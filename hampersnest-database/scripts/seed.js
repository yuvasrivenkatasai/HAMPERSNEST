// Safe Production Seed Runner
const { db, closeConnection } = require('../config');

async function runSeeds() {
  console.log('[HampersNest DB] Executing production seeds...');
  
  try {
    const [log] = await db.seed.run();
    if (!log || log.length === 0) {
      console.log('[HampersNest DB] No seed files executed.');
    } else {
      console.log('[HampersNest DB] Seeds executed successfully:');
      log.forEach(file => console.log(`  - ${file}`));
    }
    await closeConnection();
    process.exit(0);
  } catch (error) {
    console.error('[HampersNest DB] Seeding failed with error:', error);
    await closeConnection();
    process.exit(1);
  }
}

runSeeds();
