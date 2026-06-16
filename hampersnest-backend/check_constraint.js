import { sequelize } from './database/db.js';

async function run() {
  try {
    const [tables] = await sequelize.query("SELECT table_name FROM user_tables");
    console.log('Tables:', tables.map(t => t.TABLE_NAME));
    
    // Find settings table constraints
    const [cons] = await sequelize.query("SELECT constraint_name, constraint_type, table_name, search_condition FROM user_constraints WHERE table_name IN ('Settings', 'SETTINGS')");
    console.log('Constraints on SETTINGS:');
    console.log(cons);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sequelize.close();
  }
}
run();
