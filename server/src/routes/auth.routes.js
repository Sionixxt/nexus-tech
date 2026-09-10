const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateProfile
} = require('../controllers/auth.controller');

const { authenticate } = require('../middleware/auth');
const { registerRules, loginRules, refreshTokenRules, handleValidation } = require('../middleware/validate');

router.post('/register', registerRules, handleValidation, register);
router.post('/login', loginRules, handleValidation, login);
router.post('/refresh', refreshTokenRules, handleValidation, refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);

module.exports = router;
