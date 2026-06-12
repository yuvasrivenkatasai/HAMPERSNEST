import { Op } from 'sequelize';
import crypto from 'crypto';
import { Product, Category } from '../database/models.js';

const ensureCategoryExists = async (categoryId) => {
  const category = await Category.findByPk(categoryId);
  if (!category) {
    const error = new Error('Please select a valid category');
    error.statusCode = 400;
    throw error;
  }
  return category;
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: { [Op.ne]: false } };
    const products = await Product.findAll({
      where: filter,
      order: [['createdAt', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by string ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  const { name, price, image, category, masterCategory, rating, description, details, customization, shipping, isFeatured, originalPrice, isActive } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Please provide name, price, and category' });
  }

  try {
    const uniqueId = crypto.randomUUID();

    await ensureCategoryExists(category);

    const createdProduct = await Product.create({
      id: uniqueId,
      name,
      price: Number(price),
      image: image || '/assets/hero_banner.png',
      category,
      masterCategory: masterCategory || category,
      rating: rating ? Number(rating) : 4.5,
      description: description || '',
      details: Array.isArray(details) ? details : [],
      customization: Array.isArray(customization) ? customization : [],
      shipping: Array.isArray(shipping) ? shipping : [],
      isFeatured: !!isFeatured,
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      isActive: isActive !== undefined ? !!isActive : true
    });

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { name, price, image, category, masterCategory, rating, description, details, customization, shipping, isFeatured, originalPrice, isActive } = req.body;

  try {
    const product = await Product.findOne({ where: { id: req.params.id } });

    if (product) {
      if (category !== undefined) {
        await ensureCategoryExists(category);
      }

      product.name = name !== undefined ? name : product.name;
      product.price = price !== undefined ? Number(price) : product.price;
      product.image = image !== undefined ? image : product.image;
      product.category = category !== undefined ? category : product.category;
      product.masterCategory = masterCategory !== undefined 
        ? masterCategory 
        : (category !== undefined ? category : product.masterCategory);
      product.rating = rating !== undefined ? Number(rating) : product.rating;
      product.description = description !== undefined ? description : product.description;
      product.details = details !== undefined ? (Array.isArray(details) ? details : []) : product.details;
      product.customization = customization !== undefined ? (Array.isArray(customization) ? customization : []) : product.customization;
      product.shipping = shipping !== undefined ? (Array.isArray(shipping) ? shipping : []) : product.shipping;
      product.isFeatured = isFeatured !== undefined ? !!isFeatured : product.isFeatured;
      product.originalPrice = originalPrice !== undefined ? Number(originalPrice) : product.originalPrice;
      product.isActive = isActive !== undefined ? !!isActive : product.isActive;



      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });

    if (product) {
      await product.destroy();
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment product views count
// @route   POST /api/products/:id/view
// @access  Public
export const incrementProductViews = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (product) {
      product.views = (product.views || 0) + 1;
      await product.save();
      res.json({ success: true, views: product.views });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment product clicks count
// @route   POST /api/products/:id/click
// @access  Public
export const incrementProductClicks = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (product) {
      product.clicks = (product.clicks || 0) + 1;
      await product.save();
      res.json({ success: true, clicks: product.clicks });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
