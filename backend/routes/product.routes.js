const express = require('express');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
} = require('../controllers/product.controller');

const router = express.Router();

router.post('/', createProduct);
router.get('/:id', getProductById);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/', getProducts);

module.exports = router;
