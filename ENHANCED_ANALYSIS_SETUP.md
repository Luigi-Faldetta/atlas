# Enhanced Property Analysis Setup Guide

## Overview

This guide explains how to set up and use the enhanced property analysis features that leverage ChatGPT web browsing capabilities and real estate APIs to dramatically improve data quality in your InvestmentAnalysis.tsx component.

## 🚀 Key Features

### 1. Web-Enhanced Analysis
- **Property listing scraping** with ChatGPT processing for structured data extraction
- **Walk Score, Transit Score, Bike Score** estimation from web content
- **Market trends analysis** based on current market data
- **Investment potential assessment** using AI-powered analysis
- **Local insights** extracted from neighborhood descriptions

### 2. Real Estate API Integration
- **RentCast API**: Property records, rent estimates, value estimates, market comparables
- **WalkScore API**: Official walkability, transit, and bike scores
- **ATTOM API**: Comprehensive property data including tax assessments, ownership history
- **Google Maps Places API**: Nearby amenities count and quality ratings

### 3. Enhanced Data Quality
- **Confidence scoring** for each data source
- **Source tracking** to understand data provenance
- **Automatic fallbacks** when APIs are unavailable
- **Data completeness metrics** to identify gaps

## 📋 Prerequisites

1. **OpenAI API Key** - For ChatGPT-powered web content processing
2. **Real Estate API Keys** (optional but recommended):
   - RentCast API Key
   - WalkScore API Key  
   - ATTOM API Key
   - Google Maps API Key

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd mcp-server
npm install axios cheerio
```

### 2. Set Up Environment Variables

Create a `.env` file in the `mcp-server` directory:

```env
# Required for web-enhanced analysis
OPENAI_API_KEY=your_openai_api_key_here

