export interface Property {
  id: string; // or URL if that's your unique identifier
  URL: string;
  Address: string;
  Price: string;
  'Living Area': string;
  Bedrooms?: number; // if your raw JSON has it as a string
  investment_score: number;
  estimated_rent: number;
  yearly_yield: number;
  yearly_appreciation_percentage: number;
  yearly_appreciation_value: number;
  roi_5_years: number;
  roi_10_years: number;
  strengths: string;
  name?: string;
  location?: string;
  score?: number;

  price?: number; // new field (optional)
  yield?: number; // new field (optional)
  appreciation?: number; // new field (optional)
  sqMeters?: number; // new field (optional)
  energyLabel?: string; // new field (optional)
  weaknesses: string;
  analysis_explanation: string;
  Scraped: boolean;
  Message: string;
  scrape_error: string;
  ai_error: string;
  address: string;
  image?: string; // new field (optional)
  yearBuilt?: number; // new field (optional)
  // For consistency, you can also add parsed fields (e.g., price as a number, etc.)
}

// // Reduced number of properties for better performance
// export const properties: Property[] = [
//   {
//     id: 'prop1',
//     name: 'Urban Heights Residence',
//     location: 'Amsterdam, Netherlands',
//     score: 8.5,
//     price: 320000,
//     yield: 5.8,
//     appreciation: 3.2,
//     image: '/images/property1.jpg',
//     sqMeters: 85,
//     yearBuilt: 2015,
//     energyLabel: 'A',
//     description:
//       'Modern apartment in the heart of Amsterdam with excellent connectivity and amenities.',
//   },
//   {
//     id: 'prop2',
//     name: 'Riverside Plaza',
//     location: 'Berlin, Germany',
//     score: 7.9,
//     price: 450000,
//     yield: 4.5,
//     appreciation: 4.8,
//     image: '/images/property2.jpg',
//     sqMeters: 120,
//     yearBuilt: 2010,
//     energyLabel: 'B',
//     description:
//       'Spacious office space overlooking the river with high-end finishes and parking facilities.',
//   },
//   {
//     id: 'prop3',
//     name: 'Mediterranean Villa',
//     location: 'Barcelona, Spain',
//     score: 9.2,
//     price: 780000,
//     yield: 6.7,
//     appreciation: 5.1,
//     image: '/images/property3.jpg',
//     sqMeters: 210,
//     yearBuilt: 2018,
//     energyLabel: 'A+',
//     description:
//       'Luxurious villa with a pool and garden, located close to the Mediterranean coast.',
//   },
//   {
//     id: 'prop4',
//     name: 'Nordic Business Center',
//     location: 'Stockholm, Sweden',
//     score: 8.0,
//     price: 550000,
//     yield: 5.3,
//     appreciation: 3.5,
//     image: '/images/property4.jpg',
//     sqMeters: 150,
//     yearBuilt: 2012,
//     energyLabel: 'A',
//     description:
//       'Modern office building with sustainable design and excellent location near tech hub.',
//   },
//   {
//     id: 'prop5',
//     name: 'Alpine Retreat',
//     location: 'Zurich, Switzerland',
//     score: 9.5,
//     price: 1200000,
//     yield: 4.2,
//     appreciation: 6.5,
//     image: '/images/property5.jpg',
//     sqMeters: 180,
//     yearBuilt: 2019,
//     energyLabel: 'A+',
//     description:
//       'Premium residence with panoramic mountain views and high-end smart home features.',
//   },
//   {
//     id: 'prop6',
//     name: 'Central District Lofts',
//     location: 'Vienna, Austria',
//     score: 7.5,
//     price: 380000,
//     yield: 5.9,
//     appreciation: 3.8,
//     image: '/images/property6.jpg',
//     sqMeters: 95,
//     yearBuilt: 2008,
//     energyLabel: 'B',
//     description:
//       'Converted historic lofts with exposed brick and modern amenities in central district.',
//   },
//   {
//     id: 'prop7',
//     name: 'Parisian Elegance',
//     location: 'Paris, France',
//     score: 8.8,
//     price: 890000,
//     yield: 4.1,
//     appreciation: 5.2,
//     image: '/images/property7.jpg',
//     sqMeters: 115,
//     yearBuilt: 1935,
//     energyLabel: 'C',
//     description:
//       'Charming Haussmann-style apartment with high ceilings and original moldings.',
//   },
//   {
//     id: 'prop8',
//     name: 'Harbor View Towers',
//     location: 'Copenhagen, Denmark',
//     score: 8.3,
//     price: 520000,
//     yield: 5.4,
//     appreciation: 4.3,
//     image: '/images/property8.jpg',
//     sqMeters: 110,
//     yearBuilt: 2016,
//     energyLabel: 'A',
//     description:
//       'Waterfront apartment with harbor views and access to community amenities.',
//   },
//   {
//     id: 'prop9',
//     name: 'Green Valley Estate',
//     location: 'Dublin, Ireland',
//     score: 7.8,
//     price: 620000,
//     yield: 4.9,
//     appreciation: 4.6,
//     image: '/images/property9.jpg',
//     sqMeters: 185,
//     yearBuilt: 2014,
//     energyLabel: 'A',
//     description:
//       'Family home with garden in a quiet suburb with excellent schools and transport links.',
//   },
//   {
//     id: 'prop10',
//     name: 'Lisbon Heights',
//     location: 'Lisbon, Portugal',
//     score: 8.9,
//     price: 480000,
//     yield: 6.3,
//     appreciation: 5.7,
//     image: '/images/property10.jpg',
//     sqMeters: 105,
//     yearBuilt: 2017,
//     energyLabel: 'A',
//     description:
//       'Bright apartment with historic tile work and views of the Tagus river.',
//   },
//   // Removed properties 11-20+ for better performance
// ];
