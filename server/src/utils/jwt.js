// ============================================================================
// JWT Utilities — Token Generation & Verification
// ============================================================================

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/database');

/**
 * Generate a short-lived access token (default: 15 minutes)
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

/**
 * Generate a long-lived refresh token stored in the database (default: 7 days)
 */
const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString('hex');

  // Parse expiry duration
  const daysMatch = (process.env.JWT_REFRESH_EXPIRES_IN || '7d').match(/(\d+)d/);
  const days = daysMatch ? parseInt(daysMatch[1]) : 7;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
};

/**
 * Verify an access token and return decoded payload
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify a refresh token against the database
 * Returns the stored token record with user, or null if invalid/expired
 */
const verifyRefreshToken = async (token) => {
  const stored = await prisma.refreshToken.findUnique({
    where: { token },
    include: {
      user: {
        select: { id: true, email: true, role: true, firstName: true, lastName: true, isActive: true },
      },
    },
  });

  if (!stored) return null;

  // Check expiration
  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    return null;
  }

  return stored;
};

/**
 * Revoke a specific refresh token
 */
const revokeRefreshToken = async (token) => {
  try {
    await prisma.refreshToken.deleteMany({ where: { token } });
  } catch (_) {
    // Token may already be deleted
  }
};

/**
 * Revoke all refresh tokens for a user (force logout everywhere)
 */
const revokeAllUserTokens = async (userId) => {
  await prisma.refreshToken.deleteMany({ where: { userId } });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
};
