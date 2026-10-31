import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';

import { initDb } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import consultRoutes from './routes/consultRoutes.js';
import scamRoutes from './routes/scamRoutes.js';
import grievanceRoutes from './routes/grievanceRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting to prevent API abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address, please try again after 15 minutes.'
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Lazy DB initialization for serverless / traditional environments
let dbInitDone = false;
app.use(async (req, res, next) => {
  if (!dbInitDone) {
    try {
      await initDb();
      dbInitDone = true;
    } catch (e) {
      console.warn('initDb error:', e.message);
    }
  }
  next();
});

// Mount routes with /api prefix
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/consult', apiLimiter, consultRoutes);
app.use('/api/scam-shield', apiLimiter, scamRoutes);
app.use('/api/grievance', apiLimiter, grievanceRoutes);
app.use('/api/history', apiLimiter, historyRoutes);

// Also mount routes without /api prefix for flexible base URL configurations
app.use('/auth', authLimiter, authRoutes);
app.use('/consult', apiLimiter, consultRoutes);
app.use('/scam-shield', apiLimiter, scamRoutes);
app.use('/grievance', apiLimiter, grievanceRoutes);
app.use('/history', apiLimiter, historyRoutes);

// Health check endpoint (both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Sahayak AI Guardian API',
    model: 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  });
});

// Central Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;
