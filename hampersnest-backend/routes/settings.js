import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Public route (Storefront reads settings)
router.get('/', getSettings);

// Protected route (Admin updates settings)
router.put('/', protect, authorizeRoles('Super Admin'), updateSettings);

export default router;