# Optional - Real Estate APIs (use mock data if not provided)
RENTCAST_API_KEY=your_rentcast_api_key_here
WALKSCORE_API_KEY=your_walkscore_api_key_here
ATTOM_API_KEY=your_attom_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Server configuration
PORT=3001
NODE_ENV=development
```

### 3. Start the Enhanced MCP Server

```bash
cd mcp-server
npm start
```

## 📡 API Endpoints

### Enhanced Analysis
```
GET /api/v1/property-analysis/{propertyIdentifier}/enhanced?propertyUrl={url}
```

**Parameters:**
- `propertyIdentifier`: Property address or identifier
- `propertyUrl` (optional): URL of property listing for web scraping

**Response:** Combined data from web scraping, real estate APIs, and MCP services

### Market Research
```
GET /api/v1/property-analysis/{propertyIdentifier}/market-research
```

**Response:** Market trends, price appreciation, rental yields, and investment grade

## 🎯 Frontend Integration

### 1. Import the Enhanced Hook

```typescript
import { 
  useEnhancedPropertyData, 
  usePropertyEnhancementSuggestions,
  mergeEnhancedDataWithProps 
} from '../lib/api/useEnhancedPropertyData';
```

### 2. Use in Your Component

```typescript
function PropertyAnalysisPage({ propertyId, existingProps }) {
  // Get enhanced data
  const { 
    data: enhancedData, 
    loading, 
    error, 
    enhanceWithUrl, 
    getMarketResearch 
  } = useEnhancedPropertyData(propertyId);

  // Get suggestions for improvement
  const suggestions = usePropertyEnhancementSuggestions(enhancedData);

  // Merge with existing props
  const mergedProps = mergeEnhancedDataWithProps(existingProps, enhancedData);

  return (
    <div>
      {/* Enhancement Controls */}
      <div className="enhancement-panel">
        <button onClick={() => enhanceWithUrl('https://example-listing.com')}>
          Enhance with Listing URL
        </button>
        <button onClick={getMarketResearch}>
          Get Market Research
        </button>
      </div>

      {/* Data Quality Indicator */}
      {enhancedData?.dataQuality && (
        <div className="data-quality">
          <span>Data Quality: {enhancedData.dataQuality.confidenceScore}%</span>
          <span>Sources: {enhancedData.dataQuality.sourcesUsed.join(', ')}</span>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion">{suggestion}</div>
          ))}
        </div>
      )}

      {/* Enhanced Investment Analysis */}
      <InvestmentAnalysis {...mergedProps} />
    </div>
  );
}
```

## 🔧 Configuration Options

### Web Scraping Configuration

The web scraping service automatically:
- Extracts meaningful content from property listings
- Processes with ChatGPT to identify key metrics
- Estimates scores based on mentioned features
- Provides confidence ratings for extracted data

### API Integration Priority

Data sources are prioritized as follows:
1. **Real Estate APIs** (highest confidence)
2. **Web scraping + ChatGPT** (medium-high confidence)
3. **MCP mock services** (medium confidence)
4. **Default values** (lowest confidence)

## 📊 Data Enhancement Examples

### Before Enhancement (Mock Data)
```json
{
  "walkScore": 70,
  "nearbyAmenities": {
    "restaurants": 8,
    "schools": 3
  },
  "crimeRate": 15,
  "dataSource": "default"
}
```

### After Enhancement (Real APIs + Web Scraping)
```json
{
  "walkScore": 85,
  "bikeScore": 78,
  "transitScore": 92,
  "nearbyAmenities": {
    "restaurants": 24,
    "schools": 7,
    "groceryStores": 6,
    "parks": 4
  },
  "crimeRate": 12.3,
  "dataQuality": {
    "confidenceScore": 0.89,
    "sourcesUsed": ["api_walkscore", "api_google_places", "web_enhanced_chatgpt"],
    "dataCompleteness": 95
  }
}
```

## 🎨 UI Enhancements

### Data Quality Indicators

Add visual indicators for data quality:

```tsx
const DataQualityBadge = ({ quality }) => {
  const getColor = (score) => {
    if (score >= 0.8) return 'green';
    if (score >= 0.6) return 'yellow'; 
    return 'red';
  };

  return (
    <div className={`quality-badge ${getColor(quality.confidenceScore)}`}>
      <span>Quality: {Math.round(quality.confidenceScore * 100)}%</span>
      <span>Sources: {quality.sourceCount}</span>
    </div>
  );
};
```

### Enhancement Suggestions Panel

```tsx
const EnhancementPanel = ({ suggestions, onEnhance }) => (
  <div className="enhancement-panel">
    <h3>Improve Data Quality</h3>
    {suggestions.map((suggestion, index) => (
      <div key={index} className="suggestion-item">
        <span>{suggestion}</span>
        <button onClick={() => onEnhance(suggestion)}>
          Apply
        </button>
      </div>
    ))}
  </div>
);
```

## 🚨 Troubleshooting

### Common Issues

1. **OpenAI API Rate Limits**
   - Monitor usage in OpenAI dashboard
   - Implement request caching (6-hour default)
   - Use shorter content extracts for ChatGPT processing

2. **Real Estate API Limits**
   - Each API has different rate limits
   - Services gracefully fall back to mock data
   - Consider upgrading API plans for higher volume

3. **Web Scraping Blocks**
   - Some sites block automated requests
   - Service includes proper headers and delays
   - Falls back to API data when scraping fails

### Performance Optimization

1. **Enable Caching**
   - Enhanced data cached for 6 hours
   - API data cached for 24 hours
   - Clear cache during development: `DELETE /api/v1/cache`

2. **Batch Requests**
   - APIs called in parallel where possible
   - Non-blocking fallbacks for failed requests
   - Timeout handling for slow responses

## 📈 Metrics and Analytics

### Data Quality Metrics

- **Confidence Score**: 0-1 based on source reliability
- **Data Completeness**: Percentage of fields populated
- **Source Diversity**: Number of different data sources used
- **Freshness**: How recently data was updated

### Performance Metrics

Monitor these in your application:
- API response times
- Cache hit rates
- Data enhancement success rates
- User engagement with enhanced features

## 🔮 Future Enhancements

### Planned Features

1. **Real-time Market Alerts** - Notifications when property metrics change
2. **Comparative Analysis** - Side-by-side property comparisons
3. **Investment Recommendations** - AI-powered investment suggestions
4. **Custom Data Sources** - Integration with additional APIs
5. **Historical Trend Analysis** - Track property metrics over time

### Contributing

To add new data sources or enhance existing ones:

1. Create a new service in `mcp-server/src/services/`
2. Add API integration following existing patterns
3. Update the `combineApiData` function in `realEstateApiService.js`
4. Add corresponding TypeScript interfaces
5. Update documentation and tests

## 📞 Support

For questions or issues:
- Review the MCP integration guide: `MCP_INTEGRATION_GUIDE.md`
- Check API documentation for each service
- Monitor server logs for debugging information
- Test individual endpoints with curl or Postman

---

**Next Steps:** Start with the basic setup and gradually add API keys as you obtain them. The system is designed to work progressively better as more data sources become available. 