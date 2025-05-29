import { useState, useEffect } from 'react';
import mcpApiClient from './mcpClient';

export interface EnhancedPropertyData {
  // Web-enhanced data from scraping + ChatGPT
  webEnhanced?: {
    walkScore: number;
    bikeScore: number;
    transitScore: number;
    energyEfficiencyScore: number;
    crimeRateEstimate: number;
    schoolQualityScore: number;
    nearbyAmenities: {
      restaurants: number;
      schools: number;
      parks: number;
      gyms: number;
      groceryStores: number;
      hospitals: number;
    };
    propertyFeatures: string[];
    marketTrends: {
      priceDirection: 'increasing' | 'stable' | 'decreasing';
      demandLevel: 'high' | 'medium' | 'low';
      timeOnMarket: number;
    };
    investmentPotential: {
      rentalDemand: 'high' | 'medium' | 'low';
      appreciation: 'high' | 'medium' | 'low';
      riskLevel: 'low' | 'medium' | 'high';
    };
    localInsights: string[];
    confidence: number;
    source: string;
  };

  // Real estate API data
  apiData?: {
    walkScore?: number;
    transitScore?: number;
    bikeScore?: number;
    propertyValue?: number;
    estimatedRent?: number;
    rentConfidence?: number;
    yearBuilt?: number;
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
    nearbyAmenities?: {
      schools: number;
      hospitals: number;
      restaurants: number;
      gyms: number;
      groceryStores: number;
      parks: number;
    };
    investmentMetrics?: {
      grossRentalYield?: string;
      averageWalkabilityScore?: string;
      amenityDensityScore?: string;
    };
    sources: string[];
  };

  // Market research data
  marketResearch?: {
    priceAppreciation: number;
    rentalYield: number;
    marketSentiment: string;
    investmentGrade: string;
    keyTrends: string[];
  };

  // Comparables data
  comparables?: {
    source: string;
    comparables: {
      count: number;
      properties: Array<{
        address: string;
        price: number;
        pricePerSqFt: number;
        soldDate: string;
        daysOnMarket: number;
      }>;
    };
  };

  // Data quality metrics
  dataQuality?: {
    sourcesUsed: string[];
    sourceCount: number;
    confidenceScore: number;
    dataCompleteness: number;
    lastUpdated: string;
  };
}

export interface UseEnhancedPropertyDataResult {
  data: EnhancedPropertyData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  enhanceWithUrl: (propertyUrl: string) => Promise<void>;
  getMarketResearch: () => Promise<void>;
}

/**
 * Custom hook to fetch enhanced property data using multiple sources:
 * - Web scraping + ChatGPT analysis
 * - Real estate APIs (RentCast, WalkScore, ATTOM, Google Places)
 * - Existing MCP services
 */
export const useEnhancedPropertyData = (
  propertyIdentifier: string
): UseEnhancedPropertyDataResult => {
  const [data, setData] = useState<EnhancedPropertyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEnhancedData = async (propertyUrl?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Build URL with optional property URL for web scraping
      const params = new URLSearchParams();
      if (propertyUrl) {
        params.append('propertyUrl', propertyUrl);
      }

      const url = `/property-analysis/${encodeURIComponent(propertyIdentifier)}/enhanced${
        params.toString() ? `?${params.toString()}` : ''
      }`;

      // Use the internal client directly to access enhanced endpoints
      const response = await (mcpApiClient as any).client.get(url);

      // Transform the response to match our interface
      const enhancedData: EnhancedPropertyData = {
        webEnhanced: response.data.webEnhanced || undefined,
        apiData: response.data.apiData || undefined,
        dataQuality: response.data.dataQuality || undefined,
      };

      setData(enhancedData);
    } catch (err: any) {
      console.error('Error fetching enhanced property data:', err);
      setError(err.message || 'Failed to fetch enhanced property data');
    } finally {
      setLoading(false);
    }
  };

  const getMarketResearch = async () => {
    try {
      setLoading(true);
      const response = await (mcpApiClient as any).client.get(
        `/property-analysis/${encodeURIComponent(propertyIdentifier)}/market-research`
      );

      // Update existing data with market research
      setData(prevData => ({
        ...prevData,
        marketResearch: response.data.marketResearch,
        comparables: response.data.comparables,
      }));
    } catch (err: any) {
      console.error('Error fetching market research:', err);
      setError(err.message || 'Failed to fetch market research');
    } finally {
      setLoading(false);
    }
  };

  const enhanceWithUrl = async (propertyUrl: string) => {
    await fetchEnhancedData(propertyUrl);
  };

  const refetch = () => {
    fetchEnhancedData();
  };

  // Fetch data on mount
  useEffect(() => {
    if (propertyIdentifier) {
      fetchEnhancedData();
    }
  }, [propertyIdentifier]);

  return {
    data,
    loading,
    error,
    refetch,
    enhanceWithUrl,
    getMarketResearch,
  };
};

/**
 * Hook to get real-time property enhancement suggestions
 */
