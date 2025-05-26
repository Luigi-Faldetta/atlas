'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvestmentAnalysis from '@/components/InvestmentAnalysis';
import ROICalculator from '@/components/ROICalculator';
import AnalysisProgressIndicator from '@/components/AnalysisProgressIndicator'; // Import the new component
import { Calculator, Search, ArrowRight } from 'lucide-react';

// Define the type for the analysis result, including potential errors
type AnalysisResult = {
  error?: string;
  scraped_data?: {
    address: string;
    price: string;
    living_area: string;
    bedrooms: string;
    bathrooms: string;
    year_built: string;
    price_per_sqm: number | null;
  };
  agent_analysis?: {
    investment_score: number;
    roi_5_years: number | null;
    roi_10_years: number | null;
    yearly_yield: number | null;
    monthly_rental_income: number | null;
    expected_monthly_income: number | null;
    yearly_appreciation_percentage: number | null;
    yearly_appreciation_value: number | null;
    strengths: string[];
    weaknesses: string[];
    characteristics?: string[];
    risk_score?: number;
    yield_score?: number;
    growth_score?: number;
    location_score?: number;
    condition_score?: number;
  };
} | null;

// Define the analysis stages
const ANALYSIS_STAGES = [
  'Fetching Property Details...',
  'Analyzing Investment Potential...',
  'Evaluating Market Trends...',
  'Generating Report...',
];

