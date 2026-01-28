
const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { protect } = require('../middleware/auth');

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

module.exports = router;
