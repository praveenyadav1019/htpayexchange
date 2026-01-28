import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import accountRoutes from './routes/accounts.js';
import adminRoutes from './routes/admin.js';

// Necessary for ES Modules to handle paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware
// We modify helmet to allow the frontend to load correctly (disabling strict CSP)
app.use(helmet({
  contentSecurityPolicy: false, 
}));

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' }));

// Rate Limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/admin', adminRoutes);

// --- FRONTEND SERVING ---
// Serve the static files from the Vite build folder
// Use '../dist' because index.js is inside the 'server' folder
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Handle React/Vite routing (must be AFTER api routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('HTPAY Database Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => console.log(`Fintech Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });