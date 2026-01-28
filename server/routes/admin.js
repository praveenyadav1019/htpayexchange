
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import ExchangeRate from '../models/ExchangeRate.js';
import AdminActionLog from '../models/AdminActionLog.js';
import { protectAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

router.use(protectAdmin);

/**
 * Production-Grade Withdrawal Approval
 * Performs atomic debiting across multiple balance types if needed.
 */
router.post('/withdrawals/:id/approve', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tx = await Transaction.findById(req.params.id).session(session);
    if (!tx || tx.status !== 'PENDING') throw new Error('Request invalid or already settled.');

    const wallet = await Wallet.findOne({ user: tx.user }).session(session);
    const rates = await ExchangeRate.findOne().sort({ updatedAt: -1 }).session(session) || { buyRate: 98.37 };

    let inrDebit = 0;
    let usdtDebit = 0;

    if (wallet.inrBalance >= tx.amount) {
      inrDebit = tx.amount;
    } else {
      inrDebit = wallet.inrBalance;
      usdtDebit = (tx.amount - inrDebit) / rates.buyRate;
    }

    // Atomic execution
    const updatedWallet = await Wallet.findOneAndUpdate(
      { _id: wallet._id, inrBalance: { $gte: inrDebit }, usdtBalance: { $gte: usdtDebit } },
      { $inc: { inrBalance: -inrDebit, usdtBalance: -usdtDebit } },
      { session, new: true }
    );

    if (!updatedWallet) throw new Error('Financial inconsistency detected. Settlement aborted.');

    tx.status = 'COMPLETED';
    tx.metadata = { ...tx.metadata, inrDebit, usdtDebit, rate: rates.buyRate };
    await tx.save({ session });

    await AdminActionLog.create([{
      admin: req.user._id,
      action: 'APPROVE_WITHDRAWAL',
      targetType: 'Transaction',
      targetId: tx._id,
      details: { amount: tx.amount, inrDebit, usdtDebit }
    }], { session });

    await session.commitTransaction();
    res.json({ success: true });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ message: err.message });
  } finally {
    session.endSession();
  }
});

router.get('/users', async (req, res) => {
  const users = await User.find({ role: 'user' }).lean();
  const wallets = await Wallet.find({ user: { $in: users.map(u => u._id) } });
  res.json(users.map(u => ({
    ...u,
    trustBalance: wallets.find(w => w.user.toString() === u._id.toString())?.inrBalance || 0,
    incomeBalance: wallets.find(w => w.user.toString() === u._id.toString())?.usdtBalance || 0,
  })));
});

router.get('/stats', async (req, res) => {
  const [totalUsers, pDep, pWith, wallets] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Transaction.countDocuments({ type: 'DEPOSIT', status: 'PENDING' }),
    Transaction.countDocuments({ type: 'WITHDRAWAL', status: 'PENDING' }),
    Wallet.find()
  ]);

  res.json({
    totalUsers,
    pendingDeposits: pDep,
    pendingWithdrawals: pWith,
    totalPlatformInr: wallets.reduce((a, w) => a + w.inrBalance, 0),
    totalPlatformUsdt: wallets.reduce((a, w) => a + w.usdtBalance, 0)
  });
});

export default router;
