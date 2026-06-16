import { sequelize } from './database/db.js';

async function run() {
  try {
    const [cons] = await sequelize.query("SELECT owner, table_name, constraint_type, search_condition FROM dba_constraints WHERE owner = 'HAMPERSNEST' AND constraint_name = 'SYS_C0028775'");
    console.log('Constraint SYS_C0028775 in DBA for HAMPERSNEST:');
    console.log(cons);
    
    // Also check table columns for HAMPERSNEST.products
    const [cols] = await sequelize.query("SELECT column_name, data_type FROM dba_tab_columns WHERE owner = 'HAMPERSNEST' AND table_name = 'products'");
    console.log('Columns in HAMPERSNEST.products:');
    console.log(cols);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sequelize.close();
  }
}
run();
