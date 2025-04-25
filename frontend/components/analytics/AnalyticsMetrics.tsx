import React from 'react';
import {
  PropertyValueHistory,
  PropertyValueMetrics,
} from '@/data/types/analytics'; // Adjust path if needed

interface AnalyticsMetricsProps {
  propertyData: PropertyValueHistory | null; // Allow null
}

// Helper function to format percentage difference (premium/discount)
const formatPercentage = (value: number | undefined): string => {
  if (value === undefined || isNaN(value)) return 'N/A';
  const percentage = value * 100; // Assuming value is like 1.05 for 5% premium
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(1)}%`;
};

// Helper function to format number or return 'N/A'
const formatNumber = (
  value: number | undefined,
  decimals: number = 2
): string => {
  if (value === undefined || isNaN(value)) return 'N/A';
  return value.toFixed(decimals);
};

export default function AnalyticsMetrics({
  propertyData,
}: AnalyticsMetricsProps) {
  // Handle case where propertyData itself might be null or undefined
  if (!propertyData) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <p className="text-gray-500 dark:text-gray-400">
          Metrics data not available.
        </p>
      </div>
    );
  }

  // Destructure metrics for easier access, handle if it's undefined
  const metrics = propertyData.metrics;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Value Metrics
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Detailed metrics showing the relationship between property value and
          token price
        </p>
      </div>

      <div className="p-6">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {/* Volatility */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Volatility (Ann.)
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {/* Check if metrics and volatility exist */}
              {metrics?.volatility !== undefined
                ? `${formatNumber(metrics.volatility)}%`
                : 'N/A'}
            </p>
          </div>

          {/* Price-to-NAV */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Price-to-NAV
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {/* Check if metrics and priceToNav exist */}
              {metrics?.priceToNav !== undefined
                ? formatPercentage(metrics.priceToNav - 1)
                : 'N/A'}{' '}
              {/* Adjusted calculation */}
            </p>
          </div>

          {/* Value Correlation */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Value Correlation
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {/* Check if metrics and valueCorrelation exist */}
              {formatNumber(metrics?.valueCorrelation)}
            </p>
          </div>

          {/* Property Appreciation */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Property Apprec. (Ann.)
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {/* Check if metrics and propertyAppreciation exist */}
              {metrics?.propertyAppreciation !== undefined
                ? `${formatNumber(metrics.propertyAppreciation)}%`
                : 'N/A'}
            </p>
          </div>

          {/* Token Appreciation */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Token Apprec. (Ann.)
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {/* Check if metrics and tokenAppreciation exist */}
              {metrics?.tokenAppreciation !== undefined
                ? `${formatNumber(metrics.tokenAppreciation)}%`
                : 'N/A'}
            </p>
          </div>

          {/* Sharpe Ratio */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sharpe Ratio
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {/* Check if metrics and sharpeRatio exist */}
              {formatNumber(metrics?.sharpeRatio)}
            </p>
          </div>

          {/* Average Premium (Optional, add if needed) */}
          {/*
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Premium</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {metrics?.averagePremium !== undefined ? `${formatPercentage(metrics.averagePremium)}` : 'N/A'}
            </p>
          </div>
          */}
        </div>

        {/* Optional: Add a message if metrics are missing */}
        {!metrics && (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-4">
            Detailed metrics are not available for this property.
          </p>
        )}

        {/* Optional: Add descriptions or explanations for metrics */}
        {/* ... */}
      </div>
    </div>
  );
}
