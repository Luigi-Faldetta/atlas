const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { spawn } = require('child_process');
const { scrapeProperty } = require('./propertyScraperService');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI if API key exists
const openai = process.env.OPENAI_API_KEY ? 
  new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Apply security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Apply rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again after 15 minutes'
  }
});

// Apply rate limiter to all property analysis requests
app.use('/api/property-analysis', apiLimiter);

// Centralized error handler
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add a global default timeout handling
const responseTimeout = (req, res, next) => {
  res.setTimeout(60000, () => {
    res.status(504).json({
      error: 'Server timeout processing request',
      status: 504
    });
  });
  next();
};

app.use(responseTimeout);

// Main endpoint for property analysis
app.post('/api/property-analysis', asyncHandler(async (req, res) => {
  const { url, platform } = req.body;
  
  // Validate required parameters
  if (!url || !platform) {
    return res.status(400).json({
      error: 'Missing required parameters: url and platform are required',
      status: 400
    });
  }
  
  // Validate platform support
  const supportedPlatforms = ['idealista', 'fotocasa', 'habitaclia'];
  if (!supportedPlatforms.includes(platform.toLowerCase())) {
    return res.status(400).json({
      error: `Unsupported platform: ${platform}. Supported platforms are: ${supportedPlatforms.join(', ')}`,
      status: 400
    });
  }

  // Validate URL format
  const platformPatterns = {
    idealista: /^https?:\/\/(www\.)?idealista\.(com|es|pt|it)/i,
    fotocasa: /^https?:\/\/(www\.)?fotocasa\.(es|com)/i,
    habitaclia: /^https?:\/\/(www\.)?habitaclia\.(com|es)/i
  };

  if (!platformPatterns[platform.toLowerCase()].test(url)) {
    return res.status(400).json({
      error: `Invalid URL format for ${platform}`,
      status: 400
    });
  }

  console.log(`Scraping property from ${platform}: ${url}`);
  
  try {
    // Call Python scraper instead of the JavaScript one
    const pythonResult = await callPythonScraper(url, platform);
    
    if (!pythonResult.success) {
      console.warn('Python scraper had an issue:', pythonResult.error);
      console.log('Using fallback data');
    }
    
    // Generate AI-enhanced analysis if OpenAI is available
    let aiAnalysis = null;
    if (pythonResult.data) {
      aiAnalysis = await generateAIAnalysis(pythonResult.data);
      // Make sure aiAnalysis is a string if it's an object
      if (aiAnalysis && typeof aiAnalysis === 'object') {
        pythonResult.data.aiAnalysis = aiAnalysis.analysis || JSON.stringify(aiAnalysis);
      } else {
        pythonResult.data.aiAnalysis = aiAnalysis;
      }
    }
    
    // Return combined result in the structure the frontend expects
    res.status(200).json({
      success: true,
      message: 'Property analysis completed',
      data: {
        ...pythonResult.data,
        url,
        scrapedAt: new Date().toISOString(),
        platform,
        isFallback: !pythonResult.success
      }
    });
  } catch (error) {
    console.error('Error processing property analysis:', error);
    
    // Return a user-friendly error with appropriate status code
    const status = error.message.includes('CAPTCHA') ? 403 : 
                   error.message.includes('timeout') ? 504 : 
                   error.message.includes('parser') ? 422 : 500;
    
    res.status(status).json({
      error: `Property analysis failed: ${error.message}`,
      status,
      url,
      platform
    });
  }
}));

/**
 * Call the Python scraper with URL and platform
 */
function callPythonScraper(url, platform) {
  return new Promise((resolve, reject) => {
    try {
      console.log('Calling Python scraper...');
      const pythonProcess = spawn('python', ['./python_scraper.py', url, platform]);
      
      let dataString = '';
      
      // Collect data from script
      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });
      
      // Log any errors
      pythonProcess.stderr.on('data', (data) => {
        console.error('Python scraper error:', data.toString());
      });
      
      // Handle process completion
      pythonProcess.on('close', (code) => {
        console.log(`Python scraper exited with code ${code}`);
        
        try {
          if (code !== 0) {
            return resolve({
              success: false,
              error: `Python scraper failed with code ${code}`,
              data: generateFallbackData(url, platform)
            });
          }
          
          // Parse the JSON result
          const result = JSON.parse(dataString);
          resolve(result);
        } catch (error) {
          console.error('Error parsing Python output:', error);
          resolve({
            success: false,
            error: 'Failed to parse Python output',
            data: generateFallbackData(url, platform)
          });
        }
      });
    } catch (error) {
      console.error('Failed to start Python process:', error);
      resolve({
        success: false,
        error: `Failed to start Python process: ${error.message}`,
        data: generateFallbackData(url, platform)
      });
    }
  });
}

/**
 * Generate fallback data when Python scraper fails
 */
