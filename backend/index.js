const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const sequelize = require('./models/sequelize');
// const User = require('./models/User');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const platformRoutes = require('./routes/platformRoutes');
const scraperRoutes = require('./routes/scraper');

// Import seed database function
const seedDatabase = require('./seedDatabase');

// Initialize Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/platform-stats', platformRoutes);
app.use('/api/scraper', scraperRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Project Atlas API' });
});

app._router.stack.forEach((middleware) => {
  if (middleware.authRoutes) {
    console.log(`Route: ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log(`Route: ${handler.route.path}`);
      }
    });
  }
});

// Start server
const startServer = async () => {
  try {
    // Seed database with mock data if in development
    if (process.env.NODE_ENV !== 'production') {
      await seedDatabase();
    }

    // sequelize
    //   .sync({ force: false }) // Set `force: true` to drop and recreate tables
    //   .then(() => console.log('Database synced'))
    //   .catch((err) => console.error('Error syncing database:', err));

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
