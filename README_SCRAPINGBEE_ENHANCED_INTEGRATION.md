# ScrapingBee Enhanced Integration for Atlas Property Analysis

## Overview

This integration adds advanced screenshot-based property analysis to Atlas using the ScrapingBee Screenshot API combined with OpenAI Vision. It provides enhanced data extraction capabilities that go beyond traditional web scraping by capturing visual information and handling complex interactions like cookie consent dialogs, dropdown menus, and pop-ups.

## Features

### 🎯 Core Capabilities
- **Full Page Screenshots**: Capture complete property listings with all visual elements
- **Interactive Element Handling**: Automatically expand dropdown menus and dismiss pop-ups
- **Cookie Consent Management**: Handle GDPR cookie dialogs across different sites
- **AI Vision Analysis**: Extract property data from screenshots using GPT-4 Vision
- **Multi-Site Support**: Pre-configured for major property sites (Funda, Idealista, Fotocasa, Habitaclia)

### 🔧 Enhanced Features
- **Dropdown Expansion**: Automatically click and expand property detail dropdowns
- **Popup Dismissal**: Handle cookie consent, newsletters, and other overlay dialogs
- **Dynamic Content Loading**: Wait for lazy-loaded images and content
- **Quality Scoring**: Confidence metrics for extracted data
- **Fallback Support**: Graceful degradation to standard scraping if enhanced fails

## Architecture

### Components Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Express Proxy   │    │  ScrapingBee    │
│   Tools Page    │◄──►│     Server       │◄──►│   Enhanced API  │
│                 │    │                  │    │                 │
│ Enhanced UI     │    │ /analyze-enhanced│    │ Screenshot +    │
│ Controls        │    │ /capture-screenshot    │ AI Vision       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                ▲                        ▲
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Docker         │    │  ScrapingBee    │
                       │   Compose        │    │  Screenshot API │
                       │   Services       │    │  + OpenAI       │
                       └──────────────────┘    └─────────────────┘
```

### Service Architecture

1. **Frontend Enhancement** (`frontend/app/tools/page.tsx`)
   - Enhanced analysis UI controls
   - Toggle for screenshot-based analysis
   - Options for dropdown expansion, popup handling
   - Visual indicators for enhanced features

2. **Express Proxy Extensions** (`express-server/express-server.js`)
   - `/analyze-enhanced` - Enhanced screenshot analysis
   - `/capture-screenshot` - Screenshot capture only
   - `/supported-sites` - List configured property sites
   - `/scraper-status` - Service health monitoring

3. **ScrapingBee Enhanced API** (`ai_agent/scrapingbee_enhanced_scraper.py`)
   - Core screenshot capture logic
   - Site-specific interaction handlers
   - AI Vision-based data extraction
   - Quality scoring and validation

4. **API Integration Service** (`ai_agent/scrapingbee_api_integration.py`)
   - FastAPI server for enhanced analysis
   - Request validation and routing
   - Response formatting for dashboard compatibility
   - Error handling and logging

## Installation & Setup

### 1. Environment Variables

Add these to your `.env` file:

```bash
# ScrapingBee Configuration
SCRAPINGBEE_API_KEY=your_scrapingbee_api_key_here

# OpenAI Configuration (required for AI Vision)
OPENAI_API_KEY=your_openai_api_key_here

# Service URLs (for Docker deployment)
SCRAPINGBEE_API_URL=http://127.0.0.1:8001
```

### 2. Install Dependencies

```bash
# Add new dependencies to ai_agent
cd ai_agent
pip install httpx fastapi uvicorn

# Or update requirements.txt and install
pip install -r requirements.txt
```

### 3. Docker Deployment

The integration is automatically configured in `docker-compose.yml`:

```bash
# Build and start enhanced services
docker-compose up --build scrapingbee-enhanced express-proxy

# Or start all services
docker-compose up --build
```

### 4. Manual Testing

```bash
# Test the ScrapingBee enhanced service
cd ai_agent
python test_scrapingbee_integration.py

