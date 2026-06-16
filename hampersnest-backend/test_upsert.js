import { Setting } from './database/models.js';
import { sequelize } from './database/db.js';

async function testSave() {
  try {
    await sequelize.authenticate();
    console.log('Connected');
    await Setting.upsert({
      key: 'instagramUrl',
      value: 'https://instagram.com/test'
    });
    console.log('Upsert successful');
  } catch (err) {
    console.error('Upsert failed:', err.message);
    if (err.original) {
        console.error('Original:', err.original.message);
    }
  } finally {
    await sequelize.close();
  }
}
testSave();
