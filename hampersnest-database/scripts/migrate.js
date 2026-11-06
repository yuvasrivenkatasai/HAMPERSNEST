// Programmatic Knex Migration Runner
const knex = require('knex');
const knexfile = require('../knexfile');

const env = process.env.NODE_ENV || 'development';
const config = knexfile[env];

if (!config) {
  console.error(`[HampersNest DB] Configuration for environment "${env}" not found in knexfile.js`);
  process.exit(1);
}

const db = knex(config);

async function runMigrations() {
  console.log(`[HampersNest DB] Running migrations for environment: "${env}" using client "${config.client}"...`);
  
  try {
    const [batchNo, log] = await db.migrate.latest();
    if (log.length === 0) {
      console.log('[HampersNest DB] Database is already up to date. No new migrations executed.');
    } else {
      console.log(`[HampersNest DB] Batch ${batchNo} completed successfully. Migrations executed:`);
      log.forEach(file => console.log(`  - ${file}`));
    }
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('[HampersNest DB] Migration failed with error:', error);
    await db.destroy();
    process.exit(1);
  }
}

runMigrations();

