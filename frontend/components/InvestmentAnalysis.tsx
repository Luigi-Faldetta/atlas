import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HomeIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import ScoreBreakdownChart from './ScoreBreakdownChart';
import InfoModal from './InfoModal';
import { useEffect } from 'react'; // Import useEffect for logging once

type InvestmentAnalysisProps = {
  investmentScore: number;
  roi5Years: number | null;
  roi10Years: number | null;
  yearlyYield: number | null;
  monthlyRentalIncome: number | null;
  expectedMonthlyIncome: number | null;
  yearlyAppreciationPercentage: number | null;
  yearlyAppreciationValue: number | null;
  strengths: string[];
  weaknesses: string[];
  price: string; // Raw price string from props (e.g., "1295000 €" or "€ 440.000 k.k.")
  address: string;
  pricePerSqm: number | null;
  // Score breakdown categories (optional, might come from AI or use defaults)
  riskScore?: number;
  yieldScore?: number;
  growthScore?: number;
  locationScore?: number;
  conditionScore?: number;
  // Property characteristics (optional)
  characteristics?: string[];
};

const getScoreColor = (score: number) => {
  if (score >= 70) return '#10B981'; // green
  if (score >= 50) return '#F59E0B'; // yellow/amber
  return '#EF4444'; // red
};

