// express-server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ─── CORS CONFIG (PERMISSIVE FOR RAPID PROTOTYPING) ───
const corsOptions = {
  origin: (origin, callback) => {
    // Log the origin received from the browser/client
    console.log(`CORS Check: Received origin: ${origin}`);

    // allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) {
      console.log('CORS Check: No origin provided, allowing.');
      return callback(null, true);
    }

    // Allow localhost for development
    if (origin.includes('localhost')) {
      console.log(`CORS Check: Localhost origin ${origin} is allowed.`);
      return callback(null, true);
    }

    // Allow all Vercel domains for rapid prototyping
    if (origin.includes('vercel.app') || origin.includes('project-atlas.xyz')) {
      console.log(`CORS Check: Vercel/Production origin ${origin} is allowed.`);
      return callback(null, true);
    }

    // Allow ngrok domains (for testing)
    if (origin.includes('ngrok-free.app') || origin.includes('loca.lt')) {
      console.log(`CORS Check: Tunnel origin ${origin} is allowed.`);
      return callback(null, true);
    }

    // For rapid prototyping, be more permissive
    console.log(`CORS Check: Allowing origin ${origin} for rapid prototyping.`);
    return callback(null, true);
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// ─── JSON BODY PARSER ───
// Ensure this comes AFTER CORS middleware if CORS needs to apply to OPTIONS requests
// which might implicitly have a content-type, though usually not an issue.
app.use(express.json());

const PYTHON_API_URL = process.env.AI_AGENT_URL || 'http://127.0.0.1:8000';
const SCRAPINGBEE_API_URL = process.env.SCRAPINGBEE_API_URL || 'http://127.0.0.1:8001';

// ─── ANALYZE ENDPOINT (ORIGINAL) ───
app.post('/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res
      .status(400)
      .json({ detail: 'Missing property URL in request body' });
  }

  console.log(`Received request to analyze: ${url}`);
  try {
    console.log(`Forwarding to Python API: ${PYTHON_API_URL}/analyze`);
    const response = await axios.post(`${PYTHON_API_URL}/analyze`, { url });
    console.log(`Python API responded with status ${response.status}`);
    // Important: Forward CORS headers from Python API if needed? Usually not for proxy.
    // The browser only cares about CORS headers from THIS express server.
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      'Error forwarding to Python API:',
      error.response ? error.response.data : error.message
    );
    const statusCode = error.response?.status || 500;
    const detail =
      error.response?.data?.detail ||
      'Error communicating with analysis service';
    return res.status(statusCode).json({ detail });
  }
});

