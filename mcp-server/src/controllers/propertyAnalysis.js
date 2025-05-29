const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');
const geocodingService = require('../services/geocodingService');
const airQualityService = require('../services/airQualityService');
const newsService = require('../services/newsService');
const propertyDataService = require('../services/propertyDataService');
const demographicsService = require('../services/demographicsService');
const lifestyleService = require('../services/lifestyleService');
const marketActivityService = require('../services/marketActivityService');
const webEnhancedDataService = require('../services/webEnhancedDataService');
const realEstateApiService = require('../services/realEstateApiService');

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
    
    // Fetch data from all enhanced services
    const [
      airQuality,
      localNews,
      demographics,
      lifestyle,
      marketActivity
    ] = await Promise.all([
      airQualityService.getComprehensiveAirQuality(property.address, {
        latitude: property.latitude,
        longitude: property.longitude
      }),
      newsService.getLocalNews(property.address),
      demographicsService.getComprehensiveDemographics(property.address),
      lifestyleService.getComprehensiveLifestyle(property.address),
      marketActivityService.getComprehensiveMarketActivity(property.address)
    ]);
    
    // Prepare the enhanced response
    const response = {
      property: {
        identifier: propertyIdentifier,
        address: property.address,
        coordinates: {
          latitude: property.latitude,
          longitude: property.longitude
        }
      },
      airQuality: airQuality,
      localNews: localNews,
      demographics: demographics,
      lifestyle: lifestyle,
      marketActivity: marketActivity,
      lastUpdated: new Date().toISOString()
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

// Get air quality data for a property (enhanced)
const getAirQuality = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting air quality for property: ${propertyIdentifier}`);
    
    // Parse the property identifier
    const property = await parsePropertyIdentifier(propertyIdentifier);
    
    // Get comprehensive air quality data
    const airQualityData = await airQualityService.getComprehensiveAirQuality(
      property.address,
      { latitude: property.latitude, longitude: property.longitude }
    );
    
    return res.status(StatusCodes.OK).json(airQualityData);
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

// NEW: Get demographics data for a property
const getDemographics = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting demographics data for property: ${propertyIdentifier}`);
    
    // Parse the property identifier
    const property = await parsePropertyIdentifier(propertyIdentifier);
    
    // Get comprehensive demographics data
    const demographicsData = await demographicsService.getComprehensiveDemographics(
      property.address,
      { latitude: property.latitude, longitude: property.longitude }
    );
    
    return res.status(StatusCodes.OK).json(demographicsData);
  } catch (error) {
    logger.error('Error getting demographics data:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve demographics data',
      error: error.message
    });
  }
};

// NEW: Get lifestyle data for a property
const getLifestyle = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting lifestyle data for property: ${propertyIdentifier}`);
    
    // Parse the property identifier
    const property = await parsePropertyIdentifier(propertyIdentifier);
    
    // Get comprehensive lifestyle data
    const lifestyleData = await lifestyleService.getComprehensiveLifestyle(
      property.address,
      { latitude: property.latitude, longitude: property.longitude }
    );
    
    return res.status(StatusCodes.OK).json(lifestyleData);
  } catch (error) {
    logger.error('Error getting lifestyle data:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve lifestyle data',
      error: error.message
    });
  }
};

// NEW: Get market activity data for a property
const getMarketActivity = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting market activity data for property: ${propertyIdentifier}`);
    
    // Parse the property identifier
    const property = await parsePropertyIdentifier(propertyIdentifier);
    
    // Extract property details from query parameters if available
    const propertyDetails = {
      currentPrice: req.query.price ? parseFloat(req.query.price) : null,
      size: req.query.size ? parseFloat(req.query.size) : 85 // Default 85 m²
    };
    
    // Get comprehensive market activity data
    const marketActivityData = await marketActivityService.getComprehensiveMarketActivity(
      property.address,
      propertyDetails
    );
    
    return res.status(StatusCodes.OK).json(marketActivityData);
  } catch (error) {
    logger.error('Error getting market activity data:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve market activity data',
      error: error.message
    });
  }
};

// Get financial data for a property
const getFinancials = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting financial data for property: ${propertyIdentifier}`);
    
    // Assume propertyIdentifier is a URL or can be converted to one
    let propertyUrl = propertyIdentifier;
    
    // If it's not a URL, try to construct one (this is a fallback)
    if (!propertyIdentifier.startsWith('http')) {
      // Default to a sample URL for testing
      propertyUrl = `https://www.funda.nl/koop/amsterdam/huis-${propertyIdentifier}/`;
    }
    
    // Fetch and enrich property data
    const propertyData = await propertyDataService.fetchPropertyAnalysis(propertyUrl);
    const enrichedData = propertyDataService.enrichPropertyData(propertyData);
    
    // Extract financial metrics
    const financialData = {
      investmentScore: enrichedData.agent_analysis.investment_score,
      roi: {
        fiveYears: enrichedData.agent_analysis.roi_5_years,
        tenYears: enrichedData.agent_analysis.roi_10_years
      },
      cashFlow: {
        monthlyRentalIncome: enrichedData.agent_analysis.monthly_rental_income,
        expectedMonthlyIncome: enrichedData.agent_analysis.expected_monthly_income,
        netOperatingIncome: enrichedData.agent_analysis.net_operating_income,
        cashOnCashReturn: enrichedData.agent_analysis.cash_on_cash_return
      },
      yields: {
        yearlyYield: enrichedData.agent_analysis.yearly_yield,
        capRate: enrichedData.agent_analysis.cap_rate,
        grm: enrichedData.agent_analysis.grm
      },
      financing: {
        dscr: enrichedData.agent_analysis.dscr,
        equityBuildup: enrichedData.agent_analysis.equity_buildup,
        irr: enrichedData.agent_analysis.irr
      },
      appreciation: {
        yearlyPercentage: enrichedData.agent_analysis.yearly_appreciation_percentage,
        yearlyValue: enrichedData.agent_analysis.yearly_appreciation_value,
        projectedValue5Years: enrichedData.agent_analysis.projected_value_5_years,
        projectedValue10Years: enrichedData.agent_analysis.projected_value_10_years
      },
      expenses: {
        propertyTaxRate: enrichedData.agent_analysis.property_tax_rate,
        communityFees: enrichedData.agent_analysis.community_fees,
        vacancyRate: enrichedData.agent_analysis.vacancy_rate
      }
    };
    
    return res.status(StatusCodes.OK).json(financialData);
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
    
    // Assume propertyIdentifier is a URL or can be converted to one
    let propertyUrl = propertyIdentifier;
    
    // If it's not a URL, try to construct one (this is a fallback)
    if (!propertyIdentifier.startsWith('http')) {
      // Default to a sample URL for testing
      propertyUrl = `https://www.funda.nl/koop/amsterdam/huis-${propertyIdentifier}/`;
    }
    
    // Fetch and enrich property data
    const propertyData = await propertyDataService.fetchPropertyAnalysis(propertyUrl);
    const enrichedData = propertyDataService.enrichPropertyData(propertyData);
    
    // Extract property details
    const propertyDetails = {
      basic: {
        address: enrichedData.scraped_data.address,
        price: enrichedData.scraped_data.price,
        pricePerSqm: enrichedData.scraped_data.price_per_sqm,
        livingArea: enrichedData.scraped_data.living_area,
        bedrooms: enrichedData.scraped_data.bedrooms,
        bathrooms: enrichedData.scraped_data.bathrooms,
        yearBuilt: enrichedData.scraped_data.year_built
      },
      specifications: {
        propertyType: enrichedData.agent_analysis.building_type,
        energyLabel: enrichedData.agent_analysis.energy_label,
        daysOnMarket: enrichedData.agent_analysis.days_on_market
      },
      analysis: {
        investmentScore: enrichedData.agent_analysis.investment_score,
        strengths: enrichedData.agent_analysis.strengths,
        weaknesses: enrichedData.agent_analysis.weaknesses
      },
      locationScores: {
        walkability: enrichedData.agent_analysis.walkability_score,
        transit: enrichedData.agent_analysis.transit_score,
        bike: enrichedData.agent_analysis.bike_score,
        noiseLevel: enrichedData.agent_analysis.noise_level,
        airQuality: enrichedData.agent_analysis.air_quality,
        floodRisk: enrichedData.agent_analysis.flood_risk,
        crimeRate: enrichedData.agent_analysis.crime_rate
      },
      market: {
        type: enrichedData.market,
        averagePricePerSqm: enrichedData.agent_analysis.market_average_price_sqm,
        priceVsMarket: enrichedData.agent_analysis.price_vs_market,
        rentalDemand: enrichedData.agent_analysis.rental_demand,
        averageRentalTime: enrichedData.agent_analysis.average_rental_time,
        touristActivity: enrichedData.agent_analysis.tourist_activity
      }
    };
    
    return res.status(StatusCodes.OK).json(propertyDetails);
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
    
    // Assume propertyIdentifier is a URL or can be converted to one
    let propertyUrl = propertyIdentifier;
    
    // If it's not a URL, try to construct one (this is a fallback)
    if (!propertyIdentifier.startsWith('http')) {
      // Default to a sample URL for testing
      propertyUrl = `https://www.funda.nl/koop/amsterdam/huis-${propertyIdentifier}/`;
    }
    
    // Fetch and enrich property data
    const propertyData = await propertyDataService.fetchPropertyAnalysis(propertyUrl);
    const enrichedData = propertyDataService.enrichPropertyData(propertyData);
    
    // Get additional data from other services
    const property = await parsePropertyIdentifier(propertyIdentifier);
    const localNews = await newsService.getLocalNews(property.address);
    
    // Compile full analysis
    const fullAnalysis = {
      property: {
        url: propertyUrl,
        identifier: propertyIdentifier,
        market: enrichedData.market,
        coordinates: {
          latitude: property.latitude,
          longitude: property.longitude
        }
      },
      scrapedData: enrichedData.scraped_data,
      investmentAnalysis: {
        score: enrichedData.agent_analysis.investment_score,
        explanation: enrichedData.agent_analysis.investmentScoreExplanation,
        strengths: enrichedData.agent_analysis.strengths,
        weaknesses: enrichedData.agent_analysis.weaknesses
      },
      financialMetrics: {
        roi: {
          fiveYears: enrichedData.agent_analysis.roi_5_years,
          tenYears: enrichedData.agent_analysis.roi_10_years
        },
        yields: {
          yearly: enrichedData.agent_analysis.yearly_yield,
          capRate: enrichedData.agent_analysis.cap_rate,
          cashOnCash: enrichedData.agent_analysis.cash_on_cash_return
        },
        income: {
          monthlyRental: enrichedData.agent_analysis.monthly_rental_income,
          expectedMonthly: enrichedData.agent_analysis.expected_monthly_income,
          noi: enrichedData.agent_analysis.net_operating_income
        },
        ratios: {
          dscr: enrichedData.agent_analysis.dscr,
          grm: enrichedData.agent_analysis.grm,
          irr: enrichedData.agent_analysis.irr
        },
        appreciation: {
          yearlyPercentage: enrichedData.agent_analysis.yearly_appreciation_percentage,
          yearlyValue: enrichedData.agent_analysis.yearly_appreciation_value,
          projectedValue5Years: enrichedData.agent_analysis.projected_value_5_years,
          projectedValue10Years: enrichedData.agent_analysis.projected_value_10_years
        },
        expenses: {
          propertyTaxRate: enrichedData.agent_analysis.property_tax_rate,
          communityFees: enrichedData.agent_analysis.community_fees,
          vacancyRate: enrichedData.agent_analysis.vacancy_rate
        },
        equityBuildup: enrichedData.agent_analysis.equity_buildup
      },
      propertySpecifications: {
        type: enrichedData.agent_analysis.building_type,
        energyLabel: enrichedData.agent_analysis.energy_label,
        daysOnMarket: enrichedData.agent_analysis.days_on_market
      },
      locationMetrics: {
        scores: {
          walkability: enrichedData.agent_analysis.walkability_score,
          transit: enrichedData.agent_analysis.transit_score,
          bike: enrichedData.agent_analysis.bike_score
        },
        environmental: {
          airQuality: enrichedData.agent_analysis.air_quality,
          noiseLevel: enrichedData.agent_analysis.noise_level,
          floodRisk: enrichedData.agent_analysis.flood_risk
        },
        safety: {
          crimeRate: enrichedData.agent_analysis.crime_rate
        }
      },
      marketContext: {
        averagePricePerSqm: enrichedData.agent_analysis.market_average_price_sqm,
        priceVsMarket: enrichedData.agent_analysis.price_vs_market,
        rentalMarket: {
          demand: enrichedData.agent_analysis.rental_demand,
          averageTimeToRent: enrichedData.agent_analysis.average_rental_time,
          tenantQuality: enrichedData.agent_analysis.tenant_quality_score
        },
        touristActivity: enrichedData.agent_analysis.tourist_activity
      },
      localNews: localNews,
      timestamp: new Date().toISOString()
    };
    
    return res.status(StatusCodes.OK).json(fullAnalysis);
  } catch (error) {
    logger.error('Error getting full property analysis:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve full property analysis',
      error: error.message
    });
  }
};

// NEW: Get enhanced property analysis using web scraping + ChatGPT + APIs
const getEnhancedAnalysis = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    const { propertyUrl } = req.query; // Optional property listing URL for web scraping
    
    logger.info(`Getting enhanced analysis for property: ${propertyIdentifier}`);
    
    // Parse the property identifier
    const property = await parsePropertyIdentifier(propertyIdentifier);
    
    // Fetch enhanced data from multiple sources in parallel
    const [
      webEnhancedData,
      apiData,
      airQuality,
      localNews,
      demographics,
      lifestyle,
      marketActivity
    ] = await Promise.allSettled([
      // Web scraping + ChatGPT analysis (if URL provided)
      propertyUrl ? 
        webEnhancedDataService.getEnhancedPropertyData(propertyUrl, property.address) : 
        Promise.resolve(null),
      // Real estate APIs integration
      realEstateApiService.getComprehensivePropertyData(property.address, {
        latitude: property.latitude,
        longitude: property.longitude
      }),
      // Existing MCP services
      airQualityService.getComprehensiveAirQuality(property.address, {
        latitude: property.latitude,
        longitude: property.longitude
      }),
      newsService.getLocalNews(property.address),
      demographicsService.getComprehensiveDemographics(property.address),
      lifestyleService.getComprehensiveLifestyle(property.address),
      marketActivityService.getComprehensiveMarketActivity(property.address)
    ]);

    // Combine all data sources
    const enhancedResponse = {
      property: {
        identifier: propertyIdentifier,
        address: property.address,
        coordinates: {
          latitude: property.latitude,
          longitude: property.longitude
        }
      },
      webEnhanced: webEnhancedData.status === 'fulfilled' ? webEnhancedData.value : null,
      apiData: apiData.status === 'fulfilled' ? apiData.value : null,
      airQuality: airQuality.status === 'fulfilled' ? airQuality.value : null,
      localNews: localNews.status === 'fulfilled' ? localNews.value : null,
      demographics: demographics.status === 'fulfilled' ? demographics.value : null,
      lifestyle: lifestyle.status === 'fulfilled' ? lifestyle.value : null,
      marketActivity: marketActivity.status === 'fulfilled' ? marketActivity.value : null,
      // Add data quality and source tracking
      dataQuality: {
        sourcesUsed: [],
        confidenceScore: 0,
        lastUpdated: new Date().toISOString()
      },
      lastUpdated: new Date().toISOString()
    };

    // Calculate data quality metrics
    enhancedResponse.dataQuality = calculateDataQuality(enhancedResponse);
    
    return res.status(StatusCodes.OK).json(enhancedResponse);
  } catch (error) {
    logger.error('Error getting enhanced property analysis:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve enhanced property analysis',
      error: error.message
    });
  }
};

