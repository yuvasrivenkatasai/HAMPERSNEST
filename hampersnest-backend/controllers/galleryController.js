import { Op } from 'sequelize';
import { GalleryItem, Category } from '../database/models.js';

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

const ensureCategoryExists = async (categoryId) => {
  const category = await Category.findByPk(categoryId);
  if (!category) {
    const error = new Error('Please select a valid category');
    error.statusCode = 400;
    throw error;
  }
  return category;
};

// @desc    Get all gallery showcase items
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: { [Op.ne]: false } };
    const items = await GalleryItem.findAll({
      where: filter,
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new gallery item
// @route   POST /api/gallery
// @access  Private/Admin
export const createGalleryItem = async (req, res) => {
  const { title, image, category, description, isActive, fileSize, dimensions, mediaType, width, height } = req.body;

  if (!title || !image || !category) {
    return res.status(400).json({ message: 'Please provide title, image, and category' });
  }

  try {
    let baseId = slugify(title);
    let uniqueId = baseId || 'gallery-item';
    let count = 1;
    while (await GalleryItem.findOne({ where: { id: uniqueId } })) {
      uniqueId = `${baseId}-${count}`;
      count++;
    }

    await ensureCategoryExists(category);

    const createdItem = await GalleryItem.create({
      id: uniqueId,
      title,
      image,
      category,
      description: description || '',
      fileSize: fileSize || 'Unknown',
      dimensions: dimensions || 'Unknown',
      mediaType: mediaType || 'Image',
      width: width || 0,
      height: height || 0,
      isActive: isActive !== undefined ? !!isActive : true
    });

    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
export const updateGalleryItem = async (req, res) => {
  const { title, image, category, description, isActive, fileSize, dimensions, mediaType, width, height } = req.body;

  try {
    const item = await GalleryItem.findOne({ where: { id: req.params.id } });

    if (item) {
      if (category !== undefined) {
        await ensureCategoryExists(category);
      }

      item.title = title !== undefined ? title : item.title;
      item.image = image !== undefined ? image : item.image;
      item.category = category !== undefined ? category : item.category;
      item.description = description !== undefined ? description : item.description;
      item.isActive = isActive !== undefined ? !!isActive : item.isActive;
      
      if (fileSize !== undefined) item.fileSize = fileSize;
      if (dimensions !== undefined) item.dimensions = dimensions;
      if (mediaType !== undefined) item.mediaType = mediaType;
      if (width !== undefined) item.width = width;
      if (height !== undefined) item.height = height;

      if (title !== undefined && slugify(title) !== req.params.id) {
        let baseId = slugify(title);
        let uniqueId = baseId || 'gallery-item';
        let count = 1;
        while (await GalleryItem.findOne({ where: { id: uniqueId, id: { [Op.ne]: item.id } } })) {
          uniqueId = `${baseId}-${count}`;
          count++;
        }
        item.id = uniqueId;
      }

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Gallery item not found' });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.findOne({ where: { id: req.params.id } });

    if (item) {
      await item.destroy();
      res.json({ message: 'Gallery item deleted successfully' });
    } else {
      res.status(404).json({ message: 'Gallery item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
