# Real Estate Investment Metrics

This document outlines the metrics used in the InvestmentAnalysis dashboard, which ones are currently implemented in the UI, and how to connect them to external data sources.

## Currently Implemented Metrics

### Basic Property Information
- [x] **Price** - Purchase price of the property
- [x] **Address** - Property location
- [x] **Size** - Building surface area in m²
- [x] **Bedrooms** - Number of bedrooms
- [x] **Bathrooms** - Number of bathrooms
- [x] **Year Built** - When the property was constructed

### Financial Metrics
- [x] **Rental Yield** - Annual rental income as a percentage of property value
- [x] **ROI (Return on Investment)** - 5-year and 10-year ROI projections
- [x] **Monthly Rental Income** - Expected rental income per month
- [x] **Annual Rental Income** - Total annual rental income
- [x] **Annual Expenses** - Expected annual expenses
- [x] **Net Operating Income** - Annual rental income minus operating expenses
- [x] **Yearly Appreciation Percentage** - Expected annual property value growth percentage
- [x] **Yearly Appreciation Value** - Expected annual property value growth in currency
- [x] **Break-even Point** - Years until the investment pays for itself
- [x] **5-Year Projected Value** - Estimated property value after 5 years

### Location Metrics
- [x] **Nearby Amenities** - Number of schools, grocery stores, gyms, restaurants, hospitals, parks within a specified radius
- [x] **Location Pros & Cons** - Specific advantages and disadvantages of the location

### Suitability Metrics
- [x] **Suitability Scores** - Ratings for different demographics (families, couples, singles)
- [x] **Investment Score** - Overall investment potential score with breakdown

## Newly Added Metrics (UI Only)

### Property Specifications
- [x] **Building Type** - Type of property (apartment, house, commercial, etc.)
- [x] **Energy Label** - Energy efficiency rating
- [x] **Lot Size** - Size of the land the property sits on (in m²)
- [x] **Distance to Supermarket** - Distance to nearest grocery store in meters
- [x] **Public Transit Access** - Whether public transportation is available nearby
- [x] **Property Tax Rate** - Annual property tax as percentage of value
- [x] **Community Fees** - Monthly community/maintenance fees

### Environmental & Safety Metrics
- [x] **Noise Pollution Index** - Noise level rating (0-100, lower is better)
- [x] **Air Quality Index** - Air quality rating (0-100, higher is better)
- [x] **Crime Rate** - Crime incidents per 1000 residents
- [x] **Flood Risk** - Percentage chance of flooding
- [x] **Vacancy Rate** - Percentage of vacant properties in the area

## Metrics Still To Be Implemented

### Additional Environmental Metrics
- [x] **Distance to Green Spaces** - Distance to nearest parks or nature areas
- [x] **Average Sun Exposure** - Hours of sunlight per day
- [x] **Urban Heat Island Effect** - Measure of increased temperature due to urban development

### Additional Financial Metrics
- [x] **Debt Service Coverage Ratio (DSCR)** - Net operating income divided by total debt service
- [x] **Cash on Cash Return** - Annual pre-tax cash flow divided by total cash invested
- [x] **Gross Rent Multiplier (GRM)** - Property price divided by gross annual rental income
- [x] **Internal Rate of Return (IRR)** - Discount rate that makes the net present value zero
- [x] **Equity Build-up** - Increase in equity over time through mortgage paydown

### Market & Trend Metrics
- [x] **Days on Market** - Average time properties stay on market in the area
- [x] **Price History** - Past sales and listing prices for the property
- [x] **Neighborhood Price Trends** - 5-year historical price trends for the area
- [x] **Rental Demand Forecast** - Projected changes in rental demand

## Additional Proposed Metrics

### Socio-Economic & Demographic Metrics
- [x] **Median Household Income** - Median income for households in the area
- [x] **Age Distribution in Area** - Breakdown of population by age groups
- [x] **Social Diversity Index** - Measure of social diversity in the neighborhood

### Local Amenities & Lifestyle Metrics
- [x] **Cultural Venues Nearby (Theatres)** - Number/proximity of theatres, museums, etc.
- [x] **Foot Traffic Level** - Indication of pedestrian activity in the area
- [x] **Events per Month in Area** - Average number of public events locally
- [x] **Sentiment Score from Local Reviews** - Aggregated sentiment from online reviews of the area/amenities
- [x] **Public Art & Aesthetic Score** - Subjective or objective rating of public art and general aesthetics
- [x] **Pet-Friendliness (Dog Parks etc.)** - Availability of dog parks and pet-friendly amenities
- [x] **Presence of Local Markets** - Availability of farmers' markets, flea markets, etc.
- [x] **Parking Space** - Availability and type of parking (e.g., dedicated, street)
- [x] **Proximity to the nearest large city** - Distance and travel time to a major urban center

### Market Activity & Property Specifics (New)
- [x] **Short-term Rental Activity (e.g., Airbnb)** - Level of short-term rental presence and regulations
- [x] **Assessed Property Value** - Official valuation for tax purposes
- [x] **Number of Listings Nearby** - Current count of similar properties for sale/rent in the vicinity
- [x] **Utility Costs (estimated)** - Estimated monthly/annual costs for essential utilities

## Connecting to Data Sources

### API Integration

To integrate real data into these metrics, you'll need to connect to various APIs and databases:

