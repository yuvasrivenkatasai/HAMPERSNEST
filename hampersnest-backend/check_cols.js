import { sequelize } from './database/db.js';

async function run() {
  try {
    for (const table of ['products', 'orders', 'inquiries']) {
      const [cols] = await sequelize.query(
        `SELECT column_name, data_type FROM user_tab_columns WHERE LOWER(table_name) = '${table.toLowerCase()}'`
      );
      console.log(`\nColumns in ${table}:`);
      console.table(cols);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sequelize.close();
  }
}
run();
