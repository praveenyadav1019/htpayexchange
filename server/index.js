import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import authRoutes from './routes/auth.js';
import transactionRoutes from './routes/transactions.js';
import accountRoutes from './routes/accounts.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middleware - CSP disabled so Vite scripts can run
app.use(helmet({
  contentSecurityPolicy: false, 
}));

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10kb' }));

// Rate Limiting
app.use('/api', rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again later.'
}));

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/admin', adminRoutes);

// --- FRONTEND SERVING ---
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
        // Only serve index.html if the request is NOT for an API route
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
} else {
    console.warn("⚠️ Warning: dist folder not found. Frontend will not be served.");
    app.get('/', (req, res) => res.send("API is running, but frontend is not built."));
}

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ status: 'error', message: err.message });
});

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI is not defined in Environment Variables.");
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('HTPAY Database Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`Serving frontend from: ${distPath}`);
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });