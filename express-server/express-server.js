// express-server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ─── CORS CONFIG ───
const allowedOrigins = [
  'http://localhost:3000',
  'https://atlasnew.vercel.app',
  'https://www.project-atlas.xyz', // Trailing slash removed
];
const corsOptions = {
  origin: (origin, callback) => {
    // Log the origin received from the browser/client
    console.log(`CORS Check: Received origin: ${origin}`);

    // allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) {
      console.log('CORS Check: No origin provided, allowing.');
      return callback(null, true);
    }
    // Check if the origin is in our allowed list
    if (allowedOrigins.includes(origin)) {
      console.log(`CORS Check: Origin ${origin} is allowed.`);
      return callback(null, true);
    }
    // If not allowed, log the error and reject
    console.error(`CORS Check: Origin ${origin} NOT ALLOWED.`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204, // Some legacy browsers choke on 204
};

// Apply CORS middleware using the options.
// This should handle preflight (OPTIONS) requests automatically.
app.use(cors(corsOptions));

// Remove the explicit app.options('*', ...) line.
// app.options('*', cors(corsOptions));

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
