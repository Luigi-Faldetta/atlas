import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions, // Import ChartOptions
  ChartData, // Import ChartData
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  title: string;
  labels: string[];
  datasets: ChartData<'bar'>['datasets']; // Use ChartData type
  options?: ChartOptions<'bar'>; // Add options prop with type
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  labels,
  datasets,
  options,
}) => {
  const data = {
    labels,
    datasets,
  };

  // Merge default options with passed options
  const defaultOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  // Deep merge might be needed for complex options, but a simple spread often works
  const mergedOptions = { ...defaultOptions, ...options };

  return <Bar options={mergedOptions} data={data} />; // Pass merged options here
};

export default BarChart;
