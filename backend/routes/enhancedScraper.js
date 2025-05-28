const express = require('express');
const router = express.Router();
const enhancedScraperController = require('../controllers/enhancedScraperController');
const authMiddleware = require('../middleware/authMiddleware');

// Enhanced property analysis routes
router.post(
  '/analyze-enhanced',
  (req, res, next) => {
    console.log('Route /api/enhanced-scraper/analyze-enhanced hit');
    console.log('Request body:', req.body);
    console.log('Authorization header:', req.headers.authorization);
    next();
  },
  authMiddleware,
  enhancedScraperController.analyzePropertyEnhanced
);

router.get(
  '/results-enhanced/:id',
  authMiddleware,
  enhancedScraperController.getEnhancedAnalysisResults
);

router.get(
  '/system-metrics',
  authMiddleware,
  enhancedScraperController.getSystemMetrics
);

// Health check for enhanced features
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Enhanced scraper service is running',
    features: {
      chainOfThought: true,
      selfReflection: true,
      confidenceScoring: true,
      marketSpecialization: true
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 