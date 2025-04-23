'use client';

import React, { useState } from 'react';
import { Property } from '@/data/mock/properties';
import { PropertyTagsData } from '@/data/mock/ai-features';
import PropertyImage from '@/components/ui/PropertyImage';
import PropertyTags from '@/components/ai/PropertyTags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Assuming Input component exists
import { toggleWatchlist, isInWatchlist } from '@/lib/localStorage'; // Assuming watchlist utils exist
import { formatPrice } from '@/lib/utils'; // Import shared utility

interface OverviewTabProps {
  property: Property;
  aiTagsData: PropertyTagsData | null | undefined;
}

// Format price helper (could be moved to utils)
// const formatPrice = (price: number): string => {
//   return new Intl.NumberFormat('de-DE', { 
//     style: 'currency', 
//     currency: 'EUR', 
//     maximumFractionDigits: 0 
//   }).format(price);
// };

export default function OverviewTab({ property, aiTagsData }: OverviewTabProps) {
  const [investmentAmount, setInvestmentAmount] = useState<number>(10000);
  const [isWatchlisted, setIsWatchlisted] = useState(isInWatchlist(property.id));

   // Calculate ownership percentage and token count
  const calculateOwnership = (prop: Property, amount: number) => {
    if (!prop || prop.price <= 0) return { percentage: 0, tokens: 0 };
    const percentage = Math.min((amount / prop.price) * 100, 100); // Cap at 100%
    // Assuming 1 token = 1/1000 of property value for simplicity
    const tokens = Math.floor(amount / Math.max(1, (prop.price / 1000))); 
    return { percentage, tokens };
  };

  const ownershipDetails = calculateOwnership(property, investmentAmount);

  const handleWatchlistToggle = () => {
    const newStatus = toggleWatchlist(property.id);
    setIsWatchlisted(newStatus);
    // Add feedback like a toast notification here if desired
  };
  
  const handleInvestNow = () => {
     // Navigate to trading page or handle investment logic
     console.log(`Investing ${investmentAmount} in ${property.name}`);
     // Example: router.push(`/trading?propertyId=${property.id}&amount=${investmentAmount}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
      {/* Left Panel */}
      <div>
        {/* Property Image - Force letter background */}
        <div className="rounded-lg overflow-hidden mb-4 shadow-inner">
          <PropertyImage 
            id={property.id} 
            name={property.name} 
            height={240} // Adjust height as needed
            forceLetterBackground={true}
            className="rounded-lg"
          />
        </div>
        
        <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg font-medium">{property.location}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Size</p>
            <p className="font-semibold text-gray-900 dark:text-white">{property.sqMeters} m²</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Year Built</p>
            <p className="font-semibold text-gray-900 dark:text-white">{property.yearBuilt}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Energy Label</p>
            <p className="font-semibold text-gray-900 dark:text-white">{property.energyLabel}</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Price</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(property.price)}</p>
          </div>
        </div>
        
        <div className="flex justify-around text-center mb-4 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Yield</p>
            <p className="font-medium text-lg text-green-600 dark:text-green-400">{property.yield.toFixed(1)}%</p>
          </div>
           <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Appreciation</p>
            <p className="font-medium text-lg text-blue-600 dark:text-blue-400">{property.appreciation.toFixed(1)}%</p>
          </div>
        </div>
        
        {/* Property description */}
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Description</h4>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            {property.description}
          </p>
        </div>
        
        {/* Watchlist Button */}
        <Button 
          variant={isWatchlisted ? "secondary" : "outline"} 
          onClick={handleWatchlistToggle}
          className="w-full"
        >
          {isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
        </Button>
      </div>
      
      {/* Right Panel - Investment Calculator */}
      <div className="pt-1">
         <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Investment Calculator</h3>
        
        <div className="p-5 bg-gray-100 dark:bg-gray-700/50 rounded-lg mb-6 shadow-sm">
          <div className="mb-4">
            <label htmlFor="investment-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Investment Amount (€)
            </label>
            <Input
              id="investment-amount"
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Math.max(0, Number(e.target.value)))}
              className="w-full"
              min="0"
              step="1000"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-center mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ownership</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{ownershipDetails.percentage.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tokens</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{ownershipDetails.tokens}</p>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Annual Income</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                {formatPrice((property.price * property.yield / 100) * (ownershipDetails.percentage / 100))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expected App. (1yr)</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {formatPrice(investmentAmount * property.appreciation / 100)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Atlas AI Tags */}
        <div className="mb-6">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-2">Atlas AI Tags</h4>
          <PropertyTags tagsData={aiTagsData} interactive={true} /> 
        </div>
        
        {/* Invest Button */}
        <div className="text-center">
          <Button 
            variant="primary"
            size="lg"
            onClick={handleInvestNow}
          >
            Invest Now
          </Button>
        </div>
      </div>
    </div>
  );
} 