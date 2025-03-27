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
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const { product_code, description, current_price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (product_code, description, current_price) VALUES ($1, $2, $3) RETURNING *',
      [product_code, description, current_price]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Purchases (ins) API
app.get('/api/purchases', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM purchases');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/purchases', async (req, res) => {
  const { product_code, batch_id, quantity, cost_per_unit, purchase_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO purchases (product_code, batch_id, quantity, cost_per_unit, purchase_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [product_code, batch_id, quantity, cost_per_unit, purchase_date]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Sales (outs) API
app.get('/api/sales', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', async (req, res) => {
  const { product_code, sold_price, quantity, sale_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO sales (product_code, sold_price, quantity, sale_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_code, sold_price, quantity, sale_date]
    );
    res.json(result.rows[0]);
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