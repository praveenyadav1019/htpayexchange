
const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  buyRate: { type: Number, default: 98.37 }, // USDT to INR (User sells USDT)
  sellRate: { type: Number, default: 100.00 }, // INR to USDT (User buys USDT)
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
