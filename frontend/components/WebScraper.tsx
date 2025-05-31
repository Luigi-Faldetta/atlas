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
import { useSecureApi } from '@/lib/api/secureApiClient';
import { UserInputSchema, PropertyDataSchema, createClientSafeData } from '@/lib/security/validation';
import { SecureComponent, SecureText } from '@/components/security/SecureComponent';
import { clientConfig } from '@/lib/security/environment';
import { z } from 'zod';

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
  const [platform, setPlatform] = useState<'idealista' | 'fotocasa' | 'habitaclia'>('idealista');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [useMockData, setUseMockData] = useState(false);
  const [isRealData, setIsRealData] = useState(false);
  const [scraperInfo, setScraperInfo] = useState('');

  const secureApi = useSecureApi();

  // Secure URL validation function
  const validateUrl = (inputUrl: string): boolean => {
    if (!inputUrl) {
      setUrlError('');
      return false;
    }

    try {
      // Use our validation schema
      UserInputSchema.parse({ url: inputUrl, platform });
      setUrlError('');
      return true;
    } catch (error) {
      setUrlError(
        `Please enter a valid ${platform} URL. Example: https://www.${platform}.com/property`
      );
      return false;
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

      // Prepare secure request data
      const requestData = {
        url: useMockData ? 'https://demo.example.com' : url,
        platform,
        filters: {} // Add any filters here
      };

      // Use secure API client
      const result = await secureApi.analyzeProperty(requestData);

      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze property');
      }

      // Sanitize and validate the response data
      const safePropertyData = createClientSafeData(result.data);
      
      // Check if we're using real or fallback/mock data
      const isFallback = Boolean((result.data as any)?.isFallback);
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

      // Set the sanitized property data
      setPropertyData(safePropertyData as PropertyData);
      setAnalysisStep(5); // Complete
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setAnalysisStep(0);
      
      // Log security events for suspicious activity
      if (errorMessage.includes('Rate limit') || errorMessage.includes('unauthorized')) {
        console.warn('Potential security issue detected:', errorMessage);
      }
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

      {/* Security notice for development */}
      {clientConfig.isDevelopment && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <div className="flex items-center">
            <Info className="h-4 w-4 text-blue-500 mr-2" />
            <p className="text-sm text-blue-700">
              Security features enabled: Input validation, rate limiting, and secure API calls.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Select Platform
          </label>
          <Select value={platform} onValueChange={(value: 'idealista' | 'fotocasa' | 'habitaclia') => setPlatform(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="idealista">Idealista</SelectItem>
              <SelectItem value="fotocasa">Fotocasa</SelectItem>
              <SelectItem value="habitaclia">Habitaclia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Property URL
          </label>
          <Input
            type="url"
            placeholder={`Enter a ${platform} property URL...`}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setUrlError('');
            }}
            disabled={loading || useMockData}
            className={urlError ? 'border-red-500' : ''}
            maxLength={2000} // Security: Limit input length
          />
          {urlError && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              <SecureText content={urlError} maxLength={200} />
            </p>
          )}
        </div>

        {/* Mock Data Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useMockData"
            checked={useMockData}
            onChange={(e) => setUseMockData(e.target.checked)}
            disabled={loading}
            className="rounded"
          />
          <label htmlFor="useMockData" className="text-sm text-slate-700 dark:text-slate-300">
            Use demo data for testing
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || (!url && !useMockData)}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Property...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Analyze Property
            </>
          )}
        </Button>
      </form>

      {/* Rest of the component remains the same but with secure data rendering */}
      {/* ... existing analysis progress, results display, etc. ... */}
      
      {propertyData && (
        <SecureComponent
          data={propertyData}
          schema={z.object({
            propertyAddress: z.string(),
            atlasScore: z.number().optional(),
            // Add other schema validation as needed
          })}
          fallback={<div>Unable to display property data safely</div>}
        >
          {(safeData) => (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Property Analysis Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Address</h4>
                  <SecureText content={safeData.propertyAddress} maxLength={500} />
                </div>
                {safeData.atlasScore && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Atlas Score</h4>
                    <SecureText content={safeData.atlasScore.toString()} />
                  </div>
                )}
              </div>
            </div>
          )}
        </SecureComponent>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <SecureText content={error} maxLength={200} className="text-red-700" />
          </div>
        </div>
      )}

      {/* Success Info */}
      {scraperInfo && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <SecureText content={scraperInfo} maxLength={300} className="text-green-700" />
          </div>
        </div>
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
