import express from 'express';
import { getExchangeRate, refreshRateFromAPI } from '../controllers/currencyController.js';

const router = express.Router();

/**
 * @route   GET /api/currency/rate
 * @desc    Get the latest cached INR to USD exchange rate from backend memory
 * @access  Public
 */
router.get('/rate', getExchangeRate);

/**
 * @route   POST /api/currency/refresh
 * @desc    Force a fresh fetch from Frankfurter API and update memory cache
 * @access  Public (or Admin)
 */
router.post('/refresh', async (req, res) => {
  try {
    const updated = await refreshRateFromAPI();
    return res.status(200).json({
      success: true,
      message: 'Exchange rate refreshed successfully',
      data: updated
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
