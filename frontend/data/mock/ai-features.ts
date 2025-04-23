// AI score breakdown data based on prototype (Image 7)
export interface ScoreBreakdownItem {
  propertyId: string;
  overallScore: number;
  scoreChange?: string; // e.g., "(no change)" or "(+0.2)"
  factors: {
    name: 'Risk' | 'Yield' | 'Growth' | 'Location' | 'Condition';
    score: number; // Score out of 10 for the progress bar
  }[];
  weightedAverage: number;
  historicalScores: {
    date: string; // e.g., "Nov 23"
    score: number;
  }[];
}

// Property tags data based on prototype (Images 4 & 7)
export interface PropertyTag {
  label: string;       // e.g., "Stable Growth", "Eco Friendly", "+1"
  category: 'feature' | 'location' | 'yield' | 'growth' | 'other'; // Helps determine icon/color potentially
  explanation?: string; // Optional explanation for modal view
}

export interface PropertyTagsData {
  propertyId: string;
  tags: PropertyTag[];
}


// --- MOCK DATA ---

export const propertyScoreBreakdowns: ScoreBreakdownItem[] = [
  {
    propertyId: 'prop-001', // Nordic Business Center
    overallScore: 8.0,
    scoreChange: '(+0.1)',
    factors: [
      { name: 'Risk', score: 7.5 },
      { name: 'Yield', score: 8.2 },
      { name: 'Growth', score: 7.8 },
      { name: 'Location', score: 8.5 },
      { name: 'Condition', score: 9.0 },
    ],
    weightedAverage: 8.1, // Example calculation
    historicalScores: [
      { date: 'Nov 23', score: 7.8 }, { date: 'Dec 23', score: 7.9 }, { date: 'Jan 24', score: 7.9 },
      { date: 'Feb 24', score: 8.0 }, { date: 'Mar 24', score: 8.0 }, { date: 'Apr 24', score: 8.0 }
    ]
  },
  {
    propertyId: 'prop-002', // Riverside Plaza
    overallScore: 7.9,
    scoreChange: '(no change)',
    factors: [
      { name: 'Risk', score: 5.9 },
      { name: 'Yield', score: 4.9 },
      { name: 'Growth', score: 5.7 },
      { name: 'Location', score: 6.3 },
      { name: 'Condition', score: 8.2 },
    ],
    weightedAverage: 6.2, // Example calculation
    historicalScores: [
      { date: 'Nov 23', score: 8.0 }, { date: 'Dec 23', score: 7.9 }, { date: 'Jan 24', score: 7.8 },
      { date: 'Feb 24', score: 7.8 }, { date: 'Mar 24', score: 7.9 }, { date: 'Apr 24', score: 7.9 }
    ]
  },
  {
    propertyId: 'prop-003', // Urban Heights Residence
    overallScore: 8.5,
    scoreChange: '(+0.3)',
    factors: [
      { name: 'Risk', score: 7.0 },
      { name: 'Yield', score: 9.0 },
      { name: 'Growth', score: 8.0 },
      { name: 'Location', score: 8.8 },
      { name: 'Condition', score: 8.5 },
    ],
    weightedAverage: 8.3, // Example calculation
    historicalScores: [
      { date: 'Nov 23', score: 8.0 }, { date: 'Dec 23', score: 8.1 }, { date: 'Jan 24', score: 8.2 },
      { date: 'Feb 24', score: 8.3 }, { date: 'Mar 24', score: 8.4 }, { date: 'Apr 24', score: 8.5 }
    ]
  },
  // Add more score breakdowns for other properties...
];

export const propertyTags: PropertyTagsData[] = [
  {
    propertyId: 'prop-001', // Nordic Business Center
    tags: [
      { label: 'Eco Friendly', category: 'feature', explanation: 'Built with sustainable materials and energy-efficient systems.' },
    ]
  },
  {
    propertyId: 'prop-002', // Riverside Plaza
    tags: [
      { label: 'Stable Growth', category: 'growth', explanation: 'Consistent appreciation due to long-term leases and location.' },
      { label: 'Prime Location', category: 'location', explanation: 'Located in a desirable area with high foot traffic.' },
    ]
  },
  {
    propertyId: 'prop-003', // Urban Heights Residence
    tags: [
      { label: 'High Yield', category: 'yield', explanation: 'Generates above-average rental income for the area.' },
      { label: 'Prime Location', category: 'location', explanation: 'Situated in a central, high-demand neighborhood.' },
      { label: '+1', category: 'other', explanation: 'One additional key feature identified by AI.' },
    ]
  },
   {
    propertyId: 'prop-005', // Mediterranean Villa
    tags: [
      { label: 'High Yield', category: 'yield' },
      { label: 'Stable Growth', category: 'growth' },
      { label: '+2', category: 'other' },
    ]
  },
  {
    propertyId: 'prop-008', // Alpine Retreat
    tags: [
      { label: 'Stable Growth', category: 'growth' },
      { label: 'Eco Friendly', category: 'feature' },
      { label: '+2', category: 'other' },
    ]
  },
  {
    propertyId: 'prop-007', // Central District Lofts
    tags: [
      { label: 'High Yield', category: 'yield' },
    ]
  },
  {
    propertyId: 'prop-006', // Parisian Elegance
    tags: [
      { label: 'Stable Growth', category: 'growth' },
      { label: 'Prime Location', category: 'location' },
      { label: '+2', category: 'other' },
    ]
  },
  {
    propertyId: 'prop-009', // Harbor View Towers
    tags: [
      { label: 'Eco Friendly', category: 'feature' },
    ]
  },
  {
    propertyId: 'prop-010', // Green Valley Estate
    tags: [
      { label: 'Stable Growth', category: 'growth' },
      { label: 'Eco Friendly', category: 'feature' },
      { label: '+1', category: 'other' },
    ]
  },
  {
    propertyId: 'prop-004', // Lisbon Heights
    tags: [
      { label: 'High Yield', category: 'yield' },
      { label: 'Stable Growth', category: 'growth' },
      { label: '+1', category: 'other' },
    ]
  },
  // Add more property tags for other properties...
]; 