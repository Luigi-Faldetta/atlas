const express = require('express');
const router = express.Router();
const scraperController = require('../controllers/scraperController');
const authMiddleware = require('../middleware/authMiddleware');

// Property analysis scraper routes
// router.post('/analyze', authMiddleware, scraperController.analyzeProperty);
router.post(
  '/analyze',
  (req, res, next) => {
    console.log('Route /api/scraper/analyze hit');
    console.log('Request body:', req.body);
    console.log('Authorization header:', req.headers.authorization);
    next();
  },
  authMiddleware,
  scraperController.analyzeProperty
);
router.get(
  '/results/:id',
  authMiddleware,
  scraperController.getAnalysisResults
);
router.get('/history', authMiddleware, scraperController.getAnalysisHistory);

module.exports = router;
