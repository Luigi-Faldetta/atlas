'use client';

import { LiquidityMetrics } from '@/data/types/analytics'; // Updated path
import ChartComponent from '@/components/ui/chart'; // Updated path

interface LiquidityPanelProps {
  liquidity: LiquidityMetrics;
}

export default function LiquidityPanel({ liquidity }: LiquidityPanelProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR', // Consider making dynamic
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  // Prepare order book chart data
  const orderBookData = {
    labels: liquidity.orderBookDepth.asks.map((_, i) => `Ask ${i + 1}`).concat(
      liquidity.orderBookDepth.bids.map((_, i) => `Bid ${i + 1}`).reverse()
    ),
    datasets: [
      {
        data: liquidity.orderBookDepth.asks.map(ask => ask.amount).concat(
          liquidity.orderBookDepth.bids.map(bid => bid.amount).reverse()
        ),
        backgroundColor: [
          ...liquidity.orderBookDepth.asks.map(() => 'rgba(239, 68, 68, 0.7)'), // Red for asks
          ...liquidity.orderBookDepth.bids.map(() => 'rgba(34, 197, 94, 0.7)')  // Green for bids
        ],
        borderWidth: 1,
        borderColor: [
          ...liquidity.orderBookDepth.asks.map(() => 'rgba(239, 68, 68, 1)'),
          ...liquidity.orderBookDepth.bids.map(() => 'rgba(34, 197, 94, 1)')
        ],
      },
    ],
  };
  
  // Chart options
  const orderBookOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Token Amount',
          color: '#6b7280', // TODO: Make dynamic
        },
        ticks: {
          color: '#6b7280' // TODO: Make dynamic
        },
        grid: {
          color: 'rgba(243, 244, 246, 1)' // TODO: Make dynamic
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
            color: '#6b7280' // TODO: Make dynamic
        }
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any[]) => {
            const index = tooltipItems[0].dataIndex;
            const isAsk = index < liquidity.orderBookDepth.asks.length;
            const orderBookIndex = isAsk 
              ? index 
              : index - liquidity.orderBookDepth.asks.length;
            
            if (isAsk) {
              const ask = liquidity.orderBookDepth.asks[orderBookIndex];
              return `Ask: €${ask.price}`;
            } else {
              // Correctly index into reversed bids array representation
              const bidIndex = liquidity.orderBookDepth.bids.length - 1 - orderBookIndex;
              const bid = liquidity.orderBookDepth.bids[bidIndex];
              return `Bid: €${bid.price}`;
            }
          },
          label: (context: any) => {
            return `Amount: ${context.raw} tokens`;
          }
        }
      }
    },
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow"> {/* Added dark mode class */}
      <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700"> {/* Added dark mode class */}
        <h2 className="text-lg font-semibold">Liquidity Analysis</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"> {/* Added dark mode class */} 
          Market depth and trading activity metrics
        </p>
      </div>
      
      <div className="p-6">
        {/* Liquidity metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Spread</h3> {/* Added dark mode class */} 
            <p className="text-xl font-semibold">{formatPercentage(liquidity.spread)}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Market Depth</h3> {/* Added dark mode class */} 
            <p className="text-xl font-semibold">{formatCurrency(liquidity.depth)}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">24h Volume</h3> {/* Added dark mode class */} 
            <p className="text-xl font-semibold">{formatCurrency(liquidity.averageDailyVolume)}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 dark:text-gray-400">Turnover Rate</h3> {/* Added dark mode class */} 
            <p className="text-xl font-semibold">{liquidity.turnoverRate.toFixed(2)}x</p>
          </div>
        </div>
        
        {/* Order book visualization */}
        <div className="mb-6">
          <h3 className="text-md font-medium mb-4">Order Book Depth</h3>
          <div className="h-64">
            <ChartComponent
              type="bar"
              data={orderBookData}
              options={orderBookOptions as any} // Cast options
              height={220}
            />
          </div>
        </div>
        
        {/* Liquidity assessment */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"> {/* Added dark mode class */}
          <h3 className="text-sm font-medium mb-2">Liquidity Assessment</h3>
          <p className="text-sm mb-3 text-gray-800 dark:text-gray-200"> {/* Added dark mode class */} 
            {liquidity.spread > 3
              ? `With a ${formatPercentage(liquidity.spread)} spread, this token has relatively low liquidity compared to similar properties, potentially resulting in higher transaction costs.`
              : liquidity.spread < 1.5
              ? `With a tight ${formatPercentage(liquidity.spread)} spread, this token enjoys excellent liquidity, making it easy to enter and exit positions with minimal price impact.`
              : `This token has a moderate ${formatPercentage(liquidity.spread)} spread, typical for tokenized real estate assets of this size.`
            }
          </p>
          <p className="text-sm text-gray-800 dark:text-gray-200"> {/* Added dark mode class */} 
            {liquidity.turnoverRate > 0.3
              ? `The high turnover rate (${liquidity.turnoverRate.toFixed(2)}x) indicates active trading, suggesting strong market interest.`
              : liquidity.turnoverRate < 0.1
              ? `The low turnover rate (${liquidity.turnoverRate.toFixed(2)}x) suggests this is primarily a long-term holding asset with less frequent trading.`
              : `The average turnover rate (${liquidity.turnoverRate.toFixed(2)}x) shows balanced trading activity for this asset class.`
            }
          </p>
        </div>
        
        {/* Explainer */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400"> {/* Added dark mode class */} 
          <h4 className="font-medium mb-1">Understanding Liquidity</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-semibold">Spread:</span> Difference between best buy and sell prices, lower is better</li>
            <li><span className="font-semibold">Market Depth:</span> Total value of orders in the order book</li>
            <li><span className="font-semibold">24h Volume:</span> Total value traded in the last 24 hours</li>
            <li><span className="font-semibold">Turnover Rate:</span> How frequently the total supply changes hands annually</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 