// HampersNest Database - Dedicated Production Knex Configuration
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const rawWalletPath = process.env.DB_WALLET_PATH || '../hampersnest-backend/wallet';
const walletPath = path.isAbsolute(rawWalletPath) ? rawWalletPath : path.resolve(__dirname, rawWalletPath);

// Configure Oracle Cloud Wallet environment
process.env.TNS_ADMIN = walletPath;

try {
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
  // Ignored if oracledb is not loaded
}

const prodConfig = {
  client: 'oracledb',
  connection: {
    user: process.env.DB_USER || 'HAMPERSNEST',
    password: process.env.DB_PASSWORD || '',
    connectString: process.env.DB_SERVICE_NAME || 'm7z45z3hgdzijbqt_low',
    configDir: walletPath,
    walletLocation: walletPath,
    walletPassword: process.env.DB_WALLET_PASSWORD
  },
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

module.exports = {
  production: prodConfig,
  development: prodConfig
};
