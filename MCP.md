# MCP (Master Control Program) API Plan

This document outlines the API strategy for the MCP server, which is responsible for gathering, processing, and providing data to the Investment Analysis dashboard.

## I. Overview

The MCP server acts as a central hub that:
1.  Receives a location (e.g., address or coordinates) for a specific property.
2.  Orchestrates calls to various external APIs to gather relevant data points for that location.
3.  Processes and aggregates this data.
4.  Exposes a set of internal API endpoints that the `InvestmentAnalysis.tsx` dashboard can query to populate its sections.

The primary goal is to provide a rich, real-time or near real-time dataset for comprehensive property investment analysis.

## II. Data Flow

```
[Dashboard] --requests_data_for_location--> [MCP Server]
                                                |
                                                +-- Fetches_data_from --> [External API 1 (e.g., Real Estate Listings)]
                                                |
                                                +-- Fetches_data_from --> [External API 2 (e.g., AirVisual for Air Quality)]
                                                |
                                                +-- Fetches_data_from --> [External API 3 (e.g., NewsAPI.org)]
                                                |
                                                +-- Fetches_data_from --> [External API N (e.g., GeoDataSource for Geocoding)]
                                                |
                                                V
[MCP Server] --processes_&_aggregates_data--> [Internal Data Model]
                                                |
                                                V
[Dashboard] <--receives_structured_data-- [MCP Server API Endpoints]
```

## III. MCP Server Internal API Endpoints

The MCP server will expose the following internal API endpoints for the dashboard. These endpoints will return data relevant to a specific property/location identified by a unique property ID or location coordinates/address.

**Base URL:** `/api/v1/property-analysis/{property_identifier}`

Where `{property_identifier}` could be an internal ID, address string, or lat/lon pair.

---

### 1. Endpoint: `/summary`
*   **Method:** `GET`
*   **Description:** Provides a consolidated summary of key metrics, similar to the top-level props for the `InvestmentAnalysis` component.
*   **Data to Return (example structure):**
    ```json
    {
      "investmentScore": 85,
      "roi5Years": 7.95,
      "roi10Years": 10.2,
      "yearlyYield": 4.2,
      "monthlyRentalIncome": 1600,
      "expectedMonthlyIncome": 1650,
      "yearlyAppreciationPercentage": 3.5,
      "yearlyAppreciationValue": 12250,
      "price": "€ 350.000",
      "address": "Example Street 123, Amsterdam",
      "pricePerSqm": 4117,
      "riskScore": 6.1,
      "yieldScore": 4.5,
      "growthScore": 8.0,
      "locationScore": 8.6,
      "conditionScore": 9.1,
      // Basic property details can also be here
      "bedrooms": 3,
      "bathrooms": 2,
      "size": 85, // sqm
      "yearBuilt": 1998,
      "buildingType": "Apartment"
    }
    ```
*   **External APIs Used by MCP:** Real Estate Listing APIs, Property Data APIs.

---

### 2. Endpoint: `/financials`
*   **Method:** `GET`
*   **Description:** Detailed financial metrics for the property.
*   **Data to Return (example structure):**
    ```json
    {
      "price": "€ 350.000",
      "numericPrice": 350000,
      "pricePerSqm": 4117,
      "monthlyRentalIncome": 1600,
      "annualRentalIncome": 19200,
      "annualExpenses": 5760,
      "netOperatingIncome": 13440,
      "breakEvenPoint": 23.8, // years
      "fiveYearProjectedValue": 415000,
      "yearlyAppreciationPercentage": 3.5,
      "yearlyAppreciationValue": 12250,
      "roi5Years": 7.95,
      "roi10Years": 10.2,
      "yearlyYield": 4.2,
      "dscr": 1.3,
      "cashOnCashReturn": 7.5,
      "grm": 15.2,
      "irr": 11.5,
      "equityBuildup": 6800, // year 1
      "estimatedUtilityCosts": 180, // monthly
      "propertyTaxRate": 0.7, // percentage
      "communityFees": 120, // monthly
      "assessedPropertyValue": 330000
    }
    ```
*   **External APIs Used by MCP:** Real Estate Listing APIs, Property Data APIs, Financial Data APIs, potentially AVM APIs.

---

### 3. Endpoint: `/property-details`
*   **Method:** `GET`
*   **Description:** Core characteristics and features of the property.
*   **Data to Return (example structure):**
    ```json
    {
      "address": "Example Street 123, Amsterdam",
      "description": "Beautiful and bright apartment...",
      "bedrooms": 3,
      "bathrooms": 2,
      "size": 85, // sqm
      "yearBuilt": 1998,
      "lotSize": 0, // sqm, if applicable
      "buildingType": "Apartment",
      "energyLabel": "B",
      "features": ["Elevator", "Balcony", "Renovated Kitchen"],
      "parkingSpace": "Limited street parking"
    }
    ```
*   **External APIs Used by MCP:** Real Estate Listing APIs, Property Data APIs.

---

### 4. Endpoint: `/location-context`
*   **Method:** `GET`
*   **Description:** Information about the property's location, including amenities, pros & cons, and suitability.
*   **Data to Return (example structure):**
    ```json
    {
      "nearbyAmenities": {
        "schools": 7,
        "groceryStores": 5,
        "gyms": 3,
        "restaurants": 13,
        "hospitals": 2,
        "parks": 6,
        "culturalVenuesNearby": 4,
        "localMarketsNearby": 2
      },
      "distanceToSupermarket": 350, // meters
      "publicTransitAccess": true,
      "proximityToLargeCity": { "name": "Amsterdam", "distanceKm": 5, "travelTimeMin": 15 },
      "locationPros": ["Excellent public transport", "Many nearby parks"],
      "locationCons": ["Can be noisy during weekends"],
      "suitabilityScores": {
        "families": 80,
        "couples": 90,
        "singles": 75
      },
      "footTrafficLevel": "Medium",
      "eventsPerMonthArea": 12,
      "petFriendlinessScore": 90
    }
    ```
