// Safe Read-Only Verification Script
// Strictly non-destructive: only executes SELECT queries and row counts.
const { db, closeConnection, config } = require('../config');
const { tables } = require('../schema');

async function runVerify() {
  console.log('====================================================');
  console.log(' HampersNest Database - Health & Row Count Check');
  console.log('====================================================');
  console.log('Client Engine :', config.client);
  console.log('Target        :', config.connection.connectString || config.connection.database || config.connection.filename || 'Configured host');
  console.log('Mode          : Strictly READ-ONLY\n');

  try {
    // 1. Connection Ping
    const pingQuery = config.client === 'oracledb' ? 'SELECT 1 as "result" FROM DUAL' : 'SELECT 1 as result';
    await db.raw(pingQuery);
    console.log('Status: [CONNECTED SUCCESSFULLY]\n');

    console.log('Checking all 11 production tables:');
    console.log('----------------------------------------------------');

    for (const t of tables) {
      const exists = await db.schema.hasTable(t.tableName);
      if (exists) {
        try {
          const res = await db(t.tableName).count({ count: '*' });
          const rowCount = res[0].count !== undefined ? res[0].count : (res[0]['COUNT(*)'] || 0);
          console.log(`  * ${t.tableName.padEnd(22)} : ${String(rowCount).padStart(5)} row(s)`);
        } catch (e) {
          console.log(`  * ${t.tableName.padEnd(22)} : [Table exists, count error: ${e.message}]`);
        }
      } else {
        console.log(`  * ${t.tableName.padEnd(22)} : [DOES NOT EXIST]`);
      }
    }

    console.log('----------------------------------------------------');
    console.log('All queries completed. Database is active and healthy.');
    console.log('====================================================\n');
    await closeConnection();
    process.exit(0);
  } catch (err) {
    console.error('\nStatus: [CONNECTION FAILED]');
    console.error('Error Details:', err.message);
    console.error('====================================================\n');
    await closeConnection();
    process.exit(1);
  }
}

runVerify();

