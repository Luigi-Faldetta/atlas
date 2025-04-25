import { v4 as uuidv4 } from 'uuid';
import { 
  TokenValueDataPoint, 
  PropertyValueHistory, 
  MarketCorrelation,
  LiquidityMetrics,
  Notification
} from '@/data/types/analytics'; // Updated import path
import { properties } from './properties';

// Helper to generate a series of dates (past n days)
const generateDateSeries = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

// Generate token value data points with realistic patterns
const generateTokenValueData = (
  property: { id: string, price: number, score: number },
  dayCount: number
): TokenValueDataPoint[] => {
  const dates = generateDateSeries(dayCount);
  const basePropertyValue = property.price * 0.85; // Start at 85% of current value
  const currentPropertyValue = property.price;
  const propertyGrowthRate = (currentPropertyValue / basePropertyValue) ** (1 / dayCount) - 1;
  
  const initialTokenValue = basePropertyValue / 1000; // Assume 1000 tokens per property
  const volatilityFactor = 10 - property.score; // Lower score = higher volatility (1-10 scale)
  
  return dates.map((date, index) => {
    // Property fundamental value grows smoothly
    const fundamentalValue = (basePropertyValue * (1 + propertyGrowthRate) ** index) / 1000;
    
    // Token market value fluctuates around fundamental with varying premium
    const dayOffset = Math.sin(index / 7) * (volatilityFactor * 0.01); // Cyclical pattern
    const randomNoise = (Math.random() - 0.5) * 0.02 * volatilityFactor; // Random fluctuation
    const trendFactor = Math.random() > 0.8 ? 0.1 : 0; // Occasional trend changes
    
    // Premium/discount ranges from -5% to +15% depending on property score
    const basePremium = (property.score > 7) ? 0.05 : (property.score > 5) ? 0 : -0.05;
    const premium = basePremium + dayOffset + randomNoise + (index / dayCount) * trendFactor;
    
    // Market value = fundamental value + premium
    const marketValue = fundamentalValue * (1 + premium);
    
    // Volume correlates with premium changes
    const volumeBase = 500 + (Math.random() * 500);
    const volumeMultiplier = 1 + Math.abs(premium) * 5; // Higher premium/discount = higher volume
    const volume = Math.round(volumeBase * volumeMultiplier);
    
    return {
      date,
      fundamentalValue: parseFloat(fundamentalValue.toFixed(2)),
      marketValue: parseFloat(marketValue.toFixed(2)),
      premium: parseFloat((premium * 100).toFixed(2)), // Convert to percentage
      volume
    };
  });
};

