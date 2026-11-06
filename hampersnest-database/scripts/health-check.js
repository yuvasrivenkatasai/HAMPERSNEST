// Database Connectivity Health-check Script
const { checkHealth, closeConnection } = require('../config');

async function run() {
  console.log('[HampersNest DB] Running connection health check...');
  const health = await checkHealth();
  
  if (health.status === 'UP') {
    console.log('[HampersNest DB] Database connection SUCCESSFUL:');
    console.log(JSON.stringify(health, null, 2));
    await closeConnection();
    process.exit(0);
  } else {
    console.error('[HampersNest DB] Database connection FAILED:');
    console.error(JSON.stringify(health, null, 2));
    await closeConnection();
    process.exit(1);
  }
}

run();

