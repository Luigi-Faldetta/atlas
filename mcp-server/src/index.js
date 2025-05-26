try {
  require('dotenv').config();
  const express = require('express');
  const cors = require('cors');
  const morgan = require('morgan');
  const helmet = require('helmet');
  const { StatusCodes } = require('http-status-codes');
  const logger = require('./utils/logger');
  const propertyAnalysisRoutes = require('./routes/propertyAnalysis');
  
  // Initialize Express app
  const app = express();
  const PORT = process.env.MCP_PORT || 3001;
  
  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));
  app.use(helmet());
  
  // API routes
  app.use('/api/v1/property-analysis', propertyAnalysisRoutes);
  
  // Health check route
  app.get('/health', (req, res) => {
    res.status(StatusCodes.OK).json({ 
      status: 'ok', 
      message: 'MCP Server is running',
      timestamp: new Date().toISOString()
    });
  });
  
  // Not found route
  app.use('*', (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({ 
      status: 'error', 
      message: `Route ${req.originalUrl} not found` 
    });
  });
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
  
  // Start server
  app.listen(PORT, () => {
    logger.info(`MCP Server is running on port ${PORT}`);
  });
  
  module.exports = app;
} catch (error) {
  console.error('Failed to initialize or start the server:', error);
  process.exit(1);
} 