'use client';

import React, { useState, useEffect } from 'react';
import { properties } from '@/data/mock/properties'; // Assuming locations can be derived
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export interface Filters {
  location: string;
  score: string; // e.g., 'all', '8+', '7-8'
  yield: string; // e.g., 'all', '6%+', '4-6%'
}

interface FilterBarProps {
  onFilterChange: (filters: Filters) => void;
}

// Helper to get unique locations from properties
const getUniqueLocations = (props: typeof properties): string[] => {
  const locations = props.map(p => p.location.split(', ')[1]).filter(Boolean); // Get country/state, filter out undefined
  return ['All Locations', ...Array.from(new Set(locations)).sort()];
};

const scoreOptions = [
  { value: 'all', label: 'All Scores' },
  { value: '9+', label: '9.0+' },
  { value: '8+', label: '8.0 - 8.9' },
  { value: '7+', label: '7.0 - 7.9' },
  { value: 'below7', label: 'Below 7.0' },
];

const yieldOptions = [
  { value: 'all', label: 'All Yields' },
  { value: '6+', label: '6.0%+' },
  { value: '5+', label: '5.0% - 5.9%' },
  { value: '4+', label: '4.0% - 4.9%' },
  { value: 'below4', label: 'Below 4.0%' },
];

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    location: 'All Locations',
    score: 'all',
    yield: 'all'
  });

  useEffect(() => {
    setLocations(getUniqueLocations(properties));
  }, []);

  const handleFilterUpdate = (filterName: keyof Filters, value: string) => {
    const newFilters = { ...currentFilters, [filterName]: value };
    setCurrentFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: Filters = {
      location: 'All Locations',
      score: 'all',
      yield: 'all'
    };
    setCurrentFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 019 17v-5.586L4.293 6.707A1 1 0 014 6V3z" clipRule="evenodd" />
        </svg>
        Filters
      </div>
      
      <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
        {/* Location Select */}
        <div className="w-full md:w-48">
          <Select onValueChange={(value) => handleFilterUpdate('location', value)} value={currentFilters.location}>
            <SelectTrigger id="location-filter">
              <SelectValue placeholder="Select Location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map(loc => (
                <SelectItem key={loc} value={loc}>{loc}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Score Select */}
        <div className="w-full md:w-40">
          <Select onValueChange={(value) => handleFilterUpdate('score', value)} value={currentFilters.score}>
            <SelectTrigger id="score-filter">
              <SelectValue placeholder="Select Score" />
            </SelectTrigger>
            <SelectContent>
              {scoreOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Yield Select */}
        <div className="w-full md:w-40">
          <Select onValueChange={(value) => handleFilterUpdate('yield', value)} value={currentFilters.yield}>
            <SelectTrigger id="yield-filter">
              <SelectValue placeholder="Select Yield" />
            </SelectTrigger>
            <SelectContent>
              {yieldOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Reset Button */}
        <Button variant="outline" onClick={handleReset} className="w-full md:w-auto">
          Reset
        </Button>
      </div>
    </div>
  );
} 