const pool = require('../config/db');

const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'categoryName is required' });
    }

    const query = `
      INSERT INTO categories (category_name)
      VALUES ($1)
      RETURNING category_id, category_name, created_at
    `;

    const { rows } = await pool.query(query, [categoryName.trim()]);
    return res.status(201).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

const getCategories = async (_req, res) => {
  try {
    const query = `
      SELECT category_id, category_name, created_at
      FROM categories
      ORDER BY category_id DESC
    `;

    const { rows } = await pool.query(query);
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const { categoryName } = req.body;

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'categoryName is required' });
    }

    const query = `
      UPDATE categories
      SET category_name = $1
      WHERE category_id = $2
      RETURNING category_id, category_name, created_at
    `;

    const { rows } = await pool.query(query, [categoryName.trim(), categoryId]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    const query = `
      DELETE FROM categories
      WHERE category_id = $1
      RETURNING category_id
    `;

    const { rows } = await pool.query(query, [categoryId]);

    if (!rows.length) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
