import express from 'express';
import { getHeroBanner, updateHeroBanner, deleteHeroBanner } from '../controllers/heroBannerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getHeroBanner)
  .put(protect, updateHeroBanner)
  .delete(protect, deleteHeroBanner);

export default router;
