// ============================================================================
// CORS Configuration — Production-ready for Render
// ============================================================================

const cors = require('cors');

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
].filter(Boolean);

// In production on Render, also allow the .onrender.com domain
if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push(/\.onrender\.com$/);
}

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, health checks)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some((allowed) => {
      if (allowed instanceof RegExp) return allowed.test(origin);
      return allowed === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

const corsMiddleware = cors(corsOptions);

module.exports = { corsMiddleware, corsOptions };
