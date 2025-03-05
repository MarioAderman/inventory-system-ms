// Import express, pg, cors, and dotenv
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
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
  const { product_code, cost_per_unit, quantity, purchase_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO purchases (product_code, cost_per_unit, quantity, purchase_date) VALUES ($1, $2, $3, $4) RETURNING *',
      [product_code, cost_per_unit, quantity, purchase_date]
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});