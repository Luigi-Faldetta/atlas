import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Type definitions for MCP API responses
export interface AirQualityData {
  aqi: number;
  category: string;
  pollutants: {
    name: string;
    concentration: number;
    unit: string;
  }[];
  location: string;
  lastUpdated: string;
}

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  imageUrl?: string;
}

export interface PropertyAnalysisData {
  summary: {
    airQuality: AirQualityData;
    localNews: NewsArticle[];
    // Other summary data...
  };
  propertyDetails: {
    // Property details data...
  };
  neighborhood: {
    // Neighborhood data...
  };
  // Other data sections...
}

class MCPApiClient {
  private client: AxiosInstance;
  
  constructor() {
    // Get MCP server URL from environment or use default
    const baseURL = process.env.NEXT_PUBLIC_MCP_API_URL || 'http://localhost:3001/api/v1';
    
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add request interceptor for handling auth if needed
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth headers if needed
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }
  
  // Get air quality data for a property
  async getAirQualityData(propertyIdentifier: string): Promise<AirQualityData> {
    try {
      const response = await this.client.get(`/property-analysis/${propertyIdentifier}/air-quality`);
      return response.data;
    } catch (error) {
      console.error('Error fetching air quality data:', error);
      throw error;
    }
  }
  
  // Get local news for a property
  async getLocalNews(propertyIdentifier: string): Promise<NewsArticle[]> {
    try {
      const response = await this.client.get(`/property-analysis/${propertyIdentifier}/local-news`);
      return response.data;
    } catch (error) {
      console.error('Error fetching local news:', error);
      throw error;
    }
  }
  
  // Get property analysis summary
  async getPropertyAnalysisSummary(propertyIdentifier: string): Promise<PropertyAnalysisData['summary']> {
    try {
      const response = await this.client.get(`/property-analysis/${propertyIdentifier}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching property analysis summary:', error);
      throw error;
    }
  }
  
  // Get full property analysis data
  async getFullPropertyAnalysis(propertyIdentifier: string): Promise<PropertyAnalysisData> {
    try {
      const response = await this.client.get(`/property-analysis/${propertyIdentifier}/full`);
      return response.data;
    } catch (error) {
      console.error('Error fetching full property analysis:', error);
      throw error;
    }
  }

  // BEER TEST MVP: Get enhanced property data with real description and features
  async getEnhancedPropertyData(propertyIdentifier: string, propertyUrl?: string): Promise<any> {
    try {
      const encodedIdentifier = encodeURIComponent(propertyIdentifier);
      const urlParams = propertyUrl ? `?propertyUrl=${encodeURIComponent(propertyUrl)}` : '';
      
      const response = await this.client.get(`/property-analysis/${encodedIdentifier}/enhanced${urlParams}`);
      const data = response.data;
      
      // RAPID PROTOTYPING: Return formatted data for immediate frontend use
      return {
        success: true,
        data: data.investmentAnalysisData, // Pre-formatted for component
        rawData: data, // Full response for debugging
        dataQuality: data.dataQuality,
        hasRealData: data.dataQuality?.hasRealData || false
      };
    } catch (error: any) {
      console.error('Error fetching enhanced property data:', error);
      
      // BEER TEST: Graceful fallback for rapid testing
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        data: null,
        hasRealData: false
      };
    }
  }
}

// Create a singleton instance
const mcpApiClient = new MCPApiClient();

export default mcpApiClient; 