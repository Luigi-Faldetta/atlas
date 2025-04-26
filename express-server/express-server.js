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
  'https://www.project-atlas.xyz',
];
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// 1) Apply CORS to all routes
app.use(cors(corsOptions));

// 2) Handle all OPTIONS pre‑flights
app.options('*', cors(corsOptions));

// ─── JSON BODY PARSER ───
app.use(express.json());

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

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

// ─── START SERVER ───
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🛠 Express proxy listening on http://localhost:${PORT}`);
  console.log(`→ Proxying /analyze to ${PYTHON_API_URL}`);
});
