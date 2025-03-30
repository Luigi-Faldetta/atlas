const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth'); // Middleware for protected routes

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', authController.logout);

// Verify token
router.get('/verify', authController.verifyToken);

// Get current user (protected route)
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;
