import { GalleryItem } from '../database/models.js';

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

// @desc    Get all gallery showcase items
// @route   GET /api/gallery
// @access  Public
export const getGalleryItems = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: { $ne: false } };
    const items = await GalleryItem.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new gallery item
// @route   POST /api/gallery
// @access  Private/Admin
export const createGalleryItem = async (req, res) => {
  const { title, image, category, description, isActive } = req.body;

  if (!title || !image || !category) {
    return res.status(400).json({ message: 'Please provide title, image, and category' });
  }

  try {
    let baseId = slugify(title);
    let uniqueId = baseId || 'gallery-item';
    let count = 1;
    while (await GalleryItem.findOne({ id: uniqueId })) {
      uniqueId = `${baseId}-${count}`;
      count++;
    }

    const item = new GalleryItem({
      id: uniqueId,
      title,
      image,
      category,
      description: description || '',
      isActive: isActive !== undefined ? !!isActive : true
    });

    const createdItem = await item.save();
    res.status(201).json(createdItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
export const updateGalleryItem = async (req, res) => {
  const { title, image, category, description, isActive } = req.body;

  try {
    const item = await GalleryItem.findOne({ id: req.params.id });

    if (item) {
      item.title = title !== undefined ? title : item.title;
      item.image = image !== undefined ? image : item.image;
      item.category = category !== undefined ? category : item.category;
      item.description = description !== undefined ? description : item.description;
      item.isActive = isActive !== undefined ? !!isActive : item.isActive;

      if (title !== undefined && slugify(title) !== req.params.id) {
        let baseId = slugify(title);
        let uniqueId = baseId || 'gallery-item';
        let count = 1;
        while (await GalleryItem.findOne({ id: uniqueId, _id: { $ne: item._id } })) {
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.findOne({ id: req.params.id });

    if (item) {
      item.isActive = false;
      await item.save();
      res.json({ message: 'Gallery item deactivated successfully' });
    } else {
      res.status(404).json({ message: 'Gallery item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
