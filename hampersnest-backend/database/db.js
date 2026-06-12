import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dialect = process.env.DB_DIALECT || 'sqlite';
let sequelize;

if (dialect === 'oracle') {
  sequelize = new Sequelize({
    dialect: 'oracle',
    username: process.env.DB_USER || 'SYSTEM',
    password: process.env.DB_PASSWORD || 'admin123',
    dialectOptions: {
      connectString: `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 1521}/${process.env.DB_NAME || 'xe'}`
    },
    logging: false
  });
} else if (dialect === 'sqlite') {
  const sqliteStorage = process.env.DB_STORAGE || path.join(__dirname, 'database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStorage,
    logging: false
  });
} else {
  const dbUrl = process.env.DB_URL;
  if (dbUrl) {
    sequelize = new Sequelize(dbUrl, {
      logging: false,
      dialectOptions: process.env.DB_SSL === 'true' ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {}
    });
  } else {
    sequelize = new Sequelize(
      process.env.DB_NAME || 'hampersnest',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        dialect: dialect,
        logging: false
      }
    );
  }
}

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`SQL Database Connected (Dialect: ${dialect})`);
    
    // Automatically sync models to database (creates tables if they do not exist)
    await sequelize.sync();
    console.log('Database models synchronized.');

    // Seeding logic (using dynamic import to avoid circular dependency)
    const { User, Category } = await import('./models.js');

    // Seed default admin user
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin user seeded successfully.');
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
