import { Setting, Category } from '../database/models.js';

export const DEFAULT_CATEGORIES = [
  { id: '0e2b44c9-4ac3-4c86-a981-1519577d1887', label: 'Wedding' },
  { id: 'df03121d-bf82-4cf3-86f5-d1bc928b80de', label: 'Baby Shower' },
  { id: 'f9b85f1b-32d8-4941-a624-30c3b46f1083', label: 'Housewarming' },
  { id: 'fa3af7ce-b972-4889-b5f8-5e827d96078b', label: 'Brass Gifting' },
  { id: '587f009c-51fa-4c9b-aa85-97304d3f89ed', label: 'Corporate Gifting' },
  { id: '7253ccfa-99c9-43b7-9ec5-07907fed7e06', label: 'Customized Hampers' }
];

const normalizeCategories = (categories) => {
  if (!Array.isArray(categories)) return DEFAULT_CATEGORIES;

  const seen = new Set();
  return categories
    .map((category) => {
      if (typeof category === 'string') {
        const value = category.trim();
        return { id: value, label: value };
      }

      const id = String(category?.id || '').trim();
      const label = String(category?.label || category?.name || '').trim();
      return { id, label };
    })
    .filter((category) => {
      if (!category.id || seen.has(category.id)) return false;
      seen.add(category.id);
      return true;
    });
};

// @desc    Get all active settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    const settingsList = await Setting.findAll();
    const settingsObj = {};
    settingsList.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    // Fetch categories from the Categories table
    const categoriesDb = await Category.findAll({ order: [['createdAt', 'ASC']] });
    const categoriesFormatted = categoriesDb.map(c => ({
      id: c.id,
      label: c.name
    }));
    
    res.json({
      announcementText: settingsObj.announcementText || 'Welcome to HampersNest! Customized Hampers and Return Gifts Hyderabad.',
      announcementActive: settingsObj.announcementActive !== undefined ? settingsObj.announcementActive : false,
      activeTheme: settingsObj.activeTheme || 'theme-default',
      categories: categoriesFormatted.length > 0 ? categoriesFormatted : DEFAULT_CATEGORIES
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings configurations
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  const { announcementText, announcementActive, activeTheme, categories } = req.body;

  try {
    const promises = [];
    
    if (announcementText !== undefined) {
      promises.push(
        Setting.upsert({
          key: 'announcementText',
          value: announcementText
        })
      );
    }
    
    if (announcementActive !== undefined) {
      promises.push(
        Setting.upsert({
          key: 'announcementActive',
          value: !!announcementActive
        })
      );
    }

    if (activeTheme !== undefined) {
      promises.push(
        Setting.upsert({
          key: 'activeTheme',
          value: activeTheme
        })
      );
    }

    if (categories !== undefined) {
      const normalizedCategories = normalizeCategories(categories);

      if (normalizedCategories.length === 0) {
        return res.status(400).json({ message: 'Please provide at least one category' });
      }

      // Sync categories with Category table
      promises.push((async () => {
        for (const cat of normalizedCategories) {
          await Category.findOrCreate({
            where: { id: cat.id },
            defaults: { name: cat.label }
          });
        }
      })());
    }

    await Promise.all(promises);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
