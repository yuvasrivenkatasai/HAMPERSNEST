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

dotenv.config();

const app = express();
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
    // Public APIs limit to 100 requests
    return 100;
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


// Subdomain and static serving configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminBuildPath = path.join(__dirname, '../hampersnest-admin/dist');
const clientBuildPath = path.join(__dirname, '../hampersnest-react/dist');

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Dynamic subdomain static router
app.use((req, res, next) => {
  const host = req.headers.host || '';
  
  // Skip static files serving for API calls
  if (req.path.startsWith('/api')) {
    return next();
  }

  if (host.startsWith('admin.')) {
    // 1. ADMIN SUBDOMAIN
    const filePath = path.join(adminBuildPath, req.path);
    res.sendFile(filePath, (err) => {
      if (err) {
        // If an asset is requested on admin subdomain but not found, try to search storefront assets directory
        if (req.path.startsWith('/assets/')) {
          const storefrontAssetPath = path.join(clientBuildPath, req.path);
          return res.sendFile(storefrontAssetPath, (assetErr) => {
            if (assetErr) {
              res.status(404).end();
            }
          });
        }

        // Fallback to Admin SPA (React Routing)
        res.sendFile(path.join(adminBuildPath, 'index.html'), (fallbackErr) => {
          if (fallbackErr) {
            res.status(500).send(`
              <h3>Admin dashboard distribution folder not found</h3>
              <p>Please compile the admin application first by running:</p>
              <code>cd hampersnest-admin && npm run build</code>
            `);
          }
        });
      }
    });
  } else {
    // 2. CLIENT MAIN STOREFRONT
    const filePath = path.join(clientBuildPath, req.path);
    res.sendFile(filePath, (err) => {
      if (err) {
        // Fallback to Customer SPA
        res.sendFile(path.join(clientBuildPath, 'index.html'), (fallbackErr) => {
          if (fallbackErr) {
            res.status(500).send(`
              <h3>Customer storefront distribution folder not found</h3>
              <p>Please compile the React application first by running:</p>
              <code>cd hampersnest-react && npm run build</code>
            `);
          }
        });
      }
    });
  }
});

// Start listening
app.listen(PORT, () => {
  console.log(`HampersNest Backend running on port ${PORT}`);
  console.log(`- Customer Storefront: http://localhost:${PORT}`);
  console.log(`- Admin Dashboard:    http://admin.localhost:${PORT}`);
});
