const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.get('/api/db-test', async (_req, res) => {
  try {
    // verify connection by selecting from known table
    const { data, error } = await pool
      .from('categories')
      .select('category_id')
      .limit(1);

    if (error) {
      console.error('Supabase DB test error', error.message);
      throw error;
    }

    res.status(200).json({ 
      message: 'Database connected successfully',
      sample: data ? data[0] : null
    });
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

module.exports = app;
