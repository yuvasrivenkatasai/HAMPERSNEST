import { sequelize } from './database/db.js';

async function run() {
  try {
    const [results] = await sequelize.query('SELECT "deliveryInfoText" FROM "products"');
    console.log('Query succeeded. Found', results.length, 'rows.');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await sequelize.close();
  }
}
run();