// ─── ENHANCED SCREENSHOT ANALYSIS ENDPOINT ───
app.post('/analyze-enhanced', async (req, res) => {
  const { 
    url, 
    capture_dropdowns = true, 
    handle_popups = true, 
    full_page = true,
    enhanced_extraction = true 
  } = req.body;
  
  if (!url) {
    return res
      .status(400)
      .json({ detail: 'Missing property URL in request body' });
  }

  console.log(`🎯 Received enhanced analysis request for: ${url}`);
  console.log(`   Options: dropdowns=${capture_dropdowns}, popups=${handle_popups}, full_page=${full_page}`);
  
  try {
    console.log(`📸 Forwarding to ScrapingBee Enhanced API: ${SCRAPINGBEE_API_URL}/api/analyze-property`);
    
    const requestPayload = {
      url,
      capture_dropdowns,
      handle_popups,
      full_page,
      enhanced_extraction
    };
    
    const response = await axios.post(`${SCRAPINGBEE_API_URL}/api/analyze-property`, requestPayload, {
      timeout: 120000, // 2 minutes timeout for comprehensive analysis
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ScrapingBee API responded with status ${response.status}`);
    console.log(`   Processing time: ${response.data.processing_time?.toFixed(2)}s`);
    console.log(`   Credits used: ${response.data.credits_used}`);
    console.log(`   Quality score: ${response.data.screenshot_quality_score?.toFixed(1)}/100`);
    
    return res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error(
      '❌ Error with ScrapingBee Enhanced API:',
      error.response ? error.response.data : error.message
    );
    
    const statusCode = error.response?.status || 500;
    const detail = error.response?.data?.error || 
                   error.response?.data?.detail ||
                   'Error communicating with enhanced analysis service';
    
    return res.status(statusCode).json({ 
      detail,
      service: 'scrapingbee-enhanced',
      timestamp: new Date().toISOString()
    });
  }
});

// ─── SCREENSHOT CAPTURE ENDPOINT ───
app.post('/capture-screenshot', async (req, res) => {
  const { 
    url, 
    capture_type = 'full_page',
    handle_interactions = true 
  } = req.body;
  
  if (!url) {
    return res
      .status(400)
      .json({ detail: 'Missing property URL in request body' });
  }

  console.log(`📸 Received screenshot request for: ${url}`);
  console.log(`   Type: ${capture_type}, Interactions: ${handle_interactions}`);
  
  try {
    const requestPayload = {
      url,
      capture_type,
      handle_interactions
    };
    
    const response = await axios.post(`${SCRAPINGBEE_API_URL}/api/capture-screenshot`, requestPayload, {
      timeout: 60000, // 1 minute timeout for screenshot
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Screenshot captured successfully`);
    
    return res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error(
      '❌ Error capturing screenshot:',
      error.response ? error.response.data : error.message
    );
    
    const statusCode = error.response?.status || 500;
    const detail = error.response?.data?.error || 
                   'Error capturing screenshot';
    
    return res.status(statusCode).json({ 
      detail,
      service: 'screenshot-capture',
      timestamp: new Date().toISOString()
    });
  }
});

// ─── SUPPORTED SITES ENDPOINT ───
app.get('/supported-sites', async (req, res) => {
  console.log(`🔍 Fetching supported sites information`);
  
  try {
    const response = await axios.get(`${SCRAPINGBEE_API_URL}/api/supported-sites`);
    console.log(`✅ Retrieved supported sites information`);
    return res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error(
      '❌ Error fetching supported sites:',
      error.response ? error.response.data : error.message
    );
    
    // Fallback with basic information
    return res.status(200).json({
      supported_sites: {
        'funda.nl': { name: 'Funda', features: { cookie_handling: true, dropdown_expansion: true }},
        'idealista.com': { name: 'Idealista', features: { cookie_handling: true, dropdown_expansion: true }},
        'fotocasa.es': { name: 'Fotocasa', features: { cookie_handling: true, dropdown_expansion: true }},
        'habitaclia.com': { name: 'Habitaclia', features: { cookie_handling: true, dropdown_expansion: true }}
      },
      total_sites: 4,
      note: 'Enhanced analysis service not available, showing cached data'
    });
  }
});

// ─── SCRAPER STATUS ENDPOINT ───
app.get('/scraper-status', async (req, res) => {
  console.log(`🔧 Checking scraper status`);
  
  try {
    // Check both APIs
    const [pythonResponse, scrapingbeeResponse] = await Promise.allSettled([
      axios.get(`${PYTHON_API_URL}/health`, { timeout: 5000 }),
      axios.get(`${SCRAPINGBEE_API_URL}/api/scraper-status`, { timeout: 5000 })
    ]);
    
    const status = {
      express_proxy: {
        status: 'active',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      python_api: {
        status: pythonResponse.status === 'fulfilled' ? 'active' : 'inactive',
        url: PYTHON_API_URL,
        error: pythonResponse.status === 'rejected' ? pythonResponse.reason.message : null
      },
      scrapingbee_enhanced: {
        status: scrapingbeeResponse.status === 'fulfilled' ? 'active' : 'inactive',
        url: SCRAPINGBEE_API_URL,
        data: scrapingbeeResponse.status === 'fulfilled' ? scrapingbeeResponse.value.data : null,
        error: scrapingbeeResponse.status === 'rejected' ? scrapingbeeResponse.reason.message : null
      }
    };
    
    console.log(`✅ Status check completed`);
    return res.status(200).json(status);
    
  } catch (error) {
    console.error('❌ Error checking scraper status:', error.message);
    return res.status(500).json({ 
      error: 'Failed to check scraper status',
      timestamp: new Date().toISOString()
    });
  }
});

// ─── HEALTH ENDPOINT ───
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    message: 'Atlas Express Proxy is running',
    service: 'atlas-express-proxy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    features: {
      basic_analysis: true,
      enhanced_screenshot_analysis: true,
      popup_handling: true,
      dropdown_expansion: true,
      multi_site_support: true
    }
  });
});

// ─── ROOT ENDPOINT ───
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Atlas Express Proxy - Enhanced Analysis Request Router',
    status: 'running',
    version: '2.0.0',
    endpoints: {
      analyze: '/analyze (Original analysis)',
      'analyze-enhanced': '/analyze-enhanced (Screenshot-based with AI Vision)',
      'capture-screenshot': '/capture-screenshot (Screenshot capture only)',
      'supported-sites': '/supported-sites (Get supported property sites)',
      'scraper-status': '/scraper-status (Check all services status)',
      health: '/health'
    },
    services: {
      python_api: PYTHON_API_URL,
      scrapingbee_enhanced: SCRAPINGBEE_API_URL
    },
    new_features: [
      'ScrapingBee screenshot-based analysis',
      'Cookie consent handling',
      'Dropdown menu expansion',
      'AI Vision data extraction',
      'Enhanced property data'
    ]
  });
});

// ─── ERROR HANDLING ───
app.use((err, req, res, next) => {
  console.error('Express server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// ─── START SERVER ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🛠 Atlas Express Proxy listening on http://localhost:${PORT}`);
  console.log(`→ Original analysis: ${PYTHON_API_URL}`);
  console.log(`→ Enhanced screenshot analysis: ${SCRAPINGBEE_API_URL}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST /analyze - Original property analysis`);
  console.log(`   POST /analyze-enhanced - Screenshot-based analysis with AI Vision`);
  console.log(`   POST /capture-screenshot - Screenshot capture only`);
  console.log(`   GET  /supported-sites - List supported property websites`);
  console.log(`   GET  /scraper-status - Check all services status`);
  console.log(`   GET  /health - Health check`);
  console.log(`\n🎯 Enhanced features:`);
  console.log(`   • Cookie consent handling`);
  console.log(`   • Dropdown menu expansion`);
  console.log(`   • Popup dismissal`);
  console.log(`   • AI Vision data extraction`);
  console.log(`   • Multi-site support (Funda, Idealista, Fotocasa, Habitaclia)`);
});
