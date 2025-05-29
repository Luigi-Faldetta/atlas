const logger = require('../utils/logger');

/**
 * Lifestyle Service - Provides amenities and lifestyle data
 * This service integrates with various APIs to provide comprehensive
 * lifestyle and amenity information for property locations.
 */
class LifestyleService {
  constructor() {
    this.cacheTimeout = 12 * 60 * 60 * 1000; // 12 hours
    this.dataCache = new Map();
  }

  /**
   * Get cultural venues nearby count
   * @param {string} address - Property address
   * @param {object} coordinates - Lat/lng coordinates
   * @returns {Promise<number>} Count of cultural venues
   */
  async getCulturalVenuesNearby(address, coordinates = null) {
    try {
      logger.info(`Getting cultural venues for: ${address}`);
      
      const venueData = this.getMockCulturalData(address);
      return venueData.count;
    } catch (error) {
      logger.error('Error fetching cultural venues:', error);
      return 3; // Default fallback
    }
  }

  /**
   * Get foot traffic level assessment
   * @param {string} address - Property address
   * @returns {Promise<string>} Foot traffic level (High/Medium/Low)
   */
  async getFootTrafficLevel(address) {
    try {
      logger.info(`Getting foot traffic level for: ${address}`);
      
      const trafficData = this.getMockTrafficData(address);
      return trafficData.level;
    } catch (error) {
      logger.error('Error fetching foot traffic level:', error);
      return "Medium"; // Default fallback
    }
  }

  /**
   * Get events per month in area
   * @param {string} address - Property address
   * @returns {Promise<number>} Number of events per month
   */
  async getEventsPerMonth(address) {
    try {
      logger.info(`Getting events per month for: ${address}`);
      
      const eventData = this.getMockEventData(address);
      return eventData.eventsPerMonth;
    } catch (error) {
      logger.error('Error fetching events data:', error);
      return 8; // Default fallback
    }
  }

  /**
   * Get sentiment score from local reviews
   * @param {string} address - Property address
   * @returns {Promise<number>} Sentiment score (0-100)
   */
  async getSentimentScore(address) {
    try {
      logger.info(`Getting sentiment score for: ${address}`);
      
      const sentimentData = this.getMockSentimentData(address);
      return sentimentData.score;
    } catch (error) {
      logger.error('Error fetching sentiment score:', error);
      return 75; // Default neutral-positive
    }
  }

  /**
   * Get public art and aesthetic score
   * @param {string} address - Property address
   * @returns {Promise<number>} Aesthetic score (0-100)
   */
  async getPublicArtScore(address) {
    try {
      logger.info(`Getting public art score for: ${address}`);
      
      const artData = this.getMockArtData(address);
      return artData.score;
    } catch (error) {
      logger.error('Error fetching public art score:', error);
      return 65; // Default moderate
    }
  }

  /**
   * Get pet-friendliness score
   * @param {string} address - Property address
   * @returns {Promise<number>} Pet-friendliness score (0-100)
   */
  async getPetFriendlinessScore(address) {
    try {
      logger.info(`Getting pet-friendliness score for: ${address}`);
      
      const petData = this.getMockPetData(address);
      return petData.score;
    } catch (error) {
      logger.error('Error fetching pet-friendliness score:', error);
      return 80; // Default good
    }
  }

  /**
   * Get local markets nearby count
   * @param {string} address - Property address
   * @returns {Promise<number>} Count of local markets
   */
  async getLocalMarketsNearby(address) {
    try {
      logger.info(`Getting local markets for: ${address}`);
      
      const marketData = this.getMockMarketData(address);
      return marketData.count;
    } catch (error) {
      logger.error('Error fetching local markets:', error);
      return 2; // Default fallback
    }
  }

  /**
   * Get parking space availability
   * @param {string} address - Property address
   * @returns {Promise<string>} Parking availability description
   */
  async getParkingAvailability(address) {
    try {
      logger.info(`Getting parking availability for: ${address}`);
      
      const parkingData = this.getMockParkingData(address);
      return parkingData.status;
    } catch (error) {
      logger.error('Error fetching parking availability:', error);
      return "Limited street parking"; // Default
    }
  }

  /**
   * Get proximity to large city information
   * @param {string} address - Property address
   * @returns {Promise<object>} City proximity data
   */
  async getProximityToLargeCity(address) {
    try {
      logger.info(`Getting proximity to large city for: ${address}`);
      
      const proximityData = this.getMockProximityData(address);
      return proximityData;
    } catch (error) {
      logger.error('Error fetching proximity data:', error);
      return { name: "Nearest City", distanceKm: 25, travelTimeMin: 30 };
    }
  }

