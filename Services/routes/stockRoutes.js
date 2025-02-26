import express from "express";
import {
  getQuote,
  getMultipleQuotes,
  getHistoricalData,
  getChartData,
  searchStocks,
} from "../controller/stockController.js";
import { protect } from '../middleware/authMiddleware.js';
import yahooFinance from 'yahoo-finance2';

const router = express.Router();

// Constants for pagination
const PAGE_SIZE = 20;

// Market Categories
const MARKETS = {
  INDIAN: {
    MAIN_INDICES: {
      "NIFTY50": "^NSEI",      // NIFTY 50
      "SENSEX": "^BSESN",      // BSE SENSEX
      "NIFTYBANK": "^NSEBANK", // NIFTY BANK
      "NIFTY100": "^CNX100",   // NIFTY 100
      "NIFTY500": "^CRSLDX",   // NIFTY 500
    },
    SECTORS: {
      TECHNOLOGY: [
        "TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "TECHM.NS", "LTI.NS",
        "MINDTREE.NS", "MPHASIS.NS", "PERSISTENT.NS", "COFORGE.NS"
      ],
      BANKING: [
        "HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS",
        "BANKBARODA.NS", "FEDERALBNK.NS", "IDFCFIRSTB.NS", "PNB.NS", "BANDHANBNK.NS"
      ],
      ENERGY: [
        "RELIANCE.NS", "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "ADANIGREEN.NS",
        "TATAPOWER.NS", "IOC.NS", "GAIL.NS", "BPCL.NS", "HINDPETRO.NS"
      ],
      AUTOMOTIVE: [
        "TATAMOTORS.NS", "M&M.NS", "MARUTI.NS", "BAJAJ-AUTO.NS", "EICHERMOT.NS",
        "HEROMOTOCO.NS", "ASHOKLEY.NS", "TVSMOTOR.NS", "MOTHERSON.NS", "BOSCHLTD.NS"
      ],
      FMCG: [
        "HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "BRITANNIA.NS", "DABUR.NS",
        "MARICO.NS", "COLPAL.NS", "GODREJCP.NS", "VBL.NS", "TATACONSUM.NS"
      ],
      PHARMA: [
        "SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "DIVISLAB.NS", "APOLLOHOSP.NS",
        "BIOCON.NS", "ALKEM.NS", "TORNTPHARM.NS", "AUROPHARMA.NS", "LUPIN.NS"
      ]
    },
    MARKET_CAP: {
      LARGE_CAP: [], // Will be populated dynamically
      MID_CAP: [],   // Will be populated dynamically
      SMALL_CAP: []  // Will be populated dynamically
    }
  },
  US: {
    MAIN_INDICES: {
      "SPX": "^GSPC",   // S&P 500
      "NDX": "^NDX",    // NASDAQ 100
      "DJI": "^DJI",    // Dow Jones
      "RUT": "^RUT"     // Russell 2000
    },
    SECTORS: {
      TECHNOLOGY: [
        "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "NFLX",
        "ORCL", "CRM", "ADBE", "INTC", "AMD", "QCOM", "CSCO"
      ],
      FINANCE: [
        "JPM", "BAC", "WFC", "C", "GS", "MS", "V", "MA", "AXP", "BLK"
      ],
      HEALTHCARE: [
        "JNJ", "PFE", "MRK", "ABBV", "UNH", "BMY", "AMGN", "GILD", "TMO", "DHR"
      ]
    }
  }
};

