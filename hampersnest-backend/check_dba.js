import { sequelize } from './database/db.js';

async function run() {
  try {
    const [cons] = await sequelize.query("SELECT table_name, search_condition FROM dba_constraints WHERE constraint_name = 'SYS_C0028775'");
    console.log('Constraint SYS_C0028775 in DBA:');
    console.log(cons);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sequelize.close();
  }
}
run();
