'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvestmentAnalysis from '@/components/InvestmentAnalysis';
import { Calculator, Search, ArrowRight } from 'lucide-react';

type AnalysisResult = {
  error?: string;
  scraped_data?: {
    address: string;
    price: string;
    living_area: string;
    plot_size: string;
    bedrooms: string;
  };
  agent_analysis?: {
    investment_score: number; // 0-100 score
    roi_5_years: number | null; // ROI for 5 years
    roi_10_years: number | null; // ROI for 10 years
    yearly_yield: number | null; // Yearly yield percentage
    monthly_rental_income: number | null; // Monthly rental income
    yearly_appreciation_percentage: number | null; // Yearly appreciation percentage
    yearly_appreciation_value: number | null; // Yearly appreciation value in euros
    strengths: string[]; // Key strengths
    weaknesses: string[]; // Key weaknesses
  };
} | null;

export default function ToolsPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze the property.');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (error) {
      console.error(error);
      setAnalysisResult({ error: 'Failed to analyze the property.' });
    } finally {
      setLoading(false);
    }
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
                {/* URL Input Section */}
                <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-xl">
                  <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-white">
                    Analyze Property
                  </h2>
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        placeholder="Enter property URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full p-3 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                      {url && (
                        <button
                          onClick={() => setUrl('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleAnalyze}
                      disabled={loading || !url}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <span>Analyze Property</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                    Paste a property listing URL to analyze investment potential
                    using AI
                  </p>
                </div>

                {/* Results Section */}
                {analysisResult && (
                  <div className="mt-8 animate-fadeIn">
                    {analysisResult.error ? (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
                          ×
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
                            ?.monthly_rental_income || null
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
                      />
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="calculator" className="p-6 md:p-8">
              <div className="bg-slate-50 dark:bg-slate-700/30 p-6 rounded-xl text-center">
                <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-white">
                  ROI Calculator
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  Coming soon! This feature will allow you to manually calculate
                  ROI for any property.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

// Add this to your global CSS file
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
*/
