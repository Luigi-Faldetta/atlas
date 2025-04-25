'use client';

import React from 'react'; // Removed useState as it's no longer needed here
import { Button } from '@/components/ui/button';

// Removed internal isInWatchlist stub

export interface OverviewTabProps {
  property: {
    id: string;
    yield: number;
    appreciation: number;
    description: string;
    price: number;
    // Add any other required fields here
  };
  aiTagsData?: any; // Adjust type if you have a proper type
  isWatchlisted: boolean; // Add prop for watchlist status
  onWatchlistToggle: (id: string) => void; // Add prop for toggle function
}

export default function OverviewTab({
  property,
  aiTagsData,
  isWatchlisted, // Use prop
  onWatchlistToggle, // Use prop
}: OverviewTabProps) {
  // Removed internal state and handler

  return (
    <div>
      <div className="flex justify-around text-center mb-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
        {/* ... Yield and Appreciation display ... */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Yield</p>
          <p className="font-medium text-lg text-green-600 dark:text-green-400">
            {typeof property.yield === 'number'
              ? property.yield.toFixed(1)
              : '0.0'}
            %
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Appreciation
          </p>
          <p className="font-medium text-lg text-blue-600 dark:text-blue-400">
            {typeof property.appreciation === 'number'
              ? property.appreciation.toFixed(1)
              : '0.0'}
            %
          </p>
        </div>
      </div>

      {/* Property description */}
      <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          Description
        </h4>
        <p className="text-gray-700 dark:text-gray-300 text-sm">
          {property.description}
        </p>
      </div>

      {/* Watchlist Button - Uses props now */}
      <Button
        onClick={() => onWatchlistToggle(property.id)} // Call the passed function
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
      </Button>
    </div>
  );
}
