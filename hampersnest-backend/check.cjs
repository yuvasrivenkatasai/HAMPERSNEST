const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'oracle',
  username: 'system',
  password: 'sai9581',
  dialectOptions: { connectString: 'localhost:1521/XEPDB1' },
  logging: false
});

(async () => {
  try {
    const [results] = await sequelize.query("SELECT column_name, data_type FROM all_tab_columns WHERE table_name = 'gallery_items'");
    console.log(results);
  } catch(e) { console.error(e); }
  process.exit(0);
})();
