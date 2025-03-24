const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// User routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.get('/dashboard', authMiddleware, userController.getDashboard);
router.get('/transactions', authMiddleware, userController.getTransactions);

module.exports = router;
