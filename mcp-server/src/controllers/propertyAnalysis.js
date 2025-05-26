const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const geocodingService = require('../services/geocodingService');
const airQualityService = require('../services/airQualityService');
const newsService = require('../services/newsService');

// Helper function to parse a property identifier into components
const parsePropertyIdentifier = async (propertyIdentifier) => {
  // Use dummy coordinates for now since geocodingService is disabled
  return {
    type: 'address',
    address: propertyIdentifier,
    latitude: 52.3676,
    longitude: 4.9041
  };
};

// Get summary data for a property
const getSummary = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting summary for property: ${propertyIdentifier}`);
    
    // Parse the property identifier
    const property = await parsePropertyIdentifier(propertyIdentifier);
    
    // Fetch data from news service only since airQuality is disabled
    const localNews = await newsService.getLocalNews(property.address);
    
    // Prepare the response
    const response = {
      property: {
        identifier: propertyIdentifier,
        address: property.address,
        coordinates: {
          latitude: property.latitude,
          longitude: property.longitude
        }
      },
      airQuality: null,  // Air quality service is disabled
      localNews: localNews
    };
    
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    logger.error('Error getting property summary:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve property summary',
      error: error.message
    });
  }
};

// Get air quality data for a property
const getAirQuality = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting air quality for property: ${propertyIdentifier}`);
    
    // For demo/testing, return sample data
    // In production, you would use the airQualityService
    const sampleAirQuality = {
      aqi: 42,
      category: 'Good',
      pollutants: [
        {
          name: 'PM2.5',
          concentration: 8.2,
          unit: 'μg/m³'
        },
        {
          name: 'PM10',
          concentration: 16.4,
          unit: 'μg/m³'
        },
        {
          name: 'O3',
          concentration: 32.1,
          unit: 'ppb'
        },
        {
          name: 'NO2',
          concentration: 12.3,
          unit: 'ppb'
        }
      ],
      location: decodeURIComponent(propertyIdentifier),
      lastUpdated: new Date().toISOString()
    };
    
    return res.status(StatusCodes.OK).json(sampleAirQuality);
  } catch (error) {
    logger.error('Error getting air quality data:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve air quality data',
      error: error.message
    });
  }
};

// Get local news for a property
const getLocalNews = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting local news for property: ${propertyIdentifier}`);
    
    // Extract location from property identifier
    const locationName = decodeURIComponent(propertyIdentifier).split(',')[0];
    
    // Get news from the news service
    const news = await newsService.getLocalNews(locationName);
    
    // If there's an error message in the response, send it as a 503 Service Unavailable
    if (news && news.error) {
      return res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
        message: news.error
      });
    }
    
    return res.status(StatusCodes.OK).json(news);
  } catch (error) {
    logger.error('Error getting local news:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve local news',
      error: error.message
    });
  }
};

// Get financial data for a property
const getFinancials = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting financial data for property: ${propertyIdentifier}`);
    
    // Get property data from our database or other sources
    // This is just placeholder logic
    
    return res.status(StatusCodes.OK).json({
      message: 'Financial data API endpoint - Not yet implemented'
    });
  } catch (error) {
    logger.error('Error getting financial data:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve financial data',
      error: error.message
    });
  }
};

// Get property details
const getPropertyDetails = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting property details for: ${propertyIdentifier}`);
    
    // Get property details from our database or other sources
    // This is just placeholder logic
    
    return res.status(StatusCodes.OK).json({
      message: 'Property details API endpoint - Not yet implemented'
    });
  } catch (error) {
    logger.error('Error getting property details:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve property details',
      error: error.message
    });
  }
};

// Get neighborhood data
const getNeighborhood = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting neighborhood data for property: ${propertyIdentifier}`);
    
    // Get neighborhood data from our database or other sources
    // This is just placeholder logic
    
    return res.status(StatusCodes.OK).json({
      message: 'Neighborhood data API endpoint - Not yet implemented'
    });
  } catch (error) {
    logger.error('Error getting neighborhood data:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve neighborhood data',
      error: error.message
    });
  }
};

// Get full property analysis
const getFullAnalysis = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting full analysis for property: ${propertyIdentifier}`);
    
    // Get all property data and analysis
    // This is just placeholder logic
    
    return res.status(StatusCodes.OK).json({
      message: 'Full property analysis API endpoint - Not yet implemented'
    });
  } catch (error) {
    logger.error('Error getting full property analysis:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve full property analysis',
      error: error.message
    });
  }
};

module.exports = {
  getSummary,
  getAirQuality,
  getLocalNews,
  getFinancials,
  getPropertyDetails,
  getNeighborhood,
  getFullAnalysis
}; 