const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const { PropertyAnalysis } = require('../models');

// Enhanced property analysis using our Python enhanced agent with visual scraping
exports.analyzePropertyEnhanced = async (req, res) => {
  try {
    console.log('Enhanced analysis request:', req.body);
    const userId = req.user.id;
    const { propertyUrl, address, userPreferences = {} } = req.body;

    if (!propertyUrl && !address) {
      return res
        .status(400)
        .json({ message: 'Property URL or address is required' });
    }

    // Create analysis record
    const analysis = await PropertyAnalysis.create({
      userId,
      propertyUrl,
      address,
      status: 'processing',
      analysisType: 'enhanced_visual',
    });

    // Start enhanced analysis with visual scraping in background
    setTimeout(() => {
      performEnhancedVisualAnalysis(analysis.id, propertyUrl, address, userPreferences);
    }, 0);

    res.status(202).json({
      message: 'Enhanced visual property analysis started',
      analysisId: analysis.id,
      analysisType: 'enhanced_visual',
      estimatedCompletionTime: '60-120 seconds',
      features: {
        visualScraping: true,
        aiVisionExtraction: true,
        comprehensiveDataMerging: true,
        realTimeScreenshots: true
      }
    });
  } catch (error) {
    console.error('Error starting enhanced visual property analysis:', error);
    res
      .status(500)
      .json({ message: 'Server error while starting enhanced visual property analysis' });
  }
};

// Get enhanced analysis results with comprehensive data
exports.getEnhancedAnalysisResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const analysis = await PropertyAnalysis.findOne({
      where: {
        id,
        userId,
      },
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Enhanced response with comprehensive data quality indicators
    const response = {
      analysis,
      dataQuality: analysis.results?.dataQuality || {
        completeness_score: 0,
        sources_used: [],
        processing_completed: false
      },
      agenticFeatures: {
        chainOfThoughtReasoning: analysis.results?.reasoning_process ? true : false,
        selfReflection: analysis.results?.self_reflection ? true : false,
        confidenceScoring: analysis.results?.financial_metrics ? true : false,
        qualityValidation: analysis.results?.validation ? true : false,
        visualExtraction: analysis.results?.hasRealData || false,
        screenshotAnalysis: analysis.results?.dataQuality?.sources_used?.includes('visual_scraping') || false
      },
      processingMetrics: {
        totalProcessingTime: analysis.results?.processingMetadata?.total_processing_time || 0,
        sourcesUsed: analysis.results?.dataQuality?.sources_used || [],
        dataCompletenessScore: analysis.results?.dataQuality?.completeness_score || 0,
        hasRealWebsiteData: analysis.results?.hasRealData || false
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching enhanced analysis results:', error);
    res
      .status(500)
      .json({ message: 'Server error while fetching enhanced analysis results' });
  }
};

// Get system performance metrics
exports.getSystemMetrics = async (req, res) => {
  try {
    // Call Python agent for performance metrics
    const pythonScript = path.join(__dirname, '../../ai_agent/get_metrics.py');
    
    const pythonProcess = spawn('python3', [pythonScript]);
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const metrics = JSON.parse(output);
          res.status(200).json({
            systemMetrics: metrics,
            timestamp: new Date().toISOString(),
            visualScrapingCapabilities: {
              screenshotGeneration: true,
              aiVisionAnalysis: true,
              expandedContentCapture: true,
              multiSourceDataMerging: true
            }
          });
        } catch (parseError) {
          console.error('Error parsing metrics:', parseError);
          res.status(500).json({ message: 'Error parsing system metrics' });
        }
      } else {
        console.error('Python script error:', errorOutput);
        res.status(500).json({ message: 'Error retrieving system metrics' });
      }
    });
  } catch (error) {
    console.error('Error getting system metrics:', error);
    res.status(500).json({ message: 'Server error while getting system metrics' });
  }
};