# Test with custom URL
python test_scrapingbee_integration.py "https://www.funda.nl/koop/amsterdam/huis-12345/"
```

## Usage

### Frontend Usage

1. **Navigate to Tools Page**: Go to `/tools` in your Atlas frontend
2. **Enable Enhanced Analysis**: Toggle the "Enhanced Screenshot Analysis" switch
3. **Configure Options**:
   - ✅ **Expand Dropdowns**: Automatically expand property detail sections
   - ✅ **Handle Popups**: Dismiss cookie consent and other dialogs
   - ✅ **Full Page Screenshot**: Capture complete page content
   - ✅ **AI Vision Extraction**: Use GPT-4 Vision for data extraction
4. **Enter Property URL**: Paste any supported property listing URL
5. **Analyze**: Click "Analyze" to start enhanced screenshot-based analysis

### API Usage

#### Enhanced Property Analysis

```bash
curl -X POST http://localhost:5001/analyze-enhanced \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://www.funda.nl/koop/amsterdam/huis-42513854-aragohof-4-1/",
    "capture_dropdowns": true,
    "handle_popups": true,
    "full_page": true,
    "enhanced_extraction": true
  }'
```

#### Screenshot Capture Only

```bash
curl -X POST http://localhost:5001/capture-screenshot \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://www.funda.nl/koop/amsterdam/huis-42513854-aragohof-4-1/",
    "capture_type": "comprehensive",
    "handle_interactions": true
  }'
```

#### Check Supported Sites

```bash
curl http://localhost:5001/supported-sites
```

#### Service Health Check

```bash
curl http://localhost:5001/scraper-status
```

## Supported Property Sites

### Pre-configured Sites

| Site | Domain | Cookie Handling | Dropdown Expansion | Popup Handling |
|------|--------|----------------|-------------------|----------------|
| **Funda** | funda.nl | ✅ | ✅ | ✅ |
| **Idealista** | idealista.com | ✅ | ✅ | ✅ |
| **Fotocasa** | fotocasa.es | ✅ | ✅ | ✅ |
| **Habitaclia** | habitaclia.com | ✅ | ✅ | ✅ |

### Site-Specific Features

Each site has configured selectors for:
- **Cookie consent buttons** - Automatically accept/dismiss cookie dialogs
- **Dropdown menus** - Expand property details, amenities, location info
- **Popup close buttons** - Dismiss newsletters, ads, overlays
- **Wait elements** - Ensure content is loaded before capturing
- **Dynamic content handling** - Handle lazy-loaded images and content

## Enhanced Data Extraction

### Screenshot Quality Scoring

The system provides quality metrics for each analysis:

```json
{
  "screenshot_quality_score": 87.5,
  "visual_clarity_score": 92.0,
  "screenshot_capture_time": 12.3,
  "ai_vision_processing_time": 8.7
}
```

### Confidence Scoring

AI Vision extraction includes confidence scores:

```json
{
  "data_extraction_confidence": {
    "address": 95,
    "price": 88,
    "bedrooms": 92,
    "bathrooms": 85,
    "size": 90
  }
}
```

### Enhanced Property Data

Beyond standard scraping, screenshot analysis provides:

```json
{
  "enhanced_features": {
    "virtual_tour_available": true,
    "floor_plan_available": true,
    "energy_label": "A+",
    "building_type": "Apartment",
    "location_highlights": [
      "Near public transport",
      "Shopping areas nearby",
      "Parks and recreation"
    ]
  }
}
```

## Integration with InvestmentAnalysis Dashboard

### Data Mapping

The enhanced analysis automatically maps to the existing `InvestmentAnalysis.tsx` dashboard:

```javascript
// Enhanced data is seamlessly integrated
const dashboardData = {
  // Standard fields
  address: result.address,
  price: result.price,
  bedrooms: result.bedrooms,
  
  // Enhanced fields
  isEnhancedAnalysis: true,
  screenshotMetadata: {
    quality_score: 87.5,
    cookies_handled: true,
    dropdowns_captured: 3
  },
  
  // AI Vision confidence scores
  confidenceScores: {
    overall_confidence: 88.2
  }
}
```

### Enhanced UI Indicators

The dashboard automatically detects enhanced analysis and shows:
- 🎯 Enhanced analysis badge
- 📸 Screenshot quality score
- 🔍 AI Vision confidence indicators
- ⚙️ Processing metadata

## Troubleshooting

### Common Issues

#### 1. Service Not Starting
```bash
# Check if all dependencies are installed
cd ai_agent
pip install -r requirements.txt

