'use client';

import { useState } from 'react';
import { PropertyValueHistory, MarketCorrelation } from '@/data/types/analytics'; // Updated path
import ChartComponent from '@/components/ui/chart'; // Updated path

interface AnalyticsMetricsProps {
  propertyData: PropertyValueHistory;
  correlations: MarketCorrelation[];
}

export default function AnalyticsMetrics({ propertyData, correlations }: AnalyticsMetricsProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  
  // Format percentage with sign
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };
  
  // Prepare correlation data
  const correlationData = {
    labels: correlations.map(c => c.market),
    datasets: [
      {
        label: 'Correlation Coefficient',
        data: correlations.map(c => {
          const value = timeframe === 'week' ? c.weekCorrelation :
                       timeframe === 'month' ? c.monthCorrelation :
                       timeframe === 'quarter' ? c.quarterCorrelation : c.yearCorrelation;
          // Return value scaled to percentage for the chart
          return parseFloat((value * 100).toFixed(1)); 
        }),
        backgroundColor: correlations.map(c => {
          const value = timeframe === 'week' ? c.weekCorrelation :
                       timeframe === 'month' ? c.monthCorrelation :
                       timeframe === 'quarter' ? c.quarterCorrelation : c.yearCorrelation;
          
          // Define colors based on correlation strength
          if (value >= 0.6) return 'rgba(34, 197, 94, 0.7)'; // Strong positive - Green
          if (value >= 0.3) return 'rgba(59, 130, 246, 0.7)'; // Moderate positive - Blue
          if (value >= -0.3) return 'rgba(249, 115, 22, 0.7)'; // Weak/Neutral - Orange
          if (value >= -0.6) return 'rgba(239, 68, 68, 0.7)'; // Moderate negative - Red
          return 'rgba(185, 28, 28, 0.7)'; // Strong negative - Dark Red
        }),
        borderWidth: 0,
        borderRadius: 4,
      }
    ]
  };
  
  // Correlation chart options
  const correlationOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        min: -100,
        max: 100,
        grid: {
          color: 'rgba(209, 213, 219, 0.2)', // TODO: Make dynamic
        },
        ticks: {
          callback: (value: number) => `${value}%`,
          color: '#6b7280', // TODO: Make dynamic
        },
        title: {
          display: true,
          text: 'Correlation Strength',
          color: '#6b7280', // TODO: Make dynamic
        }
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
            color: '#6b7280' // TODO: Make dynamic
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw / 100; // Convert back from percentage
            let strength = '';
            
            if (Math.abs(value) < 0.3) strength = 'Weak';
            else if (Math.abs(value) < 0.6) strength = 'Moderate';
            else strength = 'Strong';
            
            const direction = value >= 0 ? 'positive' : 'negative';
            return `${strength} ${direction} correlation: ${(value).toFixed(2)}`;
          }
        }
      }
    }
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow"> {/* Added dark mode class */}
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700"> {/* Added dark mode class */}
        <h2 className="text-lg font-semibold">Value Metrics</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"> {/* Added dark mode class */} 
          Detailed metrics showing the relationship between property value and token price
        </p>
      </div>
      
      <div className="p-6">
        {/* Metrics grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6"> {/* Changed to 3 columns for better spacing */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Volatility (Ann.)</p> {/* Added dark mode class */} 
            <p className="text-xl font-semibold">{propertyData.metrics.volatility.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Price-to-NAV</p> {/* Added dark mode class */} 
            <p className="text-xl font-semibold">
              {formatPercentage(propertyData.metrics.priceToNav - 100)} {/* Show premium/discount */} 
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Value Correlation</p> {/* Added dark mode class */} 
            <p className="text-xl font-semibold">{propertyData.metrics.valueCorrelation.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sharpe Ratio</p> {/* Added dark mode class */} 
            <p className="text-xl font-semibold">{propertyData.metrics.sharpeRatio.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Prop. Appreciation</p> {/* Added dark mode class */} 
            <p className="text-xl font-semibold text-green-600 dark:text-green-400"> {/* Added dark mode class */} 
              {formatPercentage(propertyData.metrics.propertyAppreciation)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Token Appreciation</p> {/* Added dark mode class */} 
            <p className="text-xl font-semibold text-green-600 dark:text-green-400"> {/* Added dark mode class */} 
              {formatPercentage(propertyData.metrics.tokenAppreciation)}
            </p>
          </div>
        </div>
        
        {/* Market insight panel */}
        <div>
          <h3 className="text-md font-medium mt-6 mb-4">Market Insight</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"> {/* Added dark mode class */} 
            <p className="text-sm mb-4 leading-relaxed text-gray-800 dark:text-gray-200"> {/* Added dark mode class */} 
              {propertyData.metrics.averagePremium > 5 
                ? `This property token is trading at a significant premium (${formatPercentage(propertyData.metrics.averagePremium)}) to its underlying value, indicating strong market demand or potential speculation.`
                : propertyData.metrics.averagePremium < -5
                ? `This property token is trading at a discount (${formatPercentage(propertyData.metrics.averagePremium)}) to its underlying value, suggesting potential undervaluation or market concerns.`
                : `This property token is trading close (${formatPercentage(propertyData.metrics.averagePremium)}) to its underlying value, indicating a balanced market.`
              }
            </p>
            
            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200"> {/* Added dark mode class */} 
              {propertyData.metrics.volatility > 15
                ? `With high volatility (${propertyData.metrics.volatility.toFixed(1)}%), this token experiences larger price swings than the underlying property market.`
                : propertyData.metrics.volatility < 8
                ? `With low volatility (${propertyData.metrics.volatility.toFixed(1)}%), this token price remains relatively stable compared to other real estate tokens.`
                : `The token shows moderate volatility (${propertyData.metrics.volatility.toFixed(1)}%), typical for tokenized real estate.`
              }
            </p>
          </div>
        </div>
        
        {/* Correlation panel */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium">Market Correlations</h3>
            <div className="flex space-x-1 text-xs">
              {(['week', 'month', 'quarter', 'year'] as const).map((tf) => (
                <button
                  key={tf}
                  className={`px-2 py-1 rounded ${
                    timeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600' /* Added dark mode class */
                  }`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf === 'week' ? '1W' : tf === 'month' ? '1M' : tf === 'quarter' ? '3M' : '1Y'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 mb-4">
            <ChartComponent
              type="bar"
              data={correlationData}
              options={correlationOptions as any} // Cast options
              height={240}
            />
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2"> {/* Added dark mode class */} 
            Correlation measures how this token's price moves in relation to other markets.
            Values close to 100% indicate strong positive correlation, while negative values
            show inverse relationships.
          </p>
        </div>
      </div>
    </div>
  );
} 