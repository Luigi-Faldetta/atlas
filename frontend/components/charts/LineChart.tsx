import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions, // Import ChartOptions
  ChartData, // Import ChartData
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  title: string;
  labels: string[];
  datasets: ChartData<'line'>['datasets']; // Use ChartData type
  options?: ChartOptions<'line'>; // Add options prop with type
}

const LineChart: React.FC<LineChartProps> = ({
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
  const defaultOptions: ChartOptions<'line'> = {
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

  return <Line options={mergedOptions} data={data} />; // Pass merged options here
};

export default LineChart;
