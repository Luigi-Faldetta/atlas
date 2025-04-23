export interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  yield: number;
  appreciation: number;
  score: number;
  sqMeters: number;
  yearBuilt: number;
  energyLabel: string;
  status: 'Available' | 'Funding' | 'Funded';
}

export const properties: Property[] = [
  {
    id: 'prop-001',
    name: 'Luxury Apartment Complex',
    description: 'A modern luxury apartment complex with 50 units in a prime downtown location. High rental demand and excellent appreciation potential.',
    location: 'New York, NY',
    price: 5000000,
    yield: 5.2,
    appreciation: 4.8,
    score: 85,
    sqMeters: 4500,
    yearBuilt: 2018,
    energyLabel: 'A',
    status: 'Available'
  },
  {
    id: 'prop-002',
    name: 'Commercial Office Building',
    description: 'A 10-story commercial office building in the financial district with long-term corporate tenants and stable income.',
    location: 'Chicago, IL',
    price: 12000000,
    yield: 3.8,
    appreciation: 3.2,
    score: 78,
    sqMeters: 9200,
    yearBuilt: 2010,
    energyLabel: 'B',
    status: 'Funding'
  },
  {
    id: 'prop-003',
    name: 'Alpine Retreat',
    description: 'Luxury mountain resort property with strong historical appreciation of 6.5% and excellent stability metrics. Ideal for investors seeking long-term capital growth.',
    location: 'Zurich, Switzerland',
    price: 1200000,
    yield: 4.2,
    appreciation: 6.5,
    score: 88,
    sqMeters: 320,
    yearBuilt: 2016,
    energyLabel: 'A+',
    status: 'Available'
  },
  {
    id: 'prop-004',
    name: 'Lisbon Heights',
    description: 'Modern apartment complex in an up-and-coming district of Lisbon with exceptional yield performance 1.8% above market average. Strong historical appreciation of 5.7%.',
    location: 'Lisbon, Portugal',
    price: 480000,
    yield: 6.3,
    appreciation: 5.7,
    score: 81,
    sqMeters: 150,
    yearBuilt: 2019,
    energyLabel: 'A',
    status: 'Available'
  },
  {
    id: 'prop-005',
    name: 'Mediterranean Villa',
    description: 'Luxury beachfront villa with exceptionally high yield performance of 6.7%, currently 2.2% above the regional market average. Excellent vacation rental potential.',
    location: 'Barcelona, Spain',
    price: 780000,
    yield: 6.7,
    appreciation: 4.9,
    score: 86,
    sqMeters: 280,
    yearBuilt: 2014,
    energyLabel: 'B+',
    status: 'Available'
  },
  {
    id: 'prop-006',
    name: 'Parisian Elegance',
    description: 'Historic apartment in central Paris with strong historical appreciation of 5.2% and excellent long-term stability. Perfect for investors seeking prestigious assets.',
    location: 'Paris, France',
    price: 890000,
    yield: 4.1,
    appreciation: 5.2,
    score: 83,
    sqMeters: 105,
    yearBuilt: 1912, 
    energyLabel: 'C',
    status: 'Funding'
  },
  {
    id: 'prop-007',
    name: 'Central District Lofts',
    description: 'Modern loft development in Vienna with exceptionally high yield of 5.9%, currently 1.4% above market average. Excellent occupancy rates and rental demand.',
    location: 'Vienna, Austria',
    price: 380000,
    yield: 5.9,
    appreciation: 4.2,
    score: 76,
    sqMeters: 95,
    yearBuilt: 2017, 
    energyLabel: 'A',
    status: 'Available'
  }
]; 