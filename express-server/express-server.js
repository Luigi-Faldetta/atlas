// express-server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// ─── GLOBAL CORS ───
// Allow your front‑end origins here:
const allowed = ['http://localhost:3000', 'https://atlasnew.vercel.app'];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
);

app.use(express.json());

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

// --- Apply cors specifically to POST /analyze if not used globally ---
app.post('/analyze', cors(corsOptions), async (req, res) => {
  // Apply cors here too
  const { url } = req.body;
  if (!url) {
    return res
      .status(400)
      .json({ detail: 'Missing property URL in request body' });
  }

  console.log(`Received request to analyze: ${url}`); // Add logging

  try {
    console.log(`Forwarding request to: ${PYTHON_API_URL}/analyze`); // Add logging
    // Forward to your Python agent
    const response = await axios.post(`${PYTHON_API_URL}/analyze`, { url });
    console.log(`Received response from Python API: Status ${response.status}`); // Add logging
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error(
      'Error forwarding request to Python API:',
      error.response ? error.response.data : error.message
    ); // Log detailed error
    const statusCode = error.response ? error.response.status : 500;
    const errorDetail = error.response
      ? error.response.data.detail ||
        'Error communicating with analysis service'
      : 'Internal server error';
    return res.status(statusCode).json({ detail: errorDetail });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🛠  Express analysis proxy listening on http://localhost:${PORT}`
  );
  console.log(`-> Forwarding /analyze requests to ${PYTHON_API_URL}`);
});
