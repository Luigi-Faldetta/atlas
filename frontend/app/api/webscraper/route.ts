import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

// Initialize OpenAI client (for AI scoring)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '', // Add your API key in .env.local file
});

// Define the URL for our scraper service
const SCRAPER_SERVICE_URL =
  process.env.SCRAPER_SERVICE_URL || 'http://localhost:5000';

// Mock data for property analysis for Spanish properties (fallback)
const mockSpanishPropertyData = {
  propertyAddress: 'Calle Gran Vía 28, Madrid, España',
  marketTrends: {
    priceHistory: [
      { date: '2023-01', price: 380000 },
      { date: '2023-04', price: 395000 },
      { date: '2023-07', price: 410000 },
      { date: '2023-10', price: 425000 },
      { date: '2024-01', price: 440000 },
      { date: '2024-04', price: 450000 },
    ],
    rentalYield: 5.2,
    areaGrowth: 4.8,
    similarProperties: [
      {
        address: 'Calle Gran Vía 30',
        price: 465000,
        sqft: 95,
        pricePerSqft: 4895,
      },
      {
        address: 'Calle Princesa 15',
        price: 445000,
        sqft: 90,
        pricePerSqft: 4944,
      },
      {
        address: 'Plaza España 4',
        price: 490000,
        sqft: 100,
        pricePerSqft: 4900,
      },
    ],
  },
  locationAnalysis: {
    walkScore: 95,
    transitScore: 98,
    crimeRate: 'Low',
    schools: [
      { name: 'Colegio San Isidro', rating: 8.2, distance: 0.5 },
      { name: 'IES Lope de Vega', rating: 7.8, distance: 0.7 },
      { name: 'Colegio Santa María', rating: 8.5, distance: 1.1 },
    ],
    amenities: {
      restaurants: 35,
      shopping: 28,
      parks: 3,
      healthcare: 8,
    },
  },
  financialMetrics: {
    purchasePrice: 450000,
    estimatedMonthlyRent: 1950,
    annualRentalIncome: 23400,
    expenses: {
      propertyTax: 1800,
      insurance: 950,
      maintenance: 2700,
      managementFees: 2340,
    },
    netOperatingIncome: 15610,
    capRate: 3.47,
    cashOnCashReturn: 5.82,
    breakEvenOccupancy: 65,
    appreciationForecast: 3.9,
  },
  riskAssessment: {
    overall: 'Low',
    vacancyRisk: 'Very Low',
    maintenanceRisk: 'Low',
    regulatoryRisk: 'Medium',
    marketVolatilityRisk: 'Low',
    score: 85,
  },
};

/**
 * Analyze property data using our real scraper service
 * @param url - The property URL
 * @param platform - The platform (idealista, fotocasa, habitaclia)
 * @param useMockData - Whether to use mock data
 * @returns Property analysis data
 */
async function analyzePropertyWithScraperService(
  url: string,
  platform: string,
  useMockData: boolean = false,
  token: string
) {
  try {
    // Make the Axios request with the Authorization header
    console.log('Request data:', { url, platform, useMockData, token });
    const response = await axios.post(
      `${SCRAPER_SERVICE_URL}/api/scraper/analyze`,
      {
        url,
        platform,
        useMockData,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Pass the token here
        },
        timeout: 60000, // 60-second timeout for scraping
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Error calling scraper service:', error.message);

    // If the scraper service is unavailable, use fallback mode
    if (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.response?.status >= 500
    ) {
      console.warn('Scraper service unavailable, using fallback mode');
      return fallbackAnalysis(url, platform);
    }

    throw error;
  }
}

/**
 * Fallback analysis when scraper service is unavailable
 */
async function fallbackAnalysis(url: string, platform: string) {
  console.log('Using fallback analysis with mock data');

  // Use the mock data with some adjustments based on platform
  const mockData = {
    ...mockSpanishPropertyData,
    propertyAddress: `${
      platform.charAt(0).toUpperCase() + platform.slice(1)
    } Property, ${
      url.includes('madrid')
        ? 'Madrid'
        : url.includes('barcelona')
        ? 'Barcelona'
        : 'España'
    }`,
    financialMetrics: {
      ...mockSpanishPropertyData.financialMetrics,
      // Adjust the price based on the platform for variety
      purchasePrice:
        platform === 'idealista'
          ? 450000
          : platform === 'fotocasa'
          ? 395000
          : 420000,
    },
  };

  // Call OpenAI to analyze if available
  let aiAnalysis = {
    score: 85,
    analysis: 'This is a mock analysis using fallback data.',
  };

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a real estate investment analysis AI. Analyze the property data and provide an investment score from 0-100 based on rental yield, location quality, and risk assessment.',
          },
          {
            role: 'user',
            content: `Analyze this Spanish property as an investment:\n${JSON.stringify(
              mockData,
              null,
              2
            )}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 500,
      });

      const aiResponse = response.choices[0]?.message?.content || '';
      const scoreMatch = aiResponse.match(/score.*?(\d+)/i);

      if (scoreMatch && scoreMatch[1]) {
        aiAnalysis = {
          score: parseInt(scoreMatch[1]),
          analysis: aiResponse,
        };
      }
    } catch (error) {
      console.error('Error calling OpenAI:', error);
    }
  }

  // Add AI score to the mock data
  const enhancedPropertyData = {
    ...mockData,
    atlasScore: aiAnalysis.score,
    aiAnalysis: aiAnalysis.analysis,
  };

  return {
    success: true,
    message: 'Property analysis completed (fallback mode)',
    data: {
      url,
      scrapedAt: new Date().toISOString(),
      propertyDetails: enhancedPropertyData,
      platform,
      isFallback: true,
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, platform, useMockData } = body;

    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    if (!url && !useMockData) {
      return NextResponse.json(
        { success: false, message: 'URL is required', error: 'Missing URL' },
        { status: 400 }
      );
    }

    console.log(`Processing property analysis for ${platform} URL: ${url}`);

    // Call our scraper service to analyze the property
    const result = await analyzePropertyWithScraperService(
      url,
      platform,
      useMockData,
      token
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error processing request',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

// Keep the GET method for compatibility
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const propertyAddress = searchParams.get('address');

  // Simple response for GET requests (for testing)
  return NextResponse.json({
    success: true,
    message: 'Property analysis completed',
    data: {
      ...mockSpanishPropertyData,
      propertyAddress:
        propertyAddress || mockSpanishPropertyData.propertyAddress,
      analysisDate: new Date().toISOString(),
      atlasScore: 85,
      note: 'This is mock data. For real analysis, use POST request with a property URL.',
    },
  });
}
