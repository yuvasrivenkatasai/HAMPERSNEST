import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

dotenv.config();

// Ensure JWT_SECRET is set globally before routes load
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL WARNING: JWT_SECRET is not set in environment variables! Using a random temporary secret. All sessions will be lost on server restart.');
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
}

import { connectDB } from './database/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import inquiryRoutes from './routes/inquiries.js';
import dashboardRoutes from './routes/dashboard.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import galleryRoutes from './routes/gallery.js';
import categoryRoutes from './routes/categories.js';
import heroBannerRoutes from './routes/heroBanner.js';
import testimonialRoutes from './routes/testimonials.js';
import categoryShowcaseRoutes from './routes/categoryShowcase.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Rate Limiter for all API routes (Enhanced for security)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: (req, res) => {
    // If request contains authorization, it's an admin API - allow 1000 requests
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return 1000;
    }
    // Public APIs limit to 5000 requests (increased for dev/hot-reloading)
    return 5000;
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/hero-banner', heroBannerRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/category-showcase', categoryShowcaseRoutes);


// Static files and uploads configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Simple root status check
app.get('/', (req, res) => {
  res.json({ message: 'HampersNest Backend API is running successfully.' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`HampersNest Backend running on port ${PORT}`);
  console.log(`- API Status: http://localhost:${PORT}`);
});
