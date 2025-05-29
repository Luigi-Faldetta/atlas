# Atlas Property Analysis MCP Server - Integration Guide

## Overview

The Atlas Property Analysis MCP Server provides comprehensive property analysis tools through the Model Context Protocol (MCP). This enables AI assistants to access real estate data, demographics, lifestyle metrics, market activity, and environmental information.

## 🚀 Quick Start

### 1. Start the MCP Server

```bash
cd mcp-server
node src/mcp-server.js
```

The server will start and wait for MCP connections via stdio.

### 2. Test the Tools (Optional)

```bash
node test-mcp-tools.js
```

This runs a comprehensive test of all available tools.

## 🛠️ Available Tools

### 1. `analyze_property_comprehensive`
**Purpose**: Complete property analysis with all available data sources

**Parameters**:
- `property_identifier` (required): Property URL or address
- `include_financial_analysis` (optional): Whether to include investment analysis
- `property_details` (optional): Additional property info (price, size)

**Example**:
```json
{
  "property_identifier": "Amsterdam, Netherlands",
  "include_financial_analysis": true,
  "property_details": {
    "price": 450000,
    "size": 85
  }
}
```

### 2. `get_property_demographics`
**Purpose**: Socio-economic and demographic data for property location

**Parameters**:
- `property_identifier` (required): Property address or location

**Example**:
```json
{
  "property_identifier": "Madrid, Spain"
}
```

### 3. `get_property_lifestyle`
**Purpose**: Lifestyle amenities and quality of life metrics

**Parameters**:
- `property_identifier` (required): Property address or location

### 4. `get_property_market_activity`
**Purpose**: Market dynamics and property-specific market data

**Parameters**:
- `property_identifier` (required): Property address or location
- `property_details` (optional): Price and size for enhanced analysis

### 5. `get_air_quality`
**Purpose**: Environmental air quality data and health metrics

**Parameters**:
- `property_identifier` (required): Property address or location

### 6. `get_local_news`
**Purpose**: Local news and events for the property area

**Parameters**:
- `property_identifier` (required): Property address or location

## 🎯 Usage Examples

### Claude Desktop Integration

1. **Add to Claude Desktop configuration** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "atlas-property-analysis": {
      "command": "node",
      "args": ["/path/to/atlas/mcp-server/src/mcp-server.js"],
      "env": {}
    }
  }
}
```

2. **Restart Claude Desktop**

3. **Use natural language commands**:
   - "Analyze the property investment potential for Amsterdam, Netherlands"
   - "What are the demographics like in Madrid, Spain?"
   - "How's the air quality in Barcelona?"
   - "Give me a comprehensive analysis of this property: [URL]"

### VS Code with MCP Extension

1. **Install the MCP Server Runner extension**
2. **Configure the server path** in extension settings
3. **Use the command palette** to run MCP tools

### API Integration

For programmatic access, you can also use the REST API endpoints:

```bash
# Start the regular API server
cd mcp-server
npm start

# Access endpoints
GET /api/v1/property-analysis/[property]/demographics
GET /api/v1/property-analysis/[property]/lifestyle
GET /api/v1/property-analysis/[property]/market-activity
GET /api/v1/property-analysis/[property]/air-quality
GET /api/v1/property-analysis/[property]/local-news
GET /api/v1/property-analysis/[property]/summary
```

## 📊 Data Sources & Capabilities

### Demographics Service
- Median household income estimation
- Age distribution analysis
- Social diversity index calculation
- City-specific demographic patterns

### Lifestyle Service
- Cultural venues and entertainment options
- Foot traffic level assessment
- Local events and activities
- Quality of life scoring (sentiment, aesthetics, pet-friendliness)
- Parking and transportation options

### Market Activity Service
- Short-term rental activity levels
- Property value assessments
- Nearby listings analysis
- Utility cost estimation
- Seasonal variations and market trends

### Air Quality Service
- Real-time AQI calculations
- Detailed pollutant breakdown (PM2.5, PM10, O3, NO2, SO2, CO)
- Health advice based on conditions
- Time-of-day and seasonal adjustments

## 🎨 InvestmentAnalysis.tsx Integration

The MCP server populates the remaining components in `InvestmentAnalysis.tsx`:

### Populated Fields:
- `medianHouseholdIncome` → Demographics Service
- `ageDistributionSummary` → Demographics Service  
- `socialDiversityIndex` → Demographics Service
- `culturalVenuesNearby` → Lifestyle Service
- `footTrafficLevel` → Lifestyle Service
- `eventsPerMonthArea` → Lifestyle Service
- `sentimentScoreLocalReviews` → Lifestyle Service
- `publicArtAestheticScore` → Lifestyle Service
- `petFriendlinessScore` → Lifestyle Service
- `localMarketsNearby` → Lifestyle Service
- `parkingSpace` → Lifestyle Service
- `proximityToLargeCity` → Lifestyle Service
- `shortTermRentalActivity` → Market Activity Service
- `assessedPropertyValue` → Market Activity Service
- `listingsNearby` → Market Activity Service
- `estimatedUtilityCosts` → Market Activity Service
- `airQualityIndex` → Air Quality Service (enhanced)

### Frontend Integration Example:

```typescript
// Fetch data from MCP server for frontend
const fetchPropertyEnhancements = async (propertyId: string) => {
  const response = await fetch(`/api/v1/property-analysis/${propertyId}/summary`);
  const data = await response.json();
  
  return {
    medianHouseholdIncome: data.demographics.medianHouseholdIncome,
    ageDistributionSummary: data.demographics.ageDistributionSummary,
    socialDiversityIndex: data.demographics.socialDiversityIndex,
    culturalVenuesNearby: data.lifestyle.culturalVenuesNearby,
    footTrafficLevel: data.lifestyle.footTrafficLevel,
    // ... other fields
  };
};
```

## 🧪 Testing & Development

### Local Testing
```bash
# Test all tools
node test-mcp-tools.js

