#!/usr/bin/env node

/**
 * Atlas Property Analysis MCP Server
 * 
 * This server implements the Model Context Protocol (MCP) to provide
 * comprehensive property analysis tools for AI assistants.
 * 
 * Available tools:
 * - analyze_property_comprehensive: Complete property analysis
 * - get_property_demographics: Socio-economic and demographic data
 * - get_property_lifestyle: Amenities and lifestyle metrics
 * - get_property_market_activity: Market dynamics and property specifics
 * - get_air_quality: Environmental air quality data
 * - get_local_news: Local news and events
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} = require('@modelcontextprotocol/sdk/types.js');

// Import our services
const airQualityService = require('./services/airQualityService');
const newsService = require('./services/newsService');
const demographicsService = require('./services/demographicsService');
const lifestyleService = require('./services/lifestyleService');
const marketActivityService = require('./services/marketActivityService');
const propertyDataService = require('./services/propertyDataService');

/**
 * Create and configure the MCP server
 */
class AtlasPropertyAnalysisMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'atlas-property-analysis',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  /**
   * Setup all tool handlers
   */
  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'analyze_property_comprehensive',
            description: 'Perform comprehensive property analysis including investment metrics, demographics, lifestyle, and market data',
            inputSchema: {
              type: 'object',
              properties: {
                property_identifier: {
                  type: 'string',
                  description: 'Property URL or address (e.g., "Amsterdam, Netherlands" or "https://www.funda.nl/...")',
                },
                include_financial_analysis: {
                  type: 'boolean',
                  description: 'Whether to include detailed financial/investment analysis',
                  default: true,
                },
                property_details: {
                  type: 'object',
                  description: 'Optional property details for enhanced analysis',
                  properties: {
                    price: { type: 'number', description: 'Property price' },
                    size: { type: 'number', description: 'Property size in square meters' },
                  },
                },
              },
              required: ['property_identifier'],
            },
          },
          {
            name: 'get_property_demographics',
            description: 'Get socio-economic and demographic data for a property location',
            inputSchema: {
              type: 'object',
              properties: {
                property_identifier: {
                  type: 'string',
                  description: 'Property address or location (e.g., "Amsterdam, Netherlands")',
                },
              },
              required: ['property_identifier'],
            },
          },
          {
            name: 'get_property_lifestyle',
            description: 'Get lifestyle amenities and local quality of life metrics',
            inputSchema: {
              type: 'object',
              properties: {
                property_identifier: {
                  type: 'string',
                  description: 'Property address or location (e.g., "Amsterdam, Netherlands")',
                },
              },
              required: ['property_identifier'],
            },
          },
          {
            name: 'get_property_market_activity',
            description: 'Get market dynamics and property-specific market data',
            inputSchema: {
              type: 'object',
              properties: {
                property_identifier: {
                  type: 'string',
                  description: 'Property address or location (e.g., "Amsterdam, Netherlands")',
                },
                property_details: {
                  type: 'object',
                  description: 'Optional property details for enhanced analysis',
                  properties: {
                    price: { type: 'number', description: 'Current property price' },
                    size: { type: 'number', description: 'Property size in square meters' },
                  },
                },
              },
              required: ['property_identifier'],
            },
          },
          {
            name: 'get_air_quality',
            description: 'Get comprehensive air quality data and environmental metrics',
            inputSchema: {
              type: 'object',
              properties: {
                property_identifier: {
                  type: 'string',
                  description: 'Property address or location (e.g., "Amsterdam, Netherlands")',
                },
              },
              required: ['property_identifier'],
            },
          },
          {
            name: 'get_local_news',
            description: 'Get local news and events for the property area',
            inputSchema: {
              type: 'object',
              properties: {
                property_identifier: {
                  type: 'string',
                  description: 'Property address or location (e.g., "Amsterdam, Netherlands")',
                },
              },
              required: ['property_identifier'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'analyze_property_comprehensive':
            return await this.handleComprehensiveAnalysis(args);
          
          case 'get_property_demographics':
            return await this.handleDemographics(args);
          
          case 'get_property_lifestyle':
            return await this.handleLifestyle(args);
          
          case 'get_property_market_activity':
            return await this.handleMarketActivity(args);
          
          case 'get_air_quality':
            return await this.handleAirQuality(args);
          
          case 'get_local_news':
            return await this.handleLocalNews(args);

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        console.error(`Error executing tool ${name}:`, error);
        
        if (error instanceof McpError) {
          throw error;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Handle comprehensive property analysis
   */
  async handleComprehensiveAnalysis(args) {
    const { property_identifier, include_financial_analysis = true, property_details = {} } = args;
    
    console.error(`[MCP] Comprehensive analysis for: ${property_identifier}`);
    
    try {
      // Parallel data collection
      const [
        demographics,
        lifestyle,
        marketActivity,
        airQuality,
        localNews
      ] = await Promise.all([
        demographicsService.getComprehensiveDemographics(property_identifier),
        lifestyleService.getComprehensiveLifestyle(property_identifier),
        marketActivityService.getComprehensiveMarketActivity(property_identifier, property_details),
        airQualityService.getComprehensiveAirQuality(property_identifier),
        newsService.getLocalNews(property_identifier).catch(() => ({ articles: [], note: 'News service unavailable' }))
      ]);

      // Get financial analysis if requested and property_identifier is a URL
      let financialAnalysis = null;
      if (include_financial_analysis && property_identifier.startsWith('http')) {
        try {
          const propertyData = await propertyDataService.fetchPropertyAnalysis(property_identifier);
          financialAnalysis = propertyDataService.enrichPropertyData(propertyData);
        } catch (error) {
          console.error('[MCP] Financial analysis failed:', error.message);
          financialAnalysis = { note: 'Financial analysis requires a valid property URL' };
        }
      }

      // Compile comprehensive analysis
      const analysis = {
        property: {
          identifier: property_identifier,
          analysis_timestamp: new Date().toISOString(),
          data_sources: ['demographics', 'lifestyle', 'market_activity', 'air_quality', 'local_news']
        },
        demographics,
        lifestyle,
        market_activity: marketActivity,
        air_quality: airQuality,
        local_news: localNews,
        ...(financialAnalysis && { financial_analysis: financialAnalysis })
      };

      // Format as markdown for better readability
      const formattedReport = this.formatComprehensiveReport(analysis);

      return {
        content: [
          {
            type: 'text',
            text: formattedReport,
          },
        ],
      };
    } catch (error) {
      console.error('[MCP] Comprehensive analysis failed:', error);
      throw new McpError(
        ErrorCode.InternalError,
        `Failed to perform comprehensive analysis: ${error.message}`
      );
    }
  }

  /**
   * Handle demographics data request
   */
  async handleDemographics(args) {
    const { property_identifier } = args;
    
    console.error(`[MCP] Demographics data for: ${property_identifier}`);
    
    const demographics = await demographicsService.getComprehensiveDemographics(property_identifier);
    
    const report = `# Demographics Analysis: ${property_identifier}

## Socio-Economic Metrics
- **Median Household Income**: €${demographics.medianHouseholdIncome.toLocaleString()}
- **Social Diversity Index**: ${demographics.socialDiversityIndex}/100

## Age Distribution
${demographics.ageDistributionSummary}

## Data Quality
- **Last Updated**: ${demographics.lastUpdated}
- **Location**: ${demographics.location}

*This data provides insights into the local community composition and economic environment.*`;

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  /**
   * Handle lifestyle data request
   */
  async handleLifestyle(args) {
    const { property_identifier } = args;
    
    console.error(`[MCP] Lifestyle data for: ${property_identifier}`);
    
    const lifestyle = await lifestyleService.getComprehensiveLifestyle(property_identifier);
    
    const report = `# Lifestyle & Amenities Analysis: ${property_identifier}

## Cultural & Entertainment
- **Cultural Venues Nearby**: ${lifestyle.culturalVenuesNearby}
- **Events per Month**: ${lifestyle.eventsPerMonthArea}
- **Foot Traffic Level**: ${lifestyle.footTrafficLevel}

## Quality of Life
- **Sentiment Score (Local Reviews)**: ${lifestyle.sentimentScoreLocalReviews}/100
- **Public Art & Aesthetic Score**: ${lifestyle.publicArtAestheticScore}/100
- **Pet-Friendliness Score**: ${lifestyle.petFriendlinessScore}/100

## Practical Amenities
- **Local Markets Nearby**: ${lifestyle.localMarketsNearby}
- **Parking**: ${lifestyle.parkingSpace}

## Location Context
- **Proximity to ${lifestyle.proximityToLargeCity.name}**: ${lifestyle.proximityToLargeCity.distanceKm}km (${lifestyle.proximityToLargeCity.travelTimeMin} minutes)

## Data Quality
- **Last Updated**: ${lifestyle.lastUpdated}

*This analysis covers lifestyle factors that impact quality of life and property desirability.*`;

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  /**
   * Handle market activity data request
   */
  async handleMarketActivity(args) {
    const { property_identifier, property_details = {} } = args;
    
    console.error(`[MCP] Market activity for: ${property_identifier}`);
    
    const marketActivity = await marketActivityService.getComprehensiveMarketActivity(
      property_identifier, 
      property_details
    );
    
    const report = `# Market Activity Analysis: ${property_identifier}

## Rental Market
- **Short-term Rental Activity**: ${marketActivity.shortTermRentalActivity}
- **Listings Nearby**: ${marketActivity.listingsNearby} properties

## Property Valuation
- **Assessed Property Value**: €${marketActivity.assessedPropertyValue.toLocaleString()}

## Operating Costs
- **Estimated Utility Costs**: €${marketActivity.estimatedUtilityCosts}/month

## Data Quality
- **Last Updated**: ${marketActivity.lastUpdated}
- **Location**: ${marketActivity.location}

*This analysis provides insights into local market dynamics and property-specific financial considerations.*`;

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  /**
   * Handle air quality data request
   */
  async handleAirQuality(args) {
    const { property_identifier } = args;
    
    console.error(`[MCP] Air quality for: ${property_identifier}`);
    
    const airQuality = await airQualityService.getComprehensiveAirQuality(property_identifier);
    
    const pollutantList = airQuality.pollutants
      .map(p => `- **${p.name}**: ${p.concentration} ${p.unit} (${p.description})`)
      .join('\n');
    
    const report = `# Air Quality Analysis: ${property_identifier}

## Overall Assessment
- **Air Quality Index (AQI)**: ${airQuality.aqi}
- **Category**: ${airQuality.category}
- **Description**: ${airQuality.description}

## Health Advice
${airQuality.healthAdvice}

## Pollutant Breakdown
${pollutantList}

## Data Quality
- **Last Updated**: ${airQuality.lastUpdated}
- **Source**: ${airQuality.source}

*Air quality directly impacts health and quality of life for residents.*`;

    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  /**
   * Handle local news data request
   */
  async handleLocalNews(args) {
    const { property_identifier } = args;
    
    console.error(`[MCP] Local news for: ${property_identifier}`);
    
    const news = await newsService.getLocalNews(property_identifier);
    
    let report = `# Local News: ${property_identifier}\n\n`;
    
    if (news.error) {
      report += `**Service Status**: ${news.error}\n\n`;
      report += `*Local news service is currently unavailable. This may be due to API limits or temporary service issues.*`;
    } else if (news.articles && news.articles.length > 0) {
      report += `## Recent Local Articles (${news.articles.length})\n\n`;
      
      news.articles.slice(0, 5).forEach((article, index) => {
        report += `### ${index + 1}. ${article.title}\n`;
        if (article.description) {
          report += `${article.description}\n`;
        }
        if (article.publishedAt) {
          report += `*Published: ${new Date(article.publishedAt).toLocaleDateString()}*\n`;
        }
        report += '\n';
      });
      
      if (news.articles.length > 5) {
        report += `*... and ${news.articles.length - 5} more articles*\n`;
      }
    } else {
      report += `No recent local news articles found for this area.`;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: report,
        },
      ],
    };
  }

  /**
   * Format comprehensive analysis report
   */
  formatComprehensiveReport(analysis) {
    const { property, demographics, lifestyle, market_activity, air_quality, local_news, financial_analysis } = analysis;
    
    let report = `# Comprehensive Property Analysis

**Property**: ${property.identifier}  
**Analysis Date**: ${new Date(property.analysis_timestamp).toLocaleString()}  
**Data Sources**: ${property.data_sources.join(', ')}

---

## 📊 Demographics & Community

### Economic Profile
- **Median Household Income**: €${demographics.medianHouseholdIncome?.toLocaleString() || 'N/A'}
- **Social Diversity Index**: ${demographics.socialDiversityIndex || 'N/A'}/100

### Population Demographics
${demographics.ageDistributionSummary || 'Data unavailable'}

---

## 🏙️ Lifestyle & Amenities

### Cultural Scene
- **Cultural Venues**: ${lifestyle.culturalVenuesNearby || 0} nearby
- **Monthly Events**: ${lifestyle.eventsPerMonthArea || 0}
- **Foot Traffic**: ${lifestyle.footTrafficLevel || 'Unknown'}

### Quality Scores
- **Local Sentiment**: ${lifestyle.sentimentScoreLocalReviews || 'N/A'}/100
- **Public Art & Aesthetics**: ${lifestyle.publicArtAestheticScore || 'N/A'}/100
- **Pet-Friendliness**: ${lifestyle.petFriendlinessScore || 'N/A'}/100

### Practical Amenities
- **Local Markets**: ${lifestyle.localMarketsNearby || 0}
- **Parking**: ${lifestyle.parkingSpace || 'Unknown'}

---

## 📈 Market Activity

### Property Market
- **Short-term Rental Activity**: ${market_activity.shortTermRentalActivity || 'Unknown'}
- **Nearby Listings**: ${market_activity.listingsNearby || 0}
- **Assessed Value**: €${market_activity.assessedPropertyValue?.toLocaleString() || 'N/A'}

### Operating Costs
- **Monthly Utilities**: €${market_activity.estimatedUtilityCosts || 'N/A'}

---

## 🌬️ Environmental Quality

### Air Quality Assessment
- **AQI**: ${air_quality.aqi || 'N/A'} (${air_quality.category || 'Unknown'})
- **Health Advice**: ${air_quality.healthAdvice || 'No specific advice'}

### Key Pollutants
${air_quality.pollutants ? air_quality.pollutants.slice(0, 3).map(p => 
  `- **${p.name}**: ${p.concentration} ${p.unit}`
).join('\n') : 'Data unavailable'}

---

## 📰 Local Context

${local_news.error ? 
  `**News Service**: ${local_news.error}` : 
  local_news.articles && local_news.articles.length > 0 ? 
    `**Recent Local News**: ${local_news.articles.length} articles found\n${local_news.articles.slice(0, 2).map(a => `- ${a.title}`).join('\n')}` :
    '**Local News**: No recent articles found'
}

---

${financial_analysis ? `## 💰 Investment Analysis

${financial_analysis.note ? 
  `**Note**: ${financial_analysis.note}` :
  `### Key Metrics
- **Investment Score**: ${financial_analysis.agent_analysis?.investment_score || 'N/A'}/10
- **5-Year ROI**: ${financial_analysis.agent_analysis?.roi_5_years || 'N/A'}%
- **Monthly Rental Income**: €${financial_analysis.agent_analysis?.monthly_rental_income?.toLocaleString() || 'N/A'}
- **Yearly Yield**: ${financial_analysis.agent_analysis?.yearly_yield || 'N/A'}%

### Strengths
${financial_analysis.agent_analysis?.strengths?.slice(0, 3).map(s => `- ${s}`).join('\n') || 'No specific strengths identified'}

### Areas for Consideration
${financial_analysis.agent_analysis?.weaknesses?.slice(0, 3).map(w => `- ${w}`).join('\n') || 'No specific concerns identified'}`
}

---` : ''}

## Summary

This comprehensive analysis provides multi-dimensional insights into the property location, covering demographic composition, lifestyle amenities, market dynamics, environmental quality, and local context. ${financial_analysis && !financial_analysis.note ? 'Investment metrics indicate ' + (financial_analysis.agent_analysis?.investment_score >= 7 ? 'strong' : financial_analysis.agent_analysis?.investment_score >= 5 ? 'moderate' : 'limited') + ' investment potential.' : ''}

*Data compiled from multiple sources and services. Individual data points may have different update frequencies.*`;

    return report;
  }

  /**
   * Setup error handling
   */
  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Server Error]:', error);
    };

    process.on('SIGINT', async () => {
      console.error('[MCP] Shutting down server...');
      await this.server.close();
      process.exit(0);
    });
  }

  /**
   * Start the server
   */
  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[MCP] Atlas Property Analysis MCP Server is running');
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  const server = new AtlasPropertyAnalysisMCPServer();
  server.start().catch((error) => {
    console.error('[MCP] Failed to start server:', error);
    process.exit(1);
  });
}

module.exports = AtlasPropertyAnalysisMCPServer; 