export default function PropertyAnalysisPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0); // State for current stage index

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;

  // Function to simulate delay for visual effect
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleAnalyze = async () => {
    console.log('handleAnalyze function started!');
    setLoading(true);
    setAnalysisResult(null); // Reset result/error
    setCurrentStageIndex(0); // Start from the first stage

    if (!API_BASE) {
      console.error(
        'Error: NEXT_PUBLIC_API_URL environment variable is not set.'
      );
      setAnalysisResult({
        error:
          'API endpoint is not configured. Please check environment variables.',
      });
      setLoading(false);
      return;
    }

    try {
      // Stage 0: Fetching
      setCurrentStageIndex(0);
      console.log(`Attempting to fetch analysis from ${API_BASE}/analyze...`);
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      console.log('Fetch response status:', response.status);

      if (!response.ok) {
        let errorDetail = 'Failed to analyze the property.';
        try {
          const errorData = await response.json();
          if (errorData && errorData.detail) errorDetail = errorData.detail;
        } catch (jsonError) {
          console.warn('Could not parse error response JSON:', jsonError);
        }
        throw new Error(errorDetail);
      }

      // Stage 1: Analyzing (Simulated Delay)
      setCurrentStageIndex(1);
      await wait(1000); // Simulate analysis time

      // Stage 2: Evaluating (Simulated Delay)
      setCurrentStageIndex(2);
      await wait(1500); // Simulate evaluation time

      // Stage 3: Generating Report
      setCurrentStageIndex(3);
      console.log('Attempting to parse response JSON...');
      const data = await response.json();

      // --- Data processing (as before) ---
      if (
        data.agent_analysis &&
        data.agent_analysis.monthly_rental_income &&
        !data.agent_analysis.expected_monthly_income
      ) {
        data.agent_analysis.expected_monthly_income =
          data.agent_analysis.monthly_rental_income * 1.1;
      }
      if (data.agent_analysis && !data.agent_analysis.characteristics) {
        data.agent_analysis.characteristics = determineCharacteristics(
          data.agent_analysis
        );
      }
      if (data.agent_analysis && !data.agent_analysis.risk_score) {
        const scores = generateScoreBreakdown(
          data.agent_analysis.investment_score
        );
        data.agent_analysis = { ...data.agent_analysis, ...scores };
      }
      // --- End Data processing ---

      await wait(500); // Simulate report generation time

      console.log('Analysis result:', data);
      setAnalysisResult(data);
      setCurrentStageIndex(ANALYSIS_STAGES.length); // Mark as completed
    } catch (error: any) {
      console.error('Error during analysis fetch:', error);
      setAnalysisResult({
        error: error.message || 'Failed to analyze the property.',
      });
    } finally {
      setLoading(false); // Stop loading indicator only after everything (success or error)
    }
  };

  // Helper functions (determineCharacteristics, generateScoreBreakdown, createSampleAnalysis) remain the same...
  // Helper function to determine property characteristics based on analysis
  const determineCharacteristics = (analysis: any) => {
    const characteristics = [];

    if (
      analysis.yearly_appreciation_percentage &&
      analysis.yearly_appreciation_percentage > 3
    ) {
      characteristics.push('Stable Growth');
    }

    if (analysis.strengths) {
      if (
        analysis.strengths.some((s: string) =>
          s.toLowerCase().includes('location')
        )
      ) {
        characteristics.push('Prime Location');
      }

      if (
        analysis.strengths.some(
          (s: string) =>
            s.toLowerCase().includes('energy') ||
            s.toLowerCase().includes('sustainable')
        )
      ) {
        characteristics.push('Eco Friendly');
      }
    }

    if (analysis.yearly_yield && analysis.yearly_yield > 5) {
      characteristics.push('High Yield');
    } else if (analysis.yearly_yield && analysis.yearly_yield > 3) {
      characteristics.push('Moderate Yield');
    }

    if (analysis.weaknesses) {
      if (
        analysis.weaknesses.some(
          (w: string) =>
            w.toLowerCase().includes('supply') ||
            w.toLowerCase().includes('availability')
        )
      ) {
        characteristics.push('Limited Supply');
      }

      if (
        analysis.weaknesses.some((w: string) =>
          w.toLowerCase().includes('demand')
        )
      ) {
        characteristics.push('High Demand');
      }
    }

    // Ensure we have at least some characteristics
    if (characteristics.length < 2) {
      characteristics.push('Residential Property');
    }

    return characteristics;
  };

  // Helper function to generate score breakdown based on investment score
  const generateScoreBreakdown = (investmentScore: number) => {
    // Scale the investment score (0-100) to weighted average (0-10)
    const weightedAverage = investmentScore / 10;

    // Generate individual scores with some variation
    const variation = () => Math.random() * 2 - 1; // Random value between -1 and 1

    // Ensure scores are within 1-10 range
    const clampScore = (score: number) => Math.min(10, Math.max(1, score));

    return {
      risk_score: clampScore(weightedAverage * 0.8 + variation()),
      yield_score: clampScore(weightedAverage * 0.9 + variation()),
      growth_score: clampScore(weightedAverage * 1.1 + variation()),
      location_score: clampScore(weightedAverage * 1.0 + variation()),
      condition_score: clampScore(weightedAverage * 1.0 + variation()),
    };
  };

  // For testing/debugging - create a sample analysis result
  const createSampleAnalysis = () => {
    const sampleScore = 75;
    const scores = generateScoreBreakdown(sampleScore);

    setAnalysisResult({
      scraped_data: {
        address: 'Aragohof 4-1, 1098 RR Amsterdam',
        price: '€ 535.000 k.k.',
        living_area: '68 m²',
        bedrooms: '3',
        bathrooms: '1', // Added sample
        year_built: '1960', // Added sample
        price_per_sqm: 535000 / 68, // Added sample calculation
      },
      agent_analysis: {
        investment_score: sampleScore,
        roi_5_years: 18.0,
        roi_10_years: 42.5,
        yearly_yield: 3.5,
        monthly_rental_income: 1500,
        expected_monthly_income: 1650,
        yearly_appreciation_percentage: 3.2,
        yearly_appreciation_value: 17120,
        strengths: [
          'Prime location in a popular neighborhood',
          'Good public transport connections',
          'Recently renovated property',
        ],
        weaknesses: [
          'Limited parking options in the area',
          'Higher price per square meter than average',
          'Potential noise from nearby main road',
        ],
        characteristics: ['Stable Growth', 'Prime Location', 'High Demand'],
        ...scores,
      },
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
            Atlas Investment Tools
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
            Analyze properties and calculate potential returns on your real
            estate investments with AI-powered insights.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <Tabs defaultValue="webscraper" className="w-full">
            <div className="border-b border-slate-200 dark:border-slate-700">
              <TabsList className="flex w-full bg-transparent p-0">
                {/* TabsTriggers remain the same */}
                <TabsTrigger
                  value="webscraper"
                  className="flex-1 py-4 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Property Analyzer</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="calculator"
                  className="flex-1 py-4 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 transition-all"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Calculator className="h-4 w-4" />
                    <span>ROI Calculator</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="webscraper" className="p-6 md:p-8">
              <div className="space-y-6">
                {/* URL Input Section - Conditionally render based on loading state */}
                {!loading && (
                  <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-xl">
                    <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
                      Analyze Property
                    </h2>
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          placeholder="Enter property URL (Funda, Idealista, Fotocasa, Habitaclia)"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="w-full p-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        {url && (
                          <button
                            onClick={() => setUrl('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            aria-label="Clear URL input"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <button
                        onClick={handleAnalyze}
                        disabled={!url} // Only disable if no URL
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Analyze Property</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex justify-between mt-3">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Paste a property listing URL to analyze investment
                        potential using AI
                      </p>
                      <button
                        onClick={createSampleAnalysis}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Use sample data
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading Indicator Section */}
                {loading && (
                  <div className="mt-8">
                    <AnalysisProgressIndicator
                      stages={ANALYSIS_STAGES}
                      currentStageIndex={currentStageIndex}
                    />
                  </div>
                )}

                {/* Results Section - Render only when not loading */}
                {!loading && analysisResult && (
                  <div className="mt-8 animate-fadeIn">
                    {analysisResult.error ? (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">
                          Analysis Failed
                        </h3>
                        <p className="text-red-600 dark:text-red-300">
                          {analysisResult.error}
                        </p>
                      </div>
                    ) : (
                      <InvestmentAnalysis
                        investmentScore={
                          analysisResult.agent_analysis?.investment_score || 0
                        }
                        roi5Years={
                          analysisResult.agent_analysis?.roi_5_years || null
                        }
                        roi10Years={
                          analysisResult.agent_analysis?.roi_10_years || null
                        }
                        yearlyYield={
                          analysisResult.agent_analysis?.yearly_yield || null
                        }
                        monthlyRentalIncome={
                          analysisResult.agent_analysis
                            ?.monthly_rental_income || null
                        }
                        expectedMonthlyIncome={
                          analysisResult.agent_analysis
                            ?.expected_monthly_income || null
                        }
                        yearlyAppreciationPercentage={
                          analysisResult.agent_analysis
                            ?.yearly_appreciation_percentage || null
                        }
                        yearlyAppreciationValue={
                          analysisResult.agent_analysis
                            ?.yearly_appreciation_value || null
                        }
                        strengths={
                          analysisResult.agent_analysis?.strengths || []
                        }
                        weaknesses={
                          analysisResult.agent_analysis?.weaknesses || []
                        }
                        price={
                          analysisResult.scraped_data?.price || 'Not available'
                        }
                        address={
                          analysisResult.scraped_data?.address ||
                          'Not available'
                        }
                        pricePerSqm={
                          analysisResult.scraped_data?.price_per_sqm ?? null
                        }
                        characteristics={
                          analysisResult.agent_analysis?.characteristics
                        }
                        riskScore={analysisResult.agent_analysis?.risk_score}
                        yieldScore={analysisResult.agent_analysis?.yield_score}
                        growthScore={
                          analysisResult.agent_analysis?.growth_score
                        }
                        locationScore={
                          analysisResult.agent_analysis?.location_score
                        }
                        conditionScore={
                          analysisResult.agent_analysis?.condition_score
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ROI Calculator Tab Content */}
            <TabsContent value="calculator" className="p-6 md:p-8">
              <ROICalculator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

// Add this to your global CSS file if you haven't already
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
*/
