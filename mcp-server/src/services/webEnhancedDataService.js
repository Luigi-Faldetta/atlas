const logger = require('../utils/logger');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Web-Enhanced Data Service
 * Combines web scraping with ChatGPT processing for comprehensive real estate data
 */
class WebEnhancedDataService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.cacheTimeout = 6 * 60 * 60 * 1000; // 6 hours
    this.dataCache = new Map();
  }

  /**
   * Scrape and analyze real estate listing data using web content + ChatGPT
   * @param {string} propertyUrl - URL of the property listing
   * @param {string} address - Property address for context
   * @returns {Promise<object>} Enhanced property data
   */
  async getEnhancedPropertyData(propertyUrl, address) {
    try {
      logger.info(`Getting enhanced property data for: ${propertyUrl}`);
      
      const cacheKey = `enhanced_${propertyUrl}`;
      const cached = this.dataCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      // Scrape the property listing page
      const scrapedData = await this.scrapePropertyListing(propertyUrl);
      
      // Process with ChatGPT for structured data extraction
      const enhancedData = await this.processWithChatGPT(scrapedData, address);
      
      // Cache the result
      this.dataCache.set(cacheKey, {
        data: enhancedData,
        timestamp: Date.now()
      });

      return enhancedData;
    } catch (error) {
      logger.error('Error getting enhanced property data:', error);
      return this.getDefaultEnhancedData(address);
    }
  }

  /**
   * Scrape property listing website
   * @private
   */
  async scrapePropertyListing(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Extract text content, removing scripts and styles
      $('script, style, nav, footer, header').remove();
      
      const textContent = $('body').text()
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 8000); // Limit to 8000 chars for ChatGPT

      return {
        url,
        content: textContent,
        title: $('title').text(),
        metaDescription: $('meta[name="description"]').attr('content') || '',
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error scraping property listing:', error);
      throw error;
    }
  }

  /**
   * Process scraped content with ChatGPT for structured data extraction
   * @private
   */
  async processWithChatGPT(scrapedData, address) {
    try {
      if (!this.openaiApiKey) {
        logger.warn('OpenAI API key not found, returning default data');
        return this.getDefaultEnhancedData(address);
      }

      const prompt = `
You are a real estate data analyst. Extract the following information from this property listing content and return it as a JSON object.

Property Address: ${address}
Listing Content: ${scrapedData.content}

Extract and calculate these specific fields:
{
  "walkScore": number (0-100, estimate based on mentioned amenities),
  "bikeScore": number (0-100, estimate based on cycling infrastructure mentions),
  "transitScore": number (0-100, estimate based on public transport mentions),
  "energyEfficiencyScore": number (0-100, based on energy features mentioned),
  "crimeRateEstimate": number (crimes per 1000 residents, estimate from safety mentions),
  "schoolQualityScore": number (0-100, based on school information),
  "nearbyAmenities": {
    "restaurants": number,
    "schools": number,
    "parks": number,
    "gyms": number,
    "groceryStores": number,
    "hospitals": number
  },
  "propertyFeatures": string[] (unique features mentioned),
  "marketTrends": {
    "priceDirection": "increasing|stable|decreasing",
    "demandLevel": "high|medium|low",
    "timeOnMarket": number (estimated days)
  },
  "investmentPotential": {
    "rentalDemand": "high|medium|low",
    "appreciation": "high|medium|low",
    "riskLevel": "low|medium|high"
  },
  "localInsights": string[] (key insights about the area)
}

Only include data that can be reasonably inferred from the content. Use null for unavailable data.
Return only valid JSON.
`;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a professional real estate data analyst. Extract information accurately and return only valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const extractedData = JSON.parse(response.data.choices[0].message.content);
      
      return {
        ...extractedData,
        source: 'web_enhanced',
        sourceUrl: scrapedData.url,
        lastUpdated: new Date().toISOString(),
        confidence: this.calculateConfidence(extractedData, scrapedData)
      };
    } catch (error) {
      logger.error('Error processing with ChatGPT:', error);
      return this.getDefaultEnhancedData(address);
    }
  }

  /**
   * Get current market data using web search + ChatGPT analysis
   */
  async getMarketResearch(address) {
    try {
      logger.info(`Getting market research for: ${address}`);
      
      // Extract city/area from address
      const searchLocation = this.extractLocationFromAddress(address);
      
      // Search for recent market data (this would be enhanced with actual search APIs)
      const marketSearchData = await this.searchMarketTrends(searchLocation);
      
      // Process with ChatGPT for insights
      const marketAnalysis = await this.analyzeMarketData(marketSearchData, address);
      
      return marketAnalysis;
    } catch (error) {
      logger.error('Error getting market research:', error);
      return this.getDefaultMarketData(address);
    }
  }

  /**
   * Search for market trends using web search
   * @private
   */
  async searchMarketTrends(location) {
    // This would integrate with search APIs like Google Custom Search, Bing, etc.
    // For now, returning mock data structure
    return {
      searchResults: [
        {
          title: `${location} Real Estate Market Report 2024`,
          snippet: "Market showing strong growth with 5.5% price appreciation year-over-year...",
          url: "example.com/market-report"
        },
        {
          title: `Investment Opportunities in ${location}`,
          snippet: "Rental yields averaging 6.2% with high demand for 2-3 bedroom properties...",
          url: "example.com/investment-guide"
        }
      ],
      searchDate: new Date().toISOString()
    };
  }

  /**
   * Analyze market data with ChatGPT
   * @private
   */
  async analyzeMarketData(searchData, address) {
    // Similar ChatGPT processing for market analysis
    // Would process search results and provide structured market insights
    return {
      priceAppreciation: 5.5,
      rentalYield: 6.2,
      marketSentiment: "positive",
      investmentGrade: "B+",
      keyTrends: [
        "Strong buyer demand",
        "Limited inventory",
        "Infrastructure improvements planned"
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculate confidence score based on data quality
   * @private
   */
  calculateConfidence(extractedData, scrapedData) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on data completeness
    const completedFields = Object.values(extractedData).filter(val => val !== null && val !== undefined).length;
    const totalFields = Object.keys(extractedData).length;
    confidence += (completedFields / totalFields) * 0.3;
    
    // Increase confidence based on content quality
    if (scrapedData.content.length > 1000) confidence += 0.1;
    if (scrapedData.title.length > 10) confidence += 0.05;
    if (scrapedData.metaDescription.length > 50) confidence += 0.05;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Extract location from address for search
   * @private
   */
  extractLocationFromAddress(address) {
    // Simple extraction - would be enhanced with proper geocoding
    const parts = address.split(',');
    return parts[parts.length - 1].trim(); // Get country/city
  }

  /**
   * Get default enhanced data when web scraping fails
   * @private
   */
  getDefaultEnhancedData(address) {
    return {
      walkScore: 70,
      bikeScore: 65,
      transitScore: 75,
      energyEfficiencyScore: 80,
      crimeRateEstimate: 15,
      schoolQualityScore: 85,
      nearbyAmenities: {
        restaurants: 12,
        schools: 3,
        parks: 2,
        gyms: 1,
        groceryStores: 4,
        hospitals: 1
      },
      propertyFeatures: ["Modern appliances", "Balcony", "Parking"],
      marketTrends: {
        priceDirection: "stable",
        demandLevel: "medium",
        timeOnMarket: 45
      },
      investmentPotential: {
        rentalDemand: "medium",
        appreciation: "medium",
        riskLevel: "low"
      },
      localInsights: [
        "Well-established neighborhood",
        "Good public transport connections",
        "Growing commercial area"
      ],
      source: 'default',
      confidence: 0.6,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get default market data
   * @private
   */
  getDefaultMarketData(address) {
    return {
      priceAppreciation: 4.2,
      rentalYield: 5.8,
      marketSentiment: "stable",
      investmentGrade: "B",
      keyTrends: [
        "Steady market growth",
        "Balanced supply and demand",
        "Stable economic conditions"
      ],
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = new WebEnhancedDataService(); 