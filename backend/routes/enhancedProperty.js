const express = require('express');
const router = express.Router();
const enhancedPropertyController = require('../controllers/enhancedPropertyController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Enhanced Property Analysis Routes
 * Provides comprehensive real estate analysis with advanced scraping and AI insights
 */

/**
 * @route POST /api/enhanced-property/analyze
 * @desc Analyze property with enhanced real-world data scraping
 * @access Public (with rate limiting)
 * @body {
 *   url: string (required) - Property URL to analyze
 *   force_refresh: boolean - Force fresh analysis (ignore cache)
 *   include_comparables: boolean - Include comparable properties analysis
 *   include_neighborhood_analysis: boolean - Include neighborhood data
 * }
 * @returns {Object} Comprehensive property analysis with investment metrics
 */
router.post('/analyze', enhancedPropertyController.analyzePropertyEnhanced);

/**
 * @route GET /api/enhanced-property/analysis/:propertyId
 * @desc Get cached property analysis by property ID or URL
 * @access Public
 * @params {string} propertyId - Property URL (encoded) or database ID
 * @returns {Object} Cached property analysis data
 */
router.get('/analysis/:propertyId', enhancedPropertyController.getCachedAnalysis);

/**
 * @route POST /api/enhanced-property/analyze-batch
 * @desc Batch analyze multiple properties
 * @access Private (requires authentication)
 * @body {
 *   urls: string[] (required) - Array of property URLs (max 10)
 *   options: Object - Analysis options
 * }
 * @returns {Object} Batch analysis results with summary statistics
 */
router.post('/analyze-batch', authMiddleware, enhancedPropertyController.batchAnalyzeProperties);

/**
 * @route GET /api/enhanced-property/analysis-history
 * @desc Get user's property analysis history
 * @access Private (requires authentication)
 * @query {
 *   limit: number - Results per page (default: 20)
 *   offset: number - Pagination offset (default: 0)
 *   city: string - Filter by city
 *   country: string - Filter by country
 *   platform: string - Filter by platform (funda, idealista, etc.)
 * }
 * @returns {Object} Paginated list of property analyses
 */
router.get('/analysis-history', authMiddleware, enhancedPropertyController.getAnalysisHistory);

module.exports = router;