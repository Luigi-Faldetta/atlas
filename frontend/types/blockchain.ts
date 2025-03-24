export interface Token {
  id: string;
  name: string;
  balance: number;
  investedAmount: number;
  monthlyEarnings: number;
  tokenId: string;
  propertyTitle: string;
  location: string;
  percentage: number;
  tokenAddress: string;
}

export interface BlockchainContextType {
  account: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  getUserTokens: (account: string) => Promise<Token[]>;
  error: string | null;
}