// Get all stocks with pagination, search, and advanced filtering
router.get('/all', async (req, res) => {
  try {
    const {
      page = 1,
      search = '',
      market = '',
      sector = '',
      marketCap = '',
      priceRange = '',
      sortBy = 'marketCap',
      sortOrder = 'desc'
    } = req.query;

    // Determine which stocks to fetch based on filters
    let stocksToFetch = [];
    if (market && sector) {
      stocksToFetch = MARKETS[market]?.SECTORS[sector] || [];
    } else if (market) {
      stocksToFetch = Object.values(MARKETS[market].SECTORS).flat();
    } else {
      stocksToFetch = Object.values(MARKETS).flatMap(m => 
        Object.values(m.SECTORS).flat()
      );
    }

    // Fetch stock data
    const quotes = await yahooFinance.quote(stocksToFetch);
    let stocks = Array.isArray(quotes) ? quotes : [quotes];

    // Apply filters
    stocks = stocks.filter(stock => {
      const matchesSearch = search ? (
        stock.symbol.toLowerCase().includes(search.toLowerCase()) ||
        (stock.longName || '').toLowerCase().includes(search.toLowerCase())
      ) : true;

      const matchesMarketCap = marketCap ? (
        marketCap === 'LARGE_CAP' ? stock.marketCap >= 50000000000 :
        marketCap === 'MID_CAP' ? stock.marketCap >= 10000000000 && stock.marketCap < 50000000000 :
        marketCap === 'SMALL_CAP' ? stock.marketCap < 10000000000 : true
      ) : true;

      const [minPrice, maxPrice] = (priceRange || '').split('-').map(Number);
      const matchesPriceRange = priceRange ? (
        (!minPrice || stock.regularMarketPrice >= minPrice) &&
        (!maxPrice || stock.regularMarketPrice <= maxPrice)
      ) : true;

      return matchesSearch && matchesMarketCap && matchesPriceRange;
    });

    // Sort stocks
    stocks.sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      switch (sortBy) {
        case 'price':
          return (a.regularMarketPrice - b.regularMarketPrice) * multiplier;
        case 'change':
          return (a.regularMarketChangePercent - b.regularMarketChangePercent) * multiplier;
        case 'volume':
          return (a.regularMarketVolume - b.regularMarketVolume) * multiplier;
        case 'marketCap':
        default:
          return (a.marketCap - b.marketCap) * multiplier;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedStocks = stocks.slice(startIndex, endIndex);

    // Format response
    const formattedStocks = paginatedStocks.map(quote => ({
      symbol: quote.symbol,
      companyName: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      high52Week: quote.fiftyTwoWeekHigh,
      low52Week: quote.fiftyTwoWeekLow,
      pe: quote.forwardPE || quote.trailingPE,
      eps: quote.epsTrailingTwelveMonths,
      dividend: quote.dividendYield,
      category: quote.symbol.endsWith('.NS') ? 'Indian' : 'US',
      sector: getSectorForStock(quote.symbol),
      previousClose: quote.regularMarketPreviousClose,
      open: quote.regularMarketOpen,
      dayHigh: quote.regularMarketDayHigh,
      dayLow: quote.regularMarketDayLow
    }));

    res.json({
      stocks: formattedStocks,
      hasMore: endIndex < stocks.length,
      total: stocks.length,
      page: Number(page),
      totalPages: Math.ceil(stocks.length / PAGE_SIZE)
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ message: 'Failed to fetch stocks' });
  }
});

// Get market structure (categories, sectors, etc.)
router.get('/markets', (req, res) => {
  res.json({
    markets: Object.keys(MARKETS).map(market => ({
      id: market,
      name: market === 'INDIAN' ? 'Indian Market' : 'US Market',
      mainIndices: Object.keys(MARKETS[market].MAIN_INDICES).map(index => ({
        id: index,
        symbol: MARKETS[market].MAIN_INDICES[index]
      })),
      sectors: Object.keys(MARKETS[market].SECTORS).map(sector => ({
        id: sector,
        name: sector.charAt(0) + sector.slice(1).toLowerCase(),
        stockCount: MARKETS[market].SECTORS[sector].length
      }))
    }))
  });
});

// Helper function to determine sector for a stock
function getSectorForStock(symbol) {
  for (const market of Object.values(MARKETS)) {
    for (const [sector, stocks] of Object.entries(market.SECTORS)) {
      if (stocks.includes(symbol)) {
        return sector;
      }
    }
  }
  return 'Unknown';
}

// Get stock quotes
router.get('/quotes', async (req, res) => {
  try {
    const { symbols } = req.query;
    if (!symbols) {
      return res.status(400).json({ message: 'Symbols are required' });
    }

    const symbolArray = symbols.split(',');
    const quotes = await yahooFinance.quote(symbolArray);
    
    const stocks = Array.isArray(quotes) ? quotes : [quotes];
    const formattedStocks = stocks.map(quote => ({
      symbol: quote.symbol,
      companyName: quote.longName || quote.shortName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      category: quote.symbol.endsWith('.NS') ? 'Indian' : 'Global'
    }));

    res.json(formattedStocks);
  } catch (error) {
    console.error('Error fetching stock quotes:', error);
    res.status(500).json({ message: 'Failed to fetch stock quotes' });
  }
});

router.get("/quote/:symbol", getQuote);

router.get("/quotes", getMultipleQuotes);

router.get("/historical/:symbol", getHistoricalData);

router.get("/chart/:symbol", getChartData);

router.get("/search", searchStocks);

export default router;
