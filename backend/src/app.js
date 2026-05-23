const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const bidRoutes = require('./routes/bidRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Security middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// CORS
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://ipl-nexus.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// AI endpoints stricter limit
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'AI request limit reached. Please wait a minute.' }
});
app.use('/api/ai', aiLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging (skip in test)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'IPL Nexus AI Auction API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/auction', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
