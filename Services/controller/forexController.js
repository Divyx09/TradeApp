import Forex from '../models/Forex.js';
import Wallet from '../models/Wallet.js';
import axios from 'axios';

// Forex pairs configuration
const FOREX_PAIRS = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar' },
  { symbol: 'EUR/GBP', name: 'Euro / British Pound' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen' }
];

// @desc    Get all forex pairs with current prices
// @route   GET /api/forex/pairs
// @access  Private
export const getForexPairs = async (req, res) => {
  try {
    // In a real application, you would fetch real-time forex data from a forex API
    // For demo purposes, we'll generate mock data
    const pairs = FOREX_PAIRS.map(pair => ({
      ...pair,
      price: generateMockPrice(),
      change: generateMockChange(),
    }));

    res.json(pairs);
  } catch (error) {
    console.error('Error fetching forex pairs:', error);
    res.status(500).json({ message: 'Failed to fetch forex pairs' });
  }
};

// @desc    Get forex pair chart data
// @route   GET /api/forex/chart/:pair
// @access  Private
export const getForexChart = async (req, res) => {
  try {
    const { pair } = req.params;
    const { timeframe = '1d' } = req.query;

    // In a real application, you would fetch historical data from a forex API
    // For demo purposes, we'll generate mock data
    const chartData = generateMockChartData(timeframe);

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching forex chart data:', error);
    res.status(500).json({ message: 'Failed to fetch chart data' });
  }
};

// @desc    Execute forex trade
// @route   POST /api/forex/trade
// @access  Private
export const executeTrade = async (req, res) => {
  try {
    const { pair, amount, type } = req.body;
    const userId = req.user._id;

    if (!pair || !amount || !type) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    // Get user's wallet
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    // Check if user has sufficient balance
    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Get current price (in real app, fetch from forex API)
    const currentPrice = generateMockPrice();

    // Create forex trade
    const trade = await Forex.create({
      userId,
      pair,
      type,
      amount,
      price: currentPrice,
    });

    // Update wallet balance
    wallet.balance -= amount;
    await wallet.save();

    res.json({
      success: true,
      trade,
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error('Error executing forex trade:', error);
    res.status(500).json({ message: 'Failed to execute trade' });
  }
};

// @desc    Get user's forex trades
// @route   GET /api/forex/trades
// @access  Private
export const getUserTrades = async (req, res) => {
  try {
    const trades = await Forex.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(trades);
  } catch (error) {
    console.error('Error fetching user trades:', error);
    res.status(500).json({ message: 'Failed to fetch trades' });
  }
};

// @desc    Close forex trade
// @route   POST /api/forex/trade/:id/close
// @access  Private
export const closeTrade = async (req, res) => {
  try {
    const trade = await Forex.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: 'OPEN'
    });

    if (!trade) {
      return res.status(404).json({ message: 'Trade not found or already closed' });
    }

    // Get current price (in real app, fetch from forex API)
    const currentPrice = generateMockPrice();

    // Calculate profit/loss
    const profitLoss = calculateProfitLoss(
      trade.type,
      trade.price,
      currentPrice,
      trade.amount
    );

    // Update trade
    trade.status = 'CLOSED';
    trade.profitLoss = profitLoss;
    trade.closedAt = new Date();
    await trade.save();

    // Update wallet balance
    const wallet = await Wallet.findOne({ userId: req.user._id });
    wallet.balance += (trade.amount + profitLoss);
    await wallet.save();

    res.json({
      success: true,
      trade,
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error('Error closing forex trade:', error);
    res.status(500).json({ message: 'Failed to close trade' });
  }
};

// Helper functions for mock data
function generateMockPrice() {
  return Math.random() * (1.5 - 0.5) + 0.5;
}

function generateMockChange() {
  return (Math.random() * 4 - 2).toFixed(2);
}

function generateMockChartData(timeframe) {
  const data = [];
  const periods = timeframe === '1d' ? 24 : timeframe === '1w' ? 7 : 30;
  
  for (let i = 0; i < periods; i++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - i);
    
    data.push({
      timestamp: timestamp.toISOString(),
      open: generateMockPrice(),
      high: generateMockPrice(),
      low: generateMockPrice(),
      close: generateMockPrice(),
      volume: Math.floor(Math.random() * 1000000)
    });
  }

  return data.reverse();
}

function calculateProfitLoss(type, entryPrice, currentPrice, amount) {
  const priceDiff = currentPrice - entryPrice;
  const multiplier = type === 'BUY' ? 1 : -1;
  return (priceDiff * amount * multiplier).toFixed(2);
} 