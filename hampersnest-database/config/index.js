// HampersNest Database Client & Configuration Module
const knex = require('knex');
const knexfile = require('../knexfile');

const environment = process.env.NODE_ENV || 'production';
const config = knexfile[environment] || knexfile.production;

// Set global Oracle configDir if using oracledb with wallet
if (config.client === 'oracledb' && config.connection && config.connection.configDir) {
  try {
    const oracledb = require('oracledb');
    oracledb.configDir = config.connection.configDir;
  } catch (e) {
    // Ignore if oracledb not loaded
  }
}

/**
 * Initialized Knex instance
 */
const db = knex(config);

/**
 * Health check helper to test database connectivity
 * @returns {Promise<{ status: string, timestamp: Date, client: string, details?: any }>}
 */
async function checkHealth() {
  try {
    const rawQuery = config.client === 'oracledb' ? 'SELECT 1 as "result" FROM DUAL' : 'SELECT 1 as result';
    const result = await db.raw(rawQuery);
    return {
      status: 'UP',
      environment,
      client: config.client,
      timestamp: new Date(),
      result: Array.isArray(result) ? result[0] : result
    };
  } catch (error) {
    return {
      status: 'DOWN',
      environment,
      client: config.client,
      timestamp: new Date(),
      error: error.message
    };
  }
}

/**
 * Closes the active database connection pool gracefully
 */
async function closeConnection() {
  await db.destroy();
}

module.exports = {
  db,
  knex: db,
  config,
  environment,
  checkHealth,
  closeConnection
};
