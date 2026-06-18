import { CategoryShowcase, Setting } from '../database/models.js';

// @desc    Get all active category showcases
// @route   GET /api/category-showcase
// @access  Public
export const getActiveShowcases = async (req, res) => {
  try {
    const showcases = await CategoryShowcase.findAll({
      where: { isActive: true },
      order: [['sortOrder', 'ASC']]
    });
    
    // Also fetch the animation setting
    const setting = await Setting.findOne({ where: { key: 'category_showcase_animation' } });
    const animationEnabled = setting ? setting.value : true;

    res.json({ showcases, animationEnabled });
  } catch (error) {
    console.error('Error fetching category showcases:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all category showcases (Admin)
// @route   GET /api/category-showcase/admin
// @access  Private/Admin
export const getAllShowcases = async (req, res) => {
  try {
    const showcases = await CategoryShowcase.findAll({
      order: [['sortOrder', 'ASC']]
    });
    
    const setting = await Setting.findOne({ where: { key: 'category_showcase_animation' } });
    const animationEnabled = setting ? setting.value : true;

    res.json({ showcases, animationEnabled });
  } catch (error) {
    console.error('Error fetching category showcases:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new category showcase
// @route   POST /api/category-showcase
// @access  Private/Admin
export const createShowcase = async (req, res) => {
  try {
    const { name, icon, image, isFeatured, targetCollection, sortOrder, isActive } = req.body;
    
    const showcase = await CategoryShowcase.create({
      name,
      icon: icon || 'fa-solid fa-gift',
      image: image || null,
      isFeatured: isFeatured || false,
      targetCollection,
      sortOrder: sortOrder || 0,
      isActive: isActive !== false
    });
    
    res.status(201).json(showcase);
  } catch (error) {
    console.error('Error creating category showcase:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a category showcase
// @route   PUT /api/category-showcase/:id
// @access  Private/Admin
export const updateShowcase = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, image, isFeatured, targetCollection, sortOrder, isActive } = req.body;
    
    const showcase = await CategoryShowcase.findByPk(id);
    if (!showcase) {
      return res.status(404).json({ message: 'Category showcase not found' });
    }
    
    showcase.name = name || showcase.name;
    showcase.icon = icon || showcase.icon;
    showcase.targetCollection = targetCollection || showcase.targetCollection;
    if (image !== undefined) showcase.image = image || null;
    if (isFeatured !== undefined) showcase.isFeatured = isFeatured;
    if (sortOrder !== undefined) showcase.sortOrder = sortOrder;
    if (isActive !== undefined) showcase.isActive = isActive;
    
    await showcase.save();
    res.json(showcase);
  } catch (error) {
    console.error('Error updating category showcase:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a category showcase
// @route   DELETE /api/category-showcase/:id
// @access  Private/Admin
export const deleteShowcase = async (req, res) => {
  try {
    const { id } = req.params;
    const showcase = await CategoryShowcase.findByPk(id);
    
    if (!showcase) {
      return res.status(404).json({ message: 'Category showcase not found' });
    }
    
    await showcase.destroy();
    res.json({ message: 'Category showcase removed' });
  } catch (error) {
    console.error('Error deleting category showcase:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update animation setting
// @route   PUT /api/category-showcase/settings/animation
// @access  Private/Admin
export const updateAnimationSetting = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    let setting = await Setting.findOne({ where: { key: 'category_showcase_animation' } });
    if (setting) {
      setting.value = !!enabled;
      await setting.save();
    } else {
      await Setting.create({ key: 'category_showcase_animation', value: !!enabled });
    }
    
    res.json({ message: 'Animation setting updated', enabled: !!enabled });
  } catch (error) {
    console.error('Error updating animation setting:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
