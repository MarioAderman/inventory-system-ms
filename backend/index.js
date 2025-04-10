// Import express, pg, cors, and dotenv
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const fs = require("fs");
const fastCsv = require("fast-csv");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(err);
  else console.log('Database connected:', res.rows[0]);
});

// API Endpoints

// 1. Products API
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.product_code, 
        p.description, 
        p.current_price, 
        p.brand,
        json_agg(
          json_build_object(
            'batch_id', pu.batch_id,
            'quantity', pu.quantity,
            'cost_per_unit', pu.cost_per_unit,
            'purchase_date', pu.purchase_date
          ) ORDER BY pu.purchase_date ASC
        ) AS batches
      FROM products p
      LEFT JOIN purchases pu ON p.product_code = pu.product_code AND pu.is_deleted = false
      WHERE p.is_deleted = false
      GROUP BY p.product_code, p.description, p.current_price, p.brand
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { product_code, description, current_price, brand } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (product_code, description, current_price, brand) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_code, description, current_price, brand]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Purchases (ins) API
app.get('/api/purchases', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM purchases WHERE is_deleted = false');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchases', async (req, res) => {
  const { product_code, batch_id, quantity, cost_per_unit, purchase_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO purchases (product_code, batch_id, quantity, original_quantity, cost_per_unit, purchase_date) 
      VALUES ($1, $2, $3, $3, $4, $5) 
      RETURNING *`,
      [product_code, batch_id, quantity, cost_per_unit, purchase_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/purchases/:id', async (req, res) => {
  const { id } = req.params;
  const { product_code, batch_id, quantity, cost_per_unit, purchase_date } = req.body;

  try {
    // Prevent editing soft-deleted records
    const existing = await pool.query(
      'SELECT * FROM purchases WHERE purchase_id = $1 AND is_deleted = false',
      [id]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found or already deleted.' });
    }

    // Update with optional manual `updated_at` (if no trigger)
    const result = await pool.query(
      `UPDATE purchases 
       SET product_code=$1, batch_id=$2, quantity=$3, cost_per_unit=$4, purchase_date=$5, updated_at=NOW()
       WHERE purchase_id=$6 RETURNING *`,
      [product_code, batch_id, quantity, cost_per_unit, purchase_date, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/purchases/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE purchases 
       SET is_deleted = true, deleted_at = NOW() 
       WHERE purchase_id = $1 AND is_deleted = false 
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Purchase already deleted or not found.' });
    }

    res.json({ message: 'Purchase deleted successfully.', record: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Sales (outs) API
app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales WHERE is_deleted = false');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const { product_code, sold_price, quantity, sale_date } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Start transaction

    // STEP 1: Check available stock for the product (sum of all batch quantities)
    const stockQuery = `
      SELECT COALESCE(SUM(quantity), 0) AS total_stock 
      FROM purchases 
      WHERE product_code = $1 AND quantity > 0
    `;
    const { rows: stockRows } = await client.query(stockQuery, [product_code]);
    const totalStock = parseInt(stockRows[0].total_stock, 10);

    if (totalStock < quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Not enough stock available" });
    }

    // STEP 2: Insert the sale into the sales table.
    const saleInsertQuery = `
      INSERT INTO sales (product_code, sold_price, quantity, sale_date) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const saleResult = await client.query(saleInsertQuery, [product_code, sold_price, quantity, sale_date]);

    // STEP 3: Deduct sold quantity from purchases (FIFO)
    let remainingQty = quantity;
    const batchQuery = `
      SELECT batch_id, quantity 
      FROM purchases 
      WHERE product_code = $1 AND quantity > 0 
      ORDER BY purchase_date ASC
    `;
    const batches = await client.query(batchQuery, [product_code]);

    for (let batch of batches.rows) {
      if (remainingQty <= 0) break;

      const deductQty = Math.min(remainingQty, batch.quantity);
      remainingQty -= deductQty;

      const updateQuery = `
        UPDATE purchases 
        SET quantity = quantity - $1 
        WHERE product_code = $2 AND batch_id = $3
      `;
      await client.query(updateQuery, [deductQty, product_code, batch.batch_id]);
    }

    await client.query('COMMIT');
    res.json({ success: true, sale: saleResult.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error("Sale processing error:", error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// 4. Inventory Value (FIFO) API
app.get('/api/inventory-value', async (req, res) => {
  try {
    const purchases = await pool.query('SELECT * FROM purchases ORDER BY purchase_date');
    const sales = await pool.query('SELECT * FROM sales ORDER BY sale_date');

    // FIFO calculation logic here
    let fifoValue = 0;
    // ... (implement FIFO logic)

    res.json({ value: fifoValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Export CSV function
app.get("/api/export-csv", async (req, res) => {
  try {
    const { page } = req.query; // Get the page from the request
    if (!page) {
      return res.status(400).send("Page parameter is required");
    }

    let query = "";
    // Modify query based on the requesting page
    if (page === "purchases") {
      query = "SELECT * FROM purchases"; // Export purchase data
    } else if (page === "sales") {
      query = "SELECT * FROM sales"; // Export sales data
    } else if (page === "products") {
      query = "SELECT * FROM products"; // Export products data
    }

    const { rows } = await pool.query(query);
    if (rows.length === 0) {
      return res.status(404).send("No data available to export.");
    }

    const csvStream = fastCsv.format({ headers: true });
    const fileName = `export_${page || "data"}.csv`; // Dynamic file name
    const filePath = `./${fileName}`;

    const writableStream = fs.createWriteStream(filePath);
    csvStream.pipe(writableStream);

    rows.forEach(row => csvStream.write(row));
    csvStream.end();

    writableStream.on("finish", () => {
      res.download(filePath, fileName, err => {
        if (err) console.error("Download error:", err);
        fs.unlinkSync(filePath); // Delete file after download
      });
    });
  } catch (err) {
    console.error("Error exporting CSV:", err);
    res.status(500).send("Server error");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});