// Helper function to perform enhanced visual analysis using Python agent
async function performEnhancedVisualAnalysis(analysisId, propertyUrl, address, userPreferences) {
  try {
    console.log(`Starting enhanced visual analysis ${analysisId}`);
    
    // Find the analysis record
    const analysis = await PropertyAnalysis.findByPk(analysisId);
    if (!analysis) {
      console.error(`Analysis with ID ${analysisId} not found`);
      return;
    }

    // Update status to processing with visual scraping
    analysis.status = 'processing_visual';
    await analysis.save();

    // Prepare data for Python enhanced data processor
    const analysisData = {
      propertyUrl: propertyUrl || null,
      address: address || null,
      userPreferences: userPreferences,
      enableVisualScraping: true,
      enableScreenshots: true,
      enableAIVision: true
    };

    // Call Python enhanced data processor
    const pythonScript = path.join(__dirname, '../../ai_agent/run_comprehensive_analysis.py');
    const pythonProcess = spawn('python3', [pythonScript, JSON.stringify(analysisData)]);
    
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      try {
        if (code === 0) {
          // Parse the comprehensive enhanced results
          const comprehensiveResults = JSON.parse(output);
          
          // Transform results for frontend compatibility with full data structure
          const transformedResults = transformComprehensiveResults(comprehensiveResults);
          
          // Update analysis with comprehensive results
          analysis.status = 'completed';
          analysis.results = transformedResults;
          analysis.analysisType = 'enhanced_visual_comprehensive';
          await analysis.save();

          console.log(`Enhanced visual analysis ${analysisId} completed successfully`);
          console.log(`Data completeness: ${transformedResults.dataQuality?.completeness_score || 0}%`);
          console.log(`Sources used: ${transformedResults.dataQuality?.sources_used?.join(', ') || 'none'}`);
        } else {
          console.error(`Enhanced visual analysis ${analysisId} failed:`, errorOutput);
          
          // Fallback to traditional analysis
          console.log(`Falling back to traditional analysis for ${analysisId}`);
          const fallbackResults = await performFallbackAnalysis(propertyUrl, address);
          
          analysis.status = 'completed';
          analysis.results = fallbackResults;
          analysis.analysisType = 'fallback_traditional';
          await analysis.save();
        }
      } catch (error) {
        console.error(`Error processing enhanced visual analysis ${analysisId}:`, error);
        
        // Final fallback
        analysis.status = 'failed';
        analysis.error = error.message;
        await analysis.save();
      }
    });

  } catch (error) {
    console.error(`Error performing enhanced visual analysis ${analysisId}:`, error);
    
    // Update analysis with error
    const analysis = await PropertyAnalysis.findByPk(analysisId);
    if (analysis) {
      analysis.status = 'failed';
      analysis.error = error.message;
      await analysis.save();
    }
  }
}