  /**
   * Get comprehensive lifestyle data
   * @param {string} address - Property address
   * @param {object} coordinates - Lat/lng coordinates
   * @returns {Promise<object>} Complete lifestyle data
   */
  async getComprehensiveLifestyle(address, coordinates = null) {
    try {
      logger.info(`Getting comprehensive lifestyle data for: ${address}`);
      
      const cacheKey = `lifestyle_${address}`;
      const cached = this.dataCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        logger.info('Returning cached lifestyle data');
        return cached.data;
      }

      const [
        culturalVenues,
        footTraffic,
        eventsPerMonth,
        sentimentScore,
        publicArtScore,
        petFriendliness,
        localMarkets,
        parkingAvailability,
        proximityData
      ] = await Promise.all([
        this.getCulturalVenuesNearby(address, coordinates),
        this.getFootTrafficLevel(address),
        this.getEventsPerMonth(address),
        this.getSentimentScore(address),
        this.getPublicArtScore(address),
        this.getPetFriendlinessScore(address),
        this.getLocalMarketsNearby(address),
        this.getParkingAvailability(address),
        this.getProximityToLargeCity(address)
      ]);

      const lifestyleData = {
        culturalVenuesNearby: culturalVenues,
        footTrafficLevel: footTraffic,
        eventsPerMonthArea: eventsPerMonth,
        sentimentScoreLocalReviews: sentimentScore,
        publicArtAestheticScore: publicArtScore,
        petFriendlinessScore: petFriendliness,
        localMarketsNearby: localMarkets,
        parkingSpace: parkingAvailability,
        proximityToLargeCity: proximityData,
        location: address,
        lastUpdated: new Date().toISOString()
      };

      // Cache the result
      this.dataCache.set(cacheKey, {
        data: lifestyleData,
        timestamp: Date.now()
      });

      return lifestyleData;
    } catch (error) {
      logger.error('Error fetching comprehensive lifestyle data:', error);
      return this.getDefaultLifestyle(address);
    }
  }

  /**
   * Generate mock cultural venue data
   * @private
   */
  getMockCulturalData(address) {
    const cityPatterns = {
      amsterdam: { base: 8, variation: 3 },
      madrid: { base: 6, variation: 2 },
      barcelona: { base: 7, variation: 3 },
      rotterdam: { base: 5, variation: 2 },
      utrecht: { base: 4, variation: 2 },
      valencia: { base: 5, variation: 2 }
    };

    const addressLower = address.toLowerCase();
    let pattern = { base: 4, variation: 2 }; // Default

    for (const [city, data] of Object.entries(cityPatterns)) {
      if (addressLower.includes(city)) {
        pattern = data;
        break;
      }
    }

    const count = Math.max(0, pattern.base + Math.floor((Math.random() - 0.5) * pattern.variation * 2));
    return { count };
  }

  /**
   * Generate mock traffic data
   * @private
   */
  getMockTrafficData(address) {
    const levels = ['High', 'Medium', 'Low'];
    const addressLower = address.toLowerCase();
    
    let level = 'Medium'; // Default
    
    // Heuristics based on location type
    if (addressLower.includes('center') || addressLower.includes('centrum') || addressLower.includes('downtown')) {
      level = 'High';
    } else if (addressLower.includes('suburb') || addressLower.includes('residential') || addressLower.includes('quiet')) {
      level = 'Low';
    }

    return { level };
  }

  /**
   * Generate mock event data
   * @private
   */
  getMockEventData(address) {
    const cityEvents = {
      amsterdam: { base: 15, variation: 5 },
      madrid: { base: 12, variation: 4 },
      barcelona: { base: 14, variation: 5 },
      rotterdam: { base: 8, variation: 3 },
      utrecht: { base: 6, variation: 2 },
      valencia: { base: 10, variation: 3 }
    };

    const addressLower = address.toLowerCase();
    let pattern = { base: 8, variation: 3 }; // Default

    for (const [city, data] of Object.entries(cityEvents)) {
      if (addressLower.includes(city)) {
        pattern = data;
        break;
      }
    }

    const eventsPerMonth = Math.max(1, pattern.base + Math.floor((Math.random() - 0.5) * pattern.variation * 2));
    return { eventsPerMonth };
  }

  /**
   * Generate mock sentiment data
   * @private
   */
  getMockSentimentData(address) {
    // Base sentiment on city characteristics + random variation
    const baseSentiment = 75;
    const variation = (Math.random() - 0.5) * 20;
    const score = Math.max(20, Math.min(100, Math.round(baseSentiment + variation)));
    
    return { score };
  }

  /**
   * Generate mock art data
   * @private
   */
  getMockArtData(address) {
    const cityArt = {
      amsterdam: 85,
      madrid: 78,
      barcelona: 88,
      rotterdam: 75,
      utrecht: 70,
      valencia: 72
    };

    const addressLower = address.toLowerCase();
    let baseScore = 65; // Default

    for (const [city, score] of Object.entries(cityArt)) {
      if (addressLower.includes(city)) {
        baseScore = score;
        break;
      }
    }

    const variation = (Math.random() - 0.5) * 15;
    const score = Math.max(0, Math.min(100, Math.round(baseScore + variation)));

    return { score };
  }

  /**
   * Generate mock pet data
   * @private
   */
  getMockPetData(address) {
    // European cities are generally pet-friendly
    const basePetScore = 80;
    const variation = (Math.random() - 0.5) * 20;
    const score = Math.max(40, Math.min(100, Math.round(basePetScore + variation)));
    
    return { score };
  }

  /**
   * Generate mock market data
   * @private
   */
  getMockMarketData(address) {
    const cityMarkets = {
      amsterdam: { base: 3, variation: 2 },
      madrid: { base: 2, variation: 1 },
      barcelona: { base: 3, variation: 2 },
      rotterdam: { base: 2, variation: 1 },
      utrecht: { base: 1, variation: 1 },
      valencia: { base: 2, variation: 1 }
    };

    const addressLower = address.toLowerCase();
    let pattern = { base: 2, variation: 1 }; // Default

    for (const [city, data] of Object.entries(cityMarkets)) {
      if (addressLower.includes(city)) {
        pattern = data;
        break;
      }
    }

    const count = Math.max(0, pattern.base + Math.floor((Math.random() - 0.5) * pattern.variation * 2));
    return { count };
  }

  /**
   * Generate mock parking data
   * @private
   */
  getMockParkingData(address) {
    const options = [
      "Available with permit",
      "Limited street parking",
      "Good availability",
      "Private parking available",
      "Restricted parking zone"
    ];

    const addressLower = address.toLowerCase();
    let status = options[1]; // Default

    // Heuristics based on location
    if (addressLower.includes('center') || addressLower.includes('centrum')) {
      status = options[4]; // Restricted
    } else if (addressLower.includes('suburb') || addressLower.includes('residential')) {
      status = options[2]; // Good availability
    }

    return { status };
  }

  /**
   * Generate mock proximity data
   * @private
   */
  getMockProximityData(address) {
    const cityProximity = {
      amsterdam: { name: "Amsterdam", distanceKm: 0, travelTimeMin: 0 },
      madrid: { name: "Madrid", distanceKm: 0, travelTimeMin: 0 },
      barcelona: { name: "Barcelona", distanceKm: 0, travelTimeMin: 0 },
      rotterdam: { name: "Amsterdam", distanceKm: 75, travelTimeMin: 60 },
      utrecht: { name: "Amsterdam", distanceKm: 35, travelTimeMin: 30 },
      valencia: { name: "Madrid", distanceKm: 350, travelTimeMin: 210 }
    };

    const addressLower = address.toLowerCase();
    let proximityData = { name: "Nearest Major City", distanceKm: 50, travelTimeMin: 45 }; // Default

    for (const [city, data] of Object.entries(cityProximity)) {
      if (addressLower.includes(city)) {
        proximityData = data;
        break;
      }
    }

    return proximityData;
  }

  /**
   * Get default lifestyle data when services fail
   * @private
   */
  getDefaultLifestyle(address) {
    return {
      culturalVenuesNearby: 4,
      footTrafficLevel: "Medium",
      eventsPerMonthArea: 8,
      sentimentScoreLocalReviews: 75,
      publicArtAestheticScore: 65,
      petFriendlinessScore: 80,
      localMarketsNearby: 2,
      parkingSpace: "Limited street parking",
      proximityToLargeCity: { name: "Nearest City", distanceKm: 25, travelTimeMin: 30 },
      location: address,
      lastUpdated: new Date().toISOString(),
      note: "Default values - external service unavailable"
    };
  }
}

module.exports = new LifestyleService(); 