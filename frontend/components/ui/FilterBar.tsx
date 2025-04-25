'use client';

import React from 'react';

// Inline definition of Filters interface
export interface Filters {
  location: string;
  score: string;
  yield: string;
}

interface Property {
  location: string;
}

interface FilterBarProps {
  properties?: Property[];
  onFilterChange: (filters: Filters) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  // Fixed list of locations – include the ones you want
  const fixedLocations = [
    'All Locations',
    'Amsterdam',
    'Rotterdam',
    'Delft',
    'Den Haag',
    'Leiden',
    'Utrecht',
    'Gouda',
    'Leeuwarden',
  ];

  return (
    <div className="flex items-center space-x-4 mb-4">
      <div>
        <label
          htmlFor="locationSelect"
          className="block text-sm font-medium text-gray-700"
        >
          Location
        </label>
        <select
          id="locationSelect"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm"
          onChange={(e) =>
            onFilterChange({
              location: e.target.value,
              score: 'all',
              yield: 'all',
            })
          }
        >
          {fixedLocations.map((loc, index) => (
            <option key={index} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterBar;
