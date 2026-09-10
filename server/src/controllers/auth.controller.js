// ============================================================================
// Auth Controller — Register, Login, Token Refresh, Logout, Profile
// ============================================================================

const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} = require('../utils/jwt');
const { sanitizeUser } = require('../utils/helpers');

/**
 * POST /api/auth/register
 * Create a new customer account
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Check for existing email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName, phone },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    return res.status(201).json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Authenticate with email and password
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check active status
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    return res.status(200).json({
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/refresh
 * Exchange a valid refresh token for a new token pair (rotation)
 */
const refreshTokenHandler = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    // Verify refresh token against DB
    const stored = await verifyRefreshToken(token);
    if (!stored) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    // Check user is still active
    if (!stored.user || !stored.user.isActive) {
      await revokeRefreshToken(token);
      return res.status(401).json({ error: 'User account is inactive.' });
    }

    // Rotate: revoke old, issue new pair
    await revokeRefreshToken(token);
    const newAccessToken = generateAccessToken(stored.user);
    const newRefreshToken = await generateRefreshToken(stored.user.id);

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Revoke the provided refresh token
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await revokeRefreshToken(token);
    }
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 */
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { addresses: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/auth/me
 * Update current user's profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const data = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phone !== undefined) data.phone = phone;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    return res.status(200).json({ user: sanitizeUser(updatedUser) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refreshToken: refreshTokenHandler,
  logout,
  getMe,
  updateProfile,
};
