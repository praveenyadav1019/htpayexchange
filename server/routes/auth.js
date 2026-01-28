
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { generateUserWallet } from '../services/tronService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;
    
    // 1. Create User
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) referredBy = referrer._id;
    }

    const user = await User.create({ name, email, password, referredBy, role: 'user' });

    // 2. Generate Unique TRC20 Wallet
    const { address, encryptedPrivateKey } = await generateUserWallet();

    // 3. Create Wallet with Chain Data
    await Wallet.create({ 
      user: user._id,
      tronAddress: address,
      encryptedPrivateKey: encryptedPrivateKey
    });

    const token = signToken(user._id);
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        referralCode: user.referralCode,
        tronAddress: address 
      } 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || user.role !== 'user' || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const wallet = await Wallet.findOne({ user: user._id });
    const token = signToken(user._id);
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        referralCode: user.referralCode,
        tronAddress: wallet ? wallet.tronAddress : null
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user._id });
  res.json({
    user: {
      ...req.user.toObject(),
      tronAddress: wallet.tronAddress
    },
    balances: {
      trust: wallet.inrBalance,
      income: wallet.usdtBalance
    }
  });
});

module.exports = router;
