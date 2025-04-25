'use client';

import { useState } from 'react';
import { properties } from '@/data/mock/properties'; // Updated path
import { propertyValueHistories, marketCorrelations, liquidityMetrics } from '@/data/mock/analytics'; // Updated path
import DualLayerChart from '@/components/analytics/DualLayerChart'; // Updated path
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics'; // Updated path
import LiquidityPanel from '@/components/analytics/LiquidityPanel'; // Updated path
import PropertyImage from '@/components/ui/PropertyImage'; // Updated path

export default function MarketAnalysisPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState(properties[0].id);
  const [timeframe, setTimeframe] = useState<'1w' | '1m' | '3m' | 'all'>('all');
  
  // Get selected property data
  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  
  // Get property value history for selected property
  const propertyHistory = propertyValueHistories.find(p => p.propertyId === selectedPropertyId);
  
  // Get market correlations for selected property
  const marketCorrelationData = marketCorrelations[selectedPropertyId] || [];
  
  // Get liquidity metrics for selected property
  const liquidityData = liquidityMetrics[selectedPropertyId];
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR', // Consider making currency dynamic or configurable
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  return (
    // Apply max-width, centering, and padding
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6"> 
      <h1 className="text-2xl font-bold mb-6">Market Analysis</h1>
      
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="mb-4 md:mb-0 max-w-2xl">
          <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm md:text-base break-words"> {/* Added dark mode class */}
            Compare property fundamental value with token market price for deeper insights
          </p>
          <h2 className="text-xl font-semibold">Advanced Analytics Dashboard</h2>
        </div>
        
        {/* Property selector */}
        <div className="min-w-[200px]">
          <label htmlFor="propertySelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"> {/* Added dark mode class */}
            Select Property
          </label>
          {/* TODO: Replace select with shadcn/ui Select component */}
          <select
            id="propertySelect"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500" /* Added dark mode classes */
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Selected property card */}
      {selectedProperty && (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 mb-8"> {/* Added dark mode class */}
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="h-24 w-24 rounded-md overflow-hidden">
                <PropertyImage 
                  id={selectedProperty.id} 
                  name={selectedProperty.name} 
                  height={96}
                />
              </div>
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-semibold">{selectedProperty.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">{selectedProperty.location}</p> {/* Added dark mode class */} 
              <div className="flex flex-wrap mt-2">
                <div className="mr-6 mb-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Property Value:</span> {/* Added dark mode class */} 
                  <span className="ml-1 font-medium">{formatCurrency(selectedProperty.price)}</span>
                </div>
                <div className="mr-6 mb-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Token Price:</span> {/* Added dark mode class */} 
                  {/* Note: Dividing by 1000 is a placeholder, replace with actual token price logic */}
                  <span className="ml-1 font-medium">{formatCurrency(selectedProperty.price / 1000)}</span>
                </div>
                <div className="mr-6 mb-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Annual Yield:</span> {/* Added dark mode class */} 
                  <span className="ml-1 font-medium text-green-600 dark:text-green-400">{selectedProperty.yield}%</span> {/* Added dark mode class */} 
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Timeframe selector */}
      <div className="mb-6 flex justify-end">
        <div className="flex space-x-1 text-xs font-medium">
          {[
            { value: '1w', label: '1 Week' },
            { value: '1m', label: '1 Month' },
            { value: '3m', label: '3 Months' },
            { value: 'all', label: 'All Time' },
          ].map((option) => (
            <button
              key={option.value}
              className={`px-3 py-1 rounded-full ${
                timeframe === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600' /* Added dark mode classes */
              }`}
              onClick={() => setTimeframe(option.value as any)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main analytics content */}
      {propertyHistory && (
        <div className="space-y-8">
          {/* Dual layer chart */}
          {/* TODO: Wrap in Card component for consistency */}
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg pb-4"> {/* Added dark mode class */} 
            <div className="pt-4 px-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Property Value vs. Token Price</h3> {/* Added dark mode class */} 
            </div>
            <div className="px-2 pt-1 pb-2">
              <DualLayerChart 
                data={propertyHistory.data} 
                timeframe={timeframe}
                height={325}
              />
            </div>
          </div>
          
          {/* Analytics metrics and liquidity panels */}
          {/* TODO: Wrap in Card component for consistency */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <AnalyticsMetrics 
                propertyData={propertyHistory} 
                correlations={marketCorrelationData} 
              />
            </div>
            
            <div>
              {liquidityData && (
                <LiquidityPanel 
                  liquidity={liquidityData} 
                />
              )}
            </div>
          </div>
          
          {/* Premium/Discount to NAV explanation */}
          {/* TODO: Wrap in Card component for consistency */}
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6"> {/* Added dark mode class */} 
            <h3 className="text-lg font-semibold mb-4">Understanding Property Token Premium/Discount</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">Why Tokens Trade at Different Values</h4> {/* Added dark mode class */} 
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm md:text-base"> {/* Added dark mode class */} 
                  Property tokens can trade at a premium or discount to their Net Asset Value (NAV) 
                  for several reasons:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm md:text-base"> {/* Added dark mode class */} 
                  <li>Market sentiment and investor demand</li>
                  <li>Liquidity differences between physical and tokenized real estate</li>
                  <li>Future growth expectations not reflected in current valuations</li>
                  <li>Access to fractional ownership benefits</li>
                  <li>Transaction cost differences compared to traditional real estate</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">What This Means For Investors</h4> {/* Added dark mode class */} 
                <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm md:text-base"> {/* Added dark mode class */} 
                  <span className="font-medium">Premium to NAV:</span> Tokens trading above their 
                  fundamental value may indicate strong demand, market optimism about future growth, 
                  or scarcity of similar investment opportunities.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm md:text-base"> {/* Added dark mode class */} 
                  <span className="font-medium">Discount to NAV:</span> Tokens trading below their
                  fundamental value might represent buying opportunities, but could also signal 
                  market concerns about the property or its management.
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base"> {/* Added dark mode class */} 
                  Savvy investors monitor the premium/discount to identify potential arbitrage 
                  opportunities or market inefficiencies in token pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 