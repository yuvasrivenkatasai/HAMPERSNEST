require('dotenv').config();
const { Sequelize } = require('sequelize');

const dbUser = process.env.DB_USER || 'system';
const dbPassword = process.env.DB_PASSWORD || 'admin123';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 1521;
const dbService = process.env.DB_SERVICE_NAME || 'XEPDB1';
const dbWalletPath = process.env.DB_WALLET_PATH;
const dbWalletPassword = process.env.DB_WALLET_PASSWORD;

const dialectOptions = {};

if (dbWalletPath) {
  dialectOptions.connectString = dbService;
  dialectOptions.configDir = dbWalletPath;
  dialectOptions.walletLocation = dbWalletPath;
  if (dbWalletPassword) {
    dialectOptions.walletPassword = dbWalletPassword;
  }
} else {
  if (dbService.trim().startsWith('(')) {
    dialectOptions.connectString = dbService;
  } else {
    dialectOptions.connectString = `${dbHost}:${dbPort}/${dbService}`;
  }
}

const sequelize = new Sequelize({
  dialect: 'oracle',
  username: dbUser,
  password: dbPassword,
  dialectOptions,
  logging: false
});

(async () => {
  try {
    await sequelize.authenticate();
    const queries = [
      'ALTER TABLE "orders" ADD "source" VARCHAR2(255) DEFAULT \'Website\'',
      'ALTER TABLE "orders" ADD "paymentStatus" VARCHAR2(255) DEFAULT \'Pending\'',
      'ALTER TABLE "orders" ADD "paymentMethod" VARCHAR2(255)',
      'ALTER TABLE "orders" ADD "advancePaid" NUMBER(10) DEFAULT 0'
    ];
    for (let q of queries) {
      try {
        await sequelize.query(q);
        console.log('Success:', q);
      } catch (err) {
        console.log('Skipped/Error (already exists?):', q, err.message);
      }
    }
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await sequelize.close();
  }
})();
