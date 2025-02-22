import mongoose from "mongoose";

const brokerClientSchema = new mongoose.Schema({
  broker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "active"
  },
  assignedDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index for broker and client
brokerClientSchema.index({ broker: 1, client: 1 }, { unique: true });

const BrokerClient = mongoose.model("BrokerClient", brokerClientSchema);
export default BrokerClient; 