// Load environment variables from .env file
require('dotenv').config();

// Configuration for external APIs used by the MCP
const apiConfig = {
  // Air Quality API (e.g., AirVisual)
  airQuality: {
    baseUrl: process.env.AIR_QUALITY_API_URL || 'https://api.airvisual.com/v2',
    apiKey: process.env.AIR_QUALITY_API_KEY,
    enabled: !!process.env.AIR_QUALITY_API_KEY
  },
  
  // News API (e.g., NewsAPI.org)
  news: {
    baseUrl: process.env.NEWS_API_URL || 'https://newsapi.org/v2',
    apiKey: process.env.NEWS_API_KEY,
    enabled: !!process.env.NEWS_API_KEY
  },
  
  // Geocoding API (e.g., Google Maps, Nominatim)
  geocoding: {
    baseUrl: process.env.GEOCODING_API_URL || 'https://maps.googleapis.com/maps/api/geocode',
    apiKey: process.env.GEOCODING_API_KEY,
    enabled: !!process.env.GEOCODING_API_KEY
  },
  
  // Places API (e.g., Google Places, Foursquare)
  places: {
    baseUrl: process.env.PLACES_API_URL || 'https://maps.googleapis.com/maps/api/place',
    apiKey: process.env.PLACES_API_KEY,
    enabled: !!process.env.PLACES_API_KEY
  },
  
  // Weather API (e.g., OpenWeatherMap)
  weather: {
    baseUrl: process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',
    apiKey: process.env.WEATHER_API_KEY,
    enabled: !!process.env.WEATHER_API_KEY
  },
  
  // Crime Data API (can vary by country/region)
  crime: {
    baseUrl: process.env.CRIME_API_URL,
    apiKey: process.env.CRIME_API_KEY,
    enabled: !!(process.env.CRIME_API_URL && process.env.CRIME_API_KEY)
  },
  
  // Census/Demographics API (can vary by country/region)
  census: {
    baseUrl: process.env.CENSUS_API_URL,
    apiKey: process.env.CENSUS_API_KEY,
    enabled: !!(process.env.CENSUS_API_URL && process.env.CENSUS_API_KEY)
  },
  
  // Real Estate API (for market data, trends)
  realEstate: {
    baseUrl: process.env.REAL_ESTATE_API_URL,
    apiKey: process.env.REAL_ESTATE_API_KEY,
    enabled: !!(process.env.REAL_ESTATE_API_URL && process.env.REAL_ESTATE_API_KEY)
  },
  
  // Walkability/Transit Score API
  walkability: {
    baseUrl: process.env.WALKABILITY_API_URL,
    apiKey: process.env.WALKABILITY_API_KEY,
    enabled: !!(process.env.WALKABILITY_API_URL && process.env.WALKABILITY_API_KEY)
  },
  
  // Configuration for potential internal API services
  internal: {
    // Existing backend API
    backend: {
      baseUrl: process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000/api',
      enabled: !!process.env.INTERNAL_BACKEND_URL
    },
    
    // Scraper API/endpoint
    scraper: {
      baseUrl: process.env.INTERNAL_SCRAPER_URL || 'http://localhost:5000/api/scraper',
      enabled: !!process.env.INTERNAL_SCRAPER_URL
    }
  }
};

// Log configuration status for debugging
const logger = require('../utils/logger');
if (process.env.NODE_ENV !== 'test') {
  Object.keys(apiConfig).forEach(api => {
    if (api !== 'internal' && apiConfig[api].enabled) {
      logger.info(`${api} API is enabled`);
    } else if (api !== 'internal') {
      logger.warn(`${api} API is not enabled`);
    }
  });
}

module.exports = apiConfig; 