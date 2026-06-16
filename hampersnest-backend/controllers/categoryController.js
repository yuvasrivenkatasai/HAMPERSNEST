import { Category, Product, GalleryItem } from '../database/models.js';
import { DEFAULT_CATEGORIES } from './settingsController.js';
import crypto from 'crypto';

const ensureDefaultCategories = async () => {
  const count = await Category.count();
  if (count > 0) return;

  await Category.bulkCreate(DEFAULT_CATEGORIES.map(category => ({
    id: category.id,
    name: category.label
  })));
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    await ensureDefaultCategories();
    const categories = await Category.findAll({ order: [['createdAt', 'ASC']] });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Please provide a category name' });
  }

  const cleanId = crypto.randomUUID();
  const cleanName = String(name).trim();

  try {
    const newCategory = await Category.create({
      id: cleanId,
      name: cleanName
    });

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an existing category's name
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Please provide a category name' });
  }

  const cleanName = String(name).trim();

  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = cleanName;
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if any products are using it
    const productsCount = await Product.count({ where: { category: req.params.id } });
    if (productsCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category: it is currently linked to ${productsCount} product(s). Please delete or change the products first.`
      });
    }

    // Check if any gallery items are using it
    const galleryCount = await GalleryItem.count({ where: { category: req.params.id } });
    if (galleryCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category: it is currently linked to ${galleryCount} showcase item(s). Please delete or change the showcase items first.`
      });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
