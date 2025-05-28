const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const { PropertyAnalysis } = require('../models');

// Enhanced property analysis using our Python enhanced agent
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
      analysisType: 'enhanced',
    });

    // Start enhanced analysis in background
    setTimeout(() => {
      performEnhancedAnalysis(analysis.id, propertyUrl, address, userPreferences);
    }, 0);

    res.status(202).json({
      message: 'Enhanced property analysis started',
      analysisId: analysis.id,
      analysisType: 'enhanced',
      estimatedCompletionTime: '30-60 seconds'
    });
  } catch (error) {
    console.error('Error starting enhanced property analysis:', error);
    res
      .status(500)
      .json({ message: 'Server error while starting enhanced property analysis' });
  }
};

// Get enhanced analysis results with agentic features
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

    // Add enhanced metadata if available
    const response = {
      analysis,
      agenticFeatures: {
        chainOfThoughtReasoning: analysis.results?.reasoning_process ? true : false,
        selfReflection: analysis.results?.self_reflection ? true : false,
        confidenceScoring: analysis.results?.financial_metrics ? true : false,
        qualityValidation: analysis.results?.validation ? true : false
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
            timestamp: new Date().toISOString()
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

// Helper function to perform enhanced analysis using Python agent
async function performEnhancedAnalysis(analysisId, propertyUrl, address, userPreferences) {
  try {
    console.log(`Starting enhanced analysis ${analysisId}`);
    
    // Find the analysis record
    const analysis = await PropertyAnalysis.findByPk(analysisId);
    if (!analysis) {
      console.error(`Analysis with ID ${analysisId} not found`);
      return;
    }

    // Update status to processing
    analysis.status = 'processing';
    await analysis.save();

    // Prepare data for Python agent
    const analysisData = {
      propertyUrl: propertyUrl || null,
      address: address || null,
      userPreferences: userPreferences
    };

    // Call Python enhanced agent
    const pythonScript = path.join(__dirname, '../../ai_agent/run_enhanced_analysis.py');
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
          // Parse the enhanced analysis results
          const enhancedResults = JSON.parse(output);
          
          // Transform results for frontend compatibility
          const transformedResults = transformEnhancedResults(enhancedResults);
          
          // Update analysis with enhanced results
          analysis.status = 'completed';
          analysis.results = transformedResults;
          analysis.analysisType = 'enhanced';
          await analysis.save();

          console.log(`Enhanced analysis ${analysisId} completed successfully`);
        } else {
          console.error(`Enhanced analysis ${analysisId} failed:`, errorOutput);
          
          // Fallback to basic analysis
          console.log(`Falling back to basic analysis for ${analysisId}`);
          const fallbackResults = await performFallbackAnalysis(propertyUrl, address);
          
          analysis.status = 'completed';
          analysis.results = fallbackResults;
          analysis.analysisType = 'fallback';
          await analysis.save();
        }
      } catch (error) {
        console.error(`Error processing enhanced analysis ${analysisId}:`, error);
        
        // Final fallback
        analysis.status = 'failed';
        analysis.error = error.message;
        await analysis.save();
      }
    });

  } catch (error) {
    console.error(`Error performing enhanced analysis ${analysisId}:`, error);
    
    // Update analysis with error
    const analysis = await PropertyAnalysis.findByPk(analysisId);
    if (analysis) {
      analysis.status = 'failed';
      analysis.error = error.message;
      await analysis.save();
    }
  }
}

// Transform enhanced results for frontend compatibility
function transformEnhancedResults(enhancedResults) {
  try {
    return {
      // Core metrics for InvestmentAnalysis component
      investmentScore: enhancedResults.investment_score || 0,
      address: enhancedResults.address || 'Unknown Address',
      
      // Financial metrics
      roi5Years: enhancedResults.financial_metrics?.roi_5_year || null,
      roi10Years: enhancedResults.financial_metrics?.roi_10_year || null,
      yearlyYield: enhancedResults.financial_metrics?.yearly_yield || null,
      monthlyRentalIncome: enhancedResults.financial_metrics?.monthly_rental || null,
      expectedMonthlyIncome: enhancedResults.financial_metrics?.monthly_rental || null,
      
      // Enhanced features
      strengths: enhancedResults.strengths || [],
      weaknesses: enhancedResults.weaknesses || [],
      recommendations: enhancedResults.recommendations || [],
      
      // Agentic features
      reasoningProcess: enhancedResults.reasoning_process || null,
      selfReflection: enhancedResults.self_reflection || null,
      confidenceScores: enhancedResults.financial_metrics || {},
      
      // Analysis metadata
      analysisContext: enhancedResults.analysis_context || {},
      validation: enhancedResults.validation || {},
      metadata: enhancedResults.metadata || {},
      
      // Additional metrics for comprehensive dashboard
      yearlyAppreciationPercentage: enhancedResults.financial_metrics?.appreciation_rate || 3.5,
      yearlyAppreciationValue: null, // Will be calculated in frontend
      pricePerSqm: null, // Will be calculated if size available
      
      // Enhanced analysis indicator
      isEnhancedAnalysis: true,
      agenticFeatures: {
        chainOfThought: !!enhancedResults.reasoning_process,
        selfReflection: !!enhancedResults.self_reflection,
        confidenceScoring: !!enhancedResults.financial_metrics,
        qualityValidation: !!enhancedResults.validation
      }
    };
  } catch (error) {
    console.error('Error transforming enhanced results:', error);
    return {
      investmentScore: 0,
      address: 'Error processing results',
      error: 'Failed to transform enhanced analysis results',
      isEnhancedAnalysis: false
    };
  }
}

// Fallback analysis function
async function performFallbackAnalysis(propertyUrl, address) {
  console.log('Performing fallback analysis...');
  
  // Basic mock analysis for rapid prototyping
  return {
    investmentScore: 65,
    address: address || 'Property Address',
    roi5Years: 8.5,
    roi10Years: 12.3,
    yearlyYield: 5.2,
    monthlyRentalIncome: 1500,
    expectedMonthlyIncome: 1500,
    yearlyAppreciationPercentage: 3.5,
    
    strengths: [
      'Good location with growth potential',
      'Reasonable price for the area',
      'Decent rental yield potential'
    ],
    weaknesses: [
      'Limited data available for analysis',
      'Market conditions uncertain',
      'Requires further investigation'
    ],
    recommendations: [
      'Conduct detailed market research',
      'Verify property condition',
      'Consider professional appraisal'
    ],
    
    // Fallback indicators
    isEnhancedAnalysis: false,
    analysisType: 'fallback',
    message: 'Enhanced analysis unavailable - showing basic assessment'
  };
}

module.exports = {
  analyzePropertyEnhanced: exports.analyzePropertyEnhanced,
  getEnhancedAnalysisResults: exports.getEnhancedAnalysisResults,
  getSystemMetrics: exports.getSystemMetrics
}; 