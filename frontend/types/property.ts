export interface Property {
  id: string;
  title: string;
  totalValue: number;
  monthlyRent: number;
  riskScore?: number;
  aiScore?: number;
  annualAppreciation: number;
}
