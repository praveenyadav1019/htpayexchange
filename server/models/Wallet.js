
import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  inrBalance: { 
    type: Number, 
    default: 0 
  },
  usdtBalance: { 
    type: Number, 
    default: 0 
  },
  // TRON Network Integration
  tronAddress: {
    type: String,
    unique: true,
    sparse: true // Allows nulls for older accounts before regeneration
  },
  encryptedPrivateKey: {
    type: String,
    select: false // Never return this in standard queries
  },
  lastBalanceSync: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Wallet', walletSchema);
