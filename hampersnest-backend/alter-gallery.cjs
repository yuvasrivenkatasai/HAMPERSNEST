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
    await sequelize.authenticate();
    const queries = [
      'ALTER TABLE "gallery_items" ADD "fileSize" VARCHAR2(255) DEFAULT \'Unknown\'',
      'ALTER TABLE "gallery_items" ADD "dimensions" VARCHAR2(255) DEFAULT \'Unknown\'',
      'ALTER TABLE "gallery_items" ADD "mediaType" VARCHAR2(255) DEFAULT \'Image\'',
      'ALTER TABLE "gallery_items" ADD "width" NUMBER(10) DEFAULT 0',
      'ALTER TABLE "gallery_items" ADD "height" NUMBER(10) DEFAULT 0'
    ];
    for (let q of queries) {
      try {
        await sequelize.query(q);
        console.log('Success:', q);
      } catch (e) {
        if (e.message.includes('ORA-01430') || e.message.includes('ORA-00942')) {
          console.log('Skipped/Already exists:', q, e.message);
        } else {
          console.error('Failed:', q, e.message);
        }
      }
    }
  } catch(e) { console.error(e); }
  process.exit(0);
})();
