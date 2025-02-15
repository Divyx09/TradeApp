import yahooFinance from 'yahoo-finance2';

class StockService {
  constructor() {
    this.defaultStocks = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META'];
    this.stockData = new Map();
  }

  async getQuote(symbol) {
    try {
      const quote = await yahooFinance.quote(symbol);
      return {
        symbol: quote.symbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  async getMultipleQuotes(symbols = this.defaultStocks) {
    try {
      const quotes = await Promise.all(
        symbols.map(symbol => this.getQuote(symbol))
      );
      return quotes;
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      throw error;
    }
  }

  async getHistoricalData(symbol, period = '1d', interval = '5m') {
    try {
      // Calculate start date based on period
      const now = new Date();
      let startDate = new Date();
      
      switch(period) {
        case '1d':
          startDate.setDate(now.getDate() - 1);
          break;
        case '1w':
          startDate.setDate(now.getDate() - 7);
          break;
        case '1m':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 1); // Default to 1 day
      }

      const queryOptions = {
        period1: startDate,
        period2: now,
        interval: interval
      };

      const result = await yahooFinance.historical(symbol, queryOptions);
      
      return result.map(item => ({
        timestamp: item.date,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      }));
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      throw error;
    }
  }

  async getChartData(symbol, range = '1d') {
    try {
      // For daily data (1d, 5d)
      if (['1d', '5d'].includes(range)) {
        console.log('Fetching intraday data for:', symbol, 'range:', range);
        
        const result = await yahooFinance.chart(symbol, {
          interval: '5m',
          range: range,
          includePrePost: false,
        });
        
        if (!result || !result.quotes || result.quotes.length === 0) {
          throw new Error('No intraday data available');
        }

        const data = result.quotes
          .filter(quote => quote.close !== null && quote.open !== null)
          .map(quote => ({
            timestamp: new Date(quote.timestamp * 1000),
            open: quote.open,
            high: quote.high,
            low: quote.low,
            close: quote.close,
            volume: quote.volume || 0
          }));

        console.log(`Retrieved ${data.length} intraday data points`);
        return data;
      } else {
        // For longer periods, use historical data
        const endDate = new Date();
        let startDate = new Date();
        let interval = '1d';

        switch(range) {
          case '1mo':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case '3mo':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
          case '6mo':
            startDate.setMonth(endDate.getMonth() - 6);
            break;
          case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1);
            break;
          case '2y':
            startDate.setFullYear(endDate.getFullYear() - 2);
            interval = '1wk';
            break;
          case '5y':
            startDate.setFullYear(endDate.getFullYear() - 5);
            interval = '1mo';
            break;
          default:
            startDate.setMonth(endDate.getMonth() - 1);
        }

        const queryOptions = {
          period1: startDate,
          period2: endDate,
          interval: interval,
        };

        console.log('Fetching historical data with options:', {
          symbol,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          interval
        });

        const result = await yahooFinance.historical(symbol, queryOptions);
        
        if (!result || result.length === 0) {
          throw new Error('No historical data available');
        }

        const data = result.map(item => ({
          timestamp: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        }));

        console.log(`Retrieved ${data.length} historical data points`);
        return data;
      }
    } catch (error) {
      console.error(`Error fetching chart data for ${symbol}:`, error);
      throw error;
    }
  }

  getIntervalForRange(range) {
    switch(range) {
      case '1d':
        return '5m';
      case '5d':
        return '15m';
      case '1mo':
        return '1d';
      case '3mo':
      case '6mo':
        return '1d';
      case '1y':
      case '2y':
        return '1wk';
      case '5y':
      case '10y':
      case 'max':
        return '1mo';
      default:
        return '1d';
    }
  }

  async searchStocks(query) {
    try {
      const results = await yahooFinance.search(query);
      return results.quotes.map(quote => ({
        symbol: quote.symbol,
        name: quote.shortname || quote.longname,
        exchange: quote.exchange,
        type: quote.quoteType
      }));
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  }

  startRealtimeUpdates(io) {
    setInterval(async () => {
      try {
        const quotes = await this.getMultipleQuotes();
        quotes.forEach(quote => {
          this.stockData.set(quote.symbol, quote);
        });
        io.emit('stockUpdates', quotes);
      } catch (error) {
        console.error('Error in realtime updates:', error);
      }
    }, 5000); // Update every 5 seconds
  }
}

export default new StockService(); 