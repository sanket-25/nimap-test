// using supabase-js client instead of raw pool
const supabase = require('../config/db');

const validateProductPayload = async (productName, categoryId) => {
  if (!productName || !productName.trim()) {
    return 'productName is required';
  }

  const parsedCategoryId = Number(categoryId);
  if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
    return 'categoryId must be a positive integer';
  }

  const { data: categoryCheck, error: categoryError } = await supabase
    .from('categories')
    .select('category_id')
    .eq('category_id', parsedCategoryId)
    .single();

  if (categoryError) {
    console.error('validateProductPayload category fetch error', categoryError.message);
    throw categoryError;
  }

  if (!categoryCheck) {
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

    const { data, error } = await supabase
      .from('products')
      .insert({ product_name: productName.trim(), category_id: Number(categoryId) })
      .select('product_id, product_name, category_id, created_at')
      .single();

    if (error) {
      console.error('Supabase createProduct error:', error.message);
      throw error;
    }

    return res.status(201).json(data);
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

    const { data, error } = await supabase
      .from('products')
      .update({ product_name: productName.trim(), category_id: Number(categoryId) })
      .eq('product_id', productId)
      .select('product_id, product_name, category_id, created_at')
      .single();

    if (error) {
      console.error('Supabase updateProduct error:', error.message);
      if (error.code === 'PGRST116' || error.code === 'PGRST117') {
        return res.status(404).json({ message: 'Product not found' });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(data);
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

    const { data, error } = await supabase
      .from('products')
      .delete()
      .eq('product_id', productId)
      .select('product_id');

    if (error) {
      console.error('Supabase deleteProduct error:', error.message);
      throw error;
    }

    if (!data || data.length === 0) {
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

    const { data, error } = await supabase
      .from('products')
      .select(
        `product_id, product_name, category_id, categories!inner(category_name)`
      )
      .eq('product_id', productId)
      .single();

    if (error) {
      console.error('Supabase getProductById error:', error.message);
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // supabase returns nested categories; flatten
    const result = {
      ...data,
      category_name: data.categories?.category_name,
    };
    delete result.categories;

    return res.status(200).json(result);
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

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // supabase pagination using range
    const { data, error, count } = await supabase
      .from('products')
      .select(`product_id, product_name, category_id`, { count: 'exact' })
      .order('product_id')
      .range(from, to);

    if (error) {
      console.error('Supabase getProducts error:', error.message);
      throw error;
    }

    const totalRecords = count ?? 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return res.status(200).json({
      data: data,
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
