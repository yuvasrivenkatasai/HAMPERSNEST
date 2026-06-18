import { sequelize } from './database/db.js';

async function run() {
  try {
    const [results] = await sequelize.query("SELECT table_name, column_name, data_type FROM user_tab_columns WHERE lower(table_name) = 'products'");
    console.log(results);
    process.exit(0);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}
run();
