const rateLimit = require('express-rate-limit');
const { StatusCodes } = require('http-status-codes');

// Define different rate limiters for different use cases
const rateLimiters = {
  // Standard rate limiter for most API endpoints
  standard: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
      status: 'error',
      message: 'Too many requests, please try again later.',
      code: StatusCodes.TOO_MANY_REQUESTS
    }
  }),
  
  // Stricter rate limiter for more resource-intensive endpoints
  strict: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // limit each IP to 30 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Too many requests for this resource, please try again later.',
      code: StatusCodes.TOO_MANY_REQUESTS
    }
  }),
  
  // Very limited rate limiter for external API calls
  externalApi: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Too many requests to external APIs, please try again later.',
      code: StatusCodes.TOO_MANY_REQUESTS
    }
  })
};

module.exports = rateLimiters; 