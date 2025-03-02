import mongoose from "mongoose";

const forexSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pair: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['BUY', 'SELL'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['OPEN', 'CLOSED'],
    default: 'OPEN'
  },
  profitLoss: {
    type: Number,
    default: 0
  },
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
forexSchema.index({ userId: 1, status: 1 });
forexSchema.index({ pair: 1, status: 1 });

const Forex = mongoose.model("Forex", forexSchema);
export default Forex; 