# Test specific endpoints
curl "http://localhost:3001/api/v1/property-analysis/Amsterdam%2C%20Netherlands/demographics"
```

### Mock Data Patterns
The services use intelligent mock data based on:
- **City Recognition**: Amsterdam, Madrid, Barcelona, Rotterdam, Utrecht, Valencia
- **Location Heuristics**: Center/centrum, residential, suburb keywords
- **Temporal Variations**: Time of day, seasonal effects
- **Regional Characteristics**: Cultural patterns, economic levels, environmental factors

### Error Handling
- Graceful fallbacks for missing APIs
- Caching for performance (1-24 hours depending on data type)
- Comprehensive logging for debugging
- Default values when external services fail

## 🔧 Configuration

### Environment Variables
```bash
# Optional - for enhanced news service
NEWS_API_KEY=your_news_api_key

# Optional - for real API integrations
AIR_QUALITY_API_KEY=your_aq_key
CENSUS_API_KEY=your_census_key
```

### Service Customization
Each service can be customized by modifying the respective files:
- `src/services/demographicsService.js` - Population and economic data
- `src/services/lifestyleService.js` - Amenities and quality of life
- `src/services/marketActivityService.js` - Real estate market dynamics
- `src/services/airQualityService.js` - Environmental data

## 🚀 Production Deployment

### Docker Deployment
```bash
# Build and run MCP server
docker build -t atlas-mcp-server .
docker run -p 3001:3001 atlas-mcp-server
```

### API Rate Limiting
- Standard endpoints: 100 requests/hour per IP
- Comprehensive analysis: 10 requests/hour per IP
- Caching reduces external API calls

### Monitoring
- Winston logging for all operations
- Request/response metrics
- Error tracking and reporting
- Performance monitoring

## 📚 Advanced Usage

### Custom Property Types
The system recognizes and adjusts for:
- Apartments vs. houses
- Urban vs. suburban locations
- Tourist areas vs. residential
- Historical vs. modern districts

### Multi-language Support
- Supports Dutch, Spanish, and English property identifiers
- Automatic language detection
- Localized data patterns

### Integration with Existing AI Agent
The MCP server seamlessly integrates with the existing Python AI agent:
- Complements scraping data with enhanced analytics
- Provides missing demographic and lifestyle context
- Enhances investment analysis with market intelligence

## 🔗 Related Documentation

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/model-context-protocol)
- [Atlas AI Agent Documentation](./ai_agent/README.md)
- [InvestmentAnalysis Component Guide](./frontend/components/README.md)

## 🐛 Troubleshooting

### Common Issues

1. **"Connection refused"**: Ensure MCP server is running
2. **"Tool not found"**: Restart AI assistant to refresh MCP tools
3. **"API key missing"**: Some services work with mock data, others need API keys
4. **Slow responses**: Check network connection and enable caching

### Debug Mode
```bash
# Start with verbose logging
DEBUG=atlas:* node src/mcp-server.js
```

### Support
For issues or questions:
1. Check logs: `mcp-server/logs/`
2. Test individual tools: `node test-mcp-tools.js`
3. Verify configuration: Review `package.json` and environment variables 