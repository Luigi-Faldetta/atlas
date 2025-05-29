const logger = require('../utils/logger');

/**
 * Market Activity Service - Provides market dynamics and property-specific data
 * This service tracks real estate market activity and property-specific metrics.
 */
class MarketActivityService {
  constructor() {
    this.cacheTimeout = 6 * 60 * 60 * 1000; // 6 hours (market data changes frequently)
    this.dataCache = new Map();
  }

  /**
   * Get short-term rental activity level
   * @param {string} address - Property address
   * @param {object} coordinates - Lat/lng coordinates
   * @returns {Promise<string>} Activity level (High/Medium/Low)
   */
  async getShortTermRentalActivity(address, coordinates = null) {
    try {
      logger.info(`Getting short-term rental activity for: ${address}`);
      
      const activityData = this.getMockRentalActivity(address);
      return activityData.level;
    } catch (error) {
      logger.error('Error fetching short-term rental activity:', error);
      return "Medium"; // Default fallback
    }
  }

  /**
   * Get assessed property value
   * @param {string} address - Property address
   * @param {number} currentPrice - Current listing/market price
   * @returns {Promise<number>} Assessed value in local currency
   */
  async getAssessedPropertyValue(address, currentPrice = null) {
    try {
      logger.info(`Getting assessed property value for: ${address}`);
      
      const assessmentData = this.getMockAssessedValue(address, currentPrice);
      return assessmentData.value;
    } catch (error) {
      logger.error('Error fetching assessed property value:', error);
      return currentPrice ? currentPrice * 0.9 : 350000; // Default fallback
    }
  }

  /**
   * Get number of listings nearby
   * @param {string} address - Property address
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {Promise<number>} Count of nearby listings
   */
  async getListingsNearby(address, radiusKm = 2) {
    try {
      logger.info(`Getting listings nearby for: ${address} (${radiusKm}km radius)`);
      
      const listingsData = this.getMockListingsData(address);
      return listingsData.count;
    } catch (error) {
      logger.error('Error fetching nearby listings:', error);
      return 15; // Default fallback
    }
  }

  /**
   * Get estimated utility costs
   * @param {string} address - Property address
   * @param {number} propertySize - Property size in square meters
   * @returns {Promise<number>} Monthly utility costs in local currency
   */
  async getEstimatedUtilityCosts(address, propertySize = 85) {
    try {
      logger.info(`Getting estimated utility costs for: ${address} (${propertySize}m²)`);
      
      const utilityData = this.getMockUtilityData(address, propertySize);
      return utilityData.monthlyCost;
    } catch (error) {
      logger.error('Error fetching estimated utility costs:', error);
      return 150; // Default fallback
    }
  }

