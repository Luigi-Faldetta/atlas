import { v4 as uuidv4 } from 'uuid';

// Define your Property interface based on your JSON structure
export interface Property {
  URL: string;
  id: string;
  Address: string;
  Price: string;
  'Living Area': string;
  Bedrooms?: number;
  investment_score: number;
  estimated_rent: number;
  yearly_yield: number;
  yearly_appreciation_percentage: number;
  yearly_appreciation_value: number;
  roi_5_years: number;
  roi_10_years: number;
  strengths: string;
  weaknesses: string;
  analysis_explanation: string;
  Scraped: boolean;
  Message: string;
  scrape_error: string;
  ai_error: string;
  address: string;
  image?: string;
  yearBuilt?: number;
}

// Output interface for property value history
export interface PropertyValueHistory {
  propertyId: string;
  data: {
    date: string;
    fundamentalValue: number;
    marketValue: number;
    volume: number;
  }[];
}

// Utility: Generate an array of ISO date strings for the past dayCount days
function generateDates(dayCount: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < dayCount; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (dayCount - i));
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// Generate token value data for a given property over a specified number of days
function generateTokenValueData(
  property: Property,
  dayCount: number
): {
  date: string;
  fundamentalValue: number;
  marketValue: number;
  volume: number;
}[] {
  const dates = generateDates(dayCount);
  const basePropertyValue = parseFloat(property.Price);
  const propertyGrowthRate = 0.001; // Example growth rate
  const volatilityFactor = 10 - property.investment_score; // Lower score = higher volatility

  return dates.map((date, index) => {
    // Fundamental value grows smoothly (compounded growth)
    const fundamentalValue =
      (basePropertyValue * Math.pow(1 + propertyGrowthRate, index)) / 1000;

    // Token market value fluctuates around fundamental with cyclical and random components
    const dayOffset = Math.sin(index / 7) * (volatilityFactor * 0.01);
    const randomNoise = (Math.random() - 0.5) * 0.02 * volatilityFactor;
    const trendFactor = Math.random() > 0.8 ? 0.1 : 0;
    const basePremium =
      property.investment_score > 7
        ? 0.05
        : property.investment_score > 5
          ? 0
          : -0.05;
    const premium =
      basePremium + dayOffset + randomNoise + (index / dayCount) * trendFactor;

    // Market value = fundamental value influenced by premium
    const marketValue = fundamentalValue * (1 + premium);

    // Volume loosely correlates with premium changes
    const volumeBase = 500 + Math.random() * 500;
    const volumeMultiplier = 1 + Math.abs(premium) * 5;
    const volume = Math.round(volumeBase * volumeMultiplier);

    return { date, fundamentalValue, marketValue, volume };
  });
}

// Async function to fetch properties from your JSON file in the public folder
async function fetchProperties(): Promise<Property[]> {
  const response = await fetch('/scraped_funda_properties.json');
  if (!response.ok) {
    throw new Error('Failed to load properties JSON');
  }
  return response.json();
}

// Exported async function to generate property value histories from fetched properties
export async function getPropertyValueHistories(
  dayCount: number = 90
): Promise<PropertyValueHistory[]> {
  const properties = await fetchProperties();
  return properties.map((property) => ({
    propertyId: property.id,
    data: generateTokenValueData(property, dayCount),
  }));
}

/*
  ---------------------------
  Notifications (Unchanged)
  ---------------------------
*/
export const notifications = [
  {
    id: uuidv4(),
    type: 'system',
    title: 'System Update',
    message: 'The system will undergo maintenance at midnight.',
    timestamp: new Date().toISOString(),
    isRead: false,
    importance: 'high',
    action: {
      label: 'More Info',
      url: '/support',
    },
  },
  {
    id: uuidv4(),
    type: 'portfolio',
    title: 'Portfolio Update',
    message: 'Your portfolio value increased by 2.3% this week',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    isRead: true,
    importance: 'medium',
    action: {
      label: 'View Portfolio',
      url: '/portfolio',
    },
  },
  {
    id: uuidv4(),
    type: 'market',
    title: 'Market Trend Alert',
    message:
      'Commercial property tokens are showing higher than average premium to NAV',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: false,
    importance: 'low',
    action: {
      label: 'View Analysis',
      url: '/market-analysis',
    },
  },
];
