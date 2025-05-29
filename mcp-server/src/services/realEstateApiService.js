const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Real Estate API Integration Service
 * Integrates with multiple real estate APIs for comprehensive property data
 */
class RealEstateApiService {
  constructor() {
    // API Keys - these should be in environment variables
    this.rentcastApiKey = process.env.RENTCAST_API_KEY;
    this.walkscoreApiKey = process.env.WALKSCORE_API_KEY;
    this.attomApiKey = process.env.ATTOM_API_KEY;
    this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    this.cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
    this.dataCache = new Map();
  }

  /**
   * Get comprehensive property data from multiple APIs
   * @param {string} address - Property address
   * @param {object} coordinates - Lat/lng coordinates
   * @returns {Promise<object>} Comprehensive property data
   */
  async getComprehensivePropertyData(address, coordinates = null) {
    try {
      logger.info(`Getting comprehensive property data for: ${address}`);
      
      const cacheKey = `comprehensive_${address}`;
      const cached = this.dataCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      // Get data from multiple sources in parallel
      const [
        rentcastData,
        walkscoreData,
        attomData,
        nearbyPlacesData
      ] = await Promise.allSettled([
        this.getRentcastData(address),
        this.getWalkscoreData(address, coordinates),
        this.getAttomData(address),
        this.getNearbyPlaces(address, coordinates)
      ]);

      // Combine and normalize data
      const comprehensiveData = this.combineApiData({
        rentcast: rentcastData.status === 'fulfilled' ? rentcastData.value : null,
        walkscore: walkscoreData.status === 'fulfilled' ? walkscoreData.value : null,
        attom: attomData.status === 'fulfilled' ? attomData.value : null,
        nearbyPlaces: nearbyPlacesData.status === 'fulfilled' ? nearbyPlacesData.value : null
      }, address);

      // Cache the result
      this.dataCache.set(cacheKey, {
        data: comprehensiveData,
        timestamp: Date.now()
      });

      return comprehensiveData;
    } catch (error) {
      logger.error('Error getting comprehensive property data:', error);
      return this.getDefaultComprehensiveData(address);
    }
  }

  /**
   * Get property data from RentCast API
   * @private
   */
  async getRentcastData(address) {
    try {
      if (!this.rentcastApiKey) {
        logger.warn('RentCast API key not found');
        return null;
      }

      // RentCast Property Records API
      const response = await axios.get('https://api.rentcast.io/v1/property/records', {
        params: {
          address: address,
          format: 'json'
        },
        headers: {
          'X-API-Key': this.rentcastApiKey
        },
        timeout: 10000
      });

      return {
        source: 'rentcast',
        propertyDetails: response.data,
        rentEstimate: await this.getRentcastRentEstimate(address),
        valueEstimate: await this.getRentcastValueEstimate(address)
      };
    } catch (error) {
      logger.error('Error fetching RentCast data:', error);
      return null;
    }
  }

