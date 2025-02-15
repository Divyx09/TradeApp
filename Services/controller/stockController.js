import stockService from '../services/stockService.js';

export const getQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await stockService.getQuote(symbol);
    res.json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMultipleQuotes = async (req, res) => {
  try {
    const { symbols } = req.query;
    const symbolArray = symbols ? symbols.split(',') : undefined;
    const quotes = await stockService.getMultipleQuotes(symbolArray);
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHistoricalData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1d', interval = '5m' } = req.query;
    const data = await stockService.getHistoricalData(symbol, period, interval);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChartData = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { range = '1d' } = req.query;
    const data = await stockService.getChartData(symbol, range);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchStocks = async (req, res) => {
  try {
    const { query } = req.query;
    const results = await stockService.searchStocks(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 