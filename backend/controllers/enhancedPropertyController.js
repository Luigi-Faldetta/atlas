const axios = require('axios');
const { Property, Investment, User } = require('../models');

/**
 * Enhanced Property Controller with Real-World Data Integration
 * Integrates with the enhanced scraping pipeline for comprehensive property analysis
 */

// Configuration for enhanced AI agent service
const ENHANCED_AI_AGENT_URL = process.env.ENHANCED_AI_AGENT_URL || 'http://localhost:8000';
const AI_AGENT_TIMEOUT = 120000; // 2 minutes for comprehensive analysis

/**
 * Analyze property with enhanced real-world data
 * @route POST /api/properties/analyze-enhanced
 */
exports.analyzePropertyEnhanced = async (req, res) => {
  try {
    const { url, force_refresh = false, include_comparables = true, include_neighborhood_analysis = true } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Property URL is required',
        error: 'Missing URL parameter'
      });
    }

    console.log(`[Enhanced Analysis] Starting analysis for: ${url}`);
    const startTime = Date.now();

    // Call enhanced AI agent pipeline
    const analysisResponse = await axios.post(
      `${ENHANCED_AI_AGENT_URL}/analyze-enhanced`,
      {
        url,
        force_refresh,
        include_comparables,
        include_neighborhood_analysis
      },
      {
        timeout: AI_AGENT_TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Atlas-Backend/1.0'
        }
      }
    );

    const analysisData = analysisResponse.data;
    const processingTime = Date.now() - startTime;

    if (!analysisData.success) {
      return res.status(400).json({
        success: false,
        message: 'Enhanced property analysis failed',
        error: analysisData.error || 'Unknown analysis error',
        processing_time_ms: processingTime
      });
    }

    // Extract and format data for Atlas response format
    const enhancedData = analysisData.enhanced_data;
    const property = enhancedData.property;
    const investmentAnalysis = enhancedData.investment_analysis;
    const locationAnalysis = enhancedData.location_analysis;
    const marketAnalysis = enhancedData.market_analysis;
    const dataQuality = analysisData.data_quality;

    // Format response compatible with existing Atlas frontend
    const atlasResponse = {
      success: true,
      market: property.platform?.includes('funda') ? 'dutch' : 'spanish',
      
      // Enhanced scraped data with real-world information
      scraped_data: {
        address: property.address || 'Not found',
        price: property.price ? `€${property.price.toLocaleString()}` : 'Not found',
        living_area: property.living_area_sqm ? `${property.living_area_sqm} m²` : 'Not found',
        bedrooms: property.bedrooms ? property.bedrooms.toString() : 'Not found',
        bathrooms: property.bathrooms ? property.bathrooms.toString() : 'Not found',
        year_built: property.year_built ? property.year_built.toString() : 'Not found',
        price_per_sqm: investmentAnalysis.price_per_sqm || null,
        property_image: property.images && property.images.length > 0 ? property.images[0].url : null,
        
        // Enhanced fields
        property_type: property.property_type || 'Not specified',
        description: property.description || null,
        features: enhancedData.features || {},
        location_details: {
          city: locationAnalysis.city,
          country: locationAnalysis.country,
          neighborhood: locationAnalysis.neighborhood,
          walk_score: locationAnalysis.walk_score,
          transit_score: locationAnalysis.transit_score,
          coordinates: locationAnalysis.coordinates
        }
      },

      // Enhanced AI analysis with comprehensive metrics
      agent_analysis: {
        // Core metrics (compatible with existing frontend)
        investment_score: investmentAnalysis.investment_score || 75,
        address: property.address || 'Address not available',
        roi_5_years: investmentAnalysis.roi_5_year || null,
        roi_10_years: investmentAnalysis.roi_10_year || null,
        yearly_yield: investmentAnalysis.rental_yield || null,
        monthly_rental_income: investmentAnalysis.estimated_monthly_rent || null,
        expected_monthly_income: investmentAnalysis.estimated_monthly_rent ? 
          investmentAnalysis.estimated_monthly_rent * 1.1 : null,
        
        // Enhanced financial metrics
        cash_on_cash_return: investmentAnalysis.cash_on_cash_return || null,
        cap_rate: investmentAnalysis.cap_rate || null,
        price_per_sqm: investmentAnalysis.price_per_sqm || null,
        
        // Market analysis
        market_position: marketAnalysis.price_vs_market || 'average',
        comparable_count: marketAnalysis.comparable_count || 0,
        market_premium_discount: marketAnalysis.property_premium_discount || 0,
        
        // Risk assessment
        risk_score: investmentAnalysis.risk_score || 25,
        
        // AI-generated insights
        strengths: generateStrengths(enhancedData),
        weaknesses: generateWeaknesses(enhancedData),
        
        // Data quality indicators
        data_quality_score: dataQuality.score || 0,
        has_real_data: dataQuality.has_real_data || false,
        missing_fields: enhancedData.metadata?.missing_fields || []
      },

      // Full enhanced data for advanced dashboard features
      enhanced_data: {
        financial_details: enhancedData.financial_details,
        market_analysis: enhancedData.market_analysis,
        comparables: enhancedData.comparables,
        charts: enhancedData.charts,
        features: enhancedData.features,
        images: property.images || [],
        neighborhood_analysis: {
          walk_score: locationAnalysis.walk_score,
          transit_score: locationAnalysis.transit_score,
          safety_score: calculateSafetyScore(locationAnalysis),
          amenities_score: calculateAmenitiesScore(locationAnalysis)
        }
      },

      // Processing metadata
      metadata: {
        processing_time_ms: processingTime,
        cached: dataQuality.cached || false,
        scraping_time_seconds: analysisData.scraping_time_seconds || 0,
        analysis_time_seconds: analysisData.analysis_time_seconds || 0,
        platform_source: property.platform,
        scraped_at: enhancedData.metadata?.scraped_at,
        data_quality_score: dataQuality.score,
        extraction_confidence: enhancedData.metadata?.extraction_confidence || {}
      }
    };

    console.log(`[Enhanced Analysis] Completed successfully in ${processingTime}ms`);
    console.log(`[Enhanced Analysis] Data quality: ${dataQuality.score}%, Real data: ${dataQuality.has_real_data}`);

    // Optionally store the analysis result in database
    try {
      await storePropertyAnalysis(property, investmentAnalysis, req.user?.id);
    } catch (storageError) {
      console.warn('[Enhanced Analysis] Failed to store analysis:', storageError.message);
      // Don't fail the request if storage fails
    }

    res.status(200).json(atlasResponse);

  } catch (error) {
    console.error('[Enhanced Analysis] Error:', error.message);
    
    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        message: 'Enhanced analysis service unavailable',
        error: 'Service temporarily unavailable. Please try again later.',
        fallback_available: true
      });
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property URL or analysis request',
        error: error.response.data?.error || 'Bad request'
      });
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: 'Enhanced analysis service timeout',
        error: 'Analysis taking longer than expected. Please try again.',
        fallback_available: true
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Enhanced property analysis failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      fallback_available: true
    });
  }
};

