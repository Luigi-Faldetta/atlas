# Property Scraper Service

This is a Node.js service for scraping property data from Spanish real estate websites (Idealista, Fotocasa, Habitaclia). It provides a REST API to request property data extraction and analysis.

## Features

- 🏠 **Real estate data extraction**: Extracts property data from multiple Spanish real estate websites
- 🧠 **AI-powered investment analysis**: Calculates investment metrics and uses AI to generate an investment score
- 🛡️ **Anti-detection protection**: Uses puppeteer-stealth to avoid bot detection
- 🔒 **Rate limiting and security**: Includes rate limiting, security headers, and other protections
- 💾 **Caching**: Optimizes performance by caching recently scraped properties

## Installation

1. Clone the repository
2. Install dependencies:
```
cd server
npm install
```
3. Copy the example environment file:
```
cp .env.example .env
```
4. Edit the `.env` file to configure your settings

## Usage

### Starting the server

For development with auto-restart:
```
npm run dev
```

For production:
```
npm start
```

### API Endpoints

#### POST /api/property-analysis
Analyze a property from a URL.

**Request Body:**
```json
{
  "url": "https://www.idealista.com/inmueble/12345678/",
  "platform": "idealista",
  "useMockData": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property analysis completed",
  "data": {
    "url": "https://www.idealista.com/inmueble/12345678/",
    "scrapedAt": "2023-06-01T12:00:00Z",
    "propertyDetails": {
      "propertyAddress": "Calle Example 123, Madrid",
      "location": "Madrid",
      "purchasePrice": 450000,
      "estimatedMonthlyRent": 1800,
      "squareMeters": 90,
      "bedrooms": 3,
      "bathrooms": 2,
      "propertyType": "Apartment",
      "financialMetrics": {
        "purchasePrice": 450000,
        "estimatedMonthlyRent": 1800,
        "annualRentalIncome": 21600,
        "expenses": {
          "propertyTax": 2250,
          "insurance": 900,
          "maintenance": 4500,
          "managementFees": 1728
        },
        "totalExpenses": 9378,
        "netOperatingIncome": 12222,
        "capRate": 2.72,
        "cashOnCashReturn": 4.1,
        "rentalYield": 4.8,
        "pricePerSquareMeter": 5000,
        "breakEvenOccupancy": 43.42,
        "mortgagePayment": 1614.09
      },
      "riskAssessment": {
        "overall": "Low",
        "score": 75,
        "factors": {
          "location": "Madrid",
          "propertyType": "Apartment",
          "rentalYield": 4.8
        }
      },
      "atlasScore": 82,
      "aiAnalysis": "This property represents a good investment opportunity..."
    },
    "platform": "idealista"
  }
}
```

#### GET /api/health
Health check endpoint to verify the server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-06-01T12:00:00Z"
}
```

## Legal Considerations

Web scraping may be subject to legal restrictions and website terms of service. Key considerations:

1. **Terms of Service**: Most real estate websites prohibit scraping in their ToS
2. **Rate Limiting**: The service includes rate limiting to avoid overwhelming target sites
3. **Personal Data**: Be careful with handling personal data in compliance with GDPR
4. **User-Agent**: The service uses a realistic user-agent to mimic normal browser behavior
5. **Proxies**: For production use, consider using rotating proxies to avoid IP bans

**Disclaimer**: This tool is provided for educational purposes only. Use it responsibly and at your own risk.

## Configuration

The following environment variables can be configured:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| OPENAI_API_KEY | OpenAI API key for AI analysis | (none) |
| ENABLE_CACHE | Enable/disable caching | 1 (enabled) |
| CACHE_TTL | Cache time-to-live in ms | 3600000 (1 hour) |
| PUPPETEER_HEADLESS | Run Puppeteer in headless mode | true |
| RATE_LIMIT_WINDOW_MS | Rate limit window in ms | 900000 (15 minutes) |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | 20 |
| PROXY_LIST | Comma-separated list of proxies | (none) |

## License

ISC 