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

let sequelize;

sequelize = new Sequelize({
  dialect: 'oracle',
  username: dbUser,
  password: dbPassword,
  dialectOptions: {
    connectString: `${dbHost}:${dbPort}/${dbService}`
  },
  logging: false
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`SQL Database Connected to Oracle using: ${dbHost}:${dbPort}/${dbService}`);
    // Import models before syncing to register them with sequelize
    const { User, Category } = await import('./models.js');

    // Automatically sync models to database
    await sequelize.sync({ alter: false });
    console.log('Database models synchronized.');

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
    console.error(`Database connection/sync error: ${error.message}`);
    process.exit(1);
  }
};

export { sequelize };
