// Define interfaces for the data types
export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  totalValue: number;
  monthlyRent: number;
  annualAppreciation: number;
  riskScore: number;
  aiScore: number;
  imageUrl: string;
  status: string;
  tokenAddress: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  walletAddress: string | null;
}

export interface Investment {
  id: string;
  userId: string;
  propertyId: string;
  amount: number;
  percentage: number;
  tokenId: string;
  property: Property;
}

export interface PlatformStats {
  id: string;
  activeInvestors: number;
  totalInvested: number;
  projectedRevenue: number;
  operationalCosts: number;
  availableProperties: number;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface ProjectedReturns {
  propertyId: string;
  investmentAmount: number;
  ownershipPercentage: number;
  monthlyIncome: number;
  annualIncome: number;
  projections: {
    year: number;
    propertyValue: number;
    annualRentalIncome: number;
    cumulativeRentalIncome: number;
    totalReturn: number;
  }[];
}

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Mock data for frontend
export const mockProperties: Property[] = [
  {
    id: 'prop-001',
    title: 'Luxury Apartment Complex',
    description:
      'A modern luxury apartment complex with 50 units in a prime downtown location. High rental demand and excellent appreciation potential.',
    location: 'New York, NY',
    totalValue: 5000000,
    monthlyRent: 25000,
    annualAppreciation: 5.2,
    riskScore: 25, // Lower is less risky
    aiScore: 85, // Higher is better investment
    imageUrl:
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'Available',
    tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
  },
  {
    id: 'prop-002',
    title: 'Commercial Office Building',
    description:
      'A 10-story commercial office building in the financial district with long-term corporate tenants and stable income.',
    location: 'Chicago, IL',
    totalValue: 12000000,
    monthlyRent: 80000,
    annualAppreciation: 3.8,
    riskScore: 30,
    aiScore: 78,
    imageUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'Funding',
    tokenAddress: '0x2345678901abcdef2345678901abcdef23456789',
  },
  {
    id: 'prop-003',
    title: 'Suburban Housing Development',
    description:
      'A new housing development with 25 single-family homes in a growing suburban area with excellent schools and amenities.',
    location: 'Austin, TX',
    totalValue: 8500000,
    monthlyRent: 42500,
    annualAppreciation: 6.5,
    riskScore: 20,
    aiScore: 92,
    imageUrl:
      'https://images.unsplash.com/photo-1592595896616-c37162298647?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'Available',
    tokenAddress: '0x3456789012abcdef3456789012abcdef34567890',
  },
  {
    id: 'prop-004',
    title: 'Retail Shopping Center',
    description:
      'A well-established retail shopping center with national anchor tenants and strong foot traffic in a densely populated area.',
    location: 'Los Angeles, CA',
    totalValue: 15000000,
    monthlyRent: 95000,
    annualAppreciation: 4.2,
    riskScore: 35,
    aiScore: 75,
    imageUrl:
      'https://images.unsplash.com/photo-1519567770579-c2fc5e9ca471?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'Funded',
    tokenAddress: '0x4567890123abcdef4567890123abcdef45678901',
  },
  {
    id: 'prop-005',
    title: 'Vacation Rental Portfolio',
    description:
      'A portfolio of 15 vacation rental properties in a popular tourist destination with high seasonal demand and strong returns.',
    location: 'Miami, FL',
    totalValue: 7500000,
    monthlyRent: 60000,
    annualAppreciation: 5.8,
    riskScore: 40,
    aiScore: 82,
    imageUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    status: 'Available',
    tokenAddress: '0x5678901234abcdef5678901234abcdef56789012',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'john.doe@example.com',
    name: 'John Doe',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
  },
  {
    id: 'user-002',
    email: 'jane.smith@example.com',
    name: 'Jane Smith',
    walletAddress: '0xbcdef1234567890abcdef1234567890abcdef123',
  },
  {
    id: 'user-003',
    email: 'michael.johnson@example.com',
    name: 'Michael Johnson',
    walletAddress: '0xcdef1234567890abcdef1234567890abcdef1234',
  },
];

export const mockInvestments: Investment[] = [
  {
    id: 'inv-001',
    userId: 'user-001',
    propertyId: 'prop-001',
    amount: 250000,
    percentage: 5,
    tokenId: 'TOKEN-001',
    property: mockProperties[0],
  },
  {
    id: 'inv-002',
    userId: 'user-001',
    propertyId: 'prop-003',
    amount: 425000,
    percentage: 5,
    tokenId: 'TOKEN-002',
    property: mockProperties[2],
  },
  {
    id: 'inv-003',
    userId: 'user-002',
    propertyId: 'prop-001',
    amount: 500000,
    percentage: 10,
    tokenId: 'TOKEN-003',
    property: mockProperties[0],
  },
  {
    id: 'inv-004',
    userId: 'user-002',
    propertyId: 'prop-004',
    amount: 750000,
    percentage: 5,
    tokenId: 'TOKEN-004',
    property: mockProperties[3],
  },
  {
    id: 'inv-005',
    userId: 'user-003',
    propertyId: 'prop-002',
    amount: 1200000,
    percentage: 10,
    tokenId: 'TOKEN-005',
    property: mockProperties[1],
  },
  {
    id: 'inv-006',
    userId: 'user-003',
    propertyId: 'prop-005',
    amount: 375000,
    percentage: 5,
    tokenId: 'TOKEN-006',
    property: mockProperties[4],
  },
];

export const mockPlatformStats: PlatformStats = {
  id: 'stats-001',
  activeInvestors: 42,
  totalInvested: 3500000,
  projectedRevenue: 525000,
  operationalCosts: 175000,
  availableProperties: 3,
};

// Helper functions for frontend mock API
export const fetchProperties = (): Promise<Property[]> => {
  return Promise.resolve(mockProperties);
};

export const fetchPropertyById = (id: string): Promise<Property> => {
  const property = mockProperties.find((p) => p.id === id);
  if (!property) {
    return Promise.reject(new Error('Property not found'));
  }
  return Promise.resolve(property);
};

export const fetchUserInvestments = (userId: string): Promise<Investment[]> => {
  const investments = mockInvestments.filter((inv) => inv.userId === userId);
  return Promise.resolve(investments);
};

export const fetchPlatformStats = (): Promise<PlatformStats> => {
  return Promise.resolve(mockPlatformStats);
};

export const calculateProjectedReturns = (
  propertyId: string,
  amount: number,
  years: number = 10
): Promise<ProjectedReturns> => {
  const property = mockProperties.find((p) => p.id === propertyId);
  if (!property) {
    return Promise.reject(new Error('Property not found'));
  }

  const percentage = (amount / property.totalValue) * 100;
  const monthlyIncome = (property.monthlyRent * percentage) / 100;
  const annualIncome = monthlyIncome * 12;

  const projections = [];
  let cumulativeReturn = 0;

  for (let year = 1; year <= years; year++) {
    const appreciatedValue =
      amount * Math.pow(1 + property.annualAppreciation / 100, year);
    const yearlyRentalIncome =
      annualIncome * Math.pow(1 + property.annualAppreciation / 100, year - 1);

    cumulativeReturn += yearlyRentalIncome;

    projections.push({
      year,
      propertyValue: appreciatedValue,
      annualRentalIncome: yearlyRentalIncome,
      cumulativeRentalIncome: cumulativeReturn,
      totalReturn: (cumulativeReturn / amount) * 100,
    });
  }

  return Promise.resolve({
    propertyId,
    investmentAmount: amount,
    ownershipPercentage: percentage,
    monthlyIncome,
    annualIncome,
    projections,
  });
};

// Mock authentication functions
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const { token, user } = await response.json();
  localStorage.setItem('atlas_token', token); // Store the JWT token
  return user; // Return the user data
};

export const registerUser = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResult> => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  const { token, user } = await response.json();
  localStorage.setItem('atlas_token', token); // Store the JWT token
  return user; // Return the user data
};

export const createInvestment = (
  userId: string,
  propertyId: string,
  amount: number
): Promise<Investment> => {
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) {
    return Promise.reject(new Error('User not found'));
  }

  const property = mockProperties.find((p) => p.id === propertyId);
  if (!property) {
    return Promise.reject(new Error('Property not found'));
  }

  const percentage = (amount / property.totalValue) * 100;
  const tokenId = `TOKEN-${mockInvestments.length + 1}`;

  const newInvestment = {
    id: `inv-${mockInvestments.length + 1}`,
    userId,
    propertyId,
    amount,
    percentage,
    tokenId,
    property,
  };

  // In a real app, this would add the investment to the database
  mockInvestments.push(newInvestment);

  return Promise.resolve(newInvestment);
};
