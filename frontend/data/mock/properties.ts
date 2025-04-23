export interface Property {
  id: string;
  name: string;
  description: string;
  location: string;
  price: number;
  yield: number;
  appreciation: number;
  aiScore: number;
  tags: string[];
  sqMeters: number;
  yearBuilt: number;
  energyLabel: string;
  status: 'Available' | 'Funding' | 'Funded';
}

export const properties: Property[] = [
  {
    id: 'prop-001',
    name: 'Nordic Business Center',
    description: 'State-of-the-art business center with focus on sustainability and eco-friendly design.',
    location: 'Stockholm, Sweden',
    price: 550000,
    yield: 5.3,
    appreciation: 3.5,
    aiScore: 8.0,
    tags: ['Eco Friendly'],
    sqMeters: 1200,
    yearBuilt: 2020,
    energyLabel: 'A++',
    status: 'Available'
  },
  {
    id: 'prop-002',
    name: 'Riverside Plaza',
    description: 'Commercial property with stable long-term tenants in a prime riverside location.',
    location: 'Berlin, Germany',
    price: 450000,
    yield: 4.5,
    appreciation: 4.8,
    aiScore: 7.9,
    tags: ['Stable Growth', 'Prime Location'],
    sqMeters: 600,
    yearBuilt: 2012,
    energyLabel: 'B',
    status: 'Available'
  },
  {
    id: 'prop-003',
    name: 'Urban Heights Residence',
    description: 'Modern apartment in the heart of Amsterdam with excellent connectivity and amenities.',
    location: 'Amsterdam, Netherlands',
    price: 320000,
    yield: 5.8,
    appreciation: 3.2,
    aiScore: 8.5,
    tags: ['High Yield', 'Prime Location', '+1'],
    sqMeters: 85,
    yearBuilt: 2015,
    energyLabel: 'A',
    status: 'Available'
  },
  {
    id: 'prop-004',
    name: 'Lisbon Heights',
    description: 'Modern apartment complex in an up-and-coming district of Lisbon with exceptional yield performance.',
    location: 'Lisbon, Portugal',
    price: 480000,
    yield: 6.3,
    appreciation: 5.7,
    aiScore: 8.9,
    tags: ['High Yield', 'Stable Growth', '+1'],
    sqMeters: 150,
    yearBuilt: 2019,
    energyLabel: 'A',
    status: 'Available'
  },
  {
    id: 'prop-005',
    name: 'Mediterranean Villa',
    description: 'Luxury beachfront villa with high rental yield potential, perfect for vacation rentals.',
    location: 'Barcelona, Spain',
    price: 780000,
    yield: 6.7,
    appreciation: 5.1,
    aiScore: 9.2,
    tags: ['High Yield', 'Stable Growth', '+2'],
    sqMeters: 280,
    yearBuilt: 2014,
    energyLabel: 'B+',
    status: 'Available'
  },
  {
    id: 'prop-006',
    name: 'Parisian Elegance',
    description: 'Historic apartment in central Paris with strong historical appreciation. Prestigious asset.',
    location: 'Paris, France',
    price: 890000,
    yield: 4.1,
    appreciation: 5.2,
    aiScore: 8.8,
    tags: ['Stable Growth', 'Prime Location', '+2'],
    sqMeters: 105,
    yearBuilt: 1912,
    energyLabel: 'C',
    status: 'Available'
  },
  {
    id: 'prop-007',
    name: 'Central District Lofts',
    description: 'Modern loft development in Vienna with exceptionally high yield. Excellent occupancy rates.',
    location: 'Vienna, Austria',
    price: 380000,
    yield: 5.9,
    appreciation: 3.8,
    aiScore: 7.5,
    tags: ['High Yield'],
    sqMeters: 95,
    yearBuilt: 2017,
    energyLabel: 'A',
    status: 'Available'
  },
  {
    id: 'prop-008',
    name: 'Alpine Retreat',
    description: 'Luxury mountain resort property with strong historical appreciation and stability metrics.',
    location: 'Zurich, Switzerland',
    price: 1200000,
    yield: 4.2,
    appreciation: 6.5,
    aiScore: 9.5,
    tags: ['Stable Growth', 'Eco Friendly', '+2'],
    sqMeters: 320,
    yearBuilt: 2016,
    energyLabel: 'A+',
    status: 'Available'
  },
  {
    id: 'prop-009',
    name: 'Harbor View Towers',
    description: 'Modern residential tower complex offering stunning harbor views and high rental demand.',
    location: 'Copenhagen, Denmark',
    price: 520000,
    yield: 5.4,
    appreciation: 4.3,
    aiScore: 8.3,
    tags: ['Eco Friendly'],
    sqMeters: 90,
    yearBuilt: 2019,
    energyLabel: 'A',
    status: 'Available'
  },
  {
    id: 'prop-010',
    name: 'Green Valley Estate',
    description: 'Sprawling estate focused on sustainable living and green initiatives.',
    location: 'Dublin, Ireland',
    price: 620000,
    yield: 4.9,
    appreciation: 4.6,
    aiScore: 7.8,
    tags: ['Stable Growth', 'Eco Friendly', '+1'],
    sqMeters: 180,
    yearBuilt: 2018,
    energyLabel: 'A+',
    status: 'Available'
  },
]; 