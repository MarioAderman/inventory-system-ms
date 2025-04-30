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
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error(err);
  else console.log('Database connected:', res.rows[0]);
});

// API Endpoints

// Test
app.get('/ping', (req, res) => {
  res.send('pong');
});

// 1. Products API
app.get('/api/products', async (req, res) => {
  console.log('Hitting /api/products');
  try {
    const result = await pool.query(`
      SELECT
        p.product_id, 
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
          ) 
          ORDER BY pu.batch_id DESC
        ) AS batches
      FROM products p
      LEFT JOIN purchases pu 
        ON p.product_id = pu.product_id 
        AND pu.is_deleted = false
      WHERE p.is_deleted = false
      GROUP BY p.product_id, p.product_code, p.description, p.current_price, p.brand
      ORDER BY p.brand ASC, p.product_code ASC
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

app.put('/api/products/:product_id', async (req, res) => {
  const { product_id } = req.params;
  const { product_code, brand, description, current_price } = req.body;

  try {
    // Prevent editing soft-deleted records
    const existing = await pool.query(
      'SELECT * FROM products WHERE product_id = $1 AND is_deleted = false',
      [product_id]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found or already deleted.' });
    }

    // Update with optional manual `updated_at` (if no trigger)
    const result = await pool.query(
      `UPDATE products 
       SET product_code=$1, brand=$2, description=$3, current_price=$4, updated_at=NOW()
       WHERE product_id=$5 
       RETURNING *`,
      [product_code, brand, description, current_price, product_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:product_id', async (req, res) => {
  const { product_id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE products 
       SET is_deleted = true, deleted_at = NOW() 
       WHERE product_id = $1 AND is_deleted = false 
       RETURNING *`,
      [product_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Product already deleted or not found.' });
    }

    res.json({ message: 'Product deleted successfully.', record: result.rows[0] });
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

    const productResult = await pool.query(
      'SELECT product_id FROM products WHERE product_code = $1 AND is_deleted = false',
      [product_code]
    );
    if (productResult.rowCount === 0) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    const product_id = productResult.rows[0].product_id;

    const result = await pool.query(
      `INSERT INTO purchases (product_code, product_id, batch_id, quantity, original_quantity, cost_per_unit, purchase_date) 
       VALUES ($1, $2, $3, $4, $4, $5, $6) 
       RETURNING *`,
      [product_code, product_id, batch_id, quantity, cost_per_unit, purchase_date]
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

    const productResult = await client.query(
      'SELECT product_id FROM products WHERE product_code = $1 AND is_deleted = false',
      [product_code]
    );
    if (productResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found.' });
    }
    const product_id = productResult.rows[0].product_id;

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
      INSERT INTO sales (product_code, product_id, sold_price, quantity, sale_date) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `;
    const saleResult = await client.query(saleInsertQuery, [
      product_code, product_id, sold_price, quantity, sale_date
    ]);

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

app.put('/api/sales/:id', async (req, res) => {
  const { id } = req.params;
  const { product_code, quantity, sold_price, sale_date } = req.body;

  try {
    // Prevent editing soft-deleted records
    const existing = await pool.query(
      'SELECT * FROM sales WHERE sale_id = $1 AND is_deleted = false',
      [id]
    );
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found or already deleted.' });
    }

    // Update with optional manual `updated_at` (if no trigger)
    const result = await pool.query(
      `UPDATE sales 
       SET product_code=$1, quantity=$2, sold_price=$3, sale_date=$4, updated_at=NOW()
       WHERE sale_id=$5 RETURNING *`,
      [product_code, quantity, sold_price, sale_date, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sales/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE sales 
       SET is_deleted = true, deleted_at = NOW() 
       WHERE sale_id = $1 AND is_deleted = false 
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Sale already deleted or not found.' });
    }

    res.json({ message: 'Sale deleted successfully.', record: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
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