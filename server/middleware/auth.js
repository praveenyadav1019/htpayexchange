
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Standard protection for authenticated users
 * Uses JWT_SECRET for standard user validation
 */
export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: 'Authentication required' });

    // Verify against User Secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'user' || user.isFrozen) {
      return res.status(401).json({ message: 'User session invalid or account restricted' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired user session' });
  }
};

/**
 * Dedicated protection for Admin-only routes
 * Uses JWT_ADMIN_SECRET for high-privilege validation
 */
export const protectAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return res.status(401).json({ message: 'Administrative access required' });

    // Verify against Admin Secret - standard user tokens will fail here cryptographically
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired administrative session' });
  }
};

/**
 * Role-based restriction helper
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};
