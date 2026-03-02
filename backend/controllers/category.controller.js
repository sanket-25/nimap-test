// using supabase client instead of raw pool
const supabase = require('../config/db');

const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName || !categoryName.trim()) {
      return res.status(400).json({ message: 'categoryName is required' });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ category_name: categoryName.trim() })
      .select('category_id, category_name, created_at')
      .single();

    if (error) {
      console.error('Supabase createCategory error:', error.message);
      throw error;
    }

    return res.status(201).json(data);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

const getCategories = async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('category_id, category_name, created_at')
      .order('category_id', { ascending: false });

    if (error) {
      console.error('Supabase getCategories error:', error.message);
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Get categories error:', error.message);
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

    const { data, error } = await supabase
      .from('categories')
      .update({ category_name: categoryName.trim() })
      .eq('category_id', categoryId)
      .select('category_id, category_name, created_at')
      .single();

    if (error) {
      console.error('Supabase updateCategory error:', error.message);
      if (error.code === 'PGRST116' || error.code === 'PGRST117') {
        // not found code depending on supabase
        return res.status(404).json({ message: 'Category not found' });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.status(200).json(data);
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

    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('category_id', categoryId)
      .select('category_id');

    if (error) {
      console.error('Supabase deleteCategory error:', error.message);
      throw error;
    }

    if (!data || data.length === 0) {
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
