'use client';

import React, { useState } from 'react';
import {
  PropertyValueHistory,
  MarketCorrelationData,
  LiquidityMetricsData,
} from '@/data/mock/analytics';
import { Button } from '@/components/ui/button'; // Corrected import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Corrected chart imports assuming they are default exports in /components/charts/
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import { formatPrice } from '@/lib/utils'; // Import shared utility

interface AnalyticsTabProps {
  propertyId: string; // Needed to fetch/display correct data
  history: PropertyValueHistory | null | undefined;
  correlations: MarketCorrelationData | null | undefined;
  liquidity: LiquidityMetricsData | null | undefined;
}

// --- Sub-Components (Stubbed or Basic Implementation) ---

const ValueMetrics = ({
  history,
  liquidity,
}: {
  history: PropertyValueHistory | null | undefined;
  liquidity: LiquidityMetricsData | null | undefined;
}) => {
  // TODO: Calculate Volatility, Price-to-NAV, Correlation, Sharpe, Appreciation
  const propertyAppreciation =
    history && history.data && history.data.length > 1
      ? (history.data[history.data.length - 1].propertyValue /
          history.data[0].propertyValue -
          1) *
        100
      : 0;

  // Apply the same explicit check here
  const tokenAppreciation =
    history && history.data && history.data.length > 1
      ? (history.data[history.data.length - 1].tokenPrice /
          history.data[0].tokenPrice -
          1) *
        100
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Value Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div>
          Volatility (Annual): <span className="font-medium">66.93%</span>
        </div>
        <div>
          Price-to-NAV: <span className="font-medium">+105.99%</span>
        </div>
        <div>
          Value Correlation: <span className="font-medium">0.89</span>
        </div>
        <div>
          Sharpe Ratio: <span className="font-medium">7.19</span>
        </div>
        <div>
          Property Appreciation:{' '}
          <span className="font-medium text-green-600">
            +{propertyAppreciation.toFixed(2)}%
          </span>
        </div>
        <div>
          Token Appreciation:{' '}
          <span className="font-medium text-green-600">
            +{tokenAppreciation.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const MarketInsight = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Insight</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-600 dark:text-gray-400">
        This property token is trading at a significant premium to its
        underlying value, indicating strong market demand or potential
        speculation.
        <br />
        <br />
        With high volatility (66.93%), this token experiences larger price
        swings than the underlying property market.
      </CardContent>
    </Card>
  );
};

const MarketCorrelationsChart = ({
  data,
}: {
  data: MarketCorrelationData | null | undefined;
}) => {
  const safeData =
    data && typeof data === 'object' && Object.keys(data).length > 0
      ? data
      : null;

  // Prepare chart data only if safeData exists
  const chartData = safeData
    ? {
        labels: Object.keys(safeData),
        datasets: [
          {
            label: 'Correlation',
            data: Object.values(safeData),
            backgroundColor: Object.values(safeData).map((v) =>
              v >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
            ),
            borderColor: Object.values(safeData).map((v) =>
              v >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
            ),
            borderWidth: 1,
          },
        ],
      }
    : {
        labels: [], // Ensure valid structure even when no data
        datasets: [],
      };

  // const options = {
  //   indexAxis: 'y' as const,
  //   scales: {
  //     x: {
  //       min: -100,
  //       max: 100,
  //       ticks: { callback: (value: number) => `${value}%` },
  //     },
  //   },
  //   plugins: {
  //     legend: { display: false },
  //     title: { display: true, text: 'Correlation Strength (%)' },
  //   },
  // };

  return chartData.datasets.length > 0 ? (
    // --- FIX: Pass props as expected by BarChart.tsx ---
    <BarChart
      title="Correlation Strength (%)" // Pass the title
      labels={chartData.labels} // Pass labels directly
      datasets={chartData.datasets} // Pass datasets directly
    />
  ) : (
    // --- END FIX ---
    <div className="flex items-center justify-center h-full text-gray-500">
      Correlation data unavailable.
    </div>
  );
}; // <--- Added missing closing brace

const LiquidityAnalysis = ({
  liquidity,
}: {
  liquidity: LiquidityMetricsData | null | undefined;
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
              {formatCurrency(liquidity.marketDepth)}
            </span>
          </div>
          <div>
            24h Volume:{' '}
            <span className="block font-medium text-lg">
              {formatCurrency(liquidity.volume24h)}
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
        {/* Basic Order Book Chart - requires chart component capable of this type */}
        <div className="h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 rounded mb-4">
          Order Book Chart Placeholder
        </div>

        <h5 className="font-medium mb-2">Liquidity Assessment</h5>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          With a tight {liquidity.spread.toFixed(2)}% spread, this token enjoys
          excellent liquidity, making it easy to enter and exit positions with
          minimal price impact. The high turnover rate (
          {liquidity.turnoverRate.toFixed(2)}x) indicates active trading,
          suggesting strong market interest.
        </p>
        <h5 className="font-medium mb-1 mt-3">Understanding Liquidity</h5>
        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>
            Spread: Difference between best buy and sell prices, lower is better
          </li>
          <li>Market Depth: Total value of orders in the order book</li>
          <li>
            Turnover Rate: How frequently the total supply changes hands
            annually
          </li>
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

  const safeHistoryData =
    history?.data && Array.isArray(history.data) && history.data.length > 0
      ? history.data
      : [];
  // TODO: Implement actual timeframe filtering
  const filteredHistoryData = safeHistoryData;

  // Prepare chart data only if filteredHistoryData has items
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
              label: 'Property Value',
              data: filteredHistoryData.map((d) => d.propertyValue),
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              tension: 0.1,
              yAxisID: 'y',
            },
            {
              label: 'Token Price',
              data: filteredHistoryData.map((d) => d.tokenPrice),
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
              yAxisID: 'y1',
            },
          ],
        }
      : {
          labels: [], // Ensure valid structure even when no data
          datasets: [],
        };

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
    },
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Top Chart: Value vs Token Price */}
      <Card>
        <CardHeader>
          <CardTitle>Property Value vs. Token Price</CardTitle>
          {/* TODO: Add date range display based on timeframe */}
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80">
            {historyChartData.datasets.length > 0 ? (
              <LineChart
                title="Value vs Token Price"
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
          <MarketInsight />

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
              <MarketCorrelationsChart data={correlations} />
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
