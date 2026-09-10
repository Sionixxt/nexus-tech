// ============================================================================
// Global Error Handler Middleware
// ============================================================================

/**
 * 404 — Route not found
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

/**
 * Global error handler — catches all unhandled errors
 * In production: hides internal details. In dev: shows stack trace.
 */
const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(`\n❌ [${status}] ${err.message}`);
    if (err.stack) console.error(err.stack);
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'A record with this value already exists.',
      field: err.meta?.target?.[0],
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Record not found.',
    });
  }

  // CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'CORS policy violation.' });
  }

  // JSON parse errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }

  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred.'
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
