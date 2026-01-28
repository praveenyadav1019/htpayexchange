
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  systemId: { type: String, required: true }, // 'iob', 'upi', 'uco'
  systemName: { type: String, required: true },
  upiId: String,
  accountNumber: String,
  accountName: String,
  ifsc: String,
  phoneNumber: String,
  bankName: String,
  accountType: String,
  registeredName: String,
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  deviceStatus: { type: String, enum: ['online', 'offline'], default: 'online' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Account', accountSchema);
