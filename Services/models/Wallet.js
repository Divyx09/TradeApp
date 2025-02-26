import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 10000, // Initial balance of ₹10,000
    min: 0
  }
}, {
  timestamps: true
});

// Add an index on userId for faster queries
walletSchema.index({ userId: 1 });

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet; 