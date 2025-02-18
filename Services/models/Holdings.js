import mongoose from "mongoose";

const holdingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  averageBuyPrice: {
    type: Number,
    required: true,
  },
  totalInvestment: {
    type: Number,
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for user and symbol
holdingSchema.index({ user: 1, symbol: 1 }, { unique: true });

const Holdings = mongoose.model("Holdings", holdingSchema);
export default Holdings; 