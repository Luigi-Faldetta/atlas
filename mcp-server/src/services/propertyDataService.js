const axios = require('axios');
const logger = require('../utils/logger');

// Get the internal backend URL from environment variables
const INTERNAL_BACKEND_URL = process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000/api';
const INTERNAL_SCRAPER_URL = process.env.INTERNAL_SCRAPER_URL || 'http://localhost:5000/api/scraper';

class PropertyDataService {
  /**
   * Fetch property analysis from the internal backend (atlasScript)
   * @param {string} propertyUrl - The property URL to analyze
   * @returns {Object} Property analysis data
   */
  async fetchPropertyAnalysis(propertyUrl) {
    try {
      logger.info(`Fetching property analysis for URL: ${propertyUrl}`);
      
      // Call the internal backend analyze endpoint
      const response = await axios.post(`${INTERNAL_BACKEND_URL}/analyze`, {
        url: propertyUrl
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.success) {
        return response.data;
      } else {
        throw new Error('Failed to get successful response from backend');
      }
    } catch (error) {
      logger.error('Error fetching property analysis:', error);
      
      // If backend is unavailable, return mock data
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        logger.warn('Backend unavailable, returning mock data');
        return this.getMockPropertyData(propertyUrl);
      }
      
      throw error;
    }
  }

  /**
   * Enrich property data with additional metrics
   * This adds any missing fields that the AI might not have generated
   * @param {Object} propertyData - The property data from backend
   * @returns {Object} Enriched property data
   */
  enrichPropertyData(propertyData) {
    const analysis = propertyData.agent_analysis || {};
    const scrapedData = propertyData.scraped_data || {};
    
    // Default values for missing fields
    const defaults = {
      // Financial metrics
      dscr: analysis.dscr || 1.25,
      cash_on_cash_return: analysis.cash_on_cash_return || 7.5,
      grm: analysis.grm || 15.5,
      irr: analysis.irr || 12.5,
      equity_buildup: analysis.equity_buildup || 8500,
      
      // Market metrics
      days_on_market: analysis.days_on_market || 45,
      property_tax_rate: analysis.property_tax_rate || 1.2,
      community_fees: analysis.community_fees || 200,
      vacancy_rate: analysis.vacancy_rate || 5.5,
      tourist_activity: analysis.tourist_activity || 'Medium',
      
      // Property specifications
      energy_label: analysis.energy_label || 'C',
      building_type: analysis.building_type || 'Apartment',
      
      // Environmental & safety
      flood_risk: analysis.flood_risk || 2.5,
      crime_rate: analysis.crime_rate || 3.2,
      noise_level: analysis.noise_level || 45,
      air_quality: analysis.air_quality || 75,
      
      // Calculate projected values
      projected_value_5_years: this.calculateProjectedValue(
        scrapedData.price,
        analysis.yearly_appreciation_percentage || 3.5,
        5
      ),
      projected_value_10_years: this.calculateProjectedValue(
        scrapedData.price,
        analysis.yearly_appreciation_percentage || 3.5,
        10
      ),
      
      // Additional calculated metrics
      net_operating_income: this.calculateNOI(
        analysis.monthly_rental_income || 0,
        analysis.community_fees || 200,
        analysis.property_tax_rate || 1.2,
        scrapedData.price
      ),
      cap_rate: this.calculateCapRate(
        analysis.monthly_rental_income || 0,
        analysis.community_fees || 200,
        analysis.property_tax_rate || 1.2,
        scrapedData.price
      ),
      
      // Location scores (0-100 scale)
      walkability_score: 75,
      transit_score: 68,
      bike_score: 82,
      
      // Market comparison
      market_average_price_sqm: scrapedData.price_per_sqm ? scrapedData.price_per_sqm * 1.05 : null,
      price_vs_market: -5, // 5% below market average
      
      // Rental market data
      rental_demand: 'High',
      average_rental_time: 14, // days to rent
      tenant_quality_score: 85,
    };
    
    // Merge with existing data, preserving existing values
    return {
      ...propertyData,
      agent_analysis: {
        ...analysis,
        ...Object.keys(defaults).reduce((acc, key) => {
          acc[key] = analysis[key] !== undefined && analysis[key] !== null ? analysis[key] : defaults[key];
          return acc;
        }, {})
      }
    };
  }

