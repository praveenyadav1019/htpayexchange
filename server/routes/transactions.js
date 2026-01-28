
const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const ExchangeRate = require('../models/ExchangeRate');
const { protect } = require('../middleware/auth');
const { getUSDTBalance } = require('../services/tronService');
const mongoose = require('mongoose');

/**
 * Idempotent Deposit Verification
 * Users call this to manually trigger a sync of their TRC20 balance.
 */
router.post('/sync-deposits', protect, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const wallet = await Wallet.findOne({ user: req.user._id }).session(session);
    const onChainBalance = await getUSDTBalance(wallet.tronAddress);
    
    // Logic: If on-chain is higher than recorded, credit difference
    // In production, we'd iterate through Tx History via TronGrid API
    const diff = onChainBalance - wallet.usdtBalance;
    
    if (diff > 0.01) { // Threshold to ignore dust
      const tx = await Transaction.create([{
        user: req.user._id,
        type: 'DEPOSIT',
        amount: diff,
        currency: 'USDT',
        status: 'COMPLETED',
        description: 'Blockchain Node Sync',
        referenceId: `TRON_SYNC_${Date.now()}` // Production: Use actual TxHash
      }], { session });

      wallet.usdtBalance += diff;
      await wallet.save({ session });
      
      await session.commitTransaction();
      return res.json({ success: true, credited: diff, newBalance: wallet.usdtBalance });
    }

    await session.abortTransaction();
    res.json({ success: true, message: 'Balance is already synchronized.' });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Sync failed: ' + err.message });
  } finally {
    session.endSession();
  }
});

/**
 * Atomic Instant Swap
 * Uses Mongoose Transactions to ensure zero-sum integrity.
 */
router.post('/swap', protect, async (req, res) => {
  const { fromAmount, fromCurrency, toCurrency } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rates = await ExchangeRate.findOne().sort({ updatedAt: -1 }).session(session) || { buyRate: 98.37, sellRate: 100 };
    
    let toAmount = 0;
    const sourceField = fromCurrency === 'INR' ? 'inrBalance' : 'usdtBalance';
    const targetField = toCurrency === 'INR' ? 'inrBalance' : 'usdtBalance';

    if (fromCurrency === 'INR') toAmount = fromAmount / rates.sellRate;
    else toAmount = fromAmount * rates.buyRate;

    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user._id, [sourceField]: { $gte: fromAmount } },
      { $inc: { [sourceField]: -fromAmount, [targetField]: toAmount } },
      { session, new: true }
    );

    if (!wallet) throw new Error('Insufficient cleared funds for settlement.');

    await Transaction.create([{
      user: req.user._id,
      type: 'SWAP',
      amount: fromAmount,
      currency: fromCurrency,
      status: 'COMPLETED',
      metadata: { toAmount, rate: rates.buyRate }
    }], { session });

    await session.commitTransaction();
    res.json({ success: true, balances: { trust: wallet.inrBalance, income: wallet.usdtBalance } });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

router.get('/', protect, async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json(transactions);
});

module.exports = router;
