const express = require('express');
const router = express.Router();
const platformController = require('../controllers/platformController');
const auth = require('../middleware/auth');

// Get platform stats (public route)
router.get('/', platformController.getPlatformStats);

// Update platform stats (protected route, admin only in real app)
router.put('/', auth, platformController.updatePlatformStats);

// Calculate platform metrics (protected route, admin only in real app)
router.get('/calculate-metrics', auth, platformController.calculatePlatformMetrics);

module.exports = router;