export const usePropertyEnhancementSuggestions = (
  propertyData: EnhancedPropertyData | null
) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!propertyData) {
      setSuggestions([]);
      return;
    }

    const newSuggestions: string[] = [];

    // Check data completeness and suggest improvements
    if (!propertyData.webEnhanced) {
      newSuggestions.push('Add property listing URL for detailed web analysis');
    }

    if (!propertyData.marketResearch) {
      newSuggestions.push('Fetch market research for investment insights');
    }

    if (propertyData.dataQuality?.confidenceScore && propertyData.dataQuality.confidenceScore < 0.7) {
      newSuggestions.push('Data confidence is low - consider verifying sources');
    }

    if (propertyData.dataQuality?.dataCompleteness && propertyData.dataQuality.dataCompleteness < 80) {
      newSuggestions.push('Some data sources unavailable - check API configurations');
    }

    // Investment-specific suggestions
    if (propertyData.webEnhanced?.investmentPotential?.riskLevel === 'high') {
      newSuggestions.push('High investment risk detected - review carefully');
    }

    if (propertyData.apiData?.investmentMetrics?.grossRentalYield) {
      const yield_ = parseFloat(propertyData.apiData.investmentMetrics.grossRentalYield);
      if (yield_ < 5) {
        newSuggestions.push('Low rental yield - consider market alternatives');
      }
    }

    setSuggestions(newSuggestions);
  }, [propertyData]);

  return suggestions;
};

/**
 * Utility function to merge enhanced data with existing InvestmentAnalysis props
 */
export const mergeEnhancedDataWithProps = (
  existingProps: any,
  enhancedData: EnhancedPropertyData | null
) => {
  if (!enhancedData) return existingProps;

  const merged = { ...existingProps };

  // Merge web-enhanced data
  if (enhancedData.webEnhanced) {
    const web = enhancedData.webEnhanced;
    
    // Override with more accurate web-scraped data
    if (web.walkScore) merged.walkScore = web.walkScore;
    if (web.crimeRateEstimate) merged.crimeRate = web.crimeRateEstimate;
    if (web.schoolQualityScore) merged.schoolQualityScore = web.schoolQualityScore;
    
    // Merge amenities (take higher counts from either source)
    if (web.nearbyAmenities) {
      merged.nearbyAmenities = {
        schools: Math.max(merged.nearbyAmenities?.schools || 0, web.nearbyAmenities.schools),
        groceryStores: Math.max(merged.nearbyAmenities?.groceryStores || 0, web.nearbyAmenities.groceryStores),
        gyms: Math.max(merged.nearbyAmenities?.gyms || 0, web.nearbyAmenities.gyms),
        restaurants: Math.max(merged.nearbyAmenities?.restaurants || 0, web.nearbyAmenities.restaurants),
        hospitals: Math.max(merged.nearbyAmenities?.hospitals || 0, web.nearbyAmenities.hospitals),
        parks: Math.max(merged.nearbyAmenities?.parks || 0, web.nearbyAmenities.parks),
      };
    }

    // Add market insights
    if (web.marketTrends) {
      merged.daysOnMarket = web.marketTrends.timeOnMarket;
      merged.neighborhoodPriceTrendSummary = `Market trend: ${web.marketTrends.priceDirection} (${web.marketTrends.demandLevel} demand)`;
    }

    // Add local insights to location pros
    if (web.localInsights) {
      merged.locationPros = [
        ...(merged.locationPros || []),
        ...web.localInsights
      ];
    }
  }

  // Merge API data
  if (enhancedData.apiData) {
    const api = enhancedData.apiData;
    
    // Use API-sourced walkability scores if available
    if (api.walkScore) merged.walkScore = api.walkScore;
    if (api.transitScore) merged.transitScore = api.transitScore;
    if (api.bikeScore) merged.bikeScore = api.bikeScore;
    
    // Use property valuation if available
    if (api.propertyValue) merged.assessedPropertyValue = api.propertyValue;
    if (api.estimatedRent) merged.expectedMonthlyIncome = api.estimatedRent;
    
    // Merge amenities data
    if (api.nearbyAmenities) {
      merged.nearbyAmenities = api.nearbyAmenities;
    }

    // Add investment metrics
    if (api.investmentMetrics?.grossRentalYield) {
      merged.yearlyYield = parseFloat(api.investmentMetrics.grossRentalYield);
    }
  }

  // Merge market research
  if (enhancedData.marketResearch) {
    const market = enhancedData.marketResearch;
    merged.yearlyAppreciationPercentage = market.priceAppreciation;
    merged.rentalDemandForecast = market.marketSentiment === 'positive' ? 'High' : 'Medium';
    
    // Add market trends to location pros
    merged.locationPros = [
      ...(merged.locationPros || []),
      ...market.keyTrends.map(trend => `Market: ${trend}`)
    ];
  }

  // Add data quality metadata
  if (enhancedData.dataQuality) {
    merged.dataQualityMetadata = enhancedData.dataQuality;
  }

  return merged;
}; 