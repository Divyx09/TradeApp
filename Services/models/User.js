import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true,
    minlength: [10, "Enter the valid Phone Number"],
  },
  role: {
    type: String,
    enum: ["user", "admin", "broker"],
    default: "user",
  },
  // Broker specific fields
  license: {
    type: String,
    required: function() {
      return this.role === 'broker';
    }
  },
  experience: {
    type: Number,
    default: 0
  },
  specialization: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ["active", "inactive", "pending"],
    default: "active"
  },
  // User specific fields
  tradingPreference: {
    type: String,
    enum: ["conservative", "moderate", "aggressive"],
    default: "moderate"
  },
  riskTolerance: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  }
}, {
  timestamps: true
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;