// Calculate metrics based on token value data
const calculateMetrics = (data: TokenValueDataPoint[]) => {
  // Extract values
  const marketValues = data.map(d => d.marketValue);
  const fundamentalValues = data.map(d => d.fundamentalValue);
  const premiums = data.map(d => d.premium);
  
  // Market returns (daily)
  const marketReturns = marketValues.slice(1).map((value, i) => 
    (value - marketValues[i]) / marketValues[i]
  );
  
  // Fundamental returns (daily)
  const fundamentalReturns = fundamentalValues.slice(1).map((value, i) => 
    (value - fundamentalValues[i]) / fundamentalValues[i]
  );
  
  // Volatility (standard deviation of returns)
  const volatility = calculateStandardDeviation(marketReturns) * Math.sqrt(365) * 100;
  
  // Average premium
  const averagePremium = premiums.reduce((sum, premium) => sum + premium, 0) / premiums.length;
  
  // Correlation between fundamental and market values
  const valueCorrelation = calculateCorrelation(fundamentalValues, marketValues);
  
  // YTD appreciation
  const propertyAppreciation = ((fundamentalValues[fundamentalValues.length - 1] - fundamentalValues[0]) / fundamentalValues[0]) * 100;
  const tokenAppreciation = ((marketValues[marketValues.length - 1] - marketValues[0]) / marketValues[0]) * 100;
  
  // Sharpe ratio (assuming risk-free rate of 1%)
  const riskFreeRate = 0.01;
  const annualizedReturn = tokenAppreciation / 365 * data.length;
  const sharpeRatio = (annualizedReturn - riskFreeRate) / (volatility / 100);
  
  return {
    volatility: parseFloat(volatility.toFixed(2)),
    valueCorrelation: parseFloat(valueCorrelation.toFixed(2)),
    averagePremium: parseFloat(averagePremium.toFixed(2)),
    priceToNav: parseFloat((100 + averagePremium).toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    propertyAppreciation: parseFloat(propertyAppreciation.toFixed(2)),
    tokenAppreciation: parseFloat(tokenAppreciation.toFixed(2))
  };
};

// Standard deviation helper
const calculateStandardDeviation = (values: number[]): number => {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
};

// Correlation coefficient helper
const calculateCorrelation = (array1: number[], array2: number[]): number => {
  const n = array1.length;
  let sum1 = 0, sum2 = 0, sum1Sq = 0, sum2Sq = 0, pSum = 0;
  
  for (let i = 0; i < n; i++) {
    sum1 += array1[i];
    sum2 += array2[i];
    sum1Sq += array1[i] ** 2;
    sum2Sq += array2[i] ** 2;
    pSum += array1[i] * array2[i];
  }
  
  const num = pSum - (sum1 * sum2 / n);
  const den = Math.sqrt((sum1Sq - sum1 ** 2 / n) * (sum2Sq - sum2 ** 2 / n));
  
  return den === 0 ? 0 : num / den;
};

// Generate property value histories for all properties
export const propertyValueHistories: PropertyValueHistory[] = properties.map(property => {
  const data = generateTokenValueData(property, 90); // 90 days of data
  const metrics = calculateMetrics(data);
  
  return {
    propertyId: property.id,
    propertyName: property.name,
    data,
    metrics
  };
});

// Generate market correlations
export const marketCorrelations: Record<string, MarketCorrelation[]> = {};

properties.forEach(property => {
  marketCorrelations[property.id] = [
    {
      market: 'Real Estate',
      weekCorrelation: parseFloat((0.3 + Math.random() * 0.4).toFixed(2)),
      monthCorrelation: parseFloat((0.4 + Math.random() * 0.4).toFixed(2)),
      quarterCorrelation: parseFloat((0.5 + Math.random() * 0.3).toFixed(2)),
      yearCorrelation: parseFloat((0.6 + Math.random() * 0.3).toFixed(2))
    },
    {
      market: 'Stock Market',
      weekCorrelation: parseFloat((0.1 + Math.random() * 0.4).toFixed(2)),
      monthCorrelation: parseFloat((0.2 + Math.random() * 0.4).toFixed(2)),
      quarterCorrelation: parseFloat((0.3 + Math.random() * 0.3).toFixed(2)),
      yearCorrelation: parseFloat((0.4 + Math.random() * 0.3).toFixed(2))
    },
    {
      market: 'Crypto Market',
      weekCorrelation: parseFloat((0.2 + Math.random() * 0.6).toFixed(2)),
      monthCorrelation: parseFloat((0.3 + Math.random() * 0.5).toFixed(2)),
      quarterCorrelation: parseFloat((0.2 + Math.random() * 0.4).toFixed(2)),
      yearCorrelation: parseFloat((0.1 + Math.random() * 0.3).toFixed(2))
    },
    {
      market: 'Commodities',
      weekCorrelation: parseFloat((0 + Math.random() * 0.3).toFixed(2)),
      monthCorrelation: parseFloat((0.1 + Math.random() * 0.3).toFixed(2)),
      quarterCorrelation: parseFloat((0.2 + Math.random() * 0.3).toFixed(2)),
      yearCorrelation: parseFloat((0.3 + Math.random() * 0.3).toFixed(2))
    }
  ];
});

// Generate liquidity metrics
export const liquidityMetrics: Record<string, LiquidityMetrics> = {};

properties.forEach(property => {
  const baseTokenPrice = property.price / 1000;
  const score = property.score;
  
  // Higher score = better liquidity
  const spread = parseFloat((0.5 + (10 - score) * 0.2 + Math.random()).toFixed(2));
  const depth = parseFloat((score * 10000 + Math.random() * 50000).toFixed(0));
  const averageDailyVolume = parseFloat((score * 2000 + Math.random() * 10000).toFixed(0));
  const turnoverRate = parseFloat((0.1 + score * 0.03 + Math.random() * 0.2).toFixed(2));
  
  // Generate order book
  const bids = [];
  const asks = [];
  
  for (let i = 1; i <= 5; i++) {
    const bidPrice = parseFloat((baseTokenPrice * (1 - (i * spread / 100))).toFixed(2));
    const bidAmount = parseFloat((Math.random() * 100 + 50).toFixed(0));
    bids.push({ price: bidPrice, amount: bidAmount });
    
    const askPrice = parseFloat((baseTokenPrice * (1 + (i * spread / 100))).toFixed(2));
    const askAmount = parseFloat((Math.random() * 100 + 50).toFixed(0));
    asks.push({ price: askPrice, amount: askAmount });
  }
  
  liquidityMetrics[property.id] = {
    spread,
    depth,
    averageDailyVolume,
    turnoverRate,
    orderBookDepth: { bids, asks }
  };
});

// Generate notifications
export const notifications: Notification[] = [
  {
    id: uuidv4(),
    type: 'price',
    title: 'Price Alert: Downtown Loft',
    message: 'Downtown Loft token price increased by 5.2% in the last 24 hours',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    isRead: false,
    relatedAssetId: properties[0].id,
    importance: 'medium',
    action: {
      label: 'View Property',
      url: `/property/${properties[0].id}`
    }
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
      url: '/portfolio'
    }
  },
  {
    id: uuidv4(),
    type: 'market',
    title: 'Market Trend Alert',
    message: 'Commercial property tokens are showing higher than average premium to NAV',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    isRead: false,
    importance: 'low',
    action: {
      label: 'View Analysis',
      url: '/market-analysis'
    }
  },
  {
    id: uuidv4(),
    type: 'system',
    title: 'New Feature: Advanced Analytics',
    message: 'Explore our new advanced analytics tools to track property value vs. token price',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    isRead: false,
    importance: 'high',
  },
  {
    id: uuidv4(),
    type: 'price',
    title: 'Price Alert: Harbor View Apartment',
    message: 'Harbor View Apartment token is trading at a 7% discount to its fundamental value',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    isRead: true,
    relatedAssetId: properties[2].id,
    importance: 'medium',
    action: {
      label: 'View Property',
      url: `/property/${properties[2].id}`
    }
  }
]; 