'use client';

import React, { useState, useEffect } from 'react';
import PropertyCard from '@/components/ui/PropertyCard';
import FilterBar, { Filters } from '@/components/ui/FilterBar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
// Import Watchlist functions
import {
  isInWatchlist,
  toggleWatchlist,
  getWatchlist,
} from '@/lib/localStorage';

// Import Tab Components
import OverviewTab from '@/components/details/OverviewTab';
import AnalyticsTab from '@/components/details/AnalyticsTab';
import AITab from '@/components/details/AITab';
// Import AI/Analytics mock data if available
import { propertyScoreBreakdowns, propertyTags } from '@/data/mock/ai-features';
import * as DialogPrimitive from '@radix-ui/react-dialog'; // Import Radix primitive
import { X } from 'lucide-react'; // Import the icon

// Define the Property interface (ensure it matches your JSON structure)
export interface Property {
  URL: string;
  id: string;
  Address: string;
  Price: string;
  'Living Area': string;
  imagePath?: string;
  Bedrooms?: number;
  investment_score: number;
  estimated_rent: number;
  yearly_yield: number;
  yearly_appreciation_percentage: number;
  yearly_appreciation_value: number;
  roi_5_years: number;
  roi_10_years: number;
  strengths: string;
  weaknesses: string;
  analysis_explanation: string;
  Scraped: boolean;
  Message: string;
  scrape_error: string;
  ai_error: string;
  address: string;
  image?: string;
  yearBuilt?: number;
  // For convenience, add a normalized name field
  name?: string;
}

// Helper function to extract price from a formatted string
const extractPrice = (priceStr: string): number => {
  if (!priceStr) return 0; // Handle cases where price might be missing/invalid
  const numericString = priceStr.replace(/\D/g, '');
  return parseInt(numericString, 10) || 0; // Return 0 if parsing fails
};

// Helper function to filter properties based on the selected filters
const filterProperties = (
  allProperties: Property[],
  filters: Filters
): Property[] => {
  return allProperties.filter((property) => {
    if (filters.location !== 'All Locations') {
      if (
        !property.address.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return false;
      }
    }
    if (filters.score !== 'all') {
      const score = property.investment_score;
      if (filters.score === '9+' && score < 9) return false;
      if (filters.score === '8+' && (score < 8 || score >= 9)) return false;
      if (filters.score === '7+' && (score < 7 || score >= 8)) return false;
      if (filters.score === 'below7' && score >= 7) return false;
    }
    if (filters.yield !== 'all') {
      const yieldVal = property.yearly_yield;
      if (filters.yield === '6+' && yieldVal < 6) return false;
      if (filters.yield === '5+' && (yieldVal < 5 || yieldVal >= 6))
        return false;
      if (filters.yield === '4+' && (yieldVal < 4 || yieldVal >= 5))
        return false;
      if (filters.yield === 'below4' && yieldVal >= 4) return false;
    }
    return true;
  });
};

// Generate mock history data
interface PriceDataPoint {
  date: string;
  price: number;
  volume: number;
}

function generateHistoryData(
  basePrice: number,
  numPoints: number = 12, // 12 quarterly data points = 3 years
  annualGrowth: number = 0.03 // 3% annual growth (conservative)
): PriceDataPoint[] {
  const data: PriceDataPoint[] = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 3);
  const quarterlyGrowth = Math.pow(1 + annualGrowth, 1 / 4) - 1;
  for (let i = 0; i < numPoints; i++) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + i * 3);
    let price = basePrice * Math.pow(1 + quarterlyGrowth, i);
    const oscillation = 0.01 * Math.sin(i);
    price = price * (1 + oscillation);
    const volume = Math.round(100 + i * 3);
    data.push({
      date: date.toISOString().split('T')[0],
      price,
      volume,
    });
  }
  return data;
}

