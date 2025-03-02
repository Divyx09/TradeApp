import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getForexPairs,
  getForexChart,
  executeTrade,
  getUserTrades,
  closeTrade
} from '../controller/forexController.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all forex pairs
router.get('/pairs', getForexPairs);

// Get forex chart data
router.get('/chart/:pair', getForexChart);

// Execute a trade
router.post('/trade', executeTrade);

// Get user's trades
router.get('/trades', getUserTrades);

// Close a trade
router.post('/trade/:id/close', closeTrade);

export default router; 