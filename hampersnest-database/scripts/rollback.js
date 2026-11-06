// Programmatic Knex Migration Rollback Utility
const knex = require('knex');
const knexfile = require('../knexfile');

const env = process.env.NODE_ENV || 'development';
const config = knexfile[env];

if (!config) {
  console.error(`[HampersNest DB] Configuration for environment "${env}" not found in knexfile.js`);
  process.exit(1);
}

const db = knex(config);

async function runRollback() {
  console.log(`[HampersNest DB] Rolling back last migration batch for environment: "${env}"...`);
  
  try {
    const [batchNo, log] = await db.migrate.rollback();
    if (log.length === 0) {
      console.log('[HampersNest DB] No migrations to rollback.');
    } else {
      console.log(`[HampersNest DB] Batch ${batchNo} rolled back successfully:`);
      log.forEach(file => console.log(`  - ${file}`));
    }
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error('[HampersNest DB] Rollback failed with error:', error);
    await db.destroy();
    process.exit(1);
  }
}

runRollback();

