'use client';

import React, { useState } from 'react';
import {
  PropertyValueHistory,
  MarketCorrelation,
  LiquidityMetrics,
  TokenValueDataPoint,
} from '@/data/types/analytics';
import { Button } from '@/components/ui/button'; // Corrected import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Corrected chart imports assuming they are default exports in /components/charts/
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import { formatPrice } from '@/lib/utils'; // Import shared utility

interface AnalyticsTabProps {
  propertyId: string; // Needed to fetch/display correct data
  history: PropertyValueHistory | null | undefined;
  correlations: MarketCorrelation[] | null | undefined;
  liquidity: LiquidityMetrics | null | undefined;
}

// --- Sub-Components (Stubbed or Basic Implementation) ---

const ValueMetrics = ({
  history,
  liquidity,
}: {
  history: PropertyValueHistory | null | undefined;
  liquidity: LiquidityMetrics | null | undefined;
}) => {
  const safeHistoryData = history?.data || []; // Use safe access

  const propertyAppreciation =
    safeHistoryData.length > 1
      ? (safeHistoryData[safeHistoryData.length - 1].fundamentalValue / // Use fundamentalValue
          safeHistoryData[0].fundamentalValue - // Use fundamentalValue
          1) *
        100
      : 0;

  const tokenAppreciation =
    safeHistoryData.length > 1
      ? (safeHistoryData[safeHistoryData.length - 1].marketValue / // Use marketValue
          safeHistoryData[0].marketValue - // Use marketValue
          1) *
        100
      : 0;
      
  // TODO: Calculate actual Volatility, Price-to-NAV, Correlation, Sharpe from data
  const volatility = 66.93; // Placeholder
  const priceToNAV = 105.99; // Placeholder
  const valueCorrelation = 0.89; // Placeholder
  const sharpeRatio = 7.19; // Placeholder

  return (
    <Card>
      <CardHeader>
        <CardTitle>Value Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div>
          Volatility (Annual): <span className="font-medium">{volatility.toFixed(2)}%</span>
        </div>
        <div>
          Price-to-NAV: <span className="font-medium">{priceToNAV >= 0 ? '+' : ''}{priceToNAV.toFixed(2)}%</span>
        </div>
        <div>
          Value Correlation: <span className="font-medium">{valueCorrelation.toFixed(2)}</span>
        </div>
        <div>
          Sharpe Ratio: <span className="font-medium">{sharpeRatio.toFixed(2)}</span>
        </div>
        <div>
          Property Appreciation:{' '}
          <span className={`font-medium ${propertyAppreciation >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {propertyAppreciation >= 0 ? '+' : ''}{propertyAppreciation.toFixed(2)}%
          </span>
        </div>
        <div>
          Token Appreciation:{' '}
          <span className={`font-medium ${tokenAppreciation >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
             {tokenAppreciation >= 0 ? '+' : ''}{tokenAppreciation.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const MarketInsight = ({ history }: { history: PropertyValueHistory | null | undefined }) => {
  const safeHistoryData = history?.data || [];
  const latestData = safeHistoryData[safeHistoryData.length - 1];
  const premium = latestData ? ((latestData.marketValue / latestData.fundamentalValue) - 1) * 100 : 0;
  // Placeholder for volatility - should be calculated
  const volatility = 66.93;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Insight</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
        {latestData ? (
          <p>
            This property token is trading at a {Math.abs(premium).toFixed(2)}% 
            {premium >= 0 ? 'premium' : 'discount'} to its underlying value, indicating 
            {premium >= 0 ? 'strong market demand or potential speculation' : 'potential undervaluation or lower market confidence'}.
          </p>
        ) : (
          <p>Unable to determine market premium/discount due to missing data.</p>
        )}
        <p>
          With high volatility ({volatility.toFixed(2)}%), this token experiences larger price swings than the underlying property market.
        </p>
      </CardContent>
    </Card>
  );
};

const MarketCorrelationsChart = ({
  data,
  timeframe,
}: {
  data: MarketCorrelation[] | null | undefined;
  timeframe: string;
}) => {
  // Get the correct correlation property based on timeframe
  const getCorrelationByTimeframe = (correlation: MarketCorrelation, timeframe: string): number => {
    switch (timeframe) {
      case '1W': return correlation.weekCorrelation;
      case '1M': return correlation.monthCorrelation;
      case '3M': return correlation.quarterCorrelation;
      case '1Y':
      default: return correlation.yearCorrelation;
    }
  };

  const safeData =
    data && Array.isArray(data) && data.length > 0
      ? data
      : null;

  const chartData = safeData
    ? {
        labels: safeData.map(item => item.market),
        datasets: [
          {
            label: 'Correlation',
            data: safeData.map(item => Number(getCorrelationByTimeframe(item, timeframe)) * 100),
            backgroundColor: safeData.map(item => 
              Number(getCorrelationByTimeframe(item, timeframe)) >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
            ),
            borderColor: safeData.map(item => 
              Number(getCorrelationByTimeframe(item, timeframe)) >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
            ),
            borderWidth: 1,
          },
        ],
      }
    : { labels: [], datasets: [] };

  const chartOptions = {
    indexAxis: 'y' as const,
    scales: {
      x: {
        min: -100,
        max: 100,
        ticks: { callback: (value: number) => `${value}%` },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { 
        callbacks: {
          label: (context: any) => `${context.raw.toFixed(1)}%` // Format tooltip value
        }
       }
    },
    maintainAspectRatio: false,
  };

  return chartData.datasets.length > 0 ? (
    <BarChart
      title="Correlation Strength (%)"
      labels={chartData.labels}
      datasets={chartData.datasets}
    />
  ) : (
    <div className="flex items-center justify-center h-full text-gray-500">
      Correlation data unavailable.
    </div>
  );
};

const LiquidityAnalysis = ({
  liquidity,
}: {
  liquidity: LiquidityMetrics | null | undefined;
}) => {
  if (!liquidity)
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Liquidity data unavailable.
      </div>
    );

  const formatCurrency = (value: number) => formatPrice(value);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liquidity Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center text-sm">
          <div>
            Spread:{' '}
            <span className="block font-medium text-lg">
              {liquidity.spread.toFixed(2)}%
            </span>
          </div>
          <div>
            Market Depth:{' '}
            <span className="block font-medium text-lg">
              {formatCurrency(liquidity.depth)}
            </span>
          </div>
          <div>
            24h Volume:{' '}
            <span className="block font-medium text-lg">
              {formatCurrency(liquidity.averageDailyVolume)}
            </span>
          </div>
          <div>
            Turnover Rate:{' '}
            <span className="block font-medium text-lg">
              {liquidity.turnoverRate.toFixed(2)}x
            </span>
          </div>
        </div>

        <h5 className="font-medium mb-2 text-center">Order Book Depth</h5>
        {/* Basic Order Book Chart - needs a component */}
        <div className="h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 rounded mb-4">
          Order Book Chart Placeholder
        </div>

        <h5 className="font-medium mb-2">Liquidity Assessment</h5>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          With a tight {liquidity.spread.toFixed(2)}% spread, this token enjoys
          excellent liquidity. The {liquidity.turnoverRate.toFixed(2)}x turnover rate indicates active trading.
        </p>
        <h5 className="font-medium mb-1 mt-3">Understanding Liquidity</h5>
        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>Spread: Difference between best buy and sell prices (lower is better)</li>
          <li>Market Depth: Total value of orders</li>
          <li>Turnover Rate: Trading activity relative to supply</li>
        </ul>
      </CardContent>
    </Card>
  );
};

// --- Main Tab Component ---

export default function AnalyticsTab({
  propertyId,
  history,
  correlations,
  liquidity,
}: AnalyticsTabProps) {
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '1Y'>('1Y');

  const safeHistoryData: TokenValueDataPoint[] = history?.data || []; // Ensure type
  
  // TODO: Implement actual timeframe filtering based on 'timeframe' state
  const filteredHistoryData = safeHistoryData; 

  const historyChartData =
    filteredHistoryData.length > 0
      ? {
          labels: filteredHistoryData.map((d) =>
            new Date(d.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          ),
          datasets: [
            {
              label: 'Fundamental Value', // Use Fundamental Value
              data: filteredHistoryData.map((d) => d.fundamentalValue), // Use fundamentalValue
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              tension: 0.1,
              yAxisID: 'y',
            },
            {
              label: 'Market Price', // Use Market Price
              data: filteredHistoryData.map((d) => d.marketValue), // Use marketValue
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
              yAxisID: 'y1',
            },
          ],
        }
      : { labels: [], datasets: [] };

  const historyChartOptions = {
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Value (€)' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Token Price (€)' },
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: { // Basic tooltip formatting
        callbacks: {
            label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += formatPrice(context.parsed.y);
                }
                return label;
            }
        }
    }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Top Chart: Value vs Token Price */}
      <Card>
        <CardHeader>
          <CardTitle>Fundamental Value vs. Market Price</CardTitle>
          {/* TODO: Add date range display */}
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80">
            {historyChartData.datasets.length > 0 ? (
              <LineChart
                title="Value vs Market Price"
                labels={historyChartData.labels}
                datasets={historyChartData.datasets}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Historical data unavailable.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid for Metrics, Insight, Correlations, Liquidity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <ValueMetrics history={history} liquidity={liquidity} />
          <MarketInsight history={history} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Market Correlations</CardTitle>
              {/* Timeframe Selector */}
              <div className="flex space-x-1 text-xs">
                {['1W', '1M', '3M', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf as any)}
                    className={`px-2 py-0.5 rounded ${timeframe === tf ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="h-60">
              <MarketCorrelationsChart 
                data={correlations} 
                timeframe={timeframe} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <LiquidityAnalysis liquidity={liquidity} />
        </div>
      </div>
    </div>
  );
}