/**
 * Get cached property analysis
 * @route GET /api/properties/analysis/:propertyId
 */
exports.getCachedAnalysis = async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    // Try to get from enhanced cache first
    try {
      const cacheResponse = await axios.get(
        `${ENHANCED_AI_AGENT_URL}/cache/${encodeURIComponent(propertyId)}`,
        { timeout: 5000 }
      );
      
      if (cacheResponse.data && cacheResponse.data.success) {
        return res.status(200).json({
          success: true,
          data: cacheResponse.data.data,
          cached: true,
          cache_age_minutes: cacheResponse.data.cache_age_minutes || 0
        });
      }
    } catch (cacheError) {
      console.warn('[Cache Lookup] Enhanced cache miss or unavailable:', cacheError.message);
    }

    // Fallback to database lookup
    const property = await Property.findOne({
      where: { url: propertyId },
      include: [
        {
          model: Investment,
          include: [{ model: User, attributes: ['id', 'name'] }]
        }
      ]
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property analysis not found',
        suggestion: 'Try running a fresh analysis for this property'
      });
    }

    res.status(200).json({
      success: true,
      data: property,
      cached: true,
      cache_source: 'database'
    });

  } catch (error) {
    console.error('[Cache Lookup] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cached analysis',
      error: error.message
    });
  }
};

/**
 * Batch analyze multiple properties
 * @route POST /api/properties/analyze-batch
 */
