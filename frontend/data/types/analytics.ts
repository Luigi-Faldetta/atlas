// Inferred types based on usage in provided mock data and components

export interface TokenValueDataPoint {
  date: string;
  fundamentalValue: number;
  marketValue: number;
  premium: number;
  volume: number;
}

export interface PropertyValueMetrics {
  volatility: number;
  valueCorrelation: number;
  averagePremium: number;
  priceToNav: number;
  sharpeRatio: number;
  propertyAppreciation: number;
  tokenAppreciation: number;
}

export interface PropertyValueHistory {
  propertyId: string;
  propertyName: string;
  data: TokenValueDataPoint[];
  metrics: PropertyValueMetrics;
}

export interface MarketCorrelation {
  market: string;
  weekCorrelation: number;
  monthCorrelation: number;
  quarterCorrelation: number;
  yearCorrelation: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface LiquidityMetrics {
  spread: number;
  depth: number;
  averageDailyVolume: number;
  turnoverRate: number;
  orderBookDepth: OrderBook;
}

export interface NotificationAction {
  label: string;
  url: string;
}

export interface Notification {
  id: string;
  type: 'price' | 'portfolio' | 'market' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedAssetId?: string;
  importance: 'low' | 'medium' | 'high';
  action?: NotificationAction;
} 