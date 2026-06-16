import { Setting } from './database/models.js';
import { sequelize } from './database/db.js';

async function run() {
  try {
    await sequelize.authenticate();
    const settingsData = {
      contactEmail: 'Hampersnestgifts@gmail.com',
      currency: 'INR',
      shippingRate: '0',
      announcementText: '',
      announcementActive: false,
      businessAddress: 'Uppal, Hyderabad, Telangana, India',
      googleMapsUrl: 'https://www.google.com/maps/place/Hampers+Nest/@17.4192972,78.6025777',
      whatsappNumber: '917989202194',
      instagramUrl: 'https://www.instagram.com/hampersnest',
      youtubeUrl: 'https://youtube.com/@hampersnestgifts',
      facebookUrl: '',
      linkedinUrl: '',
      pinterestUrl: '',
      twitterUrl: ''
    };

    for (const [key, rawValue] of Object.entries(settingsData)) {
      if (key !== 'categories') {
        let valueToSave = rawValue;
        if (typeof rawValue === 'string') {
          const trimmed = rawValue.trim();
          valueToSave = trimmed === '' ? null : trimmed;
        }

        try {
          await Setting.upsert({
            key,
            value: valueToSave
          });
          console.log(`Saved ${key}:`, valueToSave);
        } catch (e) {
          console.error(`FAILED ${key}:`, valueToSave, e.message);
        }
      }
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sequelize.close();
  }
}
run();