exports.batchAnalyzeProperties = async (req, res) => {
  try {
    const { urls, options = {} } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'URLs array is required',
        error: 'Missing or invalid URLs parameter'
      });
    }

    if (urls.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 properties can be analyzed in a batch',
        error: 'Batch size limit exceeded'
      });
    }

    console.log(`[Batch Analysis] Starting batch analysis for ${urls.length} properties`);
    const startTime = Date.now();

    // Call enhanced AI agent for batch analysis
    const batchResponse = await axios.post(
      `${ENHANCED_AI_AGENT_URL}/analyze-batch`,
      {
        urls,
        options: {
          force_refresh: options.force_refresh || false,
          include_comparables: options.include_comparables !== false,
          include_neighborhood_analysis: options.include_neighborhood_analysis !== false,
          priority: options.priority || 'normal'
        }
      },
      {
        timeout: AI_AGENT_TIMEOUT * 2, // Double timeout for batch
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Atlas-Backend/1.0'
        }
      }
    );

    const batchData = batchResponse.data;
    const processingTime = Date.now() - startTime;

    if (!batchData.success) {
      return res.status(400).json({
        success: false,
        message: 'Batch property analysis failed',
        error: batchData.error || 'Unknown batch analysis error',
        processing_time_ms: processingTime
      });
    }

    // Format batch results
    const formattedResults = batchData.results.map((result, index) => ({
      url: urls[index],
      success: result.success,
      data: result.success ? formatEnhancedData(result.data) : null,
      error: result.success ? null : result.error,
      processing_time_ms: result.processing_time_ms || 0,
      data_quality_score: result.success ? result.data.metadata?.data_quality_score : 0
    }));

    const successCount = formattedResults.filter(r => r.success).length;
    const failureCount = formattedResults.length - successCount;

    console.log(`[Batch Analysis] Completed: ${successCount} success, ${failureCount} failures in ${processingTime}ms`);

    res.status(200).json({
      success: true,
      message: `Batch analysis completed: ${successCount}/${formattedResults.length} properties analyzed successfully`,
      results: formattedResults,
      summary: {
        total_properties: formattedResults.length,
        successful_analyses: successCount,
        failed_analyses: failureCount,
        average_data_quality: successCount > 0 ? 
          formattedResults.filter(r => r.success).reduce((sum, r) => sum + r.data_quality_score, 0) / successCount : 0,
        total_processing_time_ms: processingTime
      }
    });

  } catch (error) {
    console.error('[Batch Analysis] Error:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Batch property analysis failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get property analysis history
 * @route GET /api/properties/analysis-history
 */
exports.getAnalysisHistory = async (req, res) => {
  try {
    const { limit = 20, offset = 0, city, country, platform } = req.query;
    const userId = req.user?.id;

    const whereClause = {};
    if (city) whereClause.location_city = city;
    if (country) whereClause.location_country = country;
    if (platform) whereClause.platform = platform;

    // Get recent analyses from database
    const analyses = await Property.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Investment,
          where: userId ? { userId } : {},
          required: false,
          include: [{ model: User, attributes: ['id', 'name'] }]
        }
      ]
    });

    const formattedAnalyses = analyses.rows.map(property => ({
      id: property.id,
      url: property.url || `${property.title} - ${property.location}`,
      platform: property.platform || 'unknown',
      title: property.title,
      location: property.location,
      price: property.price,
      data_quality_score: property.data_quality_score || 0,
      investment_score: property.investment_score || null,
      analyzed_at: property.createdAt,
      has_investment: property.Investments && property.Investments.length > 0,
      summary: {
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area_sqm: property.living_area_sqm,
        year_built: property.year_built
      }
    }));

    res.status(200).json({
      success: true,
      data: formattedAnalyses,
      pagination: {
        total: analyses.count,
        limit: parseInt(limit),
        offset: parseInt(offset),
        has_more: analyses.count > (parseInt(offset) + parseInt(limit))
      }
    });

  } catch (error) {
    console.error('[Analysis History] Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analysis history',
      error: error.message
    });
  }
};

// Helper functions

function generateStrengths(enhancedData) {
  const strengths = [];
  
  // High-quality data
  if (enhancedData.metadata?.data_quality_score > 80) {
    strengths.push('Comprehensive property data extracted with high confidence');
  }
  
  // Investment metrics
  if (enhancedData.investment_analysis?.rental_yield > 5) {
    strengths.push(`Strong rental yield of ${enhancedData.investment_analysis.rental_yield.toFixed(1)}%`);
  }
  
  if (enhancedData.investment_analysis?.investment_score > 75) {
    strengths.push('High investment potential score based on comprehensive analysis');
  }
  
  // Location benefits
  if (enhancedData.location_analysis?.walk_score > 70) {
    strengths.push('Excellent walkability and urban amenities');
  }
  
  // Market position
  if (enhancedData.market_analysis?.price_vs_market === 'below_market') {
    strengths.push('Property priced below market average - potential value opportunity');
  }
  
  // Property features
  const features = enhancedData.features || {};
  if (features.elevator) strengths.push('Building has elevator access');
  if (features.parking) strengths.push('Dedicated parking space included');
  if (features.balcony || features.terrace) strengths.push('Outdoor space available');
  
  return strengths.length > 0 ? strengths : ['Detailed property analysis completed'];
}

