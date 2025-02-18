import express from 'express';
import {
  buyStock,
  sellStock,
  getPortfolio,
  getTransactionHistory,
} from '../controller/portfolioController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Portfolio routes
router.get('/holdings', getPortfolio);
router.get('/transactions', getTransactionHistory);
router.post('/buy', buyStock);
router.post('/sell', sellStock);

export default router; 