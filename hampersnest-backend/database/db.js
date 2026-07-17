import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config();

// Configuration defaults
const dbUser = process.env.DB_USER || 'system';
const dbPassword = process.env.DB_PASSWORD || 'admin123';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 1521;
const dbService = process.env.DB_SERVICE_NAME || 'XEPDB1';
const dbWalletPath = process.env.DB_WALLET_PATH;
const dbWalletPassword = process.env.DB_WALLET_PASSWORD;

const dbDialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

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

if (dbDialect === 'oracle') {
  sequelize = new Sequelize({
    dialect: 'oracle',
    username: dbUser,
    password: dbPassword,
    dialectOptions,
    logging: false
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });
}


export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    if (dbDialect === 'oracle') {
      if (dbWalletPath) {
        console.log(`SQL Database Connected to Oracle Cloud via Wallet: ${dbService}`);
      } else {
        console.log(`SQL Database Connected to Oracle using: ${dbHost}:${dbPort}/${dbService}`);
      }
    } else {
      console.log(`SQL Database Connected to SQLite: ./database.sqlite`);
    }
    // Import models before syncing to register them with sequelize
    const { User, Category } = await import('./models.js');

    // Automatically sync models to database (Disabled alter to prevent schema resets on restart)
    await sequelize.sync();
    
    // Safely add missing columns to Products table (bypassing SQLite backup table bug / keeping Oracle aligned)
    if (dbDialect === 'sqlite') {
      try {
        await sequelize.query('ALTER TABLE Products ADD COLUMN watermarkSettings TEXT;');
      } catch (e) { /* Column already exists */ }
      try {
        await sequelize.query('ALTER TABLE Products ADD COLUMN variantsEnabled BOOLEAN DEFAULT 0;');
      } catch (e) { /* Column already exists */ }
      try {
        await sequelize.query('ALTER TABLE Products ADD COLUMN variants TEXT;');
      } catch (e) { /* Column already exists */ }
      try {
        await sequelize.query('ALTER TABLE Products ADD COLUMN customAddons TEXT;');
      } catch (e) { /* Column already exists */ }
    } else if (dbDialect === 'oracle') {
      try {
        await sequelize.query('ALTER TABLE "products" ADD "watermarkSettings" CLOB');
      } catch (e) { /* Column already exists */ }
      try {
        await sequelize.query('ALTER TABLE "products" ADD "variantsEnabled" NUMBER(1) DEFAULT 0');
      } catch (e) { /* Column already exists */ }
      try {
        await sequelize.query('ALTER TABLE "products" ADD "variants" CLOB');
      } catch (e) { /* Column already exists */ }
      try {
        await sequelize.query('ALTER TABLE "products" ADD "customAddons" CLOB');
      } catch (e) { /* Column already exists */ }
    }

    console.log('Database connection verified and schema synced (manual alter).');

    // Seed default admin user securely
    const adminExists = await User.count();
    if (adminExists === 0) {
      const generatedPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString('hex');
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      await User.create({
        username: process.env.ADMIN_USERNAME || 'superadmin',
        password: hashedPassword,
        role: 'Super Admin'
      });
      console.warn('================================================================');
      console.warn('ATTENTION: Initial Super Admin user created.');
      console.warn(`Username: ${process.env.ADMIN_USERNAME || 'superadmin'}`);
      console.warn(`Password: ${generatedPassword}`);
      if (!process.env.ADMIN_PASSWORD) {
        console.warn('CRITICAL: Please save this auto-generated password!');
      }
      console.warn('================================================================');
    }

    // Seed default categories
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      const defaultCategories = [
        { id: 'Wedding', name: 'Wedding' },
        { id: 'Baby Shower', name: 'Baby Shower' },
        { id: 'Housewarming', name: 'Housewarming' },
        { id: 'Brass', name: 'Brass Gifting' },
        { id: 'Corporate', name: 'Corporate Gifting' },
        { id: 'Customized', name: 'Customized Hampers' }
      ];
      for (const cat of defaultCategories) {
        await Category.create(cat);
      }
      console.log('Default categories seeded successfully.');
    }
  } catch (error) {
    console.error('Database connection/sync error:', error);
    process.exit(1);
  }
};

export { sequelize };