  /**
   * Get comprehensive market activity data
   * @param {string} address - Property address
   * @param {object} propertyDetails - Additional property details
   * @returns {Promise<object>} Complete market activity data
   */
  async getComprehensiveMarketActivity(address, propertyDetails = {}) {
    try {
      logger.info(`Getting comprehensive market activity for: ${address}`);
      
      const cacheKey = `market_activity_${address}`;
      const cached = this.dataCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        logger.info('Returning cached market activity data');
        return cached.data;
      }

      const { currentPrice, size } = propertyDetails;

      const [
        rentalActivity,
        assessedValue,
        listingsNearby,
        utilityCosts
      ] = await Promise.all([
        this.getShortTermRentalActivity(address),
        this.getAssessedPropertyValue(address, currentPrice),
        this.getListingsNearby(address),
        this.getEstimatedUtilityCosts(address, size)
      ]);

      const marketActivityData = {
        shortTermRentalActivity: rentalActivity,
        assessedPropertyValue: assessedValue,
        listingsNearby: listingsNearby,
        estimatedUtilityCosts: utilityCosts,
        location: address,
        lastUpdated: new Date().toISOString()
      };

      // Cache the result
      this.dataCache.set(cacheKey, {
        data: marketActivityData,
        timestamp: Date.now()
      });

      return marketActivityData;
    } catch (error) {
      logger.error('Error fetching comprehensive market activity:', error);
      return this.getDefaultMarketActivity(address);
    }
  }

  /**
   * Generate mock rental activity data
   * @private
   */
  getMockRentalActivity(address) {
    const cityActivity = {
      amsterdam: 'High',
      madrid: 'Medium',
      barcelona: 'High',
      rotterdam: 'Medium',
      utrecht: 'Low',
      valencia: 'Medium'
    };

    const addressLower = address.toLowerCase();
    let level = 'Medium'; // Default

    for (const [city, activity] of Object.entries(cityActivity)) {
      if (addressLower.includes(city)) {
        level = activity;
        break;
      }
    }

    // Adjust based on area characteristics
    if (addressLower.includes('center') || addressLower.includes('centrum') || addressLower.includes('tourist')) {
      level = 'High';
    } else if (addressLower.includes('residential') || addressLower.includes('suburb')) {
      level = 'Low';
    }

    return { level };
  }

  /**
   * Generate mock assessed value data
   * @private
   */
  getMockAssessedValue(address, currentPrice) {
    let baseValue = 350000; // Default

    if (currentPrice) {
      // Assessed value is typically 85-95% of market price
      const assessmentRatio = 0.85 + Math.random() * 0.1;
      baseValue = Math.round(currentPrice * assessmentRatio);
    } else {
      // Estimate based on city patterns
      const cityValues = {
        amsterdam: 450000,
        madrid: 320000,
        barcelona: 380000,
        rotterdam: 280000,
        utrecht: 420000,
        valencia: 250000
      };

      const addressLower = address.toLowerCase();
      for (const [city, value] of Object.entries(cityValues)) {
        if (addressLower.includes(city)) {
          baseValue = value;
          break;
        }
      }

      // Add variation
      const variation = (Math.random() - 0.5) * 0.2;
      baseValue = Math.round(baseValue * (1 + variation));
    }

    return { value: baseValue };
  }

  /**
   * Generate mock listings data
   * @private
   */
  getMockListingsData(address) {
    const cityListings = {
      amsterdam: { base: 25, variation: 10 },
      madrid: { base: 20, variation: 8 },
      barcelona: { base: 22, variation: 9 },
      rotterdam: { base: 15, variation: 6 },
      utrecht: { base: 12, variation: 5 },
      valencia: { base: 18, variation: 7 }
    };

    const addressLower = address.toLowerCase();
    let pattern = { base: 18, variation: 7 }; // Default

    for (const [city, data] of Object.entries(cityListings)) {
      if (addressLower.includes(city)) {
        pattern = data;
        break;
      }
    }

    // Adjust for area characteristics
    let multiplier = 1;
    if (addressLower.includes('center') || addressLower.includes('centrum')) {
      multiplier = 1.3; // More listings in city center
    } else if (addressLower.includes('suburb') || addressLower.includes('residential')) {
      multiplier = 0.7; // Fewer listings in suburbs
    }

    const variation = (Math.random() - 0.5) * pattern.variation * 2;
    const count = Math.max(1, Math.round((pattern.base + variation) * multiplier));

    return { count };
  }

  /**
   * Generate mock utility data
   * @private
   */
  getMockUtilityData(address, propertySize) {
    // Base utility costs per m² by country/city
    const cityUtilityRates = {
      amsterdam: { rate: 2.2, baseMonthly: 45 },
      madrid: { rate: 1.8, baseMonthly: 35 },
      barcelona: { rate: 1.9, baseMonthly: 38 },
      rotterdam: { rate: 2.1, baseMonthly: 42 },
      utrecht: { rate: 2.0, baseMonthly: 40 },
      valencia: { rate: 1.7, baseMonthly: 32 }
    };

    const addressLower = address.toLowerCase();
    let rates = { rate: 2.0, baseMonthly: 40 }; // Default

    for (const [city, data] of Object.entries(cityUtilityRates)) {
      if (addressLower.includes(city)) {
        rates = data;
        break;
      }
    }

    // Calculate based on property size
    const sizeBasedCost = propertySize * rates.rate;
    const totalMonthlyCost = Math.round(rates.baseMonthly + sizeBasedCost);

    // Add seasonal variation (winter is typically higher)
    const month = new Date().getMonth();
    const seasonalMultiplier = (month >= 10 || month <= 2) ? 1.2 : 0.9;
    
    const monthlyCost = Math.round(totalMonthlyCost * seasonalMultiplier);

    return { monthlyCost };
  }

  /**
   * Get default market activity data when services fail
   * @private
   */
  getDefaultMarketActivity(address) {
    return {
      shortTermRentalActivity: "Medium",
      assessedPropertyValue: 350000,
      listingsNearby: 18,
      estimatedUtilityCosts: 150,
      location: address,
      lastUpdated: new Date().toISOString(),
      note: "Default values - external service unavailable"
    };
  }
}

module.exports = new MarketActivityService(); 