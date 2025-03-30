'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Search,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PropertyData {
  propertyAddress: string;
  marketTrends: {
    priceHistory: Array<{ date: string; price: number }>;
    rentalYield: number;
    areaGrowth: number;
    similarProperties: Array<{
      address: string;
      price: number;
      sqft: number;
      pricePerSqft: number;
    }>;
  };
  locationAnalysis: {
    walkScore: number;
    transitScore: number;
    crimeRate: string;
  };
  financialMetrics: {
    purchasePrice: number;
    estimatedMonthlyRent: number;
    netOperatingIncome: number;
    capRate: number;
    cashOnCashReturn: number;
    appreciationForecast: number;
  };
  riskAssessment: {
    overall: string;
    score: number;
  };
  atlasScore?: number;
  aiAnalysis?: string;
  source?: {
    platform: string;
    url: string;
    scrapedAt: string;
  };
}

export default function WebScraper() {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('idealista');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [useMockData, setUseMockData] = useState(false);
  const [isRealData, setIsRealData] = useState(false);
  const [scraperInfo, setScraperInfo] = useState('');

  // URL validation function
  const validateUrl = (inputUrl: string) => {
    if (!inputUrl) {
      setUrlError('');
      return false;
    }

    const platformUrls = {
      idealista: /^https?:\/\/(www\.)?idealista\.(com|es|pt|it)/i,
      fotocasa: /^https?:\/\/(www\.)?fotocasa\.(es|com)/i,
      habitaclia: /^https?:\/\/(www\.)?habitaclia\.(com|es)/i,
    };

    const selectedPlatformRegex =
      platformUrls[platform as keyof typeof platformUrls];

    if (!selectedPlatformRegex.test(inputUrl)) {
      setUrlError(
        `Please enter a valid ${platform} URL. Example: https://www.${platform}.com/property`
      );
      return false;
    } else {
      setUrlError('');
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !useMockData) {
      setError('Please enter a property URL');
      return;
    }

    // Validate URL if not using mock data
    if (!useMockData && !validateUrl(url)) {
      return;
    }

    setLoading(true);
    setError('');
    setPropertyData(null);
    setAnalysisStep(1);
    setScraperInfo('');
    setIsRealData(false);

    try {
      // Simulate analysis steps
      await simulateAnalysisSteps();

      const token = localStorage.getItem('atlas_token'); // Use atlas_token
      console.log('Retrieved token:', token); // Debugging
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      // Make actual API call
      const response = await fetch('/api/webscraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Pass the token here
        },
        body: JSON.stringify({
          url,
          platform,
          useMockData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze property');
      }

      const result = await response.json();

      // Check if we're using real or fallback/mock data
      const isFallback = Boolean(result.data.isFallback);
      const isMockData = useMockData || isFallback;

      setIsRealData(!isMockData);

      if (isFallback) {
        setScraperInfo(
          'The scraper service is currently unavailable. Using fallback data for demonstration purposes.'
        );
      } else if (useMockData) {
        setScraperInfo(
          'Using demo data as requested. For real analysis, uncheck "Use demo data" and enter a valid property URL.'
        );
      } else {
        setScraperInfo(
          `Real property data successfully scraped from ${platform} at ${new Date().toLocaleString()}`
        );
      }

      // Extract property data, handling both nested and non-nested structures
      const propertyData = result.data.propertyDetails || result.data;
      setPropertyData(propertyData);
      setAnalysisStep(5); // Complete
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setAnalysisStep(0);
    } finally {
      setLoading(false);
    }
  };

  const simulateAnalysisSteps = async () => {
    // Simulate multiple steps of analysis
    const steps = [
      'Extracting property data...',
      'Analyzing market trends...',
      'Evaluating financial metrics...',
      'Calculating Atlas score...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setAnalysisStep(i + 1);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
        AI Property Analyzer
      </h2>
      <p className="mb-6 text-slate-600 dark:text-slate-300">
        Enter a property listing URL from a Spanish real estate website to
        analyze it using our AI model.
      </p>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Enter property URL..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (e.target.value) validateUrl(e.target.value);
              }}
              className="w-full"
              disabled={loading}
              style={{
                borderColor: urlError
                  ? 'red'
                  : url && !urlError
                  ? 'green'
                  : undefined,
              }}
            />
            {urlError && (
              <div className="text-red-500 text-sm mt-1">{urlError}</div>
            )}
          </div>
          <Button
            type="submit"
            disabled={loading || (!useMockData && (urlError !== '' || !url))}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Property
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
              Platform
            </label>
            <Select
              value={platform}
              onValueChange={setPlatform}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idealista">Idealista</SelectItem>
                <SelectItem value="fotocasa">Fotocasa</SelectItem>
                <SelectItem value="habitaclia">Habitaclia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="useMockData"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={useMockData}
              onChange={(e) => setUseMockData(e.target.checked)}
              disabled={loading}
            />
            <label
              htmlFor="useMockData"
              className="text-sm text-slate-600 dark:text-slate-400"
            >
              Use demo data (when backend is unavailable)
            </label>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-6">
          <div className="space-y-2">
            <p className="text-slate-600 dark:text-slate-300 flex items-center">
              {analysisStep >= 1 &&
                (analysisStep > 1 ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-500" />
                ))}
              Extracting property data
            </p>
            <p className="text-slate-600 dark:text-slate-300 flex items-center">
              {analysisStep >= 2 &&
                (analysisStep > 2 ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-500" />
                ))}
              Analyzing market trends
            </p>
            <p className="text-slate-600 dark:text-slate-300 flex items-center">
              {analysisStep >= 3 &&
                (analysisStep > 3 ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-500" />
                ))}
              Evaluating financial metrics
            </p>
            <p className="text-slate-600 dark:text-slate-300 flex items-center">
              {analysisStep >= 4 &&
                (analysisStep > 4 ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin text-blue-500" />
                ))}
              Calculating Atlas score
            </p>
          </div>
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${(analysisStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {propertyData && (
        <>
          {scraperInfo && (
            <div
              className={`mb-4 p-3 rounded-md flex items-start ${
                isRealData
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              }`}
            >
              <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{scraperInfo}</span>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                {propertyData.propertyAddress}
              </h3>
              {propertyData.atlasScore && (
                <div className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full">
                  <span className="font-bold mr-1">Atlas Score:</span>{' '}
                  {propertyData.atlasScore}
                </div>
              )}
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">
                  Financial Overview
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Purchase Price:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      €
                      {propertyData.financialMetrics?.purchasePrice?.toLocaleString() ||
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Monthly Rent:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      €
                      {propertyData.financialMetrics?.estimatedMonthlyRent?.toLocaleString() ||
                        'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Net Operating Income:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      €
                      {propertyData.financialMetrics?.netOperatingIncome?.toLocaleString() ||
                        'N/A'}
                      /year
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Cap Rate:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {propertyData.financialMetrics?.capRate?.toFixed(2) ||
                        'N/A'}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Cash-on-Cash Return:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {propertyData.financialMetrics?.cashOnCashReturn?.toFixed(
                        2
                      ) || 'N/A'}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Rental Yield:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {propertyData.marketTrends?.rentalYield?.toFixed(2) ||
                        'N/A'}
                      %
                    </span>
                  </div>

                  {propertyData.source && (
                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between">
                        <span>Source:</span>
                        <span>{propertyData.source.platform}</span>
                      </div>
                      {propertyData.source.scrapedAt && (
                        <div className="flex justify-between">
                          <span>Data retrieved:</span>
                          <span>
                            {new Date(
                              propertyData.source.scrapedAt
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-slate-900 dark:text-white">
                  Risk Assessment
                </h4>
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      Atlas AI Score:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {propertyData.atlasScore}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${getScoreColorClass(
                        propertyData.atlasScore
                      )}`}
                      style={{ width: `${propertyData.atlasScore}%` }}
                    ></div>
                  </div>
                  <div className="text-sm mt-1 text-slate-500 dark:text-slate-400">
                    {getScoreDescription(propertyData.atlasScore)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Overall Risk:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white flex items-center">
                      {propertyData.riskAssessment?.overall || 'Unknown'}
                      <div
                        className={`ml-2 w-3 h-3 rounded-full ${getRiskColorClass(
                          propertyData.riskAssessment?.overall || 'Unknown'
                        )}`}
                      ></div>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Walk Score:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {propertyData.locationAnalysis?.walkScore || 'N/A'}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Transit Score:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {propertyData.locationAnalysis?.transitScore || 'N/A'}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Area Growth Rate:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {propertyData.marketTrends?.areaGrowth?.toFixed(1) ||
                        'N/A'}
                      %/year
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      Appreciation Forecast:
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {propertyData.financialMetrics?.appreciationForecast?.toFixed(
                        1
                      ) || 'N/A'}
                      %/year
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {propertyData.aiAnalysis && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">
                  AI Analysis
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {propertyData.aiAnalysis}
                </p>
              </div>
            )}

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                Add to Investment Watchlist
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper functions for UI
function getScoreColorClass(score?: number) {
  if (!score) return 'bg-gray-400';
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getScoreDescription(score?: number) {
  if (!score) return 'Not rated';
  if (score >= 80) return 'Excellent investment opportunity';
  if (score >= 60) return 'Good investment opportunity';
  if (score >= 40) return 'Average investment opportunity';
  return 'Below average investment opportunity';
}

function getRiskColorClass(risk: string) {
  switch (risk.toLowerCase()) {
    case 'very low':
    case 'low':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'high':
    case 'very high':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
}