# Verify environment variables
echo $SCRAPINGBEE_API_KEY
echo $OPENAI_API_KEY
```

#### 2. Screenshot Capture Fails
```bash
# Test with basic screenshot first
curl -X POST http://localhost:8001/api/capture-screenshot \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com", "capture_type": "full_page"}'
```

#### 3. AI Vision Errors
- Verify OpenAI API key is valid and has GPT-4 Vision access
- Check if image is too large (ScrapingBee compresses automatically)
- Ensure sufficient OpenAI credits

#### 4. Site-Specific Issues
```bash
# Check supported sites configuration
curl http://localhost:8001/api/supported-sites

# Test with different site
python test_scrapingbee_integration.py "https://www.idealista.com/..."
```

### Debug Logging

Enable detailed logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Performance Optimization

- **Screenshot Quality**: Balance quality vs. speed with compression settings
- **Timeout Settings**: Adjust based on site complexity (default: 120s)
- **Concurrent Requests**: Limit concurrent screenshot captures
- **Caching**: Consider caching screenshots for repeated analyses

## API Documentation

### Response Formats

#### Enhanced Analysis Response
```json
{
  "success": true,
  "data": {
    "address": "Aragohof 4-1, 1098 RR Amsterdam",
    "price": "€535,000",
    "bedrooms": 3,
    "bathrooms": 1,
    "size": "68 m²",
    "isEnhancedAnalysis": true,
    "screenshotMetadata": {
      "screenshot_quality_score": 87.5,
      "cookies_handled": true,
      "dropdowns_captured": 3
    }
  },
  "processing_time": 45.2,
  "credits_used": 12,
  "screenshot_quality_score": 87.5,
  "extraction_confidence": {
    "address": 95,
    "price": 88
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Screenshot capture failed: Site timeout",
  "processing_time": 12.3,
  "credits_used": 0,
  "screenshot_quality_score": 0.0
}
```

## Security Considerations

### API Key Protection
- ScrapingBee API keys are server-side only
- OpenAI API keys never exposed to frontend
- All requests validated and sanitized

### Rate Limiting
- Built-in rate limiting for API calls
- ScrapingBee credit usage monitoring
- Graceful degradation on quota limits

### Data Privacy
- Screenshots are processed in memory only
- No persistent storage of property images
- GDPR compliance through automatic cookie handling

## Future Enhancements

### Planned Features
- **Video Capture**: Capture property tour videos
- **Multi-Screenshot Analysis**: Compare multiple property views
- **Custom Selectors**: User-defined interaction selectors
- **Batch Processing**: Analyze multiple properties simultaneously
- **Advanced AI Models**: Integration with specialized vision models

### Performance Improvements
- **Screenshot Caching**: Cache frequently accessed properties
- **Parallel Processing**: Concurrent screenshot capture
- **Optimized Compression**: Smart image compression algorithms
- **CDN Integration**: Global screenshot delivery network

## Support

### Documentation
- [ScrapingBee Screenshot API Docs](https://www.scrapingbee.com/documentation/#screenshot_full_page)
- [OpenAI Vision API Docs](https://platform.openai.com/docs/guides/vision)

### Testing
```bash
# Run comprehensive integration tests
cd ai_agent
python test_scrapingbee_integration.py

# Test specific functionality
python -c "from scrapingbee_enhanced_scraper import ScrapingBeeEnhancedScraper; print('✅ Import successful')"
```

### Monitoring
- Service health: `GET /api/scraper-status`
- Screenshot quality metrics in response data
- Processing time monitoring
- Credit usage tracking

---

## Quick Start Checklist

- [ ] Set `SCRAPINGBEE_API_KEY` in environment
- [ ] Set `OPENAI_API_KEY` in environment  
- [ ] Install dependencies: `pip install -r ai_agent/requirements.txt`
- [ ] Start services: `docker-compose up --build`
- [ ] Test integration: `python ai_agent/test_scrapingbee_integration.py`
- [ ] Enable enhanced analysis in frontend `/tools` page
- [ ] Test with property URL and verify dashboard integration

**🎉 You're ready to use enhanced screenshot-based property analysis!** 