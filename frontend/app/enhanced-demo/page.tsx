"use client";

import React from 'react';
import InvestmentAnalysis from '../../components/InvestmentAnalysis';

// Enhanced test data with full agentic features
const enhancedTestData = {
  investmentScore: 87,
  roi5Years: 7.95,
  roi10Years: 8.2,
  yearlyYield: 5.1,
  monthlyRentalIncome: 1900,
  expectedMonthlyIncome: 1900,
  yearlyAppreciationPercentage: 3.8,
  yearlyAppreciationValue: 17100,
  strengths: [
    "Prime canal-side location in Amsterdam center",
    "Strong rental demand in the area",
    "Good public transportation access",
    "High-quality renovation with modern amenities",
    "Excellent investment fundamentals"
  ],
  weaknesses: [
    "Higher maintenance costs for canal-side property",
    "Tourist rental restrictions in city center",
    "Limited parking availability",
    "Potential noise from tourist areas"
  ],
  price: "€ 450.000 k.k.",
  address: "Prinsengracht 123, 1015 DT Amsterdam, Netherlands",
  pricePerSqm: 6000,
  
  // Enhanced property details
  bedrooms: 2,
  bathrooms: 1,
  size: 75,
  yearBuilt: 2005,
  description: "Beautiful canal-side apartment in the heart of Amsterdam. Recently renovated with high-quality materials and modern amenities. Features large windows overlooking the historic Prinsengracht canal, hardwood floors, and a modern kitchen. Perfect for both living and investment purposes.",
  features: [
    "Canal views",
    "Recently renovated", 
    "Hardwood floors",
    "Modern kitchen",
    "High ceilings",
    "Central heating",
    "Double glazing",
    "Bike storage"
  ],
  
  // Enhanced agentic features - THE KEY ADDITION
  isEnhancedAnalysis: true,
  agenticFeatures: {
    chainOfThought: true,
    selfReflection: true,
    confidenceScoring: true,
    qualityValidation: true,
  },
  
  reasoningProcess: `STEP 1: INITIAL ASSESSMENT
Analyzing property at Prinsengracht 123, Amsterdam
- Property type: Canal-side apartment
- Location: Prime Amsterdam center location
- Price point: €450,000 for 75m² indicates €6,000/m²
- Market context: Dutch residential market with strong fundamentals

STEP 2: MARKET ANALYSIS
Dutch Market Factors:
- WOZ value assessment: Likely around €420,000-€480,000 range
- Energy label requirements: Modern building likely B or C rating
- Rental point system: 75m² + location should yield 140+ points
- Transfer tax: 2% for buyers under 35, 10.4% for investors

STEP 3: FINANCIAL MODELING
Rental Income Estimation:
- Market rent: €1,800-€2,200/month based on location and size
- Annual yield: 4.8-5.2% gross yield potential
- Operating expenses: ~30% of gross income
- Net yield: 3.4-3.6% after expenses

STEP 4: SELF-CRITIQUE
Potential Issues with Analysis:
- Limited comparable data for exact location
- Market volatility not fully accounted for
- Maintenance costs for canal-side property may be higher
- Tourist rental restrictions in Amsterdam center

STEP 5: CONFIDENCE ASSESSMENT
Overall confidence: 85% based on available data quality and market knowledge`,

  selfReflection: `VALIDATION REVIEW:
✓ Numerical consistency: Price/m² calculations verified
✓ Market appropriateness: Analysis fits Dutch market context
✓ Logical coherence: Investment metrics align with market conditions
⚠ Data limitations: Some assumptions made due to limited property details
✓ Confidence calibration: 85% confidence appropriate given data quality

REFINEMENT NOTES:
- Analysis could benefit from recent comparable sales data
- Energy label verification would improve accuracy
- Local rental market analysis could be more detailed
- Consider seasonal tourism impact on rental potential`,

  confidenceScores: {
    price_analysis: 88,
    rental_yield: 82,
    market_assessment: 90,
    financial_projections: 85,
    risk_evaluation: 78,
    overall_recommendation: 85
  },

  analysisContext: {
    market_type: 'dutch',
    data_quality_score: 85,
    complexity_level: 'moderate',
    confidence_threshold: 80
  },

  validation: {
    quality_score: 91,
    validation_notes: [
      'Price analysis shows good consistency with market data',
      'Rental yield calculations verified against Dutch market standards',
      'Location premium appropriately factored into assessment',
      'Risk factors adequately identified and quantified'
    ],
    confidence_calibration: 87
  },

  metadata: {
    analysis_type: 'enhanced_agentic',
    market_specialization: 'dutch_residential',
    timestamp: new Date().toISOString(),
    agentic_patterns: ['chain_of_thought', 'self_reflection', 'confidence_scoring', 'quality_validation']
  },

  // Additional enhanced metrics
  buildingType: "Canal House Apartment",
  energyLabel: "B",
  distanceToSupermarket: 200,
  publicTransitAccess: true,
  noisePollutionIndex: 55,
  airQualityIndex: 72,
  crimeRate: 8.5,
  vacancyRate: 2.1,
  propertyTaxRate: 0.8,
  communityFees: 95,
  floodRisk: 2,
  
  // Market trends
  daysOnMarket: 28,
  priceHistorySummary: "Property previously sold for €380,000 in 2020. Listed at €425,000 in 2023.",
  neighborhoodPriceTrendSummary: "Canal-side properties +6.2% year-over-year, outperforming city average.",
  rentalDemandForecast: "High",
  
  // Demographics
  medianHouseholdIncome: 68000,
  ageDistributionSummary: "Young professionals: 45%, Families: 30%, Students: 25%",
  socialDiversityIndex: 85,
  
  // Lifestyle metrics
  culturalVenuesNearby: 12,
  footTrafficLevel: "High",
  eventsPerMonthArea: 18,
  sentimentScoreLocalReviews: 92,
  publicArtAestheticScore: 95,
  petFriendlinessScore: 78,
  localMarketsNearby: 3,
  parkingSpace: "Limited street parking, bike storage available",
  proximityToLargeCity: { name: "Amsterdam Center", distanceKm: 0, travelTimeMin: 0 },
  
  // Market activity
  shortTermRentalActivity: "High",
  assessedPropertyValue: 465000,
  listingsNearby: 15,
  estimatedUtilityCosts: 145
};

export default function EnhancedDemo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 Enhanced Agentic AI Analysis Demo
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Transparent AI reasoning with chain-of-thought and self-reflection
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
              ✅ Chain-of-Thought
            </span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              ✅ Self-Reflection
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
              ✅ Confidence Scoring
            </span>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
              ✅ Quality Validation
            </span>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Enhanced Agentic AI Demo
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  This demo showcases the enhanced agentic AI features including transparent reasoning, 
                  self-reflection, confidence scoring, and quality validation. The purple section at the top 
                  shows the AI's internal reasoning process.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Analysis Component with Enhanced Features */}
        <InvestmentAnalysis {...enhancedTestData} />
        
        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Enhanced Agentic AI Analysis • Following atlas.mdc patterns • Beer Test Phase
          </p>
        </div>
      </div>
    </div>
  );
} 