import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route (Storefront reads settings)
router.get('/', getSettings);

// Protected route (Admin updates settings)
router.put('/', protect, updateSettings);

export default router;