  /**
   * Get rent estimate from RentCast
   * @private
   */
  async getRentcastRentEstimate(address) {
    try {
      if (!this.rentcastApiKey) return null;

      const response = await axios.get('https://api.rentcast.io/v1/property/rent-estimate', {
        params: {
          address: address,
          format: 'json'
        },
        headers: {
          'X-API-Key': this.rentcastApiKey
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching RentCast rent estimate:', error);
      return null;
    }
  }

  /**
   * Get value estimate from RentCast
   * @private
   */
  async getRentcastValueEstimate(address) {
    try {
      if (!this.rentcastApiKey) return null;

      const response = await axios.get('https://api.rentcast.io/v1/property/value-estimate', {
        params: {
          address: address,
          format: 'json'
        },
        headers: {
          'X-API-Key': this.rentcastApiKey
        },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      logger.error('Error fetching RentCast value estimate:', error);
      return null;
    }
  }

  /**
   * Get walkability data from WalkScore API
   * @private
   */
  async getWalkscoreData(address, coordinates) {
    try {
      if (!this.walkscoreApiKey || !coordinates) {
        logger.warn('WalkScore API key or coordinates not found');
        return this.getMockWalkscoreData();
      }

      const response = await axios.get('https://api.walkscore.com/score', {
        params: {
          format: 'json',
          address: address,
          lat: coordinates.latitude,
          lon: coordinates.longitude,
          transit: 1,
          bike: 1,
          wsapikey: this.walkscoreApiKey
        },
        timeout: 10000
      });

      return {
        source: 'walkscore',
        walkScore: response.data.walkscore,
        transitScore: response.data.transit?.score || null,
        bikeScore: response.data.bike?.score || null,
        description: response.data.description,
        updated: response.data.updated
      };
    } catch (error) {
      logger.error('Error fetching WalkScore data:', error);
      return this.getMockWalkscoreData();
    }
  }

  /**
   * Get property data from ATTOM API
   * @private
   */
  async getAttomData(address) {
    try {
      if (!this.attomApiKey) {
        logger.warn('ATTOM API key not found');
        return null;
      }

      // ATTOM Property Detail API
      const response = await axios.get('https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/basicprofile', {
        params: {
          address1: address,
          format: 'json'
        },
        headers: {
          'ApiKey': this.attomApiKey,
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      return {
        source: 'attom',
        propertyData: response.data,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error fetching ATTOM data:', error);
      return null;
    }
  }

  /**
   * Get nearby places using Google Maps Places API
   * @private
   */
  async getNearbyPlaces(address, coordinates) {
    try {
      if (!this.googleMapsApiKey || !coordinates) {
        logger.warn('Google Maps API key or coordinates not found');
        return this.getMockNearbyPlaces();
      }

      const placeTypes = ['school', 'hospital', 'restaurant', 'gym', 'grocery_or_supermarket', 'park'];
      const nearbyData = {};

      for (const type of placeTypes) {
        try {
          const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
              location: `${coordinates.latitude},${coordinates.longitude}`,
              radius: 1000, // 1km radius
              type: type,
              key: this.googleMapsApiKey
            },
            timeout: 10000
          });

          nearbyData[type] = {
            count: response.data.results.length,
            places: response.data.results.slice(0, 5).map(place => ({
              name: place.name,
              rating: place.rating,
              vicinity: place.vicinity
            }))
          };
        } catch (typeError) {
          logger.warn(`Error fetching ${type} data:`, typeError.message);
          nearbyData[type] = { count: 0, places: [] };
        }

        // Add delay between requests to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return {
        source: 'google_places',
        nearbyPlaces: nearbyData,
        searchRadius: 1000,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error fetching nearby places:', error);
      return this.getMockNearbyPlaces();
    }
  }

  /**
   * Combine data from multiple API sources
   * @private
   */
  combineApiData(apiData, address) {
    const combined = {
      address: address,
      sources: [],
      lastUpdated: new Date().toISOString()
    };

    // Process RentCast data
    if (apiData.rentcast) {
      combined.sources.push('rentcast');
      const rentcast = apiData.rentcast;
      
      if (rentcast.propertyDetails) {
        combined.propertyValue = rentcast.propertyDetails.value;
        combined.yearBuilt = rentcast.propertyDetails.yearBuilt;
        combined.bedrooms = rentcast.propertyDetails.bedrooms;
        combined.bathrooms = rentcast.propertyDetails.bathrooms;
        combined.squareFootage = rentcast.propertyDetails.squareFootage;
      }
      
      if (rentcast.rentEstimate) {
        combined.estimatedRent = rentcast.rentEstimate.rent;
        combined.rentConfidence = rentcast.rentEstimate.confidence;
      }
    }

    // Process WalkScore data
    if (apiData.walkscore) {
      combined.sources.push('walkscore');
      combined.walkScore = apiData.walkscore.walkScore;
      combined.transitScore = apiData.walkscore.transitScore;
      combined.bikeScore = apiData.walkscore.bikeScore;
      combined.walkDescription = apiData.walkscore.description;
    }

    // Process ATTOM data
    if (apiData.attom && apiData.attom.propertyData) {
      combined.sources.push('attom');
      const attom = apiData.attom.propertyData;
      
      // Extract relevant ATTOM data points
      if (attom.property && attom.property[0]) {
        const property = attom.property[0];
        combined.taxAssessment = property.assessment?.assessed?.total;
        combined.propertyType = property.summary?.proptype;
        combined.lotSize = property.lot?.lotsize1;
      }
    }

    // Process Google Places data
    if (apiData.nearbyPlaces) {
      combined.sources.push('google_places');
      const places = apiData.nearbyPlaces.nearbyPlaces;
      
      combined.nearbyAmenities = {
        schools: places.school?.count || 0,
        hospitals: places.hospital?.count || 0,
        restaurants: places.restaurant?.count || 0,
        gyms: places.gym?.count || 0,
        groceryStores: places.grocery_or_supermarket?.count || 0,
        parks: places.park?.count || 0
      };
      
      combined.nearbyPlacesDetails = places;
    }

    // Calculate derived metrics
    combined.investmentMetrics = this.calculateInvestmentMetrics(combined);
    
    return combined;
  }

  /**
   * Calculate investment metrics from combined data
   * @private
   */
  calculateInvestmentMetrics(data) {
    const metrics = {};

    // Calculate rental yield if we have both rent and value
    if (data.estimatedRent && data.propertyValue) {
      const annualRent = data.estimatedRent * 12;
      metrics.grossRentalYield = ((annualRent / data.propertyValue) * 100).toFixed(2);
    }

    // Calculate walkability score (composite)
    if (data.walkScore || data.transitScore || data.bikeScore) {
      const scores = [data.walkScore, data.transitScore, data.bikeScore].filter(s => s != null);
      metrics.averageWalkabilityScore = scores.length > 0 ? 
        (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null;
    }

    // Calculate amenity density score
    if (data.nearbyAmenities) {
      const amenityCount = Object.values(data.nearbyAmenities).reduce((sum, count) => sum + count, 0);
      metrics.amenityDensityScore = Math.min((amenityCount / 30) * 100, 100).toFixed(1); // Scale to 100
    }

    return metrics;
  }

  /**
   * Get mock WalkScore data when API is unavailable
   * @private
   */
  getMockWalkscoreData() {
    return {
      source: 'mock',
      walkScore: 75,
      transitScore: 68,
      bikeScore: 82,
      description: "Very Walkable - Most errands can be accomplished on foot",
      updated: new Date().toISOString()
    };
  }

  /**
   * Get mock nearby places data when API is unavailable
   * @private
   */
  getMockNearbyPlaces() {
    return {
      source: 'mock',
      nearbyPlaces: {
        school: { count: 3, places: [] },
        hospital: { count: 1, places: [] },
        restaurant: { count: 12, places: [] },
        gym: { count: 2, places: [] },
        grocery_or_supermarket: { count: 4, places: [] },
        park: { count: 2, places: [] }
      },
      searchRadius: 1000,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get default comprehensive data when all APIs fail
   * @private
   */
  getDefaultComprehensiveData(address) {
    return {
      address: address,
      sources: ['default'],
      walkScore: 70,
      transitScore: 65,
      bikeScore: 75,
      nearbyAmenities: {
        schools: 3,
        hospitals: 1,
        restaurants: 8,
        gyms: 2,
        groceryStores: 3,
        parks: 2
      },
      investmentMetrics: {
        amenityDensityScore: "63.3"
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get market comparables for a property
   */
  async getMarketComparables(address, propertyDetails = {}) {
    try {
      logger.info(`Getting market comparables for: ${address}`);
      
      if (!this.rentcastApiKey) {
        return this.getMockComparables();
      }

      const response = await axios.get('https://api.rentcast.io/v1/property/comparables', {
        params: {
          address: address,
          radius: 1000, // 1km radius
          count: 10,
          format: 'json'
        },
        headers: {
          'X-API-Key': this.rentcastApiKey
        },
        timeout: 15000
      });

      return {
        source: 'rentcast',
        comparables: response.data,
        searchRadius: 1000,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error getting market comparables:', error);
      return this.getMockComparables();
    }
  }

  /**
   * Get mock comparables data
   * @private
   */
  getMockComparables() {
    return {
      source: 'mock',
      comparables: {
        count: 5,
        properties: [
          {
            address: "Similar Property 1",
            price: 445000,
            pricePerSqFt: 525,
            soldDate: "2024-01-15",
            daysOnMarket: 32
          },
          {
            address: "Similar Property 2", 
            price: 468000,
            pricePerSqFt: 540,
            soldDate: "2024-02-03",
            daysOnMarket: 28
          }
        ]
      },
      searchRadius: 1000,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = new RealEstateApiService(); 