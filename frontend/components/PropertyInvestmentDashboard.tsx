import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Assuming Select is used elsewhere or will be
import { Slider } from '@/components/ui/slider'; // Assuming Slider is used elsewhere or will be
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Assuming Card is used elsewhere or will be
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Assuming Tabs is used elsewhere or will be
import {
  Table,
  TableBody,
  TableCell, // Add TableCell here
  TableHead,
  TableHeader,
  TableRow, // Add TableRow here
} from '@/components/ui/table';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  TooltipProps,
} from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'; // Import types for Tooltip formatter

// --- Interfaces ---
interface PropertyOption {
  id: string;
  name: string;
  location: string;
  value: number;
  rentalIncomePerMonth: number;
  image: string;
  highlights: string[];
}

interface ChartDataPoint {
  year: number;
  propertyValue: number;
  yourEquityValue: number;
  cumulativeRentalIncome: number;
  totalReturn: number;
  totalReturnPercentage: number;
}

const PropertyInvestmentDashboard = () => {
  // --- Mock Property Data ---
  const propertyOptions: PropertyOption[] = [
    {
      id: 'propertyA',
      name: 'Seaside Villa',
      location: 'Costa del Sol, Spain',
      value: 350000,
      rentalIncomePerMonth: 2800,
      image:
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1074&auto=format&fit=crop',
      highlights: ['Beachfront', '4 bedrooms', '180m²'],
    },
    {
      id: 'propertyB',
      name: 'City Apartment',
      location: 'Amsterdam, Netherlands',
      value: 220000,
      rentalIncomePerMonth: 1650,
      image:
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1170&auto=format&fit=crop',
      highlights: ['Central location', '2 bedrooms', '75m²'],
    },
    {
      id: 'propertyC',
      name: 'Mountain Chalet',
      location: 'Swiss Alps',
      value: 480000,
      rentalIncomePerMonth: 3500,
      image:
        // Using a different image URL as the one provided might be invalid or removed
        'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1065&auto=format&fit=crop',
      highlights: ['Ski-in/ski-out', '5 bedrooms', '210m²'],
    },
  ];

  // --- Constants ---
  const FIXED_YEARS = 10;
  const FIXED_APPRECIATION_RATE = 3.4;

  // --- State Variables ---
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    propertyOptions[0]?.id ?? ''
  );
  const [ownershipPercentage, setOwnershipPercentage] = useState<number>(10);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]); // Explicitly type chartData state
  const [activeTab, setActiveTab] = useState<string>('chart');

  // Get the selected property safely
  const selectedProperty = propertyOptions.find(
    (property) => property.id === selectedPropertyId
  );

  // Calculate all values based on selected property, handling potential undefined
  const propertyValue = selectedProperty?.value ?? 0;
  const rentalIncomePerMonth = selectedProperty?.rentalIncomePerMonth ?? 0;
  const yourInvestment = propertyValue * (ownershipPercentage / 100);
  const yourRentalIncomePerMonth =
    rentalIncomePerMonth * (ownershipPercentage / 100);
  const yourRentalIncomePerYear = yourRentalIncomePerMonth * 12;
  // Handle division by zero if yourInvestment is 0
  const roi =
    yourInvestment > 0 ? (yourRentalIncomePerYear / yourInvestment) * 100 : 0;

  // Generate chart data
  useEffect(() => {
    // Ensure selectedProperty exists before proceeding
    if (!selectedProperty) {
      setChartData([]); // Clear chart data if no property is selected
      return;
    }

    // Use values directly from the found selectedProperty inside the effect
    const currentPropValue = selectedProperty.value;
    const currentRentalIncome = selectedProperty.rentalIncomePerMonth;
    // Recalculate investment and rental based on current state inside effect
    const currentInvestment = currentPropValue * (ownershipPercentage / 100);
    const currentRentalPerYear =
      currentRentalIncome * (ownershipPercentage / 100) * 12;

    const data: ChartDataPoint[] = [];
    let iteratingPropertyValue = currentPropValue;
    let cumulativeRentalIncome = 0;

    for (let year = 0; year <= FIXED_YEARS; year++) {
      const yearPropertyValue =
        year === 0 ? currentPropValue : iteratingPropertyValue;
      const yourEquityValue = yearPropertyValue * (ownershipPercentage / 100);
      const yearRentalIncome = year === 0 ? 0 : currentRentalPerYear;

      cumulativeRentalIncome += yearRentalIncome;

      // Ensure currentInvestment is not zero before calculating percentages
      const totalReturn =
        yourEquityValue + cumulativeRentalIncome - currentInvestment;
      const totalReturnPercentage =
        currentInvestment > 0 ? (totalReturn / currentInvestment) * 100 : 0;

      data.push({
        year,
        propertyValue: parseFloat(yearPropertyValue.toFixed(2)),
        yourEquityValue: parseFloat(yourEquityValue.toFixed(2)),
        cumulativeRentalIncome: parseFloat(cumulativeRentalIncome.toFixed(2)),
        totalReturn: parseFloat(totalReturn.toFixed(2)),
        totalReturnPercentage: parseFloat(totalReturnPercentage.toFixed(2)),
      });

      // Calculate next year's property value
      iteratingPropertyValue =
        iteratingPropertyValue * (1 + FIXED_APPRECIATION_RATE / 100);
    }

    setChartData(data);
    // Correct dependencies: depend on state that triggers recalculation
  }, [selectedPropertyId, ownershipPercentage]);

  // Format numbers with thousand separators and decimal places
  const formatNumber = (
    num: number | undefined | null,
    decimals = 0
  ): string => {
    if (typeof num !== 'number' || isNaN(num)) {
      return 'N/A';
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Custom Tooltip Component for Type Safety
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      // No need to assert payload type here, as payload items are handled individually
      return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow-lg border border-slate-200 dark:border-slate-700 opacity-95">
          <p className="font-bold text-slate-900 dark:text-white mb-2">{`Year ${label}`}</p>
          {payload.map((pld) => {
            // Check if pld.name is a string before using .includes()
            const isPercentage =
              typeof pld.name === 'string' && pld.name.includes('%');
            const formattedValue =
              typeof pld.value === 'number'
                ? isPercentage
                  ? formatNumber(pld.value, 2) + '%'
                  : '€' + formatNumber(pld.value, 0) // Default to currency if not percentage
                : pld.value; // Handle cases where value might not be a number

            return (
              <p
                key={pld.dataKey || pld.name}
                style={{ color: pld.color }}
                className="text-sm"
              >
                {`${pld.name}: ${formattedValue}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    // Added dark mode classes to the main container
    <div className="p-6 max-w-5xl mx-auto bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800">
      <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white text-center">
        Property Investment Calculator
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-center mb-8 max-w-3xl mx-auto">
        Select a property and choose your ownership percentage to see your
        potential returns over {FIXED_YEARS} years.
      </p>

      {/* Property Selection Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {propertyOptions.map((property) => (
          <div
            key={property.id}
            onClick={() => setSelectedPropertyId(property.id)}
            className={`
              relative overflow-hidden group cursor-pointer transition-all duration-300 transform hover:-translate-y-1
              rounded-xl border-2 ${
                selectedPropertyId === property.id
                  ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-lg'
                  : 'border-slate-200 dark:border-slate-700 shadow hover:shadow-md' // Added hover shadow
              }
            `}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/5 z-10"></div>
              {/* Using next/image for optimization */}
              <img
                src={property.image}
                alt={property.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                // Consider adding width/height or using next/image if optimization needed
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <h3 className="text-white text-xl font-bold">
                  {property.name}
                </h3>
                <p className="text-white/90 text-sm">{property.location}</p>
              </div>

              {selectedPropertyId === property.id && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white p-1 rounded-full z-20 shadow">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-slate-800">
              <div className="flex justify-between items-start mb-2">
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  €{formatNumber(property.value)}
                </div>
                <div className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                  €{formatNumber(property.rentalIncomePerMonth)}/mo
                </div>
              </div>

              <div className="flex gap-2 flex-wrap mt-2">
                {property.highlights.map((highlight, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ownership Percentage Slider */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 mb-10">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-base font-medium text-slate-700 dark:text-slate-300">
            Your Ownership (%)
          </label>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {ownershipPercentage}%
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="100"
          value={ownershipPercentage}
          onChange={(
            e: React.ChangeEvent<HTMLInputElement> // Added event type
          ) => setOwnershipPercentage(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500" // Added dark mode accent
        />

        <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
          <span>1%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                Your Investment
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                €{formatNumber(yourInvestment)}
              </span>
            </div>
            <div className="h-10 border-r border-blue-200 dark:border-blue-700/50 hidden md:block"></div>
            <div>
              <span className="block text-sm font-medium text-slate-500 dark:text-slate-400">
                Monthly Rental Income
              </span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                €{formatNumber(yourRentalIncomePerMonth, 2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl shadow-md text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)]"
            style={{ backgroundSize: '10px 10px' }}
          ></div>
          <span className="block text-sm font-medium text-blue-100 mb-1">
            Your Investment
          </span>
          <span className="text-2xl font-bold">
            €{formatNumber(yourInvestment)}
          </span>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-5 rounded-xl shadow-md text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)]"
            style={{ backgroundSize: '10px 10px' }}
          ></div>
          <span className="block text-sm font-medium text-amber-100 mb-1">
            Monthly Rental
          </span>
          <span className="text-2xl font-bold">
            €{formatNumber(yourRentalIncomePerMonth, 2)}
          </span>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-xl shadow-md text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)]"
            style={{ backgroundSize: '10px 10px' }}
          ></div>
          <span className="block text-sm font-medium text-emerald-100 mb-1">
            Annual ROI
          </span>
          <span className="text-2xl font-bold">{formatNumber(roi, 2)}%</span>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl shadow-md text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)]"
            style={{ backgroundSize: '10px 10px' }}
          ></div>
          <span className="block text-sm font-medium text-purple-100 mb-1">
            {FIXED_YEARS}-Year Return %
          </span>
          <span className="text-2xl font-bold">
            {/* Safely access chartData with optional chaining */}
            {formatNumber(
              chartData[FIXED_YEARS]?.totalReturnPercentage ?? 0,
              2
            )}
            %
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-slate-200 dark:border-slate-700">
        <button
          className={`px-4 py-2 font-medium transition-colors duration-150 ${
            // Added transition
            activeTab === 'chart'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border-b-2 border-transparent' // Added transparent border for layout consistency
          }`}
          onClick={() => setActiveTab('chart')}
        >
          Chart View
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors duration-150 ${
            // Added transition
            activeTab === 'table'
              ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 border-b-2 border-transparent' // Added transparent border
          }`}
          onClick={() => setActiveTab('table')}
        >
          Table View
        </button>
      </div>

      {/* Charts & Table Container */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 min-h-[400px]">
        {' '}
        {/* Added min-height */}
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          {FIXED_YEARS}-Year Return Projection
        </h2>
        {activeTab === 'chart' ? (
          <div className="h-96 mb-8">
            {' '}
            {/* Ensure chart container has height */}
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id="colorEquity"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#8884d8"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorRental"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#82ca9d"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    {/* Removed unused colorReturn gradient */}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />{' '}
                  {/* Use CSS variable */}
                  <XAxis
                    dataKey="year"
                    label={{
                      value: 'Year',
                      position: 'insideBottomRight',
                      offset: -5,
                      fill: 'hsl(var(--muted-foreground))', // Use CSS variable
                    }}
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12,
                    }} // Use CSS variable
                    tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    yAxisId="left" // Keep ID for clarity
                    label={{
                      value: 'Value (€)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: 'hsl(var(--muted-foreground))', // Use CSS variable
                      style: { textAnchor: 'middle' },
                    }}
                    tickFormatter={(value) => `€${formatNumber(value / 1000)}k`} // Format ticks
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12,
                    }} // Use CSS variable
                    tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    // domain={[0, 'dataMax + 10']} // Auto domain often works better
                    label={{
                      value: 'Return (%)',
                      angle: 90,
                      position: 'insideRight',
                      fill: 'hsl(var(--muted-foreground))', // Use CSS variable
                      style: { textAnchor: 'middle' },
                    }}
                    tickFormatter={(value) => `${formatNumber(value, 0)}%`} // Format ticks
                    tick={{
                      fill: 'hsl(var(--muted-foreground))',
                      fontSize: 12,
                    }} // Use CSS variable
                    tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: 'hsl(var(--accent))', fillOpacity: 0.3 }}
                  />{' '}
                  {/* Use CSS variable */}
                  <Legend
                    wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="yourEquityValue"
                    name="Your Equity Value"
                    stroke="#8884d8"
                    fill="url(#colorEquity)"
                    activeDot={{ r: 6 }} // Slightly smaller active dot
                    dot={false} // Hide dots by default
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="cumulativeRentalIncome"
                    name="Cumulative Rental Income"
                    stroke="#82ca9d"
                    fill="url(#colorRental)"
                    dot={false} // Hide dots by default
                  />
                  {/* Removed the separate Line for totalReturn as it's implied by the stacked areas */}
                  <Line
                    yAxisId="right" // Ensure this uses the right axis
                    type="monotone"
                    dataKey="totalReturnPercentage"
                    name="Total Return (%)"
                    stroke="#ef4444" // Red color for percentage line
                    strokeWidth={2} // Thinner line
                    dot={{ r: 3, strokeWidth: 1, fill: '#ef4444' }} // Smaller dots
                    activeDot={{ r: 5, strokeWidth: 1 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                Select property and ownership to generate chart.
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 sticky left-0 bg-slate-50 dark:bg-slate-700">
                    {' '}
                    {/* Sticky Year */}
                    Year
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Property Value
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Your Equity
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Cumulative Rental
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Total Return (€)
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Total Return (%)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {chartData.length > 0 ? (
                  chartData.map((data) => (
                    <tr
                      key={data.year}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" // Adjusted dark hover
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-200 sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-700/50">
                        {' '}
                        {/* Sticky Year */}
                        {data.year}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-slate-600 dark:text-slate-300">
                        €{formatNumber(data.propertyValue)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-slate-600 dark:text-slate-300">
                        €{formatNumber(data.yourEquityValue)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-slate-600 dark:text-slate-300">
                        €{formatNumber(data.cumulativeRentalIncome)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-blue-600 dark:text-blue-400">
                        €{formatNumber(data.totalReturn)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium text-amber-600 dark:text-amber-400">
                        {formatNumber(data.totalReturnPercentage, 2)}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-slate-500 dark:text-slate-400"
                    >
                      No data available. Select property and ownership.
                    </TableCell>
                  </TableRow>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyInvestmentDashboard;
