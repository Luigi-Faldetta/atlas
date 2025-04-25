'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DualLayerChart from '@/components/analytics/DualLayerChart';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import LiquidityPanel from '@/components/analytics/LiquidityPanel';

interface Property {
  id: string;
  Address?: string;
  Price?: number;
  name?: string;
  image?: string;
  ['Living Area']?: string;
  analysis_explanation?: string;
  URL?: string;
}

// Update PropertyValueHistory interface to include metrics
interface PropertyValueHistory {
  propertyId: string;
  data: {
    date: string;
    fundamentalValue: number;
    marketValue: number;
    volume: number;
  }[];
  metrics: {
    volatility: number;
    valueCorrelation: number;
    averagePremium: number;
    priceToNav: number;
    sharpeRatio: number;
    propertyAppreciation: number;
    tokenAppreciation: number;
  };
}

interface LiquidityData {
  spread: number;
  depth: number;
  averageDailyVolume: number;
  orderBookDepth: {
    asks: { price: number; amount: number }[];
    bids: { price: number; amount: number }[];
  };
  turnoverRate: number;
}

export default function MarketAnalysisPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [propertyHistory, setPropertyHistory] =
    useState<PropertyValueHistory | null>(null);
  const [timeframe, setTimeframe] = useState<'1w' | '1m' | '3m' | 'all'>('all');
  const [liquidityData, setLiquidityData] = useState<LiquidityData | null>(
    null
  );

  // Fetch the JSON property list (or use mock if needed)
  useEffect(() => {
    fetch('/scraped_funda_properties.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load properties JSON');
        return res.json();
      })
      .then((data: Property[]) => {
        const normalized = data.map((p) => ({
          ...p,
          // fallback name
          name: p.name || p.Address || 'Untitled Property',
        }));
        setProperties(normalized);
        if (normalized.length > 0) {
          setSelectedPropertyId(normalized[0].id || normalized[0].URL || '');
        }
      })
      .catch(() => {
        // Mock fallback if JSON fails
        const mockProps: Property[] = [
          {
            id: 'mock-1',
            Address: '123 Mock St',
            Price: 240000,
            name: 'Mock Property 1',
            image: '',
            ['Living Area']: '120 sqm',
            analysis_explanation: 'A very nice mock property.',
            URL: 'mock-1',
          },
        ];
        setProperties(mockProps);
        setSelectedPropertyId('mock-1');
      });
  }, []);

  // Set mock property value chart data AND metrics
  useEffect(() => {
    if (!selectedPropertyId) return;

    // Basic mock chart data
    const mockChartData = [
      {
        date: '2023-01-01',
        fundamentalValue: 200000,
        marketValue: 195000,
        volume: 1000,
      },
      {
        date: '2023-02-01',
        fundamentalValue: 202000,
        marketValue: 196500,
        volume: 1200,
      },
      {
        date: '2023-03-01',
        fundamentalValue: 205000,
        marketValue: 204000,
        volume: 1500,
      },
      {
        date: '2023-04-01',
        fundamentalValue: 208000,
        marketValue: 210000,
        volume: 1300,
      },
      {
        date: '2023-05-01',
        fundamentalValue: 210000,
        marketValue: 220000,
        volume: 1800,
      },
    ];

    // Mock metrics data
    const mockMetrics = {
      volatility: 15.5, // e.g., 15.5%
      valueCorrelation: 0.85, // e.g., 0.85 correlation coefficient
      averagePremium: 2.1, // e.g., 2.1% average premium over NAV
      priceToNav: 1.03, // e.g., Current Price is 1.03x NAV
      sharpeRatio: 1.2, // e.g., Risk-adjusted return measure
      propertyAppreciation: 4.5, // e.g., 4.5% annualized property appreciation
      tokenAppreciation: 5.2, // e.g., 5.2% annualized token appreciation
    };

    const mockHistory: PropertyValueHistory = {
      propertyId: selectedPropertyId,
      data: mockChartData,
      metrics: mockMetrics, // Include the metrics here
    };
    setPropertyHistory(mockHistory);
  }, [selectedPropertyId]);

  // Mock liquidity data
  useEffect(() => {
    // Example liquidity data that matches the interface
    const mockLiquidity: LiquidityData = {
      spread: 2.5,
      depth: 100000,
      averageDailyVolume: 30000,
      orderBookDepth: {
        asks: [
          { price: 210, amount: 10 },
          { price: 215, amount: 15 },
        ],
        bids: [
          { price: 205, amount: 20 },
          { price: 200, amount: 25 },
        ],
      },
      turnoverRate: 0.05,
    };
    setLiquidityData(mockLiquidity);
  }, []);

  const selectedProperty = properties.find(
    (p) => p.id === selectedPropertyId || p.URL === selectedPropertyId
  );

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-bold mb-6">Market Analysis</h1>

      {/* Property Selector */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between">
        <div className="mb-4 md:mb-0 max-w-2xl">
          <p className="text-gray-600 dark:text-gray-400 mb-1 text-sm md:text-base">
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
            className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm
              focus:border-blue-500 focus:ring-blue-500"
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
            {selectedProperty.image ? (
              <img
                src={selectedProperty.image}
                alt={selectedProperty.name}
                className="w-32 h-32 object-cover rounded-md mb-4 md:mb-0 md:mr-6"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 md:mb-0 md:mr-6" />
            )}
            <div className="flex-grow">
              <h3 className="text-xl font-semibold mb-1">
                {selectedProperty.name}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Address: {selectedProperty.Address ?? 'N/A'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Living Area: {selectedProperty['Living Area'] ?? 'N/A'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Price: €{selectedProperty.Price ?? 'N/A'}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                {selectedProperty.analysis_explanation ??
                  'Detailed analysis info not available.'}
              </p>
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
              onClick={() => setTimeframe(option.value as any)}
              className={`px-2 py-1 rounded ${
                timeframe === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
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
              <h3 className="text-lg font-medium">
                {selectedProperty?.name ?? 'Property'} — Value Chart
              </h3>
            </div>
            <div className="px-2 pt-1 pb-2">
              <DualLayerChart
                data={propertyHistory.data.map((item) => ({
                  date: item.date,
                  fundamentalValue: item.fundamentalValue,
                  marketValue: item.marketValue,
                  volume: item.volume ?? 0, // Use actual volume if available, otherwise default to 0
                }))}
                timeframe={timeframe}
                height={325}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {/* Pass the whole propertyHistory object which now includes metrics */}
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
                    Regulatory, transaction, or redemption restrictions on
                    tokens
                  </li>
                  <li>
                    Speculation on future property price increases or decreases
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                  Example Factors Influencing NAV
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm md:text-base">
                  The Net Asset Value (NAV) of a property is driven by multiple
                  factors:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                  <li>Location and development trends</li>
                  <li>Macro environment (interest rates, economic growth)</li>
                  <li>Supply and demand in the area</li>
                  <li>Renovations or improvements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