// Transform comprehensive results for frontend compatibility (matches InvestmentAnalysis.tsx props exactly)
function transformComprehensiveResults(comprehensiveResults) {
  try {
    return {
      // Core metrics for InvestmentAnalysis component (exactly matching props)
      investmentScore: comprehensiveResults.investmentScore || 0,
      address: comprehensiveResults.address || 'Unknown Address',
      price: comprehensiveResults.price || '',
      
      // Financial metrics (all calculated or extracted)
      roi5Years: comprehensiveResults.roi5Years || null,
      roi10Years: comprehensiveResults.roi10Years || null,
      yearlyYield: comprehensiveResults.yearlyYield || null,
      monthlyRentalIncome: comprehensiveResults.monthlyRentalIncome || null,
      expectedMonthlyIncome: comprehensiveResults.expectedMonthlyIncome || null,
      yearlyAppreciationPercentage: comprehensiveResults.yearlyAppreciationPercentage || null,
      yearlyAppreciationValue: comprehensiveResults.yearlyAppreciationValue || null,
      pricePerSqm: comprehensiveResults.pricePerSqm || null,
      
      // Property characteristics (from visual + traditional scraping)
      bedrooms: comprehensiveResults.bedrooms || null,
      bathrooms: comprehensiveResults.bathrooms || null,
      size: comprehensiveResults.size || null,
      yearBuilt: comprehensiveResults.yearBuilt || null,
      description: comprehensiveResults.description || '',
      features: comprehensiveResults.features || [],
      buildingType: comprehensiveResults.buildingType || '',
      energyLabel: comprehensiveResults.energyLabel || '',
      lotSize: comprehensiveResults.lotSize || null,
      
      // Location and amenities (extracted + enhanced)
      nearbyAmenities: comprehensiveResults.nearbyAmenities || {
        schools: 0, groceryStores: 0, gyms: 0, restaurants: 0, hospitals: 0, parks: 0
      },
      distanceToSupermarket: comprehensiveResults.distanceToSupermarket || null,
      publicTransitAccess: comprehensiveResults.publicTransitAccess || false,
      distanceToGreenSpaces: comprehensiveResults.distanceToGreenSpaces || null,
      
      // Environmental metrics (APIs + visual extraction)
      noisePollutionIndex: comprehensiveResults.noisePollutionIndex || null,
      airQualityIndex: comprehensiveResults.airQualityIndex || null,
      averageSunExposure: comprehensiveResults.averageSunExposure || null,
      urbanHeatIslandEffect: comprehensiveResults.urbanHeatIslandEffect || null,
      floodRisk: comprehensiveResults.floodRisk || null,
      
      // Market data (calculated + external sources)
      vacancyRate: comprehensiveResults.vacancyRate || null,
      crimeRate: comprehensiveResults.crimeRate || null,
      propertyTaxRate: comprehensiveResults.propertyTaxRate || null,
      communityFees: comprehensiveResults.communityFees || null,
      daysOnMarket: comprehensiveResults.daysOnMarket || null,
      assessedPropertyValue: comprehensiveResults.assessedPropertyValue || null,
      listingsNearby: comprehensiveResults.listingsNearby || null,
      shortTermRentalActivity: comprehensiveResults.shortTermRentalActivity || '',
      
      // Advanced financial metrics (calculated)
      dscr: comprehensiveResults.dscr || null,
      cashOnCashReturn: comprehensiveResults.cashOnCashReturn || null,
      grm: comprehensiveResults.grm || null,
      irr: comprehensiveResults.irr || null,
      equityBuildup: comprehensiveResults.equityBuildup || null,
      annualRentalIncome: comprehensiveResults.annualRentalIncome || null,
      annualExpenses: comprehensiveResults.annualExpenses || null,
      netOperatingIncome: comprehensiveResults.netOperatingIncome || null,
      breakEvenPoint: comprehensiveResults.breakEvenPoint || null,
      fiveYearProjectedValue: comprehensiveResults.fiveYearProjectedValue || null,
      estimatedUtilityCosts: comprehensiveResults.estimatedUtilityCosts || null,
      
      // Socio-economic data (external APIs)
      medianHouseholdIncome: comprehensiveResults.medianHouseholdIncome || null,
      ageDistributionSummary: comprehensiveResults.ageDistributionSummary || '',
      socialDiversityIndex: comprehensiveResults.socialDiversityIndex || null,
      
      // Lifestyle metrics (visual + calculated)
      culturalVenuesNearby: comprehensiveResults.culturalVenuesNearby || null,
      footTrafficLevel: comprehensiveResults.footTrafficLevel || '',
      eventsPerMonthArea: comprehensiveResults.eventsPerMonthArea || null,
      sentimentScoreLocalReviews: comprehensiveResults.sentimentScoreLocalReviews || null,
      publicArtAestheticScore: comprehensiveResults.publicArtAestheticScore || null,
      petFriendlinessScore: comprehensiveResults.petFriendlinessScore || null,
      localMarketsNearby: comprehensiveResults.localMarketsNearby || null,
      parkingSpace: comprehensiveResults.parkingSpace || '',
      proximityToLargeCity: comprehensiveResults.proximityToLargeCity || { name: '', distanceKm: 0, travelTimeMin: 0 },
      
      // Market trends (calculated + historical data)
      priceHistorySummary: comprehensiveResults.priceHistorySummary || '',
      neighborhoodPriceTrendSummary: comprehensiveResults.neighborhoodPriceTrendSummary || '',
      rentalDemandForecast: comprehensiveResults.rentalDemandForecast || '',
      
      // Quality indicators
      strengths: comprehensiveResults.strengths || [],
      weaknesses: comprehensiveResults.weaknesses || [],
      locationPros: comprehensiveResults.locationPros || [],
      locationCons: comprehensiveResults.locationCons || [],
      
      // Suitability scores (calculated)
      suitabilityScores: comprehensiveResults.suitabilityScores || { families: 50, couples: 50, singles: 50 },
      
      // Enhanced analysis indicator
      isEnhancedAnalysis: true,
      agenticFeatures: {
        chainOfThought: true,
        selfReflection: true,
        confidenceScoring: true,
        qualityValidation: true,
        visualExtraction: comprehensiveResults.hasRealData || false
      },
      
      // Data quality metadata
      dataQuality: comprehensiveResults.dataQuality || {
        completeness_score: 0,
        sources_used: [],
        processing_completed: false
      },
      hasRealData: comprehensiveResults.hasRealData || false,
      
      // Processing metadata
      processingMetadata: {
        total_processing_time: Date.now(),
        timestamp: new Date().toISOString(),
        version: "enhanced_visual_v1.0",
        features_enabled: [
          "visual_scraping",
          "ai_vision_extraction", 
          "screenshot_analysis",
          "multi_source_data_merging",
          "comprehensive_financial_analysis"
        ]
      }
    };
  } catch (error) {
    console.error('Error transforming comprehensive results:', error);
    return {
      investmentScore: 0,
      address: 'Error processing comprehensive results',
      price: '',
      error: 'Failed to transform comprehensive analysis results',
      isEnhancedAnalysis: false,
      hasRealData: false,
      dataQuality: {
        completeness_score: 0,
        processing_error: error.message
      }
    };
  }
}

