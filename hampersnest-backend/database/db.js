import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded reliably regardless of execution working directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbUser = process.env.DB_USER || 'HAMPERSNEST';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 1521;
const dbService = process.env.DB_SERVICE_NAME || 'm7z45z3hgdzijbqt_low';
const rawWalletPath = process.env.DB_WALLET_PATH || path.resolve(__dirname, '../wallet');
const dbWalletPath = path.isAbsolute(rawWalletPath) ? rawWalletPath : path.resolve(__dirname, '..', rawWalletPath);
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

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    if (dbWalletPath) {
      console.log(`SQL Database Connected to Oracle Cloud via Wallet: ${dbService}`);
    } else {
      console.log(`SQL Database Connected to Oracle using: ${dbHost}:${dbPort}/${dbService}`);
    }

    // Register Sequelize models for runtime querying
    await import('./models.js');
    console.log('Database models initialized successfully.');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export { sequelize };