1. **Basic Property Information**
   - Connect to real estate database APIs like MLS, Zillow API, or Redfin API
   - Example: `GET /api/properties/{propertyId}` to retrieve basic information

2. **Financial Metrics**
   - Rental yield data: APIs like Rentometer, RentCast
   - Property appreciation: Historical property value data from APIs like HouseCanary or CoreLogic
   - Example: `GET /api/market-data/{postalCode}/appreciation` for historical appreciation rates

3. **Environmental & Safety Metrics**
   - Air Quality: Connect to environmental monitoring APIs like AirVisual API or OpenAQ
   - Noise Pollution: Municipal noise pollution databases or custom sensors
   - Crime Rate: Local police department crime statistics APIs or CrimeReports API
   - Flood Risk: FEMA Flood Map Service Center API or FloodFactor API
   - Example: `GET /api/environmental/air-quality?lat={latitude}&lon={longitude}` for air quality data

4. **Location Metrics**
   - Use Google Places API, Yelp API, or Foursquare API to get data about nearby amenities
   - OpenRouteService API for distance calculations
   - Example: `GET /api/places/nearby?lat={latitude}&lon={longitude}&type=supermarket&radius=1000`

### Database Structure

To store this data efficiently, consider the following database schema:

```sql
-- Properties table
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  address TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  size_sqm INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  year_built INTEGER NOT NULL,
  building_type VARCHAR(50) NOT NULL,
  energy_label CHAR(2),
  lot_size INTEGER,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL
);

-- Financial metrics table
CREATE TABLE financial_metrics (
  property_id INTEGER REFERENCES properties(id),
  monthly_rental_income DECIMAL(10,2),
  annual_expenses DECIMAL(12,2),
  yearly_appreciation_percentage DECIMAL(5,2),
  property_tax_rate DECIMAL(5,3),
  community_fees DECIMAL(8,2),
  vacancy_rate DECIMAL(5,2),
  PRIMARY KEY (property_id)
);

-- Location metrics table
CREATE TABLE location_metrics (
  property_id INTEGER REFERENCES properties(id),
  distance_to_supermarket INTEGER,
  public_transit_access BOOLEAN,
  schools_nearby INTEGER,
  parks_nearby INTEGER,
  restaurants_nearby INTEGER,
  hospitals_nearby INTEGER,
  PRIMARY KEY (property_id)
);

-- Environmental metrics table
CREATE TABLE environmental_metrics (
  property_id INTEGER REFERENCES properties(id),
  noise_pollution_index INTEGER,
  air_quality_index INTEGER,
  crime_rate DECIMAL(5,2),
  flood_risk DECIMAL(5,2),
  PRIMARY KEY (property_id)
);
```

## Implementation Roadmap

1. **Phase 1: UI Implementation** ✅
   - Display UI elements for all metrics with mock/default data

2. **Phase 2: API Integration**
   - Connect basic property information to real estate database API
   - Implement property value and rental income calculation services
   - Integrate with environmental data sources

3. **Phase 3: Data Analytics**
   - Implement historical data analysis for better predictions
   - Create comparative market analysis functionality
   - Develop investment recommendation engine

## Example API Integration

Here's an example of how to integrate the air quality metrics with an API:

```typescript
// api/environmental.ts
import axios from 'axios';

export async function getAirQualityData(latitude: number, longitude: number): Promise<number> {
  try {
    const response = await axios.get('https://api.openaq.org/v2/latest', {
      params: {
        coordinates: `${latitude},${longitude}`,
        radius: 10000,
        limit: 1,
        parameter: ['pm25', 'pm10', 'o3']
      }
    });
    
    // Process the response to calculate an air quality index (0-100)
    const measurements = response.data.results[0]?.measurements || [];
    const pm25Value = measurements.find(m => m.parameter === 'pm25')?.value || 0;
    const pm10Value = measurements.find(m => m.parameter === 'pm10')?.value || 0;
    const o3Value = measurements.find(m => m.parameter === 'o3')?.value || 0;
    
    // Calculate AQI based on EPA standards (simplified version)
    // A more complex calculation would be done in production
    const aqiValue = calculateAQI(pm25Value, pm10Value, o3Value);
    return aqiValue;
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return 50; // Default fallback value
  }
}

function calculateAQI(pm25: number, pm10: number, o3: number): number {
  // Implementation of AQI calculation algorithm
  // This would be a more complex calculation in production
  // Simple example: invert and scale the pollutant values
  const pm25Component = Math.max(0, 100 - (pm25 * 2));
  const pm10Component = Math.max(0, 100 - pm10);
  const o3Component = Math.max(0, 100 - (o3 * 2));
  
  // Lower values of pollutants = higher air quality
  return Math.floor((pm25Component + pm10Component + o3Component) / 3);
}
```

## Conclusion

The InvestmentAnalysis component now visually displays 32 different metrics related to real estate investment analysis. The metrics cover financial aspects, location details, property specifications, environmental factors, and suitability for different demographics.

To make this dashboard fully functional with real data, you'll need to:

1. Create appropriate backend API endpoints
2. Integrate with third-party data providers
3. Implement data processing and analysis services
4. Set up a database to store property and market data

By following the implementation roadmap, you can gradually introduce real data to replace the mock values, transforming this UI shell into a powerful real estate investment analysis tool.