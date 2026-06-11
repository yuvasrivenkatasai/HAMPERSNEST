import { Setting } from '../database/models.js';

// @desc    Get all active settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    const settingsList = await Setting.find({});
    const settingsObj = {};
    settingsList.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    
    res.json({
      announcementText: settingsObj.announcementText || 'Welcome to HampersNest! Customized Hampers and Return Gifts Hyderabad.',
      announcementActive: settingsObj.announcementActive !== undefined ? settingsObj.announcementActive : false,
      activeTheme: settingsObj.activeTheme || 'theme-default'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update settings configurations
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  const { announcementText, announcementActive, activeTheme } = req.body;

  try {
    const promises = [];
    
    if (announcementText !== undefined) {
      promises.push(
        Setting.findOneAndUpdate(
          { key: 'announcementText' },
          { value: announcementText },
          { upsert: true, new: true }
        )
      );
    }
    
    if (announcementActive !== undefined) {
      promises.push(
        Setting.findOneAndUpdate(
          { key: 'announcementActive' },
          { value: !!announcementActive },
          { upsert: true, new: true }
        )
      );
    }

    if (activeTheme !== undefined) {
      promises.push(
        Setting.findOneAndUpdate(
          { key: 'activeTheme' },
          { value: activeTheme },
          { upsert: true, new: true }
        )
      );
    }

    await Promise.all(promises);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
