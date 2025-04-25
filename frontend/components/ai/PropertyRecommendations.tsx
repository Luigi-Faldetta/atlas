'use client';

import { useState, useEffect } from 'react'; // Import useEffect
import { useRouter } from 'next/navigation';
import { PropertyRecommendation } from '@/data/mock/ai-features';
// Keep Property type import, adjust path if needed. Remove 'properties' import.
import { Property } from '@/data/mock/properties'; // Adjust path if Property type is elsewhere (e.g., '@/data/types')
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Category color mapping (remains the same)
const getCategoryColor = (category: PropertyRecommendation['category']) => {
  const colors = {
    'high-yield': 'bg-green-500',
    'stable-growth': 'bg-blue-500',
    undervalued: 'bg-purple-500',
    custom: 'bg-indigo-500',
  };
  return colors[category];
};

// Category background color mapping for cards (remains the same)
const getCategoryBgColor = (category: PropertyRecommendation['category']) => {
  const colors = {
    'high-yield': 'bg-yellow-300 bg-opacity-40',
    'stable-growth': 'bg-blue-300 bg-opacity-40',
    undervalued: 'bg-purple-300 bg-opacity-40',
    custom: 'bg-indigo-300 bg-opacity-40',
  };
  return colors[category];
};

// Helper function to extract price (add this if not already present)
const extractPrice = (priceStr: string): number => {
  if (!priceStr) return 0;
  const numericString = priceStr.replace(/\D/g, '');
  return parseInt(numericString, 10) || 0;
};

interface PropertyRecommendationsProps {
  recommendations: PropertyRecommendation[];
}

export default function PropertyRecommendations({
  recommendations,
}: PropertyRecommendationsProps) {
  const router = useRouter();
  const [allProperties, setAllProperties] = useState<Property[]>([]); // State for fetched properties
  const [isLoading, setIsLoading] = useState(true); // Loading state

  // Fetch properties from JSON on component mount
  useEffect(() => {
    setIsLoading(true);
    fetch('/scraped_funda_properties.json') // Adjust path if needed
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: Property[]) => {
        if (!Array.isArray(data)) {
          console.error('Fetched data is not an array:', data);
          throw new Error('Invalid data format received from JSON file.');
        }
        // Normalize data: ensure 'id' exists (using URL)
        const normalizedData = data.map((p) => ({
          ...p,
          id: p.URL, // Assuming URL is the unique ID used in recommendations
          // Add other normalizations if necessary
        }));
        setAllProperties(normalizedData);
      })
      .catch((error) => {
        console.error('Error loading property data:', error);
        // Handle error state appropriately
      })
      .finally(() => {
        setIsLoading(false); // Stop loading indicator
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleViewProperty = (propertyId: string) => {
    // Navigate to the property details page (adjust path if needed)
    // This assumes your property page route is dynamic like /properties/[id]
    // Or handle modal opening if that's the desired behavior
    router.push(`/properties?id=${encodeURIComponent(propertyId)}`); // Example: Navigate with query param
    // Or router.push(`/properties/${encodeURIComponent(propertyId)}`); // Example: Navigate with path param
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          AI Property Recommendations
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Loading recommendations...
        </p>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          AI Property Recommendations
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No recommendations available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        AI Property Recommendations
      </h3>
      <div className="space-y-4">
        {recommendations.map((rec) => {
          // Find the full property details from the fetched state
          const property = allProperties.find((p) => p.id === rec.propertyId);

          // Handle case where property might not be found (e.g., ID mismatch)
          if (!property) {
            console.warn(
              `Property with ID ${rec.propertyId} not found in fetched data.`
            );
            return null; // Skip rendering this recommendation
          }

          const categoryColor = getCategoryColor(rec.category);
          const categoryBgColor = getCategoryBgColor(rec.category);

          return (
            <div
              key={rec.propertyId}
              className={`p-4 rounded-lg border border-slate-300 dark:border-slate-600 ${categoryBgColor} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}
            >
              <div className="flex-grow">
                <div className="flex items-center mb-1">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${categoryColor}`}
                  ></span>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    {rec.category.replace('-', ' ')}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {property.Address} {/* Use Address from fetched property */}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {rec.reason}
                </p>
                <div className="flex items-center text-sm text-gray-800 dark:text-gray-200 gap-3">
                  <span>
                    Score:{' '}
                    <strong>{property.investment_score.toFixed(1)}</strong>
                  </span>
                  <span>
                    Yield: <strong>{property.yearly_yield.toFixed(1)}%</strong>
                  </span>
                  <span>
                    Price:{' '}
                    <strong>
                      €{extractPrice(property.Price).toLocaleString()}
                    </strong>
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewProperty(rec.propertyId)}
                className="flex-shrink-0 mt-2 sm:mt-0 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
              >
                View Property
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
