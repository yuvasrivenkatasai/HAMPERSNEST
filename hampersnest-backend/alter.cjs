const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'oracle',
  username: 'system',
  password: 'sai9581',
  dialectOptions: {
    connectString: 'localhost:1521/XEPDB1'
  },
  logging: false
});

(async () => {
  try {
    await sequelize.authenticate();
    const queries = [
      'ALTER TABLE "products" ADD "reservedQuantity" NUMBER(10) DEFAULT 0',
      'ALTER TABLE "products" ADD "lowStockThreshold" NUMBER(10) DEFAULT 5',
      'ALTER TABLE "orders" ADD "history" CLOB',
      'ALTER TABLE "orders" ADD "internalNotes" CLOB',
      'ALTER TABLE "inquiries" ADD "leadNotes" CLOB',
      'ALTER TABLE "inquiries" ADD "assignedAdmin" VARCHAR2(255) DEFAULT \'Unassigned\'',
      'ALTER TABLE "inquiries" ADD "history" CLOB'
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
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
})();
