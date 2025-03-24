const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

// Wallet routes
router.get('/balance', authMiddleware, walletController.getWalletBalance);
router.get('/tokens', authMiddleware, walletController.getPropertyTokens);
router.get('/transactions', authMiddleware, walletController.getTransactions);
router.post('/connect', authMiddleware, walletController.connectWallet);
router.post('/purchase', authMiddleware, walletController.purchaseTokens);

module.exports = router;
