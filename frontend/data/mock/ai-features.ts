export interface PropertyRecommendation {
  propertyId: string;
  category: 'high-yield' | 'stable-growth' | 'undervalued' | 'custom';
  score: number; // Match score from 0-10
  reason: string;
}

// Mock property recommendations for Atlas AI
export const propertyRecommendations: PropertyRecommendation[] = [
  {
    propertyId: 'prop-001',
    category: 'high-yield',
    score: 8.7,
    reason: 'This property has consistently shown above-market rental yields and is situated in a high-demand area with limited new supply.'
  },
  {
    propertyId: 'prop-003',
    category: 'undervalued',
    score: 9.2,
    reason: 'Based on comparable properties in the area, this property is currently trading at 12% below market value with strong appreciation potential.'
  },
  {
    propertyId: 'prop-005',
    category: 'high-yield',
    score: 8.4,
    reason: 'High seasonal demand in this tourist location creates exceptional yield opportunities, with peak season rates 3x higher than off-season.'
  },
  {
    propertyId: 'prop-002',
    category: 'stable-growth',
    score: 7.8,
    reason: 'Long-term corporate leases provide predictable cash flow, and the location is seeing consistent year-over-year appreciation.'
  },
  {
    propertyId: 'prop-004',
    category: 'stable-growth',
    score: 7.6,
    reason: 'Anchor tenants with 10+ year leases and annual rent escalation clauses ensure reliable income growth over time.'
  }
];

// AI score breakdown data
export interface ScoreBreakdownItem {
  propertyId: string;
  overallScore: number;
  factors: {
    name: string;
    score: number;
    weight: number;
    description: string;
  }[];
  historicalScores: {
    date: string;
    score: number;
  }[];
}

export const propertyScoreBreakdowns: ScoreBreakdownItem[] = [
  {
    propertyId: 'prop-001',
    overallScore: 8.5,
    factors: [
      {
        name: 'Location',
        score: 9.2,
        weight: 0.25,
        description: 'Prime downtown location with excellent accessibility and amenities.'
      },
      {
        name: 'Yield Potential',
        score: 8.7,
        weight: 0.3,
        description: 'Strong rental demand supports above-market yields.'
      },
      {
        name: 'Growth Forecast',
        score: 8.1,
        weight: 0.2,
        description: 'Property value expected to appreciate faster than market average.'
      },
      {
        name: 'Risk Assessment',
        score: 7.8,
        weight: 0.15,
        description: 'Diversified tenant base reduces vacancy risk.'
      },
      {
        name: 'Liquidity',
        score: 8.3,
        weight: 0.1,
        description: 'High market demand for similar properties in the area.'
      }
    ],
    historicalScores: [
      { date: '2023-01-01', score: 7.8 },
      { date: '2023-02-01', score: 8.0 },
      { date: '2023-03-01', score: 8.2 },
      { date: '2023-04-01', score: 8.3 },
      { date: '2023-05-01', score: 8.5 }
    ]
  },
  // Add more score breakdowns for other properties
];

// Property tags with AI analysis
export interface PropertyTagsData {
  propertyId: string;
  tags: {
    category: 'strength' | 'opportunity' | 'risk';
    text: string;
    explanation: string;
  }[];
}

export const propertyTags: PropertyTagsData[] = [
  {
    propertyId: 'prop-001',
    tags: [
      {
        category: 'strength',
        text: 'Prime Location',
        explanation: 'Located in a high-growth urban neighborhood with excellent walkability score.'
      },
      {
        category: 'strength',
        text: 'High Demand',
        explanation: 'Vacancy rates in this area are consistently below 2%.'
      },
      {
        category: 'opportunity',
        text: 'Renovation Potential',
        explanation: 'Minor updates could increase rental rates by 15-20%.'
      },
      {
        category: 'risk',
        text: 'New Development',
        explanation: 'Planned constructions nearby could temporarily impact property values.'
      }
    ]
  },
  // Add more property tags for other properties
]; 