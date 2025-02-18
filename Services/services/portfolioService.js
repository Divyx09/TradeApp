import Holdings from '../models/Holdings.js';
import Transaction from '../models/Transaction.js';
import stockService from './stockService.js';

class PortfolioService {
  async buyStock(userId, symbol, quantity, price, companyName) {
    try {
      // Find existing holding
      let holding = await Holdings.findOne({ user: userId, symbol });
      
      // Calculate total investment for this transaction
      const total = quantity * price;

      // Create transaction record
      await Transaction.create({
        user: userId,
        symbol,
        companyName,
        type: 'BUY',
        quantity,
        price,
        total
      });

      if (holding) {
        // Update existing holding
        const newTotalQuantity = holding.quantity + quantity;
        const newTotalInvestment = holding.totalInvestment + total;
        const newAveragePrice = newTotalInvestment / newTotalQuantity;

        holding = await Holdings.findOneAndUpdate(
          { user: userId, symbol },
          {
            quantity: newTotalQuantity,
            averageBuyPrice: newAveragePrice,
            totalInvestment: newTotalInvestment,
            lastUpdated: new Date()
          },
          { new: true }
        );
      } else {
        // Create new holding
        holding = await Holdings.create({
          user: userId,
          symbol,
          companyName,
          quantity,
          averageBuyPrice: price,
          totalInvestment: total
        });
      }

      return holding;
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  }

  async sellStock(userId, symbol, quantity, price) {
    try {
      const holding = await Holdings.findOne({ user: userId, symbol });
      
      if (!holding) {
        throw new Error('No holdings found for this stock');
      }

      if (holding.quantity < quantity) {
        throw new Error('Insufficient shares to sell');
      }

      const total = quantity * price;

      // Create transaction record
      await Transaction.create({
        user: userId,
        symbol,
        companyName: holding.companyName,
        type: 'SELL',
        quantity,
        price,
        total
      });

      // Update holding
      const newQuantity = holding.quantity - quantity;
      if (newQuantity === 0) {
        // Remove holding if all shares are sold
        await Holdings.deleteOne({ user: userId, symbol });
        return null;
      }

      // Update holding with new quantity
      const updatedHolding = await Holdings.findOneAndUpdate(
        { user: userId, symbol },
        {
          quantity: newQuantity,
          lastUpdated: new Date()
        },
        { new: true }
      );

      return updatedHolding;
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  }

  async getPortfolio(userId) {
    try {
      const holdings = await Holdings.find({ user: userId });
      
      // Get current prices for all holdings
      const updatedHoldings = await Promise.all(
        holdings.map(async (holding) => {
          const quote = await stockService.getQuote(holding.symbol);
          const currentValue = holding.quantity * quote.price;
          const profitLoss = currentValue - holding.totalInvestment;
          const profitLossPercentage = (profitLoss / holding.totalInvestment) * 100;

          return {
            ...holding.toObject(),
            currentPrice: quote.price,
            currentValue,
            profitLoss,
            profitLossPercentage
          };
        })
      );

      // Calculate portfolio summary
      const summary = updatedHoldings.reduce((acc, holding) => {
        acc.totalInvestment += holding.totalInvestment;
        acc.currentValue += holding.currentValue;
        acc.profitLoss += holding.profitLoss;
        return acc;
      }, {
        totalInvestment: 0,
        currentValue: 0,
        profitLoss: 0
      });

      summary.profitLossPercentage = (summary.profitLoss / summary.totalInvestment) * 100;

      return {
        holdings: updatedHoldings,
        summary
      };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  }

  async getTransactionHistory(userId) {
    try {
      return await Transaction.find({ user: userId })
        .sort({ timestamp: -1 });
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }
}

export default new PortfolioService(); 