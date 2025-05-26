const NodeCache = require('node-cache');
const logger = require('./logger');

// Create different cache instances with different TTLs based on data volatility
const caches = {
  // Short-lived cache for frequently changing data (e.g., air quality)
  // TTL: 5 minutes
  volatile: new NodeCache({
    stdTTL: 5 * 60, // 5 minutes in seconds
    checkperiod: 120, // Check for expired keys every 2 minutes
    useClones: false // For performance
  }),
  
  // Medium-lived cache for data that changes less frequently (e.g., location context)
  // TTL: 1 hour
  standard: new NodeCache({
    stdTTL: 60 * 60, // 1 hour in seconds
    checkperiod: 600, // Check for expired keys every 10 minutes
    useClones: false
  }),
  
  // Long-lived cache for data that rarely changes (e.g., property details)
  // TTL: 1 day
  stable: new NodeCache({
    stdTTL: 24 * 60 * 60, // 24 hours in seconds
    checkperiod: 3600, // Check for expired keys every hour
    useClones: false
  }),
  
  // Very short-lived cache for rate-limited API calls
  // TTL: 1 minute
  apiCall: new NodeCache({
    stdTTL: 60, // 1 minute in seconds
    checkperiod: 30, // Check for expired keys every 30 seconds
    useClones: false
  })
};

// Wrapper function for caching API responses
const withCache = async (cacheType, key, fetchFunction) => {
  // Check if we have a valid cache instance
  if (!caches[cacheType]) {
    logger.warn(`Invalid cache type: ${cacheType}, falling back to standard cache`);
    cacheType = 'standard';
  }
  
  const cache = caches[cacheType];
  
  // Try to get data from cache
  const cachedData = cache.get(key);
  if (cachedData !== undefined) {
    logger.debug(`Cache hit for key: ${key} in ${cacheType} cache`);
    return cachedData;
  }
  
  // If not in cache, fetch data
  logger.debug(`Cache miss for key: ${key} in ${cacheType} cache, fetching data`);
  try {
    const data = await fetchFunction();
    
    // Store in cache if data is valid
    if (data !== null && data !== undefined) {
      cache.set(key, data);
      logger.debug(`Stored data in ${cacheType} cache for key: ${key}`);
    }
    
    return data;
  } catch (error) {
    logger.error(`Error fetching data for cache key: ${key}`, error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Export all cache instances and the wrapper function
module.exports = {
  caches,
  withCache
}; 