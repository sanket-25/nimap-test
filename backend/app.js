const express = require('express');
const cors = require('cors');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({ message: 'API is running' });
});

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

app.use((err, _req, res, _next) => {
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

module.exports = app;
