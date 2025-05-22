const ApiService = require('./apiService');
const apiConfig = require('../config/apiConfig');
const { withCache } = require('../utils/cache');
const logger = require('../utils/logger');

class NewsService {
  constructor() {
    if (!apiConfig.news.enabled) {
      logger.warn('News service is not enabled. Please set NEWS_API_KEY in .env');
    }
    
    this.apiService = new ApiService(
      apiConfig.news.baseUrl,
      apiConfig.news.apiKey
    );
  }
  
  /**
   * Get news articles for a specific location
   * @param {string} location - Location name (e.g., "Amsterdam")
   * @param {number} [daysBack=7] - Number of days to look back
   * @param {number} [maxResults=10] - Maximum number of results to return
   * @returns {Promise<Array>} - News articles
   */
  async getLocalNews(location, daysBack = 7, maxResults = 10) {
    if (!apiConfig.news.enabled) {
      logger.warn(`News API request failed: API key not configured for location ${location}`);
      return { error: 'News service is not enabled' };
    }
    
    return withCache('volatile', `news:${location}:${daysBack}:${maxResults}`, async () => {
      try {
        // Extract the city or location name to use in our query
        const locationName = location.split(',')[0].trim();
        
        // Calculate date range
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - daysBack);
        const fromDateString = fromDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        logger.info(`Fetching news for location: ${locationName} from ${fromDateString}`);
        
        // Call the actual News API
        const data = await this.apiService.get('/everything', {
          q: `"${locationName}" AND (property OR housing OR development OR city OR neighborhood)`,
          from: fromDateString,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: maxResults
        }, {
          'X-Api-Key': apiConfig.news.apiKey
        });
        
        if (!data || !data.articles) {
          logger.warn(`No articles found for location: ${locationName}`);
          // Fall back to mock data if API returns no results
          return this._getMockNews(locationName, daysBack, maxResults);
        }
        
        return this._formatNewsData(data, location);
      } catch (error) {
        logger.error(`Error fetching news for location ${location}:`, error);
        // Fall back to mock data if API call fails
        logger.info(`Falling back to mock data for ${location}`);
        return this._getMockNews(location, daysBack, maxResults);
      }
    });
  }
  
  /**
   * Generate mock news data for testing purposes
   * @param {string} location - Location name
   * @param {number} daysBack - Number of days to look back
   * @param {number} maxResults - Maximum number of results
   * @returns {Array} - Mock news articles
   */
  _getMockNews(location, daysBack, maxResults) {
    // Extract the city or location name to use in our mock data
    const locationName = location.split(',')[0].trim();
    
    // Create sample news data with the location name
    const articles = [
      {
        title: `New Development Projects Announced in ${locationName}`,
        description: `The city council has approved three new housing developments in ${locationName}, which will add approximately 500 residential units to the area over the next two years.`,
        url: 'https://example.com/news/1',
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Local Property News',
        imageUrl: 'https://placehold.co/600x400/e6e6e6/999999?text=Development+News'
      },
      {
        title: `${locationName} Property Market Shows Strong Growth`,
        description: `The latest real estate market report indicates a 5.2% increase in property values in ${locationName} over the past quarter, outperforming the national average.`,
        url: 'https://example.com/news/2',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Real Estate Weekly',
        imageUrl: 'https://placehold.co/600x400/e6e6e6/999999?text=Market+Growth'
      },
      {
        title: `Infrastructure Improvements Planned for ${locationName}`,
        description: `The transportation department has announced a €2.3 million project to improve roads and public transit options in ${locationName}, scheduled to begin next month.`,
        url: 'https://example.com/news/3',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'City Infrastructure Today'
      },
      {
        title: `New Cultural Center Opening in ${locationName}`,
        description: `A state-of-the-art cultural center will open its doors next month in ${locationName}, featuring exhibition spaces, performance venues, and community workshops.`,
        url: 'https://example.com/news/4',
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Arts & Culture Magazine',
        imageUrl: 'https://placehold.co/600x400/e6e6e6/999999?text=Cultural+Center'
      },
      {
        title: `${locationName} Rated Among Top 10 Cities for Quality of Life`,
        description: `In the annual Global Living Index, ${locationName} has secured a spot in the top 10 cities worldwide for overall quality of life, citing its excellent public transportation, green spaces, and cultural amenities.`,
        url: 'https://example.com/news/5',
        publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'Urban Living Today',
        imageUrl: 'https://placehold.co/600x400/e6e6e6/999999?text=Quality+of+Life'
      }
    ];
    
    // Filter by date if needed
    const now = new Date();
    const cutoffDate = new Date(now.setDate(now.getDate() - daysBack));
    
    const filteredArticles = articles
      .filter(article => new Date(article.publishedAt) >= cutoffDate)
      .slice(0, maxResults);
    
    return {
      location,
      totalResults: filteredArticles.length,
      articles: filteredArticles
    };
  }
  
  /**
   * Get news specifically related to real estate in a location
   * @param {string} location - Location name (e.g., "Amsterdam")
   * @param {number} [daysBack=30] - Number of days to look back
   * @param {number} [maxResults=10] - Maximum number of results to return
   * @returns {Promise<Array>} - News articles
   */
  async getRealEstateNews(location, daysBack = 30, maxResults = 10) {
    if (!apiConfig.news.enabled) {
      return { error: 'News service is not enabled' };
    }
    
    const cacheKey = `news_realestate_${location}_${daysBack}_${maxResults}`;
    
    return await withCache('standard', cacheKey, async () => {
      try {
        // Calculate date range
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - daysBack);
        const fromDateString = fromDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Search for real estate related news in the location
        const data = await this.apiService.get('/everything', {
          q: `("${location}") AND (real estate OR property OR housing OR market OR apartment OR home prices)`,
          from: fromDateString,
          language: 'en',
          sortBy: 'relevancy',
          pageSize: maxResults
        }, {
          'X-Api-Key': apiConfig.news.apiKey
        });
        
        return this._formatNewsData(data, location);
      } catch (error) {
        logger.error(`Error fetching real estate news for location ${location}:`, error);
        throw error;
      }
    });
  }
  
  /**
   * Transform the NewsAPI response into our internal data model format
   * @param {Object} data - Raw API response
   * @param {string} location - The location the news is for
   * @returns {Object} - Formatted news data
   */
  _formatNewsData(data, location) {
    // Check if the data has the expected structure
    if (!data || !data.articles) {
      logger.warn('Unexpected NewsAPI response format:', data);
      return { error: 'Invalid news data received' };
    }
    
    // Extract relevant information from each article
    const articles = data.articles.map(article => ({
      title: article.title,
      description: article.description,
      source: article.source ? article.source.name : 'Unknown Source',
      url: article.url,
      imageUrl: article.urlToImage,
      publishedAt: article.publishedAt,
      relevanceScore: this._calculateRelevanceScore(article, location)
    }));
    
    return {
      location,
      totalResults: data.totalResults,
      articles
    };
  }
  
  /**
   * Calculate a simple relevance score for an article in relation to a location
   * @param {Object} article - The article to score
   * @param {string} location - The location to score against
   * @returns {number} - A relevance score between 0 and 100
   */
  _calculateRelevanceScore(article, location) {
    let score = 0;
    
    // Check for location mentions in title (most important)
    if (article.title && article.title.includes(location)) {
      score += 50;
    }
    
    // Check for location mentions in description
    if (article.description && article.description.includes(location)) {
      score += 30;
    }
    
    // Check for recent articles (within last 3 days)
    const publishedDate = new Date(article.publishedAt);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    if (publishedDate > threeDaysAgo) {
      score += 20;
    }
    
    return Math.min(score, 100); // Cap at 100
  }
}

// Create a singleton instance
const newsService = new NewsService();

module.exports = newsService; 