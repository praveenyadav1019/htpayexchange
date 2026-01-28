
import mongoose from 'mongoose';

const adminActionLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { 
    type: String, 
    required: true,
    enum: ['APPROVE_DEPOSIT', 'REJECT_DEPOSIT', 'APPROVE_WITHDRAWAL', 'REJECT_WITHDRAWAL', 'FREEZE_USER', 'UNFREEZE_USER', 'UPDATE_RATES']
  },
  targetType: { 
    type: String, 
    required: true,
    enum: ['Transaction', 'User', 'ExchangeRate']
  },
  targetId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AdminActionLog', adminActionLogSchema);
