import { HeroBanner } from '../database/models.js';

// @desc    Get the active hero banner configuration
// @route   GET /api/hero-banner
// @access  Public
export const getHeroBanner = async (req, res) => {
  try {
    let banner = await HeroBanner.findOne({ where: { id: 1 } });
    if (!banner) {
      banner = {
        title: 'Default Homepage Hero',
        mainImage: null,
        floatingImageTop: null,
        floatingImageBottom: null,
        isActive: false
      };
    }
    res.json(banner);
  } catch (error) {
    console.error('Error fetching hero banner:', error);
    res.status(500).json({ message: 'Server error fetching hero banner' });
  }
};

// @desc    Update the active hero banner configuration
// @route   PUT /api/hero-banner
// @access  Private/Admin
export const updateHeroBanner = async (req, res) => {
  try {
    const { title, mainImage, floatingImageTop, floatingImageBottom, isActive } = req.body;
    
    // Using upsert logic, always targeting id: 1
    let banner = await HeroBanner.findOne({ where: { id: 1 } });
    
    if (banner) {
      banner.title = title !== undefined ? title : banner.title;
      banner.mainImage = mainImage !== undefined ? mainImage : banner.mainImage;
      banner.floatingImageTop = floatingImageTop !== undefined ? floatingImageTop : banner.floatingImageTop;
      banner.floatingImageBottom = floatingImageBottom !== undefined ? floatingImageBottom : banner.floatingImageBottom;
      banner.isActive = isActive !== undefined ? isActive : banner.isActive;
      await banner.save();
    } else {
      banner = await HeroBanner.create({
        id: 1,
        title: title || 'Main Homepage Hero',
        mainImage,
        floatingImageTop,
        floatingImageBottom,
        isActive: isActive !== undefined ? isActive : true
      });
    }

    res.json(banner);
  } catch (error) {
    console.error('Error updating hero banner:', error);
    res.status(500).json({ message: 'Server error updating hero banner' });
  }
};

// @desc    Reset/Delete the active hero banner to fallback
// @route   DELETE /api/hero-banner
// @access  Private/Admin
export const deleteHeroBanner = async (req, res) => {
  try {
    const banner = await HeroBanner.findOne({ where: { id: 1 } });
    if (banner) {
      banner.mainImage = null;
      banner.floatingImageTop = null;
      banner.floatingImageBottom = null;
      banner.isActive = false;
      await banner.save();
    }
    res.json({ message: 'Hero banner reset to defaults successfully' });
  } catch (error) {
    console.error('Error resetting hero banner:', error);
    res.status(500).json({ message: 'Server error resetting hero banner' });
  }
};
