const express = require('express');
const router = express.Router();
const propertyAnalysisController = require('../controllers/propertyAnalysis');
const rateLimiter = require('../middleware/rateLimiter');

// Property analysis routes with rate limiting
// Base URL: /api/v1/property-analysis

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/summary
router.get(
  '/:propertyIdentifier/summary', 
  rateLimiter.standard,
  propertyAnalysisController.getSummary
);

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/air-quality
router.get(
  '/:propertyIdentifier/air-quality', 
  rateLimiter.standard,
  propertyAnalysisController.getAirQuality
);

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/local-news
router.get(
  '/:propertyIdentifier/local-news', 
  rateLimiter.standard,
  propertyAnalysisController.getLocalNews
);

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/financials
router.get(
  '/:propertyIdentifier/financials', 
  rateLimiter.standard,
  propertyAnalysisController.getFinancials
);

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/property-details
router.get(
  '/:propertyIdentifier/property-details', 
  rateLimiter.standard,
  propertyAnalysisController.getPropertyDetails
);

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/neighborhood
router.get(
  '/:propertyIdentifier/neighborhood', 
  rateLimiter.standard,
  propertyAnalysisController.getNeighborhood
);

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/full
router.get(
  '/:propertyIdentifier/full', 
  rateLimiter.strict,
  propertyAnalysisController.getFullAnalysis
);

/*
// Endpoint: /api/v1/property-analysis/:propertyIdentifier/location-context
router.get(
  '/:propertyIdentifier/location-context', 
  rateLimiter.standard,
  propertyAnalysisController.getLocationContext
);

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/environmental-safety
router.get(
  '/:propertyIdentifier/environmental-safety', 
  rateLimiter.standard,
  propertyAnalysisController.getEnvironmentalSafety
);

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/market-trends
router.get(
  '/:propertyIdentifier/market-trends', 
  rateLimiter.standard,
  propertyAnalysisController.getMarketTrends
);

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/socio-economic
router.get(
  '/:propertyIdentifier/socio-economic', 
  rateLimiter.standard,
  propertyAnalysisController.getSocioEconomic
);

// Endpoint: /api/v1/property-analysis/:propertyIdentifier/local-feed
router.get(
  '/:propertyIdentifier/local-feed', 
  rateLimiter.standard,
  propertyAnalysisController.getLocalFeed
);
*/

module.exports = router; 