const { sequelize } = require('./database/models.js');

async function run() {
  try {
    const [results] = await sequelize.query("SELECT * FROM user_cons_columns WHERE constraint_name = 'SYS_C0028775'");
    console.log('Columns:', results);
    const [cons] = await sequelize.query("SELECT search_condition FROM user_constraints WHERE constraint_name = 'SYS_C0028775'");
    console.log('Condition:', cons);
  } catch (e) {
    console.error(e);
  } finally {
    await sequelize.close();
  }
}
run();
