import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

type ROIChartProps = {
  roi5Years: number | null;
  roi10Years: number | null;
  yearlyYield: number | null;
};

const ROIChart = ({ roi5Years, roi10Years, yearlyYield }: ROIChartProps) => {
  // Prepare data for the chart
  const data = [
    {
      name: '5-Year ROI',
      value: roi5Years || 0,
      fill: '#3B82F6', // blue
    },
    {
      name: '10-Year ROI',
      value: roi10Years || 0,
      fill: '#8B5CF6', // purple
    },
    {
      name: 'Yearly Yield',
      value: yearlyYield || 0,
      fill: '#10B981', // green
    },
  ];

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded shadow-lg">
          <p className="text-sm font-medium">{`${label}: ${payload[0].value.toFixed(
            2
          )}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#CBD5E1' }}
            tickLine={false}
          />
          <YAxis
            unit="%"
            tick={{ fontSize: 12 }}
            axisLine={{ stroke: '#CBD5E1' }}
            tickLine={false}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ROIChart;
