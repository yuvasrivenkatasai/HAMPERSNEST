import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, requirePermission } from '../middleware/auth.js';

const router = express.Router();

// Public route (Storefront reads settings)
router.get('/', getSettings);

// Protected route (requires 'settings' permission)
router.put('/', protect, requirePermission('settings'), updateSettings);

export default router;
