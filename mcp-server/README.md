# MCP (Master Control Program) Server

The MCP server is a central hub for gathering, processing, and providing property-related data to the Investment Analysis dashboard.

## Overview

The MCP server acts as an aggregator and orchestrator for multiple external APIs to provide rich data about properties. It offers a set of unified API endpoints that the frontend can query to populate the various sections of the Investment Analysis dashboard.

## Features

- Central API for all property data needs
- Integration with multiple external data sources
- Caching to improve performance and reduce API costs
- Error handling and retry logic for external API calls
- Rate limiting to prevent abuse

## API Endpoints

The MCP server provides the following endpoints:

### Property Analysis

Base URL: `/api/v1/property-analysis`

- `GET /:propertyIdentifier/summary` - Get a summary of the property
- `GET /:propertyIdentifier/financials` - Get financial information about the property
- `GET /:propertyIdentifier/property-details` - Get detailed information about the property
- `GET /:propertyIdentifier/location-context` - Get information about the property's location
- `GET /:propertyIdentifier/environmental-safety` - Get environmental and safety information
- `GET /:propertyIdentifier/market-trends` - Get market trends for the property's area
- `GET /:propertyIdentifier/socio-economic` - Get socio-economic data for the area
- `GET /:propertyIdentifier/local-feed` - Get local news and events

The `propertyIdentifier` can be:
- An address (e.g., "123 Main St, Amsterdam")
- Latitude and longitude coordinates (e.g., "52.3676,4.9041")

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd mcp-server
   npm install
   ```
3. Copy `env.example` to `.env` and configure the environment variables
4. Start the server:
   ```
   npm start
   ```
   
## Development

To start the server in development mode with auto-reloading:
```
npm run dev
```

## Integrated Services

The MCP server integrates with the following external APIs:

- **AirVisual API** - For air quality data
- **NewsAPI** - For local news
- **Google Maps Geocoding API** - For location data
- **Additional APIs** - For weather, crime, demographics, etc.

## Caching Strategy

The MCP server employs a multi-tiered caching strategy:

- **Volatile cache** (5 minutes) - For rapidly changing data (air quality, weather)
- **Standard cache** (1 hour) - For data that changes less frequently (news, location context)
- **Stable cache** (1 day) - For data that rarely changes (property details, geocoding)

## Error Handling

The server includes robust error handling with:

- Logging of all errors
- Retry logic for transient API failures
- Graceful degradation when external services are unavailable
- Informative error messages for debugging

## Integration with Existing Backend

The MCP server is designed to work alongside the existing backend, providing additional data sources and processing capabilities without disrupting existing functionality. 