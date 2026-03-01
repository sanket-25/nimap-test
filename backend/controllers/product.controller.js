const pool = require('../config/db');

const validateProductPayload = async (productName, categoryId) => {
  if (!productName || !productName.trim()) {
    return 'productName is required';
  }

  const parsedCategoryId = Number(categoryId);
  if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
    return 'categoryId must be a positive integer';
  }

  const categoryCheckQuery = `
    SELECT category_id
    FROM categories
    WHERE category_id = $1
  `;
  const categoryCheckResult = await pool.query(categoryCheckQuery, [parsedCategoryId]);

  if (!categoryCheckResult.rows.length) {
    return 'Invalid categoryId: category does not exist';
  }

  return null;
};

const createProduct = async (req, res) => {
  try {
    const { productName, categoryId } = req.body;
    const validationError = await validateProductPayload(productName, categoryId);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const query = `
      INSERT INTO products (product_name, category_id)
      VALUES ($1, $2)
      RETURNING product_id, product_name, category_id, created_at
    `;

    const { rows } = await pool.query(query, [productName.trim(), Number(categoryId)]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { productName, categoryId } = req.body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const validationError = await validateProductPayload(productName, categoryId);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const query = `
      UPDATE products
      SET product_name = $1,
          category_id = $2
      WHERE product_id = $3
      RETURNING product_id, product_name, category_id, created_at
    `;

    const { rows } = await pool.query(query, [productName.trim(), Number(categoryId), productId]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const query = `
      DELETE FROM products
      WHERE product_id = $1
      RETURNING product_id
    `;

    const { rows } = await pool.query(query, [productId]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = Number(req.params.id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const query = `
      SELECT p.product_id,
             p.product_name,
             p.category_id,
             c.category_name
      FROM products p
      JOIN categories c
        ON p.category_id = c.category_id
      WHERE p.product_id = $1
    `;

    const { rows } = await pool.query(query, [productId]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);

    if (!Number.isInteger(page) || page <= 0) {
      return res.status(400).json({ message: 'page must be a positive integer' });
    }

    if (!Number.isInteger(pageSize) || pageSize <= 0) {
      return res.status(400).json({ message: 'pageSize must be a positive integer' });
    }

    const offset = (page - 1) * pageSize;

    const listQuery = `
      SELECT p.product_id,
             p.product_name,
             p.category_id,
             c.category_name
      FROM products p
      JOIN categories c
        ON p.category_id = c.category_id
      ORDER BY p.product_id
      LIMIT $1
      OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS total_records
      FROM products
    `;

    const [listResult, countResult] = await Promise.all([
      pool.query(listQuery, [pageSize, offset]),
      pool.query(countQuery),
    ]);

    const totalRecords = countResult.rows[0].total_records;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return res.status(200).json({
      data: listResult.rows,
      page,
      pageSize,
      totalRecords,
      totalPages,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProducts,
};
