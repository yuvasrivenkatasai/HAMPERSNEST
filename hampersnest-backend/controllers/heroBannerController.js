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
        mainImage: '/assets/hero_banner.webp',
        floatingImageTop: '/assets/wedding_gift.webp',
        floatingImageBottom: '/assets/brass_cup.webp',
        isActive: true,
        destinations: {
          mainImage: { type: 'none' },
          floatingImageTop: { type: 'none' },
          floatingImageBottom: { type: 'none' }
        }
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
    const { title, mainImage, floatingImageTop, floatingImageBottom, isActive, destinations } = req.body;
    
    // Using upsert logic, always targeting id: 1
    let banner = await HeroBanner.findOne({ where: { id: 1 } });
    
    if (banner) {
      banner.title = title !== undefined ? title : banner.title;
      banner.mainImage = mainImage !== undefined ? mainImage : banner.mainImage;
      banner.floatingImageTop = floatingImageTop !== undefined ? floatingImageTop : banner.floatingImageTop;
      banner.floatingImageBottom = floatingImageBottom !== undefined ? floatingImageBottom : banner.floatingImageBottom;
      banner.isActive = isActive !== undefined ? isActive : banner.isActive;
      if (destinations !== undefined) {
        banner.destinations = destinations;
      }
      await banner.save();
    } else {
      banner = await HeroBanner.create({
        id: 1,
        title: title || 'Main Homepage Hero',
        mainImage,
        floatingImageTop,
        floatingImageBottom,
        isActive: isActive !== undefined ? isActive : true,
        destinations: destinations !== undefined ? destinations : {
          mainImage: { type: 'none' },
          floatingImageTop: { type: 'none' },
          floatingImageBottom: { type: 'none' }
        }
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
      banner.mainImage = '/assets/hero_banner.webp';
      banner.floatingImageTop = '/assets/wedding_gift.webp';
      banner.floatingImageBottom = '/assets/brass_cup.webp';
      banner.isActive = true;
      banner.destinations = {
        mainImage: { type: 'none' },
        floatingImageTop: { type: 'none' },
        floatingImageBottom: { type: 'none' }
      };
      await banner.save();
    }
    res.json({ message: 'Hero banner reset to defaults successfully' });
  } catch (error) {
    console.error('Error resetting hero banner:', error);
    res.status(500).json({ message: 'Server error resetting hero banner' });
  }
};
