import express from 'express';
import { getQuote, getMultipleQuotes, getHistoricalData, getChartData, searchStocks } from '../controller/stockController.js';

const router = express.Router();

// Get quote for a single stock
router.get('/quote/:symbol', getQuote);

// Get quotes for multiple stocks
router.get('/quotes', getMultipleQuotes);

// Get historical data for a stock
router.get('/historical/:symbol', getHistoricalData);

// Get chart data for a stock
router.get('/chart/:symbol', getChartData);

// Search stocks
router.get('/search', searchStocks);

export default router; 