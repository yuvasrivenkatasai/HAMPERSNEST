import { Op } from 'sequelize';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product, Category } from '../database/models.js';
import { generateWatermarkedImage } from '../utils/imageProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const isAll = req.query.all === 'true';
    const noLimit = req.query.nolimit === 'true';
    const page = parseInt(req.query.page, 10) || 1;
    // Bypass limit if requesting all products for admin or storefront full catalogue
    const limit = (isAll || noLimit) ? null : (parseInt(req.query.limit, 10) || 100);
    const offset = (isAll || noLimit) ? null : (page - 1) * limit;

    const filter = {};
    if (!isAll) {
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
      ...(limit !== null && { limit, offset })
    });

    const categoryIds = [...new Set(rows.map(r => r.category).concat(rows.map(r => r.subCategory)).filter(Boolean))];
    const categories = await Category.findAll({ where: { id: categoryIds } });
    const categoryMap = {};
    categories.forEach(c => categoryMap[c.id] = c.name);

    const products = rows.map(r => {
      const p = r.toJSON();
      p.categoryName = categoryMap[p.category] || p.category;
      p.subcategoryName = p.subCategory ? (categoryMap[p.subCategory] || p.subCategory) : '';
      return p;
    });

    res.json({
      products: products,
      total: count,
      page: isAll ? 1 : page,
      totalPages: isAll ? 1 : Math.ceil(count / limit)
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
      const p = product.toJSON();
      
      if (p.category) {
        const cat = await Category.findByPk(p.category);
        p.categoryName = cat ? cat.name : p.category;
      }
      
      if (p.subCategory) {
        const subCat = await Category.findByPk(p.subCategory);
        p.subcategoryName = subCat ? subCat.name : p.subCategory;
      }
      
      res.json(p);
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
  const { name, sku, price, discountPrice, originalPrice, image, images, videoUrls, category, subCategory, occasion, tags, stockQuantity, masterCategory, rating, description, shortDescription, details, customization, shipping, isFeatured, isActive, customGiftTagEnabled, addonsEnabled, customAddons, customizationText, deliveryInfoText, watermarkSettings, variants, variantsEnabled } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Please provide name, price, and category' });
  }

  try {
    const uniqueId = req.body.id || crypto.randomUUID();

    await ensureCategoryExists(category);

    const createdProduct = await Product.create({
      id: uniqueId,
      name,
      sku: sku || uniqueId.substring(0, 8).toUpperCase(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : 0,
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      image: image || '/assets/hero_banner.png',
      images: Array.isArray(images) ? images : [],
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
      customGiftTagEnabled: customGiftTagEnabled !== undefined ? !!customGiftTagEnabled : true,
      addonsEnabled: addonsEnabled !== undefined ? !!addonsEnabled : true,
      customAddons: Array.isArray(customAddons) ? customAddons : [],
      customizationText: customizationText || 'Make your gift extra special by adding a custom gift tag and selecting add-ons.',
      deliveryInfoText: deliveryInfoText || 'Standard Delivery: 3-5 business days. Express Delivery available at checkout.',
      watermarkSettings: watermarkSettings || undefined,
      variants: Array.isArray(variants) ? variants : [],
      variantsEnabled: !!variantsEnabled,
      isFeatured: !!isFeatured,
      isActive: isActive !== undefined ? !!isActive : true
    });

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('================ PRODUCT CREATE ERROR ================');
    console.error(error);
    if (error.parent) {
      console.error('Parent error details:', error.parent);
    }
    console.error('======================================================');
    res.status(500).json({ message: error.message });
  }
};

const applyWatermarkToProduct = async (product, req) => {
  if (!product.image || !product.image.includes('/uploads/')) return false;

  const wmOptions = product.watermarkSettings || { enabled: false };
  const urlObj = new URL(product.image);
  let originalPath = urlObj.pathname.replace('_watermarked', '');
  const absoluteOriginalPath = path.join(__dirname, '../public', originalPath);
  
  if (!fs.existsSync(absoluteOriginalPath)) return false;

  const buffer = await fs.promises.readFile(absoluteOriginalPath);
  const protocol = req.protocol;
  const host = req.get('host');
  
  if (wmOptions.enabled) {
    const watermarkedBuffer = await generateWatermarkedImage(buffer, {
      enableWatermark: true,
      watermarkText: wmOptions.text,
      position: wmOptions.position,
      opacity: Number(wmOptions.opacity) / 100,
      size: wmOptions.size
    });
    
    const watermarkedRelativePath = originalPath.replace('.webp', '_watermarked.webp');
    const absoluteWatermarkedPath = path.join(__dirname, '../public', watermarkedRelativePath);
    
    await fs.promises.writeFile(absoluteWatermarkedPath, watermarkedBuffer);
    product.image = `${protocol}://${host}${watermarkedRelativePath}`;
  } else {
    product.image = `${protocol}://${host}${originalPath}`;
  }
  return true;
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

      const fields = [
        'name', 'sku', 'price', 'discountPrice', 'originalPrice', 'image', 'images', 'videoUrls',
        'category', 'masterCategory', 'subCategory', 'occasion', 'tags', 'stockQuantity',
        'rating', 'description', 'shortDescription', 'details', 'customization', 'shipping',
        'isFeatured', 'isActive', 'customGiftTagEnabled', 'addonsEnabled', 'customAddons', 'customizationText', 'deliveryInfoText', 'watermarkSettings',
        'variants', 'variantsEnabled'
      ];

      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          product[field] = req.body[field];
        }
      });

      // Auto-regenerate watermark if settings changed
      if (req.body.watermarkSettings !== undefined) {
        try { await applyWatermarkToProduct(product, req); } catch (e) { console.error('Auto-watermark failed', e); }
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('================ PRODUCT UPDATE ERROR ================');
    console.error(error);
    if (error.parent) {
      console.error('Parent error details:', error.parent);
    }
    console.error('======================================================');
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
    productData.isActive = false;
    
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

// @desc    Regenerate watermark for a product
// @route   POST /api/products/:id/watermark
// @access  Private/Admin
export const regenerateWatermark = async (req, res) => {
  try {
    const product = await Product.findOne({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    if (!product.image || !product.image.includes('/uploads/')) {
       return res.status(400).json({ message: 'Product image not found or not local' });
    }

    const wmOptions = product.watermarkSettings || { enabled: false };
    
    // Extract relative path from URL (e.g. /uploads/products/123/123456_watermarked.webp)
    const urlObj = new URL(product.image);
    let originalPath = urlObj.pathname.replace('_watermarked', '');
    const absoluteOriginalPath = path.join(__dirname, '../public', originalPath);
    
    if (!fs.existsSync(absoluteOriginalPath)) {
      return res.status(404).json({ message: 'Original image file not found on server' });
    }

    const buffer = await fs.promises.readFile(absoluteOriginalPath);
    const protocol = req.protocol;
    const host = req.get('host');
    
    if (wmOptions.enabled) {
      // Apply watermark
      const watermarkedBuffer = await generateWatermarkedImage(buffer, {
        enableWatermark: true,
        watermarkText: wmOptions.text,
        position: wmOptions.position,
        opacity: Number(wmOptions.opacity) / 100,
        size: wmOptions.size
      });
      
      const watermarkedRelativePath = originalPath.replace('.webp', '_watermarked.webp');
      const absoluteWatermarkedPath = path.join(__dirname, '../public', watermarkedRelativePath);
      
      await fs.promises.writeFile(absoluteWatermarkedPath, watermarkedBuffer);
      product.image = `${protocol}://${host}${watermarkedRelativePath}`;
    } else {
      product.image = `${protocol}://${host}${originalPath}`;
    }

    await product.save();
    res.json({ message: 'Watermark regenerated successfully.', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk apply watermark settings
// @route   POST /api/products/bulk-watermark
// @access  Private/Admin
export const bulkWatermarkProducts = async (req, res) => {
  const { ids, settings } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Please provide an array of product IDs' });
  }
  try {
    if (settings) {
      await Product.update({ watermarkSettings: settings }, { where: { id: { [Op.in]: ids } } });
    }
    // Abstracted: the actual processing will be picked up by the background worker.
    res.json({ message: 'Bulk watermark regeneration queued successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update variants
// @route   POST /api/products/bulk-variants
// @access  Private/Admin
export const bulkUpdateVariants = async (req, res) => {
  const { ids, action, payload } = req.body;
  
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'Please provide an array of product IDs' });
  }
  
  try {
    const products = await Product.findAll({ where: { id: { [Op.in]: ids } } });
    
    for (const product of products) {
      let variants = product.variants || [];
      if (!Array.isArray(variants)) variants = [];
      let updated = false;

      if (action === 'ENABLE_VARIANTS') {
        product.variantsEnabled = true;
        updated = true;
      } else if (action === 'DISABLE_VARIANTS') {
        product.variantsEnabled = false;
        updated = true;
      } else if (action === 'ADD_VARIANT') {
        // Only add if it doesn't have a variant with the exact same name
        if (!variants.some(v => v.name.toLowerCase() === payload.name.toLowerCase())) {
          variants.push({
            id: crypto.randomUUID(),
            name: payload.name,
            price: payload.price,
            sku: payload.sku || '',
            stock: payload.stock,
            isDefault: variants.length === 0
          });
          product.variants = variants;
          product.variantsEnabled = true;
          updated = true;
        }
      } else if (action === 'UPDATE_PRICE') {
        // payload = { name: "Medium", amount: 100, type: "increase" } or { name: "Medium", amount: 1500, type: "set" }
        variants.forEach(v => {
          if (v.name.toLowerCase() === payload.name.toLowerCase()) {
            let currentPrice = Number(v.price) || 0;
            if (payload.type === 'increase') {
              v.price = currentPrice + Number(payload.amount);
            } else if (payload.type === 'decrease') {
              v.price = Math.max(0, currentPrice - Number(payload.amount));
            } else {
              v.price = Number(payload.amount);
            }
            updated = true;
          }
        });
        if (updated) product.variants = variants;
      } else if (action === 'UPDATE_STOCK') {
        variants.forEach(v => {
          if (v.name.toLowerCase() === payload.name.toLowerCase()) {
            v.stock = Number(payload.stock);
            updated = true;
          }
        });
        if (updated) product.variants = variants;
      } else if (action === 'DELETE_VARIANT') {
        const initialLength = variants.length;
        variants = variants.filter(v => v.name.toLowerCase() !== payload.name.toLowerCase());
        if (variants.length < initialLength) {
          // If default was deleted, make first item default
          if (!variants.some(v => v.isDefault) && variants.length > 0) {
            variants[0].isDefault = true;
          }
          product.variants = variants;
          updated = true;
        }
      }

      if (updated) {
        await product.save();
      }
    }
    
    res.json({ message: 'Bulk variant operation completed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
