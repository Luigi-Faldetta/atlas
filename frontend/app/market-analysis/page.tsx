'use client';

import { useState, useEffect } from 'react';
import DualLayerChart from '@/components/analytics/DualLayerChart';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import LiquidityPanel from '@/components/analytics/LiquidityPanel';
import PropertyImage from '@/components/ui/PropertyImage';
// Import the async analytics function to generate histories
import { getPropertyValueHistories } from '@/data/mock/analytics';

// Define the Property interface (ensure it matches your JSON structure)
export interface Property {
  URL: string;
  id: string;
  Address: string;
  Price: string;
  'Living Area': string;
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
  // Normalized field
  name?: string;
}

export default function MarketAnalysisPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [propertyHistories, setPropertyHistories] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'1w' | '1m' | '3m' | 'all'>('all');

  // Fetch properties from your JSON file on mount
  useEffect(() => {
    fetch('/scraped_funda_properties.json')
      .then((res) => res.json())
      .then((data: Property[]) => {
        // Normalize by setting "name" as Address if needed
        const normalized = data.map((p) => ({ ...p, name: p.Address }));
        setProperties(normalized);
        if (normalized.length > 0) {
          setSelectedPropertyId(normalized[0].id || normalized[0].URL);
        }
      })
      .catch((error) => console.error('Error loading properties:', error));
  }, []);

  // Load analytics histories via the async function
  useEffect(() => {
    async function loadHistories() {
      try {
        const histories = await getPropertyValueHistories(90);
        setPropertyHistories(histories);
      } catch (error) {
        console.error('Error loading property histories:', error);
      }
    }
    loadHistories();
  }, []);

  const selectedProperty = properties.find(
    (p) => p.id === selectedPropertyId || p.URL === selectedPropertyId
  );
  const propertyHistory = propertyHistories.find(
    (h) => h.propertyId === selectedPropertyId
  );
  // Default values for correlations and liquidity
  const marketCorrelationData: any[] = [];
  const liquidityData: any = null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Market Analysis</h1>

      {/* Property Selector */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="mb-4 md:mb-0 max-w-2xl">
          <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm md:text-base break-words">
            Compare property fundamental value with token market price for
            deeper insights
          </p>
          <h2 className="text-xl font-semibold">
            Advanced Analytics Dashboard
          </h2>
        </div>
        <div className="min-w-[200px]">
          <label
            htmlFor="propertySelect"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Select Property
          </label>
          <select
            id="propertySelect"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {properties.map((property) => (
              <option
                key={property.id || property.URL}
                value={property.id || property.URL}
              >
                {property.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Property Card */}
      {selectedProperty && (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-4 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="h-24 w-24 rounded-md overflow-hidden">
                <PropertyImage
                  id={selectedProperty.id || selectedProperty.URL}
                  name={selectedProperty.name!}
                  height={96}
                />
              </div>
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-semibold">{selectedProperty.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedProperty.address}
              </p>
              <div className="flex flex-wrap mt-2">
                <div className="mr-6 mb-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Property Value:
                  </span>
                  <span className="ml-1 font-medium">
                    {formatCurrency(parseFloat(selectedProperty.Price))}
                  </span>
                </div>
                <div className="mr-6 mb-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Token Price:
                  </span>
                  <span className="ml-1 font-medium">
                    {formatCurrency(parseFloat(selectedProperty.Price) / 1000)}
                  </span>
                </div>
                <div className="mr-6 mb-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Annual Yield:
                  </span>
                  <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                    {selectedProperty.yearly_yield}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeframe Selector */}
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
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setTimeframe(option.value as any)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Analytics Content */}
      {propertyHistory && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg pb-4">
            <div className="pt-4 px-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Property Value vs. Token Price
              </h3>
            </div>
            <div className="px-2 pt-1 pb-2">
              <DualLayerChart
                data={propertyHistory.data}
                timeframe={timeframe}
                height={325}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <AnalyticsMetrics propertyData={propertyHistory} />
            </div>
            <div>
              {liquidityData && <LiquidityPanel liquidity={liquidityData} />}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              Understanding Property Token Premium/Discount
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                  Why Tokens Trade at Different Values
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm md:text-base">
                  Property tokens can trade at a premium or discount to their
                  Net Asset Value (NAV) for several reasons:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                  <li>Market sentiment and investor demand</li>
                  <li>
                    Liquidity differences between physical and tokenized real
                    estate
                  </li>
                  <li>
                    Future growth expectations not reflected in current
                    valuations
                  </li>
                  <li>Access to fractional ownership benefits</li>
                  <li>
                    Transaction cost differences compared to traditional real
                    estate
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                  What This Means For Investors
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm md:text-base">
                  <span className="font-medium">Premium to NAV:</span> Tokens
                  trading above their fundamental value may indicate strong
                  demand, market optimism about future growth, or scarcity of
                  similar investment opportunities.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm md:text-base">
                  <span className="font-medium">Discount to NAV:</span> Tokens
                  trading below their fundamental value might represent buying
                  opportunities, but could also signal market concerns about the
                  property or its management.
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base">
                  Savvy investors monitor the premium/discount to identify
                  potential arbitrage opportunities or market inefficiencies in
                  token pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
