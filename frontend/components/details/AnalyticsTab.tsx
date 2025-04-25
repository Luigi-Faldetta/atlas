'use client';

import React, { useState } from 'react';
import {
  PropertyValueHistory,
  MarketCorrelation,
  LiquidityMetrics,
  TokenValueDataPoint,
} from '@/data/types/analytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import { formatPrice } from '@/lib/utils';
import { Scale, Tick } from 'chart.js'; // Import Scale and Tick types

interface AnalyticsTabProps {
  propertyId: string;
  history: PropertyValueHistory | null | undefined;
  correlations: MarketCorrelation[] | null | undefined;
  liquidity: LiquidityMetrics | null | undefined;
}

const ValueMetrics = ({
  history,
  liquidity,
}: {
  history: PropertyValueHistory | null | undefined;
  liquidity: LiquidityMetrics | null | undefined;
}) => {
  const safeHistoryData = history?.data || [];

  const propertyAppreciation =
    safeHistoryData.length > 1
      ? (safeHistoryData[safeHistoryData.length - 1].fundamentalValue /
          safeHistoryData[0].fundamentalValue -
          1) *
        100
      : 0;

  // Ensure marketValue exists before calculating tokenAppreciation
  const tokenAppreciation =
    safeHistoryData.length > 1 &&
    safeHistoryData[0].marketValue &&
    safeHistoryData[safeHistoryData.length - 1].marketValue
      ? (safeHistoryData[safeHistoryData.length - 1].marketValue! /
          safeHistoryData[0].marketValue! -
          1) *
        100
      : 0;

  const volatility = history?.metrics?.volatility ?? 0; // Use actual metric if available
  const priceToNAV = history?.metrics?.priceToNav ?? 0; // Use actual metric if available
  const valueCorrelation = history?.metrics?.valueCorrelation ?? 0; // Use actual metric if available
  const sharpeRatio = history?.metrics?.sharpeRatio ?? 0; // Use actual metric if available

  return (
    <Card>
      <CardHeader>
        <CardTitle>Value Metrics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div>
          Volatility (Annual):{' '}
          <span className="font-medium">{volatility.toFixed(2)}%</span>
        </div>
        <div>
          Price-to-NAV:{' '}
          <span className="font-medium">
            {priceToNAV >= 0 ? '+' : ''}
            {priceToNAV.toFixed(2)}%
          </span>
        </div>
        <div>
          Value Correlation:{' '}
          <span className="font-medium">{valueCorrelation.toFixed(2)}</span>
        </div>
        <div>
          Sharpe Ratio:{' '}
          <span className="font-medium">{sharpeRatio.toFixed(2)}</span>
        </div>
        <div>
          Property Appreciation:{' '}
          <span
            className={`font-medium ${
              propertyAppreciation >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {propertyAppreciation >= 0 ? '+' : ''}
            {propertyAppreciation.toFixed(2)}%
          </span>
        </div>
        <div>
          Token Appreciation:{' '}
          <span
            className={`font-medium ${
              tokenAppreciation >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {tokenAppreciation >= 0 ? '+' : ''}
            {tokenAppreciation.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const MarketInsight = ({
  history,
}: {
  history: PropertyValueHistory | null | undefined;
}) => {
  const safeHistoryData = history?.data || [];
  const latestData = safeHistoryData[safeHistoryData.length - 1];
  // Ensure marketValue exists before calculating premium
  const premium =
    latestData && latestData.marketValue
      ? (latestData.marketValue / latestData.fundamentalValue - 1) * 100
      : 0;
  const volatility = history?.metrics?.volatility ?? 0; // Use actual metric

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Insight</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
        {latestData && latestData.marketValue !== undefined ? (
          <p>
            This property token is trading at a {Math.abs(premium).toFixed(2)}%
            {premium >= 0 ? ' premium' : ' discount'} to its underlying value,
            indicating{' '}
            {premium >= 0
              ? 'strong market demand or potential speculation'
              : 'potential undervaluation or lower market confidence'}
            .
          </p>
        ) : (
          <p>
            Unable to determine market premium/discount due to missing data.
          </p>
        )}
        <p>
          With volatility at {volatility.toFixed(2)}%, this token may experience
          price swings relative to the property market.
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
  const getCorrelationByTimeframe = (
    correlation: MarketCorrelation,
    timeframe: string
  ): number => {
    switch (timeframe) {
      case '1W':
        return correlation.weekCorrelation;
      case '1M':
        return correlation.monthCorrelation;
      case '3M':
        return correlation.quarterCorrelation;
      case '1Y':
      default:
        return correlation.yearCorrelation;
    }
  };

  const safeData = data && Array.isArray(data) && data.length > 0 ? data : null;

  const chartData = safeData
    ? {
        labels: safeData.map((item) => item.market),
        datasets: [
          {
            label: 'Correlation',
            data: safeData.map(
              (item) => Number(getCorrelationByTimeframe(item, timeframe)) * 100
            ),
            backgroundColor: safeData.map((item) =>
              Number(getCorrelationByTimeframe(item, timeframe)) >= 0
                ? 'rgba(75, 192, 192, 0.6)'
                : 'rgba(255, 99, 132, 0.6)'
            ),
            borderColor: safeData.map((item) =>
              Number(getCorrelationByTimeframe(item, timeframe)) >= 0
                ? 'rgba(75, 192, 192, 1)'
                : 'rgba(255, 99, 132, 1)'
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
        // Corrected ticks callback signature
        ticks: {
          callback: function (
            this: Scale,
            tickValue: string | number,
            index: number,
            ticks: Tick[]
          ) {
            // Ensure value is treated as number for formatting
            const numericValue =
              typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            return `${numericValue}%`;
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.raw.toFixed(1)}%`,
        },
      },
    },
    maintainAspectRatio: false,
  };

  return chartData.datasets.length > 0 ? (
    <BarChart
      title="Correlation Strength (%)"
      labels={chartData.labels}
      datasets={chartData.datasets}
      options={chartOptions}
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
        <div className="h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 rounded mb-4">
          {/* Placeholder - Implement Order Book Chart here if needed */}
          Order Book Chart Placeholder
        </div>

        <h5 className="font-medium mb-2">Liquidity Assessment</h5>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          {liquidity.description ||
            `Spread: ${liquidity.spread.toFixed(
              2
            )}%, Turnover: ${liquidity.turnoverRate.toFixed(2)}x.`}
        </p>
        <h5 className="font-medium mb-1 mt-3">Understanding Liquidity</h5>
        <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <li>
            Spread: Difference between best buy and sell prices (lower is
            better)
          </li>
          <li>Market Depth: Total value of orders</li>
          <li>Turnover Rate: Trading activity relative to supply</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default function AnalyticsTab({
  propertyId,
  history,
  correlations,
  liquidity,
}: AnalyticsTabProps) {
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '1Y'>('1Y');

  const safeHistoryData: TokenValueDataPoint[] = history?.data || [];
  // Apply filtering based on timeframe if needed - currently showing all data
  const filteredHistoryData = safeHistoryData;

  // --- Build the data using a single y-axis and per-token price ---
  const historyChartData = filteredHistoryData.length
    ? {
        labels: filteredHistoryData.map((d) =>
          new Date(d.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })
        ),
        datasets: [
          {
            label: 'Fundamental Value (€)',
            data: filteredHistoryData.map((d) => d.fundamentalValue),
            borderColor: 'rgb(54,162,235)',
            backgroundColor: 'rgba(54,162,235,0.2)',
            tension: 0.1,
          },
          {
            label: 'Market Price (€)',
            // Use marketValue as the token price for now
            data: filteredHistoryData.map((d) => d.marketValue),
            borderColor: 'rgb(75,192,192)',
            backgroundColor: 'rgba(75,192,192,0.2)',
            tension: 0.1,
          },
        ],
      }
    : { labels: [], datasets: [] };

  // --- Single-axis options ---
  const historyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: '€ per token' },
        // Corrected ticks callback signature
        ticks: {
          callback: function (
            this: Scale,
            tickValue: string | number,
            index: number,
            ticks: Tick[]
          ) {
            // Ensure value is treated as number for formatting
            const numericValue =
              typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            return '€' + formatPrice(numericValue);
          },
        },
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label({ dataset, formattedValue }: any) {
            // Ensure formattedValue is treated as string before formatting
            const valueString = String(formattedValue);
            return `${dataset.label}: €${valueString}`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6 pt-4">
      <Card>
        <CardHeader>
          <CardTitle>Fundamental Value vs. Market Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 md:h-80">
            {historyChartData.datasets.length > 0 ? (
              <LineChart
                title="Value vs Market Price" // Title is handled by CardTitle now, but kept for prop consistency
                labels={historyChartData.labels}
                datasets={historyChartData.datasets}
                options={historyChartOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Historical data unavailable.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ValueMetrics history={history} liquidity={liquidity} />
          <MarketInsight history={history} />
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Market Correlations</CardTitle>
              <div className="flex space-x-1 text-xs">
                {['1W', '1M', '3M', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf as any)}
                    className={`px-2 py-0.5 rounded ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
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

        <div className="space-y-6">
          <LiquidityAnalysis liquidity={liquidity} />
        </div>
      </div>
    </div>
  );
}
