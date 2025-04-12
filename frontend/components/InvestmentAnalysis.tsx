import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HomeIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import ScoreBreakdownChart from './ScoreBreakdownChart';
import InfoModal from './InfoModal';

type InvestmentAnalysisProps = {
  investmentScore: number;
  roi5Years: number | null;
  roi10Years: number | null;
  yearlyYield: number | null;
  monthlyRentalIncome: number | null;
  expectedMonthlyIncome: number | null; // Added expected monthly income
  yearlyAppreciationPercentage: number | null;
  yearlyAppreciationValue: number | null;
  strengths: string[];
  weaknesses: string[];
  price: string;
  address: string;
  // Score breakdown categories
  riskScore?: number;
  yieldScore?: number;
  growthScore?: number;
  locationScore?: number;
  conditionScore?: number;
};

const getScoreColor = (score: number) => {
  if (score >= 70) return '#10B981'; // green
  if (score >= 50) return '#F59E0B'; // yellow/amber
  return '#EF4444'; // red
};

const formatCurrency = (value: number | null) => {
  if (value === null) return 'N/A';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
};

const formatPercentage = (value: number | null) => {
  if (value === null) return 'N/A';
  return `${value.toFixed(2)}%`;
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
  price,
  address,
  riskScore = 6.1,
  yieldScore = 4.5,
  growthScore = 8.0,
  locationScore = 8.6,
  conditionScore = 9.1,
}: InvestmentAnalysisProps) => {
  const scoreColor = getScoreColor(investmentScore);
  const weightedAverage = (
    (riskScore + yieldScore + growthScore + locationScore + conditionScore) /
    5
  ).toFixed(1);

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
            <p className="text-xl font-semibold">{price}</p>
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
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                Current Monthly Income
                <InfoModal
                  title="Current Monthly Income"
                  content="The current rental income based on comparable properties in the area."
                />
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {monthlyRentalIncome
                  ? formatCurrency(monthlyRentalIncome)
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                Expected Monthly Income
                <InfoModal
                  title="Expected Monthly Income"
                  content="The projected rental income after potential improvements and market adjustments."
                />
              </p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {expectedMonthlyIncome
                  ? formatCurrency(expectedMonthlyIncome)
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Appreciation Metrics */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg col-span-1 md:col-span-2">
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

        {/* Score Breakdown Chart */}
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
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
                      Each category is scored out of 10, with the weighted
                      average providing an overall investment score.
                    </p>
                  </div>
                }
              />
            </h4>
          </div>
          <ScoreBreakdownChart
            scores={{
              risk: riskScore,
              yield: yieldScore,
              growth: growthScore,
              location: locationScore,
              condition: conditionScore,
            }}
            weightedAverage={parseFloat(weightedAverage)}
          />
        </div>
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
                  {strength}
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
                  {weakness}
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
