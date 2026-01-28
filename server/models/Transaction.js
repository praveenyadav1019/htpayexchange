
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['DEPOSIT', 'WITHDRAWAL', 'CONVERSION', 'COMMISSION', 'REFERRAL_BONUS', 'SWAP'], 
    required: true 
  },
  amount: { type: Number, required: true },
  currency: { type: String, enum: ['INR', 'USDT'], required: true },
  rateAtTime: { type: Number },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'REJECTED'], default: 'PENDING' },
  referenceId: { type: String }, // For off-chain tx hashes or bank UTRs
  description: String,
  metadata: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
