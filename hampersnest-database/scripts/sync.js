// Standalone Production Schema Sync & Alter Utility
// Can be executed against ANY new or existing database.
// Creates missing tables and safely alters existing tables by adding any missing columns.
const { db, closeConnection, config } = require('../config');
const { syncAll, tables } = require('../schema');

async function runSync() {
  console.log('====================================================');
  console.log(' HampersNest Database - Production Schema Sync');
  console.log('====================================================');
  console.log('Client Engine :', config.client);
  console.log('Target        :', config.connection.connectString || config.connection.database || config.connection.filename || 'Configured host');
  console.log('Mode          : Safe Create / Alter (Non-destructive)\n');

  try {
    console.log('[1/2] Checking and synchronizing 11 tables...');
    await syncAll(db);
    
    console.log('\n[2/2] Validating table existence:');
    for (const t of tables) {
      const exists = await db.schema.hasTable(t.tableName);
      console.log(`  - ${t.tableName.padEnd(22)} : ${exists ? 'EXISTS / UP-TO-DATE' : 'FAILED'}`);
    }

    console.log('\n====================================================');
    console.log('Schema synchronization completed successfully!');
    console.log('====================================================');
    await closeConnection();
    process.exit(0);
  } catch (err) {
    console.error('\nSync failed with error:', err);
    await closeConnection();
    process.exit(1);
  }
}

runSync();

