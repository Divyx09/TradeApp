import Wallet from '../models/Wallet.js';

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
// @access  Private
const getBalance = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      // Create a new wallet if it doesn't exist
      const newWallet = await Wallet.create({
        userId: req.user._id,
        balance: 10000 // Initial balance
      });
      return res.json({ balance: newWallet.balance });
    }
    
    res.json({ balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add money to wallet
// @route   POST /api/wallet/add
// @access  Private
const addMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid amount' });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    wallet.balance += amount;
    await wallet.save();

    res.json({ balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove money from wallet
// @route   POST /api/wallet/remove
// @access  Private
const removeMoney = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid amount' });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance -= amount;
    await wallet.save();

    res.json({ balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update wallet balance
// @route   POST /api/wallet/update
// @access  Private
const updateBalance = async (req, res) => {
  try {
    const { balance } = req.body;

    if (balance === undefined || balance < 0) {
      return res.status(400).json({ message: 'Please provide a valid balance' });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    wallet.balance = balance;
    await wallet.save();

    res.json({ balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getBalance,
  addMoney,
  removeMoney,
  updateBalance
}; 