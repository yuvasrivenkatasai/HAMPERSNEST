import { sequelize } from './database/db.js';

async function run() {
  try {
    const [cols] = await sequelize.query("SELECT column_name, data_type FROM user_tab_columns WHERE table_name = 'products'");
    console.log('Columns in products:');
    console.log(cols);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sequelize.close();
  }
}
run();
