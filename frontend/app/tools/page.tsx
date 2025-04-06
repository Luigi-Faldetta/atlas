'use client';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvestmentAnalysis from '@/components/InvestmentAnalysis';
import { Calculator, Search } from 'lucide-react';

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
    roi: number | null; // ROI percentage
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
    <main className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
          Atlas Investment Tools
        </h1>
        <p className="text-lg mb-8 text-slate-600 dark:text-slate-300">
          Analyze properties and calculate potential returns on your real estate
          investments.
        </p>

        <Tabs defaultValue="webscraper" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="webscraper" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Property Analyzer
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              ROI Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webscraper">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter property URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <button
                onClick={handleAnalyze}
                className="px-4 py-2 bg-blue-500 text-white rounded"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Property'}
              </button>
              {analysisResult && (
                <div className="mt-4">
                  {analysisResult.error ? (
                    <p className="text-red-500">{analysisResult.error}</p>
                  ) : (
                    <InvestmentAnalysis
                      investmentScore={
                        analysisResult.agent_analysis?.investment_score || 0
                      }
                      roi={analysisResult.agent_analysis?.roi || null}
                      strengths={analysisResult.agent_analysis?.strengths || []}
                      weaknesses={
                        analysisResult.agent_analysis?.weaknesses || []
                      }
                      price={
                        analysisResult.scraped_data?.price || 'Not available'
                      }
                      address={
                        analysisResult.scraped_data?.address || 'Not available'
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="calculator">
            <p>ROI Calculator will go here.</p>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
