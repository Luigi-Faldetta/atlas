export interface HistoricalDataPoint {
  date: string;
  propertyValue: number;
  tokenPrice: number;
}

export interface PropertyValueHistory {
  propertyId: string;
  data: HistoricalDataPoint[];
}

// Mock property value and token price history
export const propertyValueHistories: PropertyValueHistory[] = [
  {
    propertyId: 'prop-001',
    data: [
      { date: '2023-01-01', propertyValue: 4800000, tokenPrice: 95 },
      { date: '2023-02-01', propertyValue: 4850000, tokenPrice: 97 },
      { date: '2023-03-01', propertyValue: 4900000, tokenPrice: 99 },
      { date: '2023-04-01', propertyValue: 4950000, tokenPrice: 101 },
      { date: '2023-05-01', propertyValue: 5000000, tokenPrice: 105 }, // Example data
      { date: '2024-01-23', propertyValue: 5100000, tokenPrice: 108 },
      { date: '2024-02-04', propertyValue: 5120000, tokenPrice: 109 },
      { date: '2024-02-16', propertyValue: 5150000, tokenPrice: 112 },
      { date: '2024-02-28', propertyValue: 5180000, tokenPrice: 115 },
      { date: '2024-03-12', propertyValue: 5200000, tokenPrice: 118 },
      { date: '2024-03-24', propertyValue: 5250000, tokenPrice: 120 },
      { date: '2024-04-05', propertyValue: 5300000, tokenPrice: 125 },
      { date: '2024-04-17', propertyValue: 5350000, tokenPrice: 130 },
    ],
  },
  // Add more histories for other properties
];

export interface MarketCorrelationData {
  'Real Estate': number; // Correlation percentage
  'Stock Market': number;
  'Crypto Market': number;
  'Commodities': number;
}

// Mock market correlations for properties
export const marketCorrelations: Record<string, MarketCorrelationData> = {
  'prop-001': {
    'Real Estate': 75,
    'Stock Market': 30,
    'Crypto Market': 15,
    'Commodities': 5,
  },
  // Add more correlations for other properties
  'prop-003': { // Example for Urban Heights Residence from prototype
    'Real Estate': 80,
    'Stock Market': 25,
    'Crypto Market': -10,
    'Commodities': 10,
  },
};

export interface OrderBookEntry {
  price: number;
  amount: number;
}

export interface LiquidityMetricsData {
  spread: number; // Percentage
  marketDepth: number; // Currency value
  volume24h: number; // Currency value
  turnoverRate: number; // Decimal (e.g., 0.49x)
  orderBook: {
    asks: OrderBookEntry[]; // Price ascending
    bids: OrderBookEntry[]; // Price descending
  };
}

// Mock liquidity metrics for properties
export const liquidityMetrics: Record<string, LiquidityMetricsData> = {
  'prop-001': {
    spread: 1.27,
    marketDepth: 96502,
    volume24h: 19930,
    turnoverRate: 0.49,
    orderBook: {
      asks: [
        { price: 105.5, amount: 80 },
        { price: 106.0, amount: 100 },
        { price: 106.5, amount: 70 },
        { price: 107.0, amount: 120 },
        { price: 107.5, amount: 90 },
      ],
      bids: [
        { price: 104.5, amount: 110 },
        { price: 104.0, amount: 60 },
        { price: 103.5, amount: 130 },
        { price: 103.0, amount: 85 },
        { price: 102.5, amount: 105 },
      ],
    },
  },
   'prop-003': { // Example for Urban Heights Residence from prototype
    spread: 1.27,
    marketDepth: 96502,
    volume24h: 19930,
    turnoverRate: 0.49,
    orderBook: {
      asks: [
        { price: 320 * 1.006, amount: 80 }, { price: 320 * 1.007, amount: 100 }, { price: 320 * 1.008, amount: 70 }, { price: 320 * 1.009, amount: 120 }, { price: 320 * 1.010, amount: 90 },
      ],
      bids: [
        { price: 320 * 0.994, amount: 110 }, { price: 320 * 0.993, amount: 60 }, { price: 320 * 0.992, amount: 130 }, { price: 320 * 0.991, amount: 85 }, { price: 320 * 0.990, amount: 105 },
      ],
    },
  },
  // Add more liquidity data for other properties
}; 