'use client';
import React, { useState, useEffect } from 'react';
import { Property, properties } from '@/data/mock/properties';
import { propertyScoreBreakdowns, propertyTags } from '@/data/mock/ai-features';
import { propertyValueHistories, marketCorrelations, liquidityMetrics } from '@/data/mock/analytics';

import FilterBar, { Filters } from '@/components/ui/FilterBar';
import PropertyCard from '@/components/ui/PropertyCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

// Import Tab Components
import OverviewTab from '@/components/details/OverviewTab';
import AnalyticsTab from '@/components/details/AnalyticsTab';
import AITab from '@/components/details/AITab';

// Helper function to filter properties (implement actual logic)
const filterProperties = (allProperties: Property[], filters: Filters): Property[] => {
  return allProperties.filter(property => {
    // Location Filter
    if (filters.location !== 'All Locations') {
      const propertyLocation = property.location.split(', ')[1];
      if (propertyLocation !== filters.location) {
         return false;
      }
    }
    // Score Filter
    if (filters.score !== 'all') {
      const score = property.aiScore;
      if (filters.score === '9+' && score < 9) return false;
      if (filters.score === '8+' && (score < 8 || score >= 9)) return false;
      if (filters.score === '7+' && (score < 7 || score >= 8)) return false;
      if (filters.score === 'below7' && score >= 7) return false;
    }
    // Yield Filter
    if (filters.yield !== 'all') {
      const yieldVal = property.yield;
      if (filters.yield === '6+' && yieldVal < 6) return false;
      if (filters.yield === '5+' && (yieldVal < 5 || yieldVal >= 6)) return false;
      if (filters.yield === '4+' && (yieldVal < 4 || yieldVal >= 5)) return false;
      if (filters.yield === 'below4' && yieldVal >= 4) return false;
    }
    return true;
  });
};

export default function PropertiesPage() {
  const [currentFilters, setCurrentFilters] = useState<Filters>({
    location: 'All Locations',
    score: 'all',
    yield: 'all'
  });
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(properties);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ai'>('overview');

  // Apply filters when they change
  useEffect(() => {
    const result = filterProperties(properties, currentFilters);
    setFilteredProperties(result);
  }, [currentFilters]);

  const handleFilterChange = (newFilters: Filters) => {
    setCurrentFilters(newFilters);
  };

  const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setActiveTab('overview'); // Default to overview tab
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProperty(null), 300);
  };

  // Find related data for the selected property
  const selectedPropertyAI = selectedProperty ? propertyScoreBreakdowns.find(p => p.propertyId === selectedProperty.id) : null;
  const selectedPropertyTags = selectedProperty ? propertyTags.find(p => p.propertyId === selectedProperty.id) : null;
  const selectedPropertyAnalyticsHistory = selectedProperty ? propertyValueHistories.find(p => p.propertyId === selectedProperty.id) : null;
  const selectedPropertyAnalyticsCorrelations = selectedProperty ? marketCorrelations[selectedProperty.id] : null;
  const selectedPropertyAnalyticsLiquidity = selectedProperty ? liquidityMetrics[selectedProperty.id] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter Bar */}
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Property Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No properties match your current filters.</p>
          <p>Try adjusting the filters or resetting them.</p>
          {/* Consider adding a reset button here too */}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => handlePropertyClick(property)}
            />
          ))}
        </div>
      )}
      
      {/* Property Detail Modal (Using shadcn/ui Dialog) */}
      {selectedProperty && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
           {/* <DialogTrigger asChild> 
              // We trigger opening programmatically, so no trigger needed here 
           </DialogTrigger> */}
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">{selectedProperty.name}</DialogTitle>
               {/* Close button is usually part of DialogContent in shadcn */}
            </DialogHeader>
            
             {/* Tabs */}
             <div className="border-b border-gray-200 dark:border-gray-700 mt-2">
               <div className="flex flex-wrap -mb-px">
                 {/* Overview Tab Button */}
                 <button
                   className={`inline-flex items-center pb-2.5 pt-1 px-4 text-sm font-medium text-center border-b-2 ${ 
                     activeTab === 'overview' 
                       ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                       : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                   }`}
                   onClick={() => setActiveTab('overview')}
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                   Overview
                 </button>
                 {/* Analytics Tab Button */}
                 <button
                   className={`inline-flex items-center pb-2.5 pt-1 px-4 text-sm font-medium text-center border-b-2 ${ 
                     activeTab === 'analytics' 
                       ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                       : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                   }`}
                   onClick={() => setActiveTab('analytics')}
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                   Analytics
                 </button>
                 {/* AI Analysis Tab Button */}
                 <button
                   className={`inline-flex items-center pb-2.5 pt-1 px-4 text-sm font-medium text-center border-b-2 ${ 
                     activeTab === 'ai' 
                       ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                       : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                   }`}
                   onClick={() => setActiveTab('ai')}
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                   AI Analysis
                 </button>
               </div>
             </div>

            {/* Tab Content Container - Flex grow and scroll */}
            <div className="flex-grow overflow-y-auto pr-3 -mr-3 pl-1 -ml-1"> 
              {activeTab === 'overview' && (
                <OverviewTab property={selectedProperty} aiTagsData={selectedPropertyTags} />
              )}
              {activeTab === 'analytics' && (
                <AnalyticsTab 
                   propertyId={selectedProperty.id}
                   history={selectedPropertyAnalyticsHistory} 
                   correlations={selectedPropertyAnalyticsCorrelations} 
                   liquidity={selectedPropertyAnalyticsLiquidity} 
                />
              )}
              {activeTab === 'ai' && (
                <AITab 
                   scoreData={selectedPropertyAI} 
                   tagsData={selectedPropertyTags} 
                 />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
