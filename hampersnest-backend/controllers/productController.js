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

// @desc    Get all products (Paginated & Filtered)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const offset = (page - 1) * limit;

    const filter = {};
    if (req.query.all !== 'true') {
      filter.isActive = { [Op.ne]: false };
    }
    
    // Advanced filtering
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.search) {
      filter.name = { [Op.like]: `%${req.query.search}%` };
    }
    if (req.query.lowStock === 'true') {
      filter.stockQuantity = { [Op.lte]: 5 }; // Define low stock threshold
    }

    const { count, rows } = await Product.findAndCountAll({
      where: filter,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      products: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
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
  const { name, sku, price, discountPrice, originalPrice, image, videoUrls, category, subCategory, occasion, tags, stockQuantity, masterCategory, rating, description, shortDescription, details, customization, shipping, isFeatured, isActive } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Please provide name, price, and category' });
  }

  try {
    const uniqueId = crypto.randomUUID();

    await ensureCategoryExists(category);

    const createdProduct = await Product.create({
      id: uniqueId,
      name,
      sku: sku || uniqueId.substring(0, 8).toUpperCase(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      image: image || '/assets/hero_banner.png',
      videoUrls: Array.isArray(videoUrls) ? videoUrls : [],
      category,
      masterCategory: masterCategory || category,
      subCategory: subCategory || '',
      occasion: occasion || '',
      tags: Array.isArray(tags) ? tags : [],
      stockQuantity: stockQuantity !== undefined ? Number(stockQuantity) : 0,
      rating: rating ? Number(rating) : 4.5,
      description: description || '',
      shortDescription: shortDescription || '',
      details: Array.isArray(details) ? details : [],
      customization: Array.isArray(customization) ? customization : [],
      shipping: Array.isArray(shipping) ? shipping : [],
      isFeatured: !!isFeatured,
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
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });

    if (product) {
      if (req.body.category !== undefined) {
        await ensureCategoryExists(req.body.category);
      }

      // Update fields if provided
      const fields = [
        'name', 'sku', 'price', 'discountPrice', 'originalPrice', 'image', 'videoUrls',
        'category', 'masterCategory', 'subCategory', 'occasion', 'tags', 'stockQuantity',
        'rating', 'description', 'shortDescription', 'details', 'customization', 'shipping',
        'isFeatured', 'isActive'
      ];

      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          product[field] = req.body[field];
        }
      });

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

// @desc    Bulk delete products
// @route   POST /api/products/bulk-delete
// @access  Private/Admin
export const bulkDeleteProducts = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Please provide an array of product IDs' });
  }
  try {
    await Product.destroy({ where: { id: { [Op.in]: ids } } });
    res.json({ message: 'Products deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update products
// @route   POST /api/products/bulk-update
// @access  Private/Admin
export const bulkUpdateProducts = async (req, res) => {
  const { ids, updates } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !updates) {
    return res.status(400).json({ message: 'Please provide IDs and updates object' });
  }
  try {
    await Product.update(updates, { where: { id: { [Op.in]: ids } } });
    res.json({ message: 'Products updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Duplicate a product
// @route   POST /api/products/:id/duplicate
// @access  Private/Admin
export const duplicateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const uniqueId = crypto.randomUUID();
    const productData = product.get({ plain: true });
    
    delete productData.id;
    delete productData.createdAt;
    delete productData.updatedAt;
    
    productData.id = uniqueId;
    productData.name = `${productData.name} (Copy)`;
    productData.sku = `${productData.sku}-COPY`;
    
    const duplicatedProduct = await Product.create(productData);
    res.status(201).json(duplicatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Increment product views
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

// @desc    Increment product clicks
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
