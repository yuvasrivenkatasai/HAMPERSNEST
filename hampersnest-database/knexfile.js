// HampersNest Database - Knex Configuration (Production Dedicated)
// Documentation: https://knexjs.org/guide/

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const dialect = (process.env.DB_DIALECT || '').toLowerCase();
const rawClient = process.env.DB_CLIENT || (dialect === 'oracle' ? 'oracledb' : 'better-sqlite3');
const dbClient = rawClient === 'oracle' ? 'oracledb' : rawClient;
const isSqlite = dbClient === 'better-sqlite3' || dbClient === 'sqlite3';
const isOracle = dbClient === 'oracledb';

// Oracle Cloud Wallet integration patch
if (isOracle) {
  try {
    const rawWalletPath = process.env.DB_WALLET_PATH || '../hampersnest-backend/wallet';
    const walletPath = path.isAbsolute(rawWalletPath) ? rawWalletPath : path.resolve(__dirname, rawWalletPath);
    process.env.TNS_ADMIN = walletPath;

    const oracledb = require('oracledb');
    if (!oracledb._knexPatched) {
      const originalGetConnection = oracledb.getConnection;
      oracledb.getConnection = function(opts, cb) {
        if (opts && typeof opts === 'object') {
          opts.configDir = opts.configDir || walletPath;
          opts.walletLocation = opts.walletLocation || walletPath;
          if (process.env.DB_WALLET_PASSWORD) {
            opts.walletPassword = opts.walletPassword || process.env.DB_WALLET_PASSWORD;
          }
        }
        return originalGetConnection.call(this, opts, cb);
      };
      oracledb._knexPatched = true;
    }
  } catch (e) {
    // ignore if oracledb is not loaded in current environment
  }
}

function getConnectionConfig() {
  if (isSqlite) {
    const filename = process.env.DB_FILE || path.resolve(__dirname, 'database.sqlite');
    return { filename };
  }

  if (isOracle) {
    const rawWalletPath = process.env.DB_WALLET_PATH || '../hampersnest-backend/wallet';
    const walletPath = path.isAbsolute(rawWalletPath) ? rawWalletPath : path.resolve(__dirname, rawWalletPath);

    return {
      user: process.env.DB_USER || 'HAMPERSNEST',
      password: process.env.DB_PASSWORD || '',
      connectString: process.env.DB_SERVICE_NAME || 'm7z45z3hgdzijbqt_low',
      configDir: walletPath,
      walletLocation: walletPath,
      walletPassword: process.env.DB_WALLET_PASSWORD
    };
  }

  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || (dbClient === 'pg' ? '5432' : '3306'), 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hampersnest',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

const prodConfig = {
  client: dbClient,
  useNullAsDefault: isSqlite,
  connection: getConnectionConfig(),
  pool: {
    min: 1,
    max: 5,
    acquireTimeoutMillis: 30000
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: path.join(__dirname, 'migrations'),
    extension: 'js',
    loadExtensions: ['.js']
  },
  seeds: {
    directory: path.join(__dirname, 'seeds')
  }
};

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  production: prodConfig,
  development: prodConfig,

  test: {
    client: 'better-sqlite3',
    useNullAsDefault: true,
    connection: {
      filename: ':memory:'
    },
    pool: { min: 1, max: 1 },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')
    }
  }
};
