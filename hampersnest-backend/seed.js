import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './database/db.js';
import { Product, User, Setting, GalleryItem } from './database/models.js';
import { products } from '../hampersnest-react/src/data/products.js';

const seedDatabase = async () => {
  try {
    // 1. Connect to DB
    await connectDB();

    console.log('Clearing database...');
    await Product.deleteMany({});
    await User.deleteMany({});
    await Setting.deleteMany({});
    await GalleryItem.deleteMany({});
    
    // Also import/delete other collections if needed
    try {
      const { Order, Inquiry } = await import('./database/models.js');
      await Order.deleteMany({});
      await Inquiry.deleteMany({});
      console.log('Cleared Orders and Inquiries.');
    } catch (err) {
      console.log('Non-critical: Order/Inquiry models not cleared:', err.message);
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
      { key: 'announcementText', value: 'Welcome to HampersNest! Premium Customized Gift Hampers & Return Gifts Hyderabad.' },
      { key: 'announcementActive', value: false },
      { key: 'activeTheme', value: 'theme-default' }
    ]);
    console.log('Default settings successfully seeded!');

    // 4. Seed products
    console.log('Seeding products...');
    await Product.insertMany(products);
    console.log(`${products.length} products successfully seeded!`);

    // 5. Seed default gallery items
    console.log('Seeding gallery items...');
    const defaultGalleryItems = [
      {
        id: 'wedding-showcase-1',
        title: 'Ivory & Gold Luxury Wedding Return Gift Setup',
        image: '/assets/wedding_gift.png',
        category: 'Wedding',
        description: 'A beautiful wedding return gift setup featuring ivory custom boxes, silk ribbon ties, and premium brass bowls.',
        isActive: true
      },
      {
        id: 'baby-shower-showcase-1',
        title: 'Pastel Lavender Baby Shower Gift Basket Curation',
        image: '/assets/baby_shower.png',
        category: 'Baby Shower',
        description: 'Pastel purple theme box decorated with premium satin ribbons and customized baby announcement tags.',
        isActive: true
      },
      {
        id: 'housewarming-showcase-1',
        title: 'Traditional Griha Pravesham Hand-Woven Return Gifts',
        image: '/assets/housewarming.png',
        category: 'Housewarming',
        description: 'Housewarming return gifts featuring handcrafted brass diyas and traditional sweets in a customized bamboo tray.',
        isActive: true
      },
      {
        id: 'corporate-showcase-1',
        title: 'Premium Corporate Executive Gift Box Selection',
        image: '/assets/corporate.png',
        category: 'Corporate',
        description: 'Navy blue corporate gift boxes embossed with executive customization option tags and smart accessories.',
        isActive: true
      },
      {
        id: 'half-saree-showcase-1',
        title: 'Peacock Theme Half Saree Ceremony return Gift Packs',
        image: '/assets/half_saree.png',
        category: 'Wedding',
        description: 'Peacock-inspired half saree return gift bags containing silk bangle holder pouches and traditional brass diyas.',
        isActive: true
      },
      {
        id: 'brass-showcase-1',
        title: 'Hand-Engraved Pure Brass Bowls in Royal Red Box Casing',
        image: '/assets/brass_cup.png',
        category: 'Brass',
        description: 'Traditional solid brass bowls engraved with floral designs, presented in a red velvet presentation case.',
        isActive: true
      }
    ];
    await GalleryItem.insertMany(defaultGalleryItems);
    console.log(`${defaultGalleryItems.length} gallery items successfully seeded!`);

    mongoose.connection.close();
    console.log('Database seeding complete. Connection closed.');
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
