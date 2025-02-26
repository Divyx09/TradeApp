import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getBalance,
  addMoney,
  removeMoney,
  updateBalance
} from '../controller/walletController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/balance', getBalance);
router.post('/add', addMoney);
router.post('/remove', removeMoney);
router.post('/update', updateBalance);

export default router; 