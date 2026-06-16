import { sequelize } from './database/db.js';

async function run() {
  const queries = [
    // Drop the wrong CLOB columns
    { sql: 'ALTER TABLE "products" DROP COLUMN "images"', ignoreError: 'ORA-00904' },
    { sql: 'ALTER TABLE "orders" DROP COLUMN "history"', ignoreError: 'ORA-00904' },
    { sql: 'ALTER TABLE "inquiries" DROP COLUMN "history"', ignoreError: 'ORA-00904' },
    
    // Add them back as BLOB to match Sequelize's DataTypes.JSON mapping
    { sql: 'ALTER TABLE "products" ADD "images" BLOB', ignoreError: 'ORA-01430' },
    { sql: 'ALTER TABLE "orders" ADD "history" BLOB', ignoreError: 'ORA-01430' },
    { sql: 'ALTER TABLE "inquiries" ADD "history" BLOB', ignoreError: 'ORA-01430' }
  ];

  console.log('Starting migration to fix CLOB/BLOB mismatch on JSON columns...');

  for (const q of queries) {
    try {
      await sequelize.query(q.sql);
      console.log(`Successfully executed: ${q.sql}`);
    } catch (e) {
      if (e.message.includes(q.ignoreError) || e.message.includes('ORA-01430') || e.message.includes('ORA-00904')) {
        console.log(`Skipped (Already configured): ${q.sql}`);
      } else {
        console.error(`Failed to execute: ${q.sql} - Error: ${e.message}`);
      }
    }
  }
  
  await sequelize.close();
  console.log('Migration finished.');
}

run();
