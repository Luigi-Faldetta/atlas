const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./user');
const propertyRoutes = require('./property');
const walletRoutes = require('./wallet');
const scraperRoutes = require('./scraper');

// Use route modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/wallet', walletRoutes);
router.use('/scraper', scraperRoutes);

module.exports = router;