// --- UPDATED formatCurrency ---
const formatCurrency = (
  value: number | null,
  options?: Intl.NumberFormatOptions // Note: style and currency options here will be ignored
) => {
  if (value === null || value === undefined) return 'N/A';

  // 1. Format the number using 'decimal' style and 'nl-NL' locale
  const numberFormatter = new Intl.NumberFormat('nl-NL', {
    style: 'decimal',
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
  const formattedNumber = numberFormatter.format(value);

  // 2. Manually prepend the Euro sign with a space
  const finalOutput = `€ ${formattedNumber}`;
  // console.log(`formatCurrency Input: ${value}, Output: ${finalOutput}`); // Optional debug
  return finalOutput;
};

// --- UPDATED formatPercentage ---
const formatPercentage = (value: number | null) => {
  if (value === null || value === undefined) return 'N/A';

  const isInteger = Math.abs(value % 1) < 0.001;
  const minDigits = isInteger ? 0 : 1;
  const maxDigits = isInteger ? 0 : 1;

  const percentFormatter = new Intl.NumberFormat('nl-NL', {
    style: 'percent',
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  const decimalValue = value / 100;
  const finalOutput = percentFormatter.format(decimalValue);
  // console.log(`formatPercentage Input: ${value}, Output: ${finalOutput}`); // Optional debug
  return finalOutput;
};

const getCharacteristicColor = (characteristic: string) => {
  if (characteristic.includes('Growth') || characteristic.includes('Friendly'))
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  if (characteristic.includes('Demand'))
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  if (characteristic.includes('Limited') || characteristic.includes('Risk'))
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
};

const InvestmentAnalysis = ({
  investmentScore,
  roi5Years,
  roi10Years,
  yearlyYield,
  monthlyRentalIncome,
  expectedMonthlyIncome,
  yearlyAppreciationPercentage,
  yearlyAppreciationValue,
  strengths,
  weaknesses,
  price, // Raw price string from props
  address,
  pricePerSqm,
  riskScore = 6.1,
  yieldScore = 4.5,
  growthScore = 8.0,
  locationScore = 8.6,
  conditionScore = 9.1,
  characteristics = [],
}: InvestmentAnalysisProps) => {
  console.log('%%% RUNNING InvestmentAnalysis Component - VERSION CHECK %%%');

  // --- useEffect Debug Logs ---
  useEffect(() => {
    console.log('--- Running useEffect Debug Logs ---');
    try {
      // Test manual currency formatting
      const testValue = 12345.67;
      const numberFormatter = new Intl.NumberFormat('nl-NL', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      const formattedNumber = numberFormatter.format(testValue);
      const manualCurrency = `€ ${formattedNumber}`;
      console.log(
        `DEBUG (useEffect): Manual 'nl-NL' currency format for ${testValue}: ${manualCurrency}`
      );

      // Test percent formatting (integer)
      const testPercentValueInt = 22;
      const testPercentDecimalInt = testPercentValueInt / 100;
      const percentFormatterInt = new Intl.NumberFormat('nl-NL', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      console.log(
        `DEBUG (useEffect): 'nl-NL' percent format for ${testPercentValueInt}% (integer): ${percentFormatterInt.format(
          testPercentDecimalInt
        )}`
      );

      // Test percent formatting (float)
      const testPercentValueFloat = 5.6;
      const testPercentDecimalFloat = testPercentValueFloat / 100;
      const percentFormatterFloat = new Intl.NumberFormat('nl-NL', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
      console.log(
        `DEBUG (useEffect): 'nl-NL' percent format for ${testPercentValueFloat}% (float): ${percentFormatterFloat.format(
          testPercentDecimalFloat
        )}`
      );
    } catch (e) {
      console.error('DEBUG (useEffect): Error testing Intl.NumberFormat:', e);
    }
    console.log('--- Finished useEffect Debug Logs ---');
  }, []);
  // --- END DEBUG LOG LOCALE ---

  // --- Helper to parse number from price string ---
  const parsePriceString = (priceStr: string): number | null => {
    if (!priceStr) return null;
    // Remove currency symbols, thousands separators (dots/commas), extra text like 'k.k.'
    const cleanedStr = priceStr
      .replace(/€/g, '')
      .replace(/\./g, '') // Remove dots (used as thousands separators in some formats)
      .replace(/,/g, '.') // Replace comma with dot for decimal conversion (if any)
      .replace(/k\.k\./gi, '') // Remove 'k.k.' case-insensitive
      .trim();
    const match = cleanedStr.match(/^[0-9]+/); // Get leading numbers
    if (match && match[0]) {
      const num = parseFloat(match[0]);
      return isNaN(num) ? null : num;
    }
    return null;
  };
  // --- End Helper ---

  // Parse the price prop to get a number
  const numericPrice = parsePriceString(price);

  // Format the numeric price for display in the header (no decimals)
  const formattedHeaderPrice =
    numericPrice !== null
      ? formatCurrency(numericPrice, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
      : price; // Fallback to raw price string if parsing fails

  const scoreColor = getScoreColor(investmentScore);
  const weightedAverage = (investmentScore / 10).toFixed(1);
  const weightedAverageNumber = parseFloat(weightedAverage);
  const displayWeightedAverage = weightedAverage.replace('.', ',');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
      {/* Property Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <HomeIcon className="h-6 w-6 mr-2" />
              Property Analysis
            </h2>
            <p className="text-white/90 text-sm mb-1">{address}</p>
            {/* Use the formatted header price */}
            <p className="text-xl font-semibold">{formattedHeaderPrice}</p>
          </div>
          <div
            className="w-24 h-24"
            title={`Investment Score: ${investmentScore}/100`}
          >
            <CircularProgressbar
              value={investmentScore}
              text={`${investmentScore}`}
              strokeWidth={10}
              styles={buildStyles({
                textSize: '28px',
                pathColor: scoreColor,
                textColor: 'white',
                trailColor: 'rgba(255,255,255,0.3)',
              })}
            />
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Key Investment Metrics
          </h3>
        </div>

        {/* ROI Metrics */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center">
            Return on Investment
            <InfoModal
              title="Return on Investment Calculation"
              content={
                <div>
                  <p className="mb-1">ROI is calculated using the formula:</p>
                  <p className="font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded text-xs mb-1">
                    ROI = (Net Profit / Cost of Investment) × 100
                  </p>
                  <p>
                    Net Profit includes rental income and property appreciation
                    over the period, minus all expenses.
                  </p>
                </div>
              }
            />
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                5 Years
              </p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {formatPercentage(roi5Years)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                10 Years
              </p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {formatPercentage(roi10Years)}
              </p>
            </div>
          </div>
        </div>

        {/* Yield Metrics */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center">
            Yearly Yield
            <InfoModal
              title="Yearly Yield Calculation"
              content={
                <div>
                  <p className="mb-1">
                    Yearly Yield is calculated using the formula:
                  </p>
                  <p className="font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded text-xs mb-1">
                    Yield = (Annual Rental Income / Property Value) × 100
                  </p>
                  <p>
                    This represents the annual return as a percentage of the
                    property value.
                  </p>
                </div>
              }
            />
          </h4>
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {formatPercentage(yearlyYield)}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                Current Monthly Income
                <InfoModal
                  title="Current Monthly Income"
                  content="The current rental income based on comparable properties in the area."
                />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {monthlyRentalIncome
                  ? formatCurrency(monthlyRentalIncome)
                  : 'N/A'}
              </p>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                Expected Monthly Income
                <InfoModal
                  title="Expected Monthly Income"
                  content="The projected rental income after potential improvements and market adjustments."
                />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {expectedMonthlyIncome
                  ? formatCurrency(expectedMonthlyIncome)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Appreciation Metrics */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center">
            Yearly Appreciation
            <InfoModal
              title="Yearly Appreciation Calculation"
              content={
                <div>
                  <p className="mb-1">
                    Yearly Appreciation is calculated based on:
                  </p>
                  <ul className="list-disc pl-4 text-xs space-y-1">
                    <li>Historical property value trends in the area</li>
                    <li>Local economic growth forecasts</li>
                    <li>Planned infrastructure developments</li>
                    <li>Supply and demand dynamics in the neighborhood</li>
                  </ul>
                  <p className="mt-1">
                    The annual value is calculated by applying the percentage to
                    the property price.
                  </p>
                </div>
              }
            />
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {formatPercentage(yearlyAppreciationPercentage)}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Annual Rate
              </p>
            </div>
            <div className="h-8 border-r border-slate-300 dark:border-slate-600 mx-4"></div>
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-white">
                {yearlyAppreciationValue
                  ? formatCurrency(yearlyAppreciationValue)
                  : 'N/A'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Annual Value
              </p>
            </div>
          </div>
        </div>

        {/* Price per Square Meter */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center">
            <ScaleIcon className="h-4 w-4 mr-1.5" />
            Price per m²
            <InfoModal
              title="Price per Square Meter"
              content="Calculated by dividing the property price by the living area (in square meters)."
            />
          </h4>
          <p className="text-xl font-bold text-slate-800 dark:text-white">
            {pricePerSqm
              ? formatCurrency(pricePerSqm, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
              : 'N/A'}
          </p>
        </div>

        {/* Score Breakdown Chart */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200 flex items-center">
              Atlas AI Score Breakdown
              <InfoModal
                title="Atlas AI Score Breakdown"
                content={
                  <div>
                    <p className="mb-1">
                      The Atlas AI scoring system analyzes multiple factors to
                      provide a comprehensive property assessment. Scores are
                      calculated using a proprietary algorithm that evaluates:
                    </p>
                    <ul className="list-disc pl-4 text-xs space-y-1">
                      <li>Risk: Investment security and market stability</li>
                      <li>
                        Yield: Rental income potential relative to property
                        value
                      </li>
                      <li>Growth: Expected value appreciation over time</li>
                      <li>Location: Quality of neighborhood and amenities</li>
                      <li>
                        Condition: Property state and maintenance requirements
                      </li>
                    </ul>
                    <p className="mt-1">
                      Each category is scored out of 10. The average shown here
                      is derived directly from the overall Investment Score
                      (Score/10).
                    </p>
                  </div>
                }
              />
            </h4>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {displayWeightedAverage}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">
                /10
              </span>
            </div>
          </div>
          <ScoreBreakdownChart
            scores={{
              risk: riskScore,
              yield: yieldScore,
              growth: growthScore,
              location: locationScore,
              condition: conditionScore,
            }}
            weightedAverage={weightedAverageNumber}
          />
        </div>

        {/* Property Characteristics */}
        {characteristics && characteristics.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg col-span-1 md:col-span-2">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
              Property Characteristics
            </h4>
            <div className="flex flex-wrap gap-2">
              {characteristics.map((characteristic, index) => (
                <span
                  key={index}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCharacteristicColor(
                    characteristic
                  )}`}
                >
                  {characteristic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="flex items-center text-lg font-semibold text-green-600 dark:text-green-400 mb-3">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            Strengths
          </h3>
          <ul className="space-y-2">
            {strengths.map((strength, i) => (
              <li key={i} className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mr-2 flex-shrink-0 text-sm">
                  +
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {strength.replace(/^- /, '')}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="flex items-center text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
            <ArrowTrendingDownIcon className="h-5 w-5 mr-2" />
            Weaknesses
          </h3>
          <ul className="space-y-2">
            {weaknesses.map((weakness, i) => (
              <li key={i} className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 text-sm">
                  -
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  {weakness.replace(/^- /, '')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default InvestmentAnalysis;