// NEW: Get market research using web search + ChatGPT
const getMarketResearch = async (req, res) => {
  try {
    const { propertyIdentifier } = req.params;
    
    logger.info(`Getting market research for: ${propertyIdentifier}`);
    
    // Parse the property identifier
    const property = await parsePropertyIdentifier(propertyIdentifier);
    
    // Get market research using web-enhanced service
    const marketResearch = await webEnhancedDataService.getMarketResearch(property.address);
    
    // Get comparables from real estate APIs
    const comparables = await realEstateApiService.getMarketComparables(property.address);
    
    const response = {
      property: {
        identifier: propertyIdentifier,
        address: property.address
      },
      marketResearch: marketResearch,
      comparables: comparables,
      lastUpdated: new Date().toISOString()
    };
    
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    logger.error('Error getting market research:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve market research',
      error: error.message
    });
  }
};

// Helper function to calculate data quality metrics
const calculateDataQuality = (response) => {
  const sources = [];
  let totalConfidence = 0;
  let sourceCount = 0;

  // Check each data source and add to quality metrics
  if (response.webEnhanced) {
    sources.push(`web_enhanced_${response.webEnhanced.source}`);
    if (response.webEnhanced.confidence) {
      totalConfidence += response.webEnhanced.confidence;
      sourceCount++;
    }
  }

  if (response.apiData) {
    sources.push(...response.apiData.sources.map(s => `api_${s}`));
    sourceCount += response.apiData.sources.length;
    totalConfidence += 0.8; // Assume high confidence for API data
  }

  if (response.airQuality) {
    sources.push('mcp_air_quality');
    sourceCount++;
    totalConfidence += 0.7;
  }

  if (response.demographics) {
    sources.push('mcp_demographics');
    sourceCount++;
    totalConfidence += 0.7;
  }

  if (response.lifestyle) {
    sources.push('mcp_lifestyle');
    sourceCount++;
    totalConfidence += 0.7;
  }

  if (response.marketActivity) {
    sources.push('mcp_market_activity');
    sourceCount++;
    totalConfidence += 0.7;
  }

  const averageConfidence = sourceCount > 0 ? totalConfidence / sourceCount : 0;

  return {
    sourcesUsed: sources,
    sourceCount: sourceCount,
    confidenceScore: Math.round(averageConfidence * 100) / 100,
    dataCompleteness: Math.min((sourceCount / 6) * 100, 100), // Max 6 expected sources
    lastUpdated: new Date().toISOString()
  };
};

module.exports = {
  getSummary,
  getAirQuality,
  getLocalNews,
  getFinancials,
  getPropertyDetails,
  getNeighborhood,
  getFullAnalysis,
  getDemographics,
  getLifestyle,
  getMarketActivity,
  getEnhancedAnalysis,
  getMarketResearch
}; 