const axios = require('axios');
const logger = require('../utils/logger');

class ApiService {
  constructor(baseURL, apiKey = null, timeout = 10000) {
    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
      }
    });
    
    // Add request interceptor for logging
    this.client.interceptors.request.use(config => {
      logger.debug(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    }, error => {
      logger.error('API Request Error:', error);
      return Promise.reject(error);
    });
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(response => {
      logger.debug(`API Response: ${response.status} from ${response.config.method.toUpperCase()} ${response.config.baseURL}${response.config.url}`);
      return response;
    }, error => {
      if (error.response) {
        logger.error(`API Error Response: ${error.response.status} from ${error.config.method.toUpperCase()} ${error.config.baseURL}${error.config.url}`);
      } else if (error.request) {
        logger.error(`API No Response: ${error.config.method.toUpperCase()} ${error.config.baseURL}${error.config.url}`);
      } else {
        logger.error('API Error:', error.message);
      }
      return Promise.reject(error);
    });
  }
  
  // Helper method for GET requests with retry logic
  async get(url, params = {}, headers = {}, retries = 3, retryDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.client.get(url, {
          params,
          headers: { ...this.client.defaults.headers, ...headers }
        });
        return response.data;
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        const shouldRetry = this._shouldRetryRequest(error, attempt, retries);
        if (!shouldRetry) break;
        
        // Wait before retry (with exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt - 1);
        logger.info(`Retrying API request in ${delay}ms (attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we've exhausted all retries or shouldn't retry, throw the last error
    throw lastError;
  }
  
  // Helper method for POST requests with retry logic
  async post(url, data = {}, headers = {}, retries = 3, retryDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await this.client.post(url, data, {
          headers: { ...this.client.defaults.headers, ...headers }
        });
        return response.data;
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        const shouldRetry = this._shouldRetryRequest(error, attempt, retries);
        if (!shouldRetry) break;
        
        // Wait before retry (with exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt - 1);
        logger.info(`Retrying API request in ${delay}ms (attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we've exhausted all retries or shouldn't retry, throw the last error
    throw lastError;
  }
  
  // Determine if we should retry the request based on the error
  _shouldRetryRequest(error, attempt, maxRetries) {
    // Don't retry if we've hit max retries
    if (attempt >= maxRetries) return false;
    
    // Only retry on network errors, timeouts, or 5xx server errors
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return true;
    }
    
    if (error.response) {
      // Retry on 5xx server errors
      return error.response.status >= 500 && error.response.status < 600;
    }
    
    // Retry if no response received (network error)
    return !error.response && error.request;
  }
}

module.exports = ApiService; 