const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./user');
const propertyRoutes = require('./property');
const walletRoutes = require('./wallet');
const scraperRoutes = require('./scraper');
const enhancedScraperRoutes = require('./enhancedScraper');

// Use route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/wallet', walletRoutes);
router.use('/scraper', scraperRoutes);
router.use('/enhanced-scraper', enhancedScraperRoutes);

module.exports = router;