function generateFallbackData(url, platform) {
  // Extract property ID from URL if possible
  const idMatch = url.match(/\/(\d+)\/?$/);
  const propertyId = idMatch ? idMatch[1] : String(Math.floor(Math.random() * 10000000));
  
  // Base property data
  return {
    propertyAddress: `Property from ${platform} (ID: ${propertyId})`,
    price: 350000,
    squareMeters: 90,
    pricePerSqm: 3889,
    bedrooms: 3,
    bathrooms: 2,
    description: "Beautiful property in a prime location.",
    source: {
      platform,
      url,
      scrapedAt: new Date().toISOString(),
      synthetic: true
    },
    financialMetrics: {
      purchasePrice: 350000,
      estimatedMonthlyRent: 1200,
      netOperatingIncome: 12000,
      capRate: 3.5,
      cashOnCashReturn: 4.2,
      rentalYield: 4.1
    },
    marketTrends: {
      rentalYield: 4.1,
      areaGrowth: 3.5,
    },
    locationAnalysis: {
      walkScore: 78,
      transitScore: 82,
    },
    riskAssessment: {
      overall: "Medium",
      score: 65
    },
    atlasScore: 72
  };
}

// AI-enhanced property analysis
async function generateAIAnalysis(propertyData) {
  try {
    if (!openai) {
      return generateSimpleAnalysis(propertyData);
    }
    
    // Prepare property data summary for OpenAI
    const propertySummary = JSON.stringify({
      price: propertyData?.price,
      location: propertyData?.propertyAddress,
      size: propertyData?.squareMeters,
      financialMetrics: propertyData?.financialMetrics,
      marketTrends: propertyData?.marketTrends
    });
    
    // Generate AI analysis through OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert in Spanish real estate investment analysis. Provide a concise analysis of the property based on the data provided."
        },
        {
          role: "user",
          content: `Analyze this property as an investment: ${propertySummary}`
        }
      ],
      max_tokens: 250,
      temperature: 0.3
    });
    
    // Return AI analysis
    if (completion.choices && completion.choices[0]) {
      return {
        score: calculateInvestmentScore(propertyData),
        analysis: completion.choices[0].message.content
      };
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    // Fall back to the simple algorithm if API call fails
  }
  
  // Fallback to simple analysis
  return generateSimpleAnalysis(propertyData);
}

// Fallback analysis when OpenAI is unavailable
function generateSimpleAnalysis(propertyData) {
  try {
    // Extract property details with safeguards
    const details = propertyData || {};
    
    // Calculate investment score from available metrics
    const rentalYieldScore = Math.min(details.financialMetrics?.rentalYield * 10 || 0, 50);
    const riskScore = Math.min(details.riskAssessment?.score * 0.3 || 0, 30);
    const locationScore = Math.min((details.squareMeters > 70 ? 20 : 15), 20);
    
    // Total score calculation
    const totalScore = Math.min(Math.round(rentalYieldScore + riskScore + locationScore), 100);
    
    // Generate analysis text
    return {
      score: totalScore,
      analysis: `Property analysis complete. This property has a rental yield of ${details.financialMetrics?.rentalYield?.toFixed(2) || 'N/A'}%, which is ${details.financialMetrics?.rentalYield > 5 ? 'good' : 'average'} for the Spanish market. The risk assessment is ${details.riskAssessment?.overall?.toLowerCase() || 'moderate'}, and the location scores are excellent.`
    };
  } catch (error) {
    console.error("Error in fallback analysis:", error);
    return {
      score: 50, // Default fallback score
      analysis: "Analysis could not be completed with available data. Basic score provided based on limited information."
    };
  }
}

// Calculate investment score from property data
function calculateInvestmentScore(propertyData) {
  if (!propertyData) return 50; // Default score if no data
  
  try {
    const metrics = propertyData.financialMetrics || {};
    const trends = propertyData.marketTrends || {};
    
    // Core metrics with proper fallbacks
    const rentalYield = metrics.rentalYield || 0;
    const capRate = metrics.capRate || 0;
    const areaGrowth = trends.areaGrowth || 0;
    
    // Component scores
    const yieldScore = Math.min(rentalYield * 8, 40); // 40% weight - rental yield up to 5% = 40 points
    const capRateScore = Math.min(capRate * 6, 30); // 30% weight - cap rate up to 5% = 30 points
    const growthScore = Math.min(areaGrowth * 5, 15); // 15% weight - area growth up to 3% = 15 points
    const cashFlowScore = Math.min(metrics.cashOnCashReturn || 0, 15); // 15% weight - cash-on-cash up to 15% = 15 points
    
    // Final score with bounds
    return Math.max(10, Math.min(100, Math.round(yieldScore + capRateScore + growthScore + cashFlowScore)));
  } catch (error) {
    console.error("Error calculating investment score:", error);
    return 50; // Default score if calculation fails
  }
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    status: 500
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Property Scraper API running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application should continue running
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Application should continue running but in a degraded state
}); 