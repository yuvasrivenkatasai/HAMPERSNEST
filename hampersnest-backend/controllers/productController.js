import { Product } from '../database/models.js';

// Helper to generate clean URL slug/ID
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: { $ne: false } };
    const products = await Product.find(filter).sort({ createdAt: -1 });
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
    const product = await Product.findOne({ id: req.params.id });
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
  const { name, price, image, category, rating, description, details, isFeatured, originalPrice, isActive } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Please provide name, price, and category' });
  }

  try {
    let baseId = slugify(name);
    let uniqueId = baseId;
    let count = 1;
    while (await Product.findOne({ id: uniqueId })) {
      uniqueId = `${baseId}-${count}`;
      count++;
    }

    const product = new Product({
      id: uniqueId,
      name,
      price: Number(price),
      image: image || '/assets/hero_banner.png',
      category,
      rating: rating ? Number(rating) : 4.5,
      description: description || '',
      details: Array.isArray(details) ? details : [],
      isFeatured: !!isFeatured,
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      isActive: isActive !== undefined ? !!isActive : true
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { name, price, image, category, rating, description, details, isFeatured, originalPrice, isActive } = req.body;

  try {
    const product = await Product.findOne({ id: req.params.id });

    if (product) {
      product.name = name !== undefined ? name : product.name;
      product.price = price !== undefined ? Number(price) : product.price;
      product.image = image !== undefined ? image : product.image;
      product.category = category !== undefined ? category : product.category;
      product.rating = rating !== undefined ? Number(rating) : product.rating;
      product.description = description !== undefined ? description : product.description;
      product.details = details !== undefined ? (Array.isArray(details) ? details : []) : product.details;
      product.isFeatured = isFeatured !== undefined ? !!isFeatured : product.isFeatured;
      product.originalPrice = originalPrice !== undefined ? Number(originalPrice) : product.originalPrice;
      product.isActive = isActive !== undefined ? !!isActive : product.isActive;

      if (name !== undefined && slugify(name) !== req.params.id) {
        let baseId = slugify(name);
        let uniqueId = baseId;
        let count = 1;
        while (await Product.findOne({ id: uniqueId, _id: { $ne: product._id } })) {
          uniqueId = `${baseId}-${count}`;
          count++;
        }
        product.id = uniqueId;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });

    if (product) {
      product.isActive = false;
      await product.save();
      res.json({ message: 'Product deactivated successfully' });
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
    const product = await Product.findOne({ id: req.params.id });
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
    const product = await Product.findOne({ id: req.params.id });
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