export default function PropertiesPage() {
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    location: 'All Locations',
    score: 'all',
    yield: 'all',
  });
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ai'>(
    'overview'
  );
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set()); // State to track watchlist IDs

  // Load properties and initial watchlist state
  useEffect(() => {
    fetch('/scraped_funda_properties.json')
      .then((res) => res.json())
      .then((data: Property[]) => {
        // Ensure data is an array and normalize
        if (!Array.isArray(data)) {
          console.error('Fetched data is not an array:', data);
          throw new Error('Invalid data format received from JSON file.');
        }
        const normalized = data.map((p) => ({
          ...p,
          id: p.URL, // Ensure 'id' exists, using URL
          name: p.Address,
        }));
        setAllProperties(normalized);
        setFilteredProperties(normalized); // Initially show all
      })
      .catch((error) => console.error('Error loading property data:', error));

    // Load initial watchlist IDs into state
    setWatchlistIds(new Set(getWatchlist()));
  }, []);

  // Apply filters when filters or allProperties change
  useEffect(() => {
    const result = filterProperties(allProperties, currentFilters);
    setFilteredProperties(result);
  }, [currentFilters, allProperties]);

  const handleFilterChange = (newFilters: Filters) => {
    setCurrentFilters(newFilters);
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setActiveTab('overview');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProperty(null), 300);
  };

  // Handler to toggle watchlist and update state
  const handleWatchlistToggle = (propertyId: string) => {
    toggleWatchlist(propertyId); // Update localStorage
    // Update state immediately for UI feedback
    setWatchlistIds((prevIds) => {
      const newIds = new Set(prevIds);
      if (newIds.has(propertyId)) {
        newIds.delete(propertyId);
      } else {
        newIds.add(propertyId);
      }
      return newIds;
    });
  };

  // --- Data for Modal ---
  // Keep these for potential use in factors/tags if IDs match later
  const selectedPropertyAI = selectedProperty
    ? propertyScoreBreakdowns.find((p) => p.propertyId === selectedProperty.id)
    : null;
  const selectedPropertyTags = selectedProperty
    ? propertyTags.find((p) => p.propertyId === selectedProperty.id)
    : null;

  // Mock Analytics History
  const mockAnalyticsHistory = selectedProperty
    ? {
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.Address,
        data: generateHistoryData(extractPrice(selectedProperty.Price)).map(
          (point) => ({
            date: point.date,
            volume: point.volume,
            fundamentalValue: point.price * 0.95, // Example calculation
            marketValue: point.price, // Example calculation
            premium: 0.05, // Example calculation
          })
        ),
        metrics: {
          volatility: 0.1, // Example value
          valueCorrelation: 0.85, // Example value
          averagePremium: 0.05, // Example value
          priceToNav: 1.05, // Example value (Market Price / Fundamental Value)
          sharpeRatio: 1.5, // Example value
          propertyAppreciation: 3.0, // Example value (e.g., 3.0%)
          tokenAppreciation: 3.5, // Example value (e.g., 3.5%)
        },
      }
    : null;

  // Mock Correlations
  const mockAnalyticsCorrelations = selectedProperty
    ? [
        {
          market: 'S&P 500',
          weekCorrelation: 0.1,
          monthCorrelation: 0.2,
          quarterCorrelation: 0.3,
          yearCorrelation: 0.4,
        },
        {
          market: 'Local Real Estate',
          weekCorrelation: 0.6,
          monthCorrelation: 0.7,
          quarterCorrelation: 0.8,
          yearCorrelation: 0.9,
        },
        {
          market: 'Bitcoin',
          weekCorrelation: -0.2,
          monthCorrelation: -0.1,
          quarterCorrelation: 0.0,
          yearCorrelation: 0.1,
        },
      ]
    : null;

  // Mock Liquidity
  const mockLiquidityMetrics = selectedProperty
    ? {
        spread: 0.02, // Example value (e.g., 2%)
        depth: 100000, // Example value (total value in order book)
        averageDailyVolume: 50000, // Example value
        turnoverRate: 0.1, // Example value
        orderBookDepth: {
          bids: [
            { price: extractPrice(selectedProperty.Price) * 0.99, amount: 50 }, // Example bid
            { price: extractPrice(selectedProperty.Price) * 0.98, amount: 100 },
          ],
          asks: [
            { price: extractPrice(selectedProperty.Price) * 1.01, amount: 75 }, // Example ask
            { price: extractPrice(selectedProperty.Price) * 1.02, amount: 120 },
          ],
        },
        description: 'Mock liquidity description.', // Optional description
      }
    : null;

  // Mock AI Score - Directly use selectedProperty's score
  const mockAIScoreData = selectedProperty
    ? {
        propertyId: selectedProperty.id,
        // Use the score directly from the selected property
        overallScore: selectedProperty.investment_score,
        // Use factors from matched mock data if available, otherwise empty
        factors: selectedPropertyAI?.factors || [],
        weightedAverage: selectedPropertyAI?.weightedAverage || 0,
        // Use historical scores from matched mock data if available, otherwise empty
        historicalScores: selectedPropertyAI?.historicalScores || [],
      }
    : {
        // Default empty object if no property is selected
        propertyId: '',
        overallScore: 0,
        factors: [],
        weightedAverage: 0,
        historicalScores: [],
      };

  // Mock AI Tags
  const mockAITagsData = selectedPropertyTags || {
    propertyId: '',
    tags: [],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Property Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <p>No properties match the current filters.</p>
          <p>Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id} // Use id
              property={{
                id: property.id, // Use id
                name: property.Address,
                location: property.address,
                price: extractPrice(property.Price),
                score: property.investment_score,
                yield: property.yearly_yield,
                appreciation: property.yearly_appreciation_percentage || 0,
                imagePath: property.imagePath,
                sqMeters: property['Living Area']
                  ? parseFloat(property['Living Area'])
                  : 0,
                yearBuilt: property.yearBuilt || 0,
                Bedrooms: property.Bedrooms ? Number(property.Bedrooms) : 0,
                URL: property.URL, // Keep URL if needed elsewhere
                Address: property.Address,
                Price: property.Price,
                LivingArea: property['Living Area'],
              }}
              onClick={() => handlePropertyClick(property)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedProperty && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                {selectedProperty.Address}
              </DialogTitle>
            </DialogHeader>

            {/* Modal Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mt-2">
              <div className="flex flex-wrap -mb-px">
                <button
                  className={`inline-flex items-center pb-2.5 pt-1 px-4 text-sm font-medium text-center border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`inline-flex items-center pb-2.5 pt-1 px-4 text-sm font-medium text-center border-b-2 ${
                    activeTab === 'analytics'
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('analytics')}
                >
                  Analytics
                </button>
                <button
                  className={`inline-flex items-center pb-2.5 pt-1 px-4 text-sm font-medium text-center border-b-2 ${
                    activeTab === 'ai'
                      ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('ai')}
                >
                  AI Analysis
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-grow overflow-y-auto pr-3 -mr-3 pl-1 -ml-1 py-4">
              {' '}
              {/* Added py-4 for padding */}
              {activeTab === 'overview' && (
                <OverviewTab
                  property={{
                    id: selectedProperty.id, // Use id
                    yield: selectedProperty.yearly_yield,
                    appreciation:
                      selectedProperty.yearly_appreciation_percentage,
                    description: selectedProperty.analysis_explanation,
                    price: extractPrice(selectedProperty.Price),
                  }}
                  aiTagsData={selectedPropertyTags}
                  // Pass watchlist status and toggle handler
                  isWatchlisted={watchlistIds.has(selectedProperty.id)} // Check against state
                  onWatchlistToggle={handleWatchlistToggle} // Pass the handler
                />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsTab
                  propertyId={selectedProperty.id} // Use id
                  history={mockAnalyticsHistory}
                  correlations={mockAnalyticsCorrelations}
                  liquidity={mockLiquidityMetrics}
                />
              )}
              {activeTab === 'ai' && (
                // Pass the correctly constructed mockAIScoreData
                <AITab scoreData={mockAIScoreData} tagsData={mockAITagsData} />
              )}
            </div>

            {/* Custom Close Button */}
            <DialogPrimitive.Close className="absolute right-5 top-5 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              {/* Apply text color directly to the icon */}
              <X className="h-5 w-5 text-slate-900 dark:text-slate-100" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
