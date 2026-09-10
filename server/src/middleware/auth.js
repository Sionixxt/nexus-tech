// ============================================================================
// Authentication & Authorization Middleware
// ============================================================================

const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/database');

/**
 * Authenticate — Requires a valid JWT access token in Authorization header
 * Attaches `req.user` with { id, email, role, firstName, lastName }
 */
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = header.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or account deactivated.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired.',
        code: 'TOKEN_EXPIRED',
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    return res.status(500).json({ error: 'Authentication error.' });
  }
};

/**
 * Authorize — Role-based access control guard
 * Usage: authorize('ADMIN') or authorize('ADMIN', 'CUSTOMER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'You do not have permission to access this resource.',
      });
    }
    next();
  };
};

/**
 * Optional Auth — Sets req.user if a valid token is present, but doesn't fail
 * Useful for endpoints that behave differently for authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const decoded = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
        },
      });
      if (user) req.user = user;
    }
  } catch (_) {
    // Silently ignore — user remains unauthenticated
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
