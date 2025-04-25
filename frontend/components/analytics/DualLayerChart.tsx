'use client';

import { useState, useEffect, useRef } from 'react';
import { TokenValueDataPoint } from '@/data/types/analytics'; // Updated path
import ChartComponent from '@/components/ui/chart'; // Updated path, assuming chart.tsx is the component
import Chart from 'chart.js/auto';
import { ChartTypeRegistry } from 'chart.js';

// Extend the Chart type to include our custom properties
declare module 'chart.js' {
  interface Chart {
    animationsComplete?: boolean;
    animations?: { active: boolean }[];
  }
}

interface DualLayerChartProps {
  data: TokenValueDataPoint[];
  title?: string;
  showVolume?: boolean;
  height?: number;
  timeframe?: '1w' | '1m' | '3m' | 'all';
}

export default function DualLayerChart({ 
  data, 
  title = 'Property Value vs. Token Price', 
  showVolume = true,
  height = 300,
  timeframe = 'all'
}: DualLayerChartProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    fundamentalValue: number;
    marketValue: number;
    premium: number;
    visible: boolean;
    x: number;
    y: number;
  }>({
    date: '',
    fundamentalValue: 0,
    marketValue: 0,
    premium: 0,
    visible: false,
    x: 0,
    y: 0
  });

  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null); // Renamed to avoid conflict

  // Format date for chart display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (timeframe === '1w') {
      return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
    } else if (timeframe === '1m') {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); // Default to month/day for 3m/all
    }
  };

  // Filter data based on timeframe
  const filterDataByTimeframe = (data: TokenValueDataPoint[], timeframe: string) => {
    if (timeframe === 'all') return data;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    if (timeframe === '1w') {
      cutoffDate.setDate(now.getDate() - 7);
    } else if (timeframe === '1m') {
      cutoffDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === '3m') {
      cutoffDate.setMonth(now.getMonth() - 3);
    }
    
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    return data.filter(d => d.date >= cutoffStr);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR', // Consider making dynamic
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Format percentage with sign
  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Get CSS color based on value
  const getValueColor = (value: number) => {
    return value > 0 ? 'text-green-600 dark:text-green-400' : value < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'; // Added dark mode
  };


  useEffect(() => {
    if (!chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // Filter data based on timeframe
    const filteredData = filterDataByTimeframe(data, timeframe);
    
    if (chartInstance) {
      chartInstance.destroy();
    }

    const newChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index' as const,
        },
        animation: {
          duration: 1000, // Only animate on initial load
          onComplete: function(this: Chart) {
            // Store the animation so it won't re-trigger on hover
            this.animationsComplete = true;
          },
          onProgress: function(this: Chart) {
            // Skip animation if it's already been completed once
            if (this.animationsComplete === true && this.animations) {
              this.animations.forEach((animation: { active: boolean }) => {
                animation.active = false;
              });
            }
          }
        },
        plugins: {
          legend: {
            position: 'top' as const,
            align: 'start' as const,
            labels: {
              boxWidth: 15,
              usePointStyle: true,
              pointStyle: 'circle' as const,
              padding: 20,
              color: '#6b7280' // TODO: Make dynamic with theme
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(255, 255, 255, 0.95)', // TODO: Make dynamic
            titleColor: '#1f2937',
            bodyColor: '#4b5563',
            titleFont: {
              size: 13,
              weight: 'bold' as const,
            },
            bodyFont: {
              size: 12,
            },
            padding: 12,
            cornerRadius: 8,
            borderColor: 'rgba(229, 231, 235, 1)',
            borderWidth: 1,
            caretSize: 6,
            boxPadding: 3,
            mode: 'index' as const,
            intersect: false,
            displayColors: true,
            callbacks: {
              label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.datasetIndex === 2) { // Volume
                  label += context.parsed.y;
                } else {
                  label += new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'EUR', // Make dynamic
                    minimumFractionDigits: 2,
                  }).format(context.parsed.y);
                }
                return label;
              }
            }
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 8,
              padding: 10,
              color: '#6b7280', // TODO: Make dynamic
            },
            border: {
              display: false,
            }
          },
          y: {
            position: 'left' as const,
            title: {
              display: true,
              text: 'Price (€)', // Euro symbol
              color: '#6b7280',
              font: {
                size: 12,
                weight: 'normal' as const,
              },
              padding: { top: 0, bottom: 10 },
            },
            ticks: {
              precision: 0,
              padding: 8,
              color: '#6b7280', // TODO: Make dynamic
              callback: function(value: any) {
                return '€' + value; // Euro symbol
              }
            },
            grid: {
              color: 'rgba(243, 244, 246, 1)', // TODO: Make dynamic
            },
            border: {
              display: false,
            }
          },
          yVolume: {
            display: showVolume, // Control visibility
            position: 'right' as const,
            title: {
              display: true,
              text: 'Volume',
              color: '#6b7280',
              font: {
                size: 12,
                weight: 'normal' as const,
              },
              padding: { top: 0, bottom: 10 },
            },
            ticks: {
              precision: 0,
              padding: 8,
              color: '#6b7280', // TODO: Make dynamic
            },
            grid: {
              drawOnChartArea: false,
              color: 'rgba(243, 244, 246, 1)', // TODO: Make dynamic
            },
            border: {
              display: false,
            }
          }
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 20,
            bottom: 15
          }
        }
      };
    
    const newChartInstance = new Chart(ctx, {
      type: 'bar', // Base type, datasets specify their own
      data: {
        labels: filteredData.map(d => formatDate(d.date)),
        datasets: [
          {
            type: 'line' as const,
            label: 'Fundamental Value (€)',
            data: filteredData.map(d => d.fundamentalValue),
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            fill: false,
            yAxisID: 'y',
            order: 1,
          },
          {
            type: 'line' as const,
            label: 'Token Market Price (€)',
            data: filteredData.map(d => d.marketValue),
            borderColor: 'rgba(16, 185, 129, 1)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            fill: false,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'bar' as const,
            label: 'Trading Volume',
            data: showVolume ? filteredData.map(d => d.volume) : [], // Conditionally include volume data
            backgroundColor: 'rgba(209, 213, 219, 0.5)', // TODO: Dark mode color
            borderColor: 'rgba(209, 213, 219, 0.8)',
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.6,
            yAxisID: 'yVolume',
            order: 3,
            hidden: !showVolume // Also hide dataset if showVolume is false
          }
        ]
      },
      options: newChartOptions as any, // Cast options to any to avoid deep type issues
    });
    
    setChartInstance(newChartInstance);
    
    // Cleanup function
    return () => {
      if (newChartInstance) {
        newChartInstance.destroy();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, timeframe, showVolume]); // Re-run effect if these dependencies change

  return (
    <div className="relative" style={{ height: `${height}px` }}>
       {/* 
        * Note: This component currently uses a direct Chart.js implementation with useEffect.
        * Either use the ChartComponent wrapper OR the direct Chart.js approach, not both.
        * For now, we'll comment out the ChartComponent and keep the canvas for the direct approach.
        */}
       <canvas ref={chartRef}></canvas>
        
       {/* 
       <ChartComponent 
          type="bar"
          data={{
            labels: filteredData.map(d => formatDate(d.date)),
            datasets: [
              // ... configure datasets
            ]
          }}
          options={{
            // ... configure options
          }}
          height={height}
       />
       */}
      
      {/* Custom tooltip (kept logic, but might be redundant if Chart.js tooltip is sufficient) */}
      {tooltip.visible && (
        <div 
          className="absolute bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 p-3 z-50 w-64" // Added dark mode
          style={{ 
            left: tooltip.x > window.innerWidth / 2 ? tooltip.x - 270 : tooltip.x + 10, // Basic positioning
            top: tooltip.y - 80, // Adjust as needed
          }}
        >
          <div className="text-sm font-medium mb-2">
            {new Date(tooltip.date).toLocaleDateString(undefined, { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-600 dark:text-gray-400">Fundamental Value:</div>
            <div className="text-right font-medium text-blue-600 dark:text-blue-400">
              {formatCurrency(tooltip.fundamentalValue)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Market Value:</div>
            <div className="text-right font-medium text-green-600 dark:text-green-400">
              {formatCurrency(tooltip.marketValue)}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Premium/Discount:</div>
            <div className={`text-right font-medium ${getValueColor(tooltip.premium)}`}>
              {formatPercentage(tooltip.premium)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 