*   **External APIs Used by MCP:** Mapping & Places APIs (Google Places, Foursquare, Yelp, OSM), Walkability/Transit Score APIs, potentially local government data.

---

### 5. Endpoint: `/environmental-safety`
*   **Method:** `GET`
*   **Description:** Environmental data and safety metrics.
*   **Data to Return (example structure):**
    ```json
    {
      "noisePollutionIndex": 45, // 0-100
      "airQualityIndex": 65, // 0-100
      "crimeRate": 12.5, // per 1000 residents
      "floodRisk": 4, // percentage risk
      "distanceToGreenSpaces": 450, // meters
      "averageSunExposure": 7.1, // hours per day
      "urbanHeatIslandEffect": 1.8 // degrees Celsius difference
    }
    ```
*   **External APIs Used by MCP:** Air Quality APIs (AirVisual, OpenAQ), Weather APIs (for sun exposure, temperature differentials), Crime Data APIs, Flood Risk APIs.

---

### 6. Endpoint: `/market-trends`
*   **Method:** `GET`
*   **Description:** Market activity and trends relevant to the property's location.
*   **Data to Return (example structure):**
    ```json
    {
      "daysOnMarket": 52, // average for area
      "priceHistorySummary": "Last sold for €310,000 (2019).",
      "neighborhoodPriceTrendSummary": "Area prices +5.5% year-over-year.",
      "rentalDemandForecast": "High",
      "vacancyRate": 3.2, // percentage in area
      "shortTermRentalActivity": "Medium", // e.g., Airbnb/VRBO presence
      "listingsNearby": 25 // count of similar properties currently for sale/rent
    }
    ```
*   **External APIs Used by MCP:** Real Estate Market Data APIs, Property Data APIs, Short-Term Rental Data APIs.

---

### 7. Endpoint: `/socio-economic`
*   **Method:** `GET`
*   **Description:** Socio-economic and demographic data for the area.
*   **Data to Return (example structure):**
    ```json
    {
      "medianHouseholdIncome": 55000, // currency
      "ageDistributionSummary": "Majority: 30-45 (35%), 20-29 (25%)",
      "socialDiversityIndex": 72 // 0-100 score
    }
    ```
*   **External APIs Used by MCP:** Census Data APIs, Commercial Demographic Data Providers.

---

### 8. Endpoint: `/local-feed`
*   **Method:** `GET`
*   **Description:** Real-time or frequently updated local information like news.
*   **Data to Return (example structure):**
    ```json
    {
      "recentNews": [
        { "title": "New park opens in the neighborhood", "source": "Local Gazette", "date": "YYYY-MM-DD", "link": "..." },
        { "title": "Community festival next weekend", "source": "City Events Portal", "date": "YYYY-MM-DD", "link": "..." }
      ],
      "sentimentScoreLocalReviews": 85, // 0-100 or 1-5 stars (from reviews aggregation)
      "publicArtAestheticScore": 78 // 0-100
    }
    ```
*   **External APIs Used by MCP:** News APIs (NewsAPI.org), Review APIs (Yelp, Google Places - if feasible), potentially specialized art/culture APIs.

---

## IV. External API Integration Strategy

For each external API, the MCP will:
1.  **Securely Store API Keys:** Use environment variables or a secure vault.
2.  **Implement Client Logic:** Create dedicated modules/services within the MCP for each external API to handle requests, authentication, and response parsing.
3.  **Error Handling & Retries:** Implement robust error handling, including retries with backoff for transient network issues.
4.  **Rate Limiting Compliance:** Adhere to the rate limits of each API. Implement internal throttling if necessary.
5.  **Data Caching:**
    *   Cache responses from external APIs to reduce redundant calls and improve MCP response times.
    *   Cache duration will vary based on how frequently the data source updates (e.g., air quality might be cached for minutes, property listings for hours).
6.  **Data Transformation & Normalization:** Transform data from various API schemas into the MCP's internal data model, which then maps to the dashboard's expected props.
7.  **Asynchronous Operations:** Fetch data from multiple external APIs concurrently where possible to improve overall data gathering latency.

## V. Technology Stack (Placeholder - to be defined)

*   **Programming Language:** (e.g., Node.js/TypeScript, Python, Go)
*   **Framework:** (e.g., Express.js, FastAPI, Gin)
*   **Database (for caching/logging):** (e.g., Redis, PostgreSQL, MongoDB)
*   **Task Queue (for async processing):** (e.g., RabbitMQ, Celery, BullMQ)

## VI. Future Considerations

*   **User Authentication for MCP API:** If the dashboard/MCP requires user accounts.
*   **WebSockets for Real-time Dashboard Updates:** For pushing updates from MCP to the dashboard instead of client-side polling.
*   **API Versioning for MCP Endpoints.**
*   **Monitoring & Logging for MCP Server and API integrations.**
*   **Scalability of MCP server.**
*   **Data Provenance:** Tracking where each piece of data originated.

This plan provides a foundational structure. Specific external APIs will be chosen based on availability, data quality, coverage for target regions, and cost. 