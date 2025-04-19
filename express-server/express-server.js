// express-server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Allow your frontend origin (adjust if needed)
app.use(
  cors({ origin: ['http://localhost:3000', 'https://atlasnew.vercel.app/'] })
);
app.use(express.json());

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';

app.post('/analyze', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res
      .status(400)
      .json({ detail: 'Missing property URL in request body' });
  }

  try {
    // Forward to your Python agent
    const response = await axios.post(`${PYTHON_API_URL}/analyze`, { url });
    return res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      // Forward error from Python service
      return res.status(err.response.status).json(err.response.data);
    }
    console.error('Express → Python connection error:', err.message);
    return res
      .status(502)
      .json({ detail: 'Failed to reach Python analysis service' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🛠  Express analysis proxy listening on http://localhost:${PORT}`
  );
});
