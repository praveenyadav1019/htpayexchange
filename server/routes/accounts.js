
import express from 'express';
import Account from '../models/Account.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all accounts for logged in user
router.get('/', protect, async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new account
router.post('/', protect, async (req, res) => {
  try {
    const account = await Account.create({
      ...req.body,
      user: req.user._id
    });
    res.status(201).json(account);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