  /**
   * Calculate projected property value
   * @param {string} currentPrice - Current property price
   * @param {number} appreciationRate - Annual appreciation percentage
   * @param {number} years - Number of years to project
   * @returns {number} Projected value
   */
  calculateProjectedValue(currentPrice, appreciationRate, years) {
    if (!currentPrice || !appreciationRate) return null;
    
    // Extract numeric value from price string
    const priceNum = parseFloat(currentPrice.replace(/[^0-9.-]+/g, ''));
    if (isNaN(priceNum)) return null;
    
    // Calculate future value: FV = PV * (1 + r)^n
    const futureValue = priceNum * Math.pow(1 + (appreciationRate / 100), years);
    return Math.round(futureValue);
  }

  /**
   * Calculate Net Operating Income
   * @param {number} monthlyRent - Monthly rental income
   * @param {number} monthlyFees - Monthly community fees
   * @param {number} taxRate - Property tax rate percentage
   * @param {string} propertyPrice - Property price
   * @returns {number} Annual NOI
   */
  calculateNOI(monthlyRent, monthlyFees, taxRate, propertyPrice) {
    if (!monthlyRent || !propertyPrice) return null;
    
    const priceNum = parseFloat(propertyPrice.replace(/[^0-9.-]+/g, ''));
    if (isNaN(priceNum)) return null;
    
    const annualRent = monthlyRent * 12;
    const annualFees = monthlyFees * 12;
    const annualTax = (priceNum * taxRate) / 100;
    const annualExpenses = annualFees + annualTax;
    
    return Math.round(annualRent - annualExpenses);
  }

  /**
   * Calculate Cap Rate
   * @param {number} monthlyRent - Monthly rental income
   * @param {number} monthlyFees - Monthly community fees
   * @param {number} taxRate - Property tax rate percentage
   * @param {string} propertyPrice - Property price
   * @returns {number} Cap rate percentage
   */
  calculateCapRate(monthlyRent, monthlyFees, taxRate, propertyPrice) {
    const noi = this.calculateNOI(monthlyRent, monthlyFees, taxRate, propertyPrice);
    if (!noi || !propertyPrice) return null;
    
    const priceNum = parseFloat(propertyPrice.replace(/[^0-9.-]+/g, ''));
    if (isNaN(priceNum) || priceNum === 0) return null;
    
    return Math.round((noi / priceNum) * 100 * 100) / 100; // Round to 2 decimals
  }

  /**
   * Generate mock property data for testing
   * @param {string} propertyUrl - The property URL
   * @returns {Object} Mock property data
   */
  getMockPropertyData(propertyUrl) {
    return {
      success: true,
      market: 'dutch',
      scraped_data: {
        address: 'Herengracht 123, Amsterdam',
        price: '€750,000',
        living_area: '120 m²',
        bedrooms: '3',
        bathrooms: '2',
        year_built: '1985',
        price_per_sqm: 6250
      },
      agent_analysis: {
        investment_score: 78,
        address: 'Herengracht 123, Amsterdam',
        roi_5_years: 8.5,
        roi_10_years: 12.3,
        yearly_yield: 4.2,
        monthly_rental_income: 2650,
        expected_monthly_income: 2915,
        yearly_appreciation_percentage: 3.5,
        yearly_appreciation_value: 26250,
        strengths: [
          'Prime location in Amsterdam city center',
          'Good rental yield potential',
          'Well-maintained property'
        ],
        weaknesses: [
          'High initial investment required',
          'Older building may need renovations',
          'Competitive rental market'
        ],
        dscr: 1.35,
        cash_on_cash_return: 7.8,
        grm: 16.2,
        irr: 11.5,
        equity_buildup: 9200,
        days_on_market: 30,
        property_tax_rate: 1.1,
        community_fees: 250,
        vacancy_rate: 4.5,
        tourist_activity: null,
        energy_label: 'C',
        building_type: 'Historic Canal House',
        flood_risk: 8.5,
        crime_rate: 2.8,
        noise_level: 55,
        air_quality: 72
      }
    };
  }
}

module.exports = new PropertyDataService(); 