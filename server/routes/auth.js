import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { generateUserWallet } from '../services/tronService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// --- SIGNUP ---
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    // 1. Check if user already exists (Gives a better error than a crash)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // 2. Handle Referral
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) referredBy = referrer._id;
    }

    // 3. Generate TRC20 Wallet
    // NOTE: If this fails, it's usually because your TRON_PRIVATE_KEY is missing in Render
    let walletData;
    try {
        walletData = await generateUserWallet();
    } catch (walletErr) {
        console.error("Wallet Generation Failed:", walletErr);
        return res.status(500).json({ message: 'Error generating crypto wallet. Check server logs.' });
    }

    // 4. Create User
    const user = await User.create({ name, email, password, referredBy, role: 'user' });

    // 5. Create Wallet record
    await Wallet.create({ 
      user: user._id,
      tronAddress: walletData.address,
      encryptedPrivateKey: walletData.encryptedPrivateKey
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
        tronAddress: walletData.address 
      } 
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(400).json({ message: err.message });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    
    // FIX: Removed 'user.role !== user' so that anyone can log in, 
    // or you can change it to allow 'user' and 'admin'
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
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

// --- GET ME ---
router.get('/me', protect, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    res.json({
      user: {
        ...req.user.toObject(),
        tronAddress: wallet ? wallet.tronAddress : null
      },
      balances: {
        trust: wallet ? wallet.inrBalance : 0,
        income: wallet ? wallet.usdtBalance : 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

export default router;