function generateWeaknesses(enhancedData) {
  const weaknesses = [];
  
  // Data quality issues
  if (enhancedData.metadata?.data_quality_score < 60) {
    weaknesses.push('Limited property data available - analysis based on partial information');
  }
  
  if (enhancedData.metadata?.missing_fields?.length > 2) {
    weaknesses.push(`Missing key property details: ${enhancedData.metadata.missing_fields.slice(0, 3).join(', ')}`);
  }
  
  // Investment concerns
  if (enhancedData.investment_analysis?.rental_yield < 3) {
    weaknesses.push('Below-average rental yield potential');
  }
  
  if (enhancedData.investment_analysis?.risk_score > 60) {
    weaknesses.push('Higher than average investment risk profile');
  }
  
  // Market position
  if (enhancedData.market_analysis?.price_vs_market === 'above_market') {
    weaknesses.push('Property priced above market average');
  }
  
  // Location concerns
  if (enhancedData.location_analysis?.walk_score < 50) {
    weaknesses.push('Limited walkability and public transportation access');
  }
  
  // Property age
  const currentYear = new Date().getFullYear();
  if (enhancedData.property?.year_built && (currentYear - enhancedData.property.year_built) > 50) {
    weaknesses.push('Older property may require additional maintenance investment');
  }
  
  return weaknesses.length > 0 ? weaknesses : ['Consider additional due diligence for investment decision'];
}

function calculateSafetyScore(locationAnalysis) {
  // Simplified safety score calculation
  // In practice, this would integrate with crime statistics APIs
  const baseScore = 75;
  const walkScoreBonus = (locationAnalysis.walk_score || 50) > 70 ? 10 : 0;
  const transitScoreBonus = (locationAnalysis.transit_score || 50) > 70 ? 5 : 0;
  
  return Math.min(100, baseScore + walkScoreBonus + transitScoreBonus);
}

function calculateAmenitiesScore(locationAnalysis) {
  // Simplified amenities score calculation
  const baseScore = 60;
  const walkScoreBonus = ((locationAnalysis.walk_score || 50) / 100) * 30;
  const transitScoreBonus = ((locationAnalysis.transit_score || 50) / 100) * 10;
  
  return Math.min(100, Math.round(baseScore + walkScoreBonus + transitScoreBonus));
}

function formatEnhancedData(enhancedData) {
  // Format enhanced data for consistent API response
  return {
    property: enhancedData.property,
    investment_analysis: enhancedData.investment_analysis,
    market_analysis: enhancedData.market_analysis,
    location_analysis: enhancedData.location_analysis,
    financial_details: enhancedData.financial_details,
    features: enhancedData.features,
    metadata: enhancedData.metadata
  };
}

async function storePropertyAnalysis(propertyData, investmentAnalysis, userId = null) {
  try {
    // Store or update property in database
    const [property, created] = await Property.findOrCreate({
      where: { url: propertyData.url || 'unknown' },
      defaults: {
        title: propertyData.address || 'Property',
        location: propertyData.address || 'Unknown location',
        description: propertyData.description || '',
        price: propertyData.price || 0,
        size: propertyData.living_area_sqm || 0,
        bedrooms: propertyData.bedrooms || 0,
        bathrooms: propertyData.bathrooms || 0,
        propertyType: propertyData.property_type || 'Unknown',
        currentValue: propertyData.price || 0,
        platform: propertyData.platform || 'unknown',
        data_quality_score: investmentAnalysis.data_quality_score || 0,
        investment_score: investmentAnalysis.investment_score || null,
        year_built: propertyData.year_built || null,
        living_area_sqm: propertyData.living_area_sqm || null,
        location_city: propertyData.location?.city || null,
        location_country: propertyData.location?.country || null
      }
    });

    if (!created) {
      // Update existing property with new analysis data
      await property.update({
        price: propertyData.price || property.price,
        currentValue: propertyData.price || property.currentValue,
        data_quality_score: investmentAnalysis.data_quality_score || property.data_quality_score,
        investment_score: investmentAnalysis.investment_score || property.investment_score,
        updatedAt: new Date()
      });
    }

    console.log(`[Storage] ${created ? 'Created' : 'Updated'} property analysis: ${propertyData.address}`);
    return property;

  } catch (error) {
    console.error('[Storage] Failed to store property analysis:', error.message);
    throw error;
  }
}

module.exports = exports;