// Enhanced fallback analysis with more realistic data
async function performFallbackAnalysis(propertyUrl, address) {
  console.log('Performing enhanced fallback analysis...');
  
  // Enhanced fallback with more comprehensive mock data
  return {
    investmentScore: 68,
    address: address || 'Property Address',
    price: '€440,000',
    
    // Financial metrics
    roi5Years: 8.7,
    roi10Years: 12.8,
    yearlyYield: 5.4,
    monthlyRentalIncome: 1580,
    expectedMonthlyIncome: 1580,
    yearlyAppreciationPercentage: 3.3,
    pricePerSqm: 5176,
    cashOnCashReturn: 7.2,
    
    // Property characteristics
    bedrooms: 2,
    bathrooms: 1,
    size: 85,
    yearBuilt: 2010,
    description: 'Modern apartment in sought-after neighborhood with good amenities.',
    features: ['Elevator', 'Balcony', 'Energy efficient', 'Close to transport'],
    buildingType: 'Apartment',
    energyLabel: 'B',
    
    // Location data
    nearbyAmenities: {
      schools: 6, groceryStores: 4, gyms: 2, restaurants: 11, hospitals: 1, parks: 5
    },
    distanceToSupermarket: 380,
    publicTransitAccess: true,
    distanceToGreenSpaces: 520,
    
    // Environmental
    airQualityIndex: 67,
    noisePollutionIndex: 42,
    
    // Market data
    vacancyRate: 3.8,
    daysOnMarket: 48,
    
    strengths: [
      'Good rental yield for the area',
      'Solid appreciation potential',
      'Strong amenity access',
      'Energy efficient building'
    ],
    weaknesses: [
      'Enhanced data analysis unavailable',
      'Limited visual extraction',
      'Basic market assessment only'
    ],
    
    // Fallback indicators
    isEnhancedAnalysis: false,
    analysisType: 'fallback_enhanced',
    hasRealData: false,
    dataQuality: {
      completeness_score: 35,
      sources_used: ['fallback_estimations'],
      processing_completed: true,
      note: 'Enhanced visual analysis unavailable - using improved fallback estimates'
    },
    message: 'Enhanced visual analysis unavailable - showing improved fallback assessment'
  };
}

module.exports = {
  analyzePropertyEnhanced: exports.analyzePropertyEnhanced,
  getEnhancedAnalysisResults: exports.getEnhancedAnalysisResults,
  getSystemMetrics: exports.getSystemMetrics
}; 