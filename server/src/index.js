// ============================================================================
// NexusTech API — Server Entry Point
// ============================================================================

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { corsMiddleware } = require('./config/cors');
const { authLimiter, apiLimiter } = require('./config/rateLimit');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// ── Global Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(corsMiddleware);
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (product images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Global API rate limiter
app.use('/api', apiLimiter);

// Stricter rate limiter on auth endpoints
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ── API Routes ────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NexusTech API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Error Handling ────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 NexusTech API running on http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Client URL:  ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
});

module.exports = app;
