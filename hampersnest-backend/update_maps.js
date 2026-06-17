import { Setting } from './database/models.js';

async function updateMap() {
  try {
    await Setting.upsert({
      key: 'googleMapsUrl',
      value: 'https://www.google.com/maps/dir/?api=1&destination=Uppal%2C%20Hyderabad%2C%20Telangana%2C%20India'
    });
    console.log('Successfully updated googleMapsUrl in database.');
    process.exit(0);
  } catch (error) {
    console.error('Error updating:', error);
    process.exit(1);
  }
}

updateMap();
