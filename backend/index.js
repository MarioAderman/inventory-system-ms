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
  ssl: {
    rejectUnauthorized: false
  }
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
  try {
    await pool.query('SET search_path TO inventory_ms_schema');
    const result = await pool.query(`
      SELECT
        p.product_id, 
        p.product_code, 
        p.description,
        p.size,
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
  const { product_code, description, size, current_price, brand } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (product_code, description, size, current_price, brand) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [product_code, description, size, current_price, brand]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:product_id', async (req, res) => {
  const { product_id } = req.params;
  const { product_code, brand, description, size, current_price } = req.body;

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
       SET product_code=$1, brand=$2, description=$3, size=$4, current_price=$5, updated_at=NOW()
       WHERE product_id=$6 
       RETURNING *`,
      [product_code, brand, description, size, current_price, product_id]
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
    await pool.query('SET search_path TO inventory_ms_schema'); // Ensure correct schema
    const query = `
      SELECT
        s.sale_id,
        s.product_id,
        s.product_code,
        s.quantity AS total_quantity_sold,
        s.sold_price,
        s.sale_date,
        s.created_at AS sale_created_at,
        (
          SELECT COALESCE(json_agg(
            json_build_object(
              'sales_detail_id', sd.sales_detail_id,
              'purchase_id', sd.purchase_id,
              'batch_id', p.batch_id,
              'quantity_from_batch', sd.quantity,
              'cost_per_unit', sd.unit_cost,
              'total_batch_cost', sd.total_cost,
              'purchase_date', p.purchase_date
            ) ORDER BY p.purchase_date ASC, p.batch_id ASC
          ), '[]'::json)
          FROM sales_details sd
          JOIN purchases p ON sd.purchase_id = p.purchase_id
          WHERE sd.sale_id = s.sale_id
        ) AS affected_batches
      FROM sales s
      WHERE s.is_deleted = false
      ORDER BY s.sale_date DESC, s.sale_id DESC;
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sales with details:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const { product_code, sold_price, quantity: totalSaleQuantity, sale_date } = req.body; // Renamed quantity to totalSaleQuantity for clarity
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

    // STEP 1: Initial overall stock check for the product (sum of all non-deleted batch quantities)
    const stockQuery = `
      SELECT COALESCE(SUM(quantity), 0) AS total_stock 
      FROM purchases 
      WHERE product_id = $1 AND quantity > 0 AND is_deleted = false
    `;
    const { rows: stockRows } = await client.query(stockQuery, [product_id]);
    const totalStock = parseInt(stockRows[0].total_stock, 10);

    if (totalStock < totalSaleQuantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: `Not enough stock available for ${product_code}. Available: ${totalStock}, Requested: ${totalSaleQuantity}` });
    }

    // STEP 2: Insert the sale into the sales table.
    const saleInsertQuery = `
      INSERT INTO sales (product_id, product_code, quantity, sold_price, sale_date) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING sale_id
    `; // quantity here is totalSaleQuantity
    const saleResult = await client.query(saleInsertQuery, [
      product_id, product_code, totalSaleQuantity, sold_price, sale_date
    ]);
    const newSaleId = saleResult.rows[0].sale_id;

    // STEP 3: Determine which batches to use (FIFO) and insert into sales_details
    let remainingQtyToFulfill = totalSaleQuantity;
    // Fetch batches ordered by purchase_date (FIFO), also get their cost_per_unit
    const fifoBatchesQuery = `
      SELECT purchase_id, quantity, cost_per_unit 
      FROM purchases 
      WHERE product_id = $1 AND quantity > 0 AND is_deleted = false
      ORDER BY purchase_date ASC, batch_id ASC -- Assuming batch_id increments with time or purchase_id
    `;
    const { rows: availableBatches } = await client.query(fifoBatchesQuery, [product_id]);

    for (const batch of availableBatches) {
      if (remainingQtyToFulfill <= 0) break;

      const quantityFromThisBatch = Math.min(remainingQtyToFulfill, batch.quantity);

      // Insert into sales_details. The trigger will handle deducting from purchases.
      const salesDetailInsertQuery = `
        INSERT INTO sales_details 
          (sale_id, product_id, purchase_id, quantity, unit_cost)
        VALUES ($1, $2, $3, $4, $5)
      `;
      await client.query(salesDetailInsertQuery, [
        newSaleId,
        product_id,
        batch.purchase_id,
        quantityFromThisBatch,
        batch.cost_per_unit // This is the cost from the purchase batch, stored in sales_details
      ]);

      remainingQtyToFulfill -= quantityFromThisBatch;
    }

    // This check should ideally not be hit if the initial totalStock check and FIFO logic are correct,
    // but it's a safeguard. The trigger's check is per-batch.
    if (remainingQtyToFulfill > 0) {
        await client.query('ROLLBACK');
        // This indicates a logic error or race condition if totalStock was sufficient
        console.error(`Sale processing error: Could not fulfill entire quantity for sale ${newSaleId}. Remaining: ${remainingQtyToFulfill}`);
        return res.status(500).json({ error: 'Internal server error: Could not fulfill sale quantity despite initial stock check.' });
    }

    await client.query('COMMIT');
    // Fetch the created sale with its details to return to the client (optional, but good practice)
    // For now, just a success message. You might want to return the full sale object with affected_batches.
    res.status(201).json({ success: true, message: "Sale created successfully", sale_id: newSaleId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Sale processing error:", error);
    // Check if the error is from our explicit RAISE EXCEPTION in the trigger
    if (error.message && error.message.includes('Insufficient stock in purchase')) {
        return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to process sale. " + error.message });
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
      query = "SELECT * FROM purchases"; // Expogrt purchase data
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