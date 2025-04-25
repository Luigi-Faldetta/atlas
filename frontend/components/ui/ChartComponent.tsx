'use client';

import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { CategoryScale } from 'chart.js';

// Register CategoryScale to avoid errors
Chart.register(CategoryScale);

interface ChartComponentProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter';
  data: {
    labels: string[];
    datasets: any[];
  };
  options?: any;
  height?: number;
}

const ChartComponent = ({ 
  type, 
  data, 
  options = {}, 
  height = 400 
}: ChartComponentProps) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart instance
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type,
          data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            ...options
          },
        });
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div style={{ width: '100%', height: height }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default ChartComponent; 