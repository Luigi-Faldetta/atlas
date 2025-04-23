'use client';

import React, { useState, useEffect } from 'react';
import { Property, properties } from '@/data/mock/properties';
import PropertyCard from '@/components/ui/PropertyCard';
import { getWatchlist, toggleWatchlist } from '@/lib/localStorage'; // Assuming localStorage utils
import { Button } from '@/components/ui/button';

// Re-use modal-related state and components from PropertiesPage if needed
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OverviewTab from '@/components/details/OverviewTab';
import AnalyticsTab from '@/components/details/AnalyticsTab';
import AITab from '@/components/details/AITab';
import { propertyScoreBreakdowns, propertyTags } from '@/data/mock/ai-features';
import { propertyValueHistories, marketCorrelations, liquidityMetrics } from '@/data/mock/analytics';

export default function WatchlistPage() {
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);
  const [watchlistedProperties, setWatchlistedProperties] = useState<Property[]>([]);
  
  // State for modal (similar to PropertiesPage)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'ai'>('overview');

  useEffect(() => {
    const ids = getWatchlist();
    setWatchlistIds(ids);
    const filteredProps = properties.filter(prop => ids.includes(prop.id));
    setWatchlistedProperties(filteredProps);
  }, []);

  const handleRemoveFromWatchlist = (propertyId: string) => {
    toggleWatchlist(propertyId); // Update localStorage
    const newIds = getWatchlist(); // Get updated list
    setWatchlistIds(newIds);
    setWatchlistedProperties(properties.filter(prop => newIds.includes(prop.id)));
    // Optional: Add user feedback (toast)
  };

  // Modal handling functions (copied from PropertiesPage for consistency)
   const handlePropertyClick = (property: Property) => {
    setSelectedProperty(property);
    setActiveTab('overview'); 
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProperty(null), 300); 
  };

  // Find related data for the selected property (copied from PropertiesPage)
  const selectedPropertyAI = selectedProperty ? propertyScoreBreakdowns.find(p => p.propertyId === selectedProperty.id) : null;
  const selectedPropertyTags = selectedProperty ? propertyTags.find(p => p.propertyId === selectedProperty.id) : null;
  const selectedPropertyAnalyticsHistory = selectedProperty ? propertyValueHistories.find(p => p.propertyId === selectedProperty.id) : null;
  const selectedPropertyAnalyticsCorrelations = selectedProperty ? marketCorrelations[selectedProperty.id] : null;
  const selectedPropertyAnalyticsLiquidity = selectedProperty ? liquidityMetrics[selectedProperty.id] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Watchlist</h1>

      {watchlistedProperties.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.474.955-.993 1.868-1.57 2.734" /></svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Watchlist Empty</h3>
          <p className="mt-1 text-sm text-gray-500">You haven't added any properties yet.</p>
          <div className="mt-6">
            {/* Link or Button to go back to properties page */}
            <Button onClick={() => window.location.href='/properties'} variant="primary">
              Explore Properties
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {watchlistedProperties.map((property) => (
            <div key={property.id} className="relative group">
                <PropertyCard
                    property={property}
                    onClick={() => handlePropertyClick(property)}
                />
                {/* Add a remove button visible on hover */}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); // Prevent card click
                        handleRemoveFromWatchlist(property.id); 
                    }}
                    className="absolute top-2 right-10 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 z-10"
                    aria-label="Remove from watchlist"
                    title="Remove from watchlist"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                 </button>
            </div>
          ))}
        </div>
      )}

       {/* Property Detail Modal (Reused from PropertiesPage) */}
       {selectedProperty && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">{selectedProperty.name}</DialogTitle>
            </DialogHeader>
            <div className="border-b border-gray-200 dark:border-gray-700 mt-2">
               <div className="flex flex-wrap -mb-px">
                 {/* Tabs Buttons (copied) */}
                 <button className={`... ${activeTab === 'overview' ? '...' : '...'}`} onClick={() => setActiveTab('overview')}><svg/>Overview</button>
                 <button className={`... ${activeTab === 'analytics' ? '...' : '...'}`} onClick={() => setActiveTab('analytics')}><svg/>Analytics</button>
                 <button className={`... ${activeTab === 'ai' ? '...' : '...'}`} onClick={() => setActiveTab('ai')}><svg/>AI Analysis</button>
               </div>
             </div>
            <div className="flex-grow overflow-y-auto pr-3 -mr-3 pl-1 -ml-1">
              {activeTab === 'overview' && <OverviewTab property={selectedProperty} aiTagsData={selectedPropertyTags} />}
              {activeTab === 'analytics' && <AnalyticsTab propertyId={selectedProperty.id} history={selectedPropertyAnalyticsHistory} correlations={selectedPropertyAnalyticsCorrelations} liquidity={selectedPropertyAnalyticsLiquidity} />}
              {activeTab === 'ai' && <AITab scoreData={selectedPropertyAI} tagsData={selectedPropertyTags} />}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 