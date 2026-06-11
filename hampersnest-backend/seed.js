import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './database/db.js';
import { Product, User, Setting } from './database/models.js';
import { products } from '../hampersnest-react/src/data/products.js';

const seedDatabase = async () => {
  try {
    // 1. Connect to DB
    await connectDB();

    console.log('Clearing database...');
    await Product.deleteMany({});
    await User.deleteMany({});
    await Setting.deleteMany({});
    
    // Also import/delete gallery items if model is available
    try {
      const { GalleryItem, Order, Inquiry } = await import('./database/models.js');
      await GalleryItem.deleteMany({});
      await Order.deleteMany({});
      await Inquiry.deleteMany({});
      console.log('Cleared Gallery, Orders, and Inquiries.');
    } catch (err) {
      console.log('Non-critical: Gallery/Order/Inquiry models not cleared:', err.message);
    }

    // 2. Hash admin password and insert user
    console.log('Seeding admin user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminUser = new User({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    await adminUser.save();
    console.log('Default Admin Account Created:');
    console.log('Username: admin');
    console.log('Password: admin123');

    // 3. Seed settings
    console.log('Seeding settings...');
    await Setting.insertMany([
      { key: 'announcementText', value: 'Welcome to HampersNest! Customized Return Gift Hampers & Curation Services.' },
      { key: 'announcementActive', value: true },
      { key: 'activeTheme', value: 'theme-default' }
    ]);
    console.log('Default settings successfully seeded!');

    mongoose.connection.close();
    console.log('Database seeding complete. Connection closed.');
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
