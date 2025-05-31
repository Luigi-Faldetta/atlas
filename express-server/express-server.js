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

// ─── ANALYZE ENDPOINT ───
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

// ─── HEALTH ENDPOINT ───
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    message: 'Express Proxy is running',
    service: 'atlas-express-proxy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── ROOT ENDPOINT ───
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Atlas Express Proxy - Analysis Request Router',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      analyze: '/analyze',
      health: '/health'
    },
    proxy_target: PYTHON_API_URL
  });
});

// ─── START SERVER ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🛠 Express proxy listening on http://localhost:${PORT}`);
  console.log(`→ Proxying /analyze to ${PYTHON_API_URL}`);
});
