import portfolioService from '../services/portfolioService.js';
import stockService from '../services/stockService.js';

export const buyStock = async (req, res) => {
  try {
    const { symbol, quantity, companyName } = req.body;
    const userId = req.user._id;

    // Get current stock price
    const quote = await stockService.getQuote(symbol);
    const price = quote.price;

    const holding = await portfolioService.buyStock(
      userId,
      symbol,
      quantity,
      price,
      companyName
    );

    res.status(201).json(holding);
  } catch (error) {
    console.error('Buy stock error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const sellStock = async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const userId = req.user._id;

    // Get current stock price
    const quote = await stockService.getQuote(symbol);
    const price = quote.price;

    const holding = await portfolioService.sellStock(
      userId,
      symbol,
      quantity,
      price
    );

    res.json(holding);
  } catch (error) {
    console.error('Sell stock error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getPortfolio = async (req, res) => {
  try {
    const userId = req.user._id;
    const portfolio = await portfolioService.getPortfolio(userId);
    res.json(portfolio);
  } catch (error) {
    console.error('Get portfolio error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await portfolioService.getTransactionHistory(userId);
    res.json(transactions);
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ message: error.message });
  }
}; 