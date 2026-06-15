import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './Router/authRoutes.js';
import urlRoutes from './Router/urlRoutes.js';
import { redirectUrl } from './Controller/urlController.js';

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration to support cookies
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
].filter(Boolean).map(url => url.replace(/\/$/, ''));

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

// Parsers
app.use(express.json());
app.use(cookieParser());

// Public URL redirection route
app.get('/s/:shortCode', redirectUrl);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);

// Base route info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the URLytics  Auth and URL Shortener API. Please reference api_documentation.md in the backend folder.',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===========================================`);
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🔊 Listening on port ${PORT}`);
  console.log(`🔑 Auth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🔗 URL Endpoints:  http://localhost:${PORT}/api/urls`);
  console.log(`===========================================`);
});
