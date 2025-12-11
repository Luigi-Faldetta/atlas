'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  MapPin, 
  Home, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  Calendar,
  Wifi
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface PropertyData {
  property: {
    url: string;
    platform: string;
    address: string;
    price: number;
    living_area_sqm: number;
    bedrooms: number;
    bathrooms: number;
    year_built: number;
    property_type: string;
    images: Array<{ url: string; alt_text?: string }>;
    description?: string;
  };
  investment_analysis: {
    investment_score: number;
    rental_yield: number;
    roi_5_year: number;
    roi_10_year: number;
    risk_score: number;
    estimated_monthly_rent: number;
    price_per_sqm: number;
    cash_on_cash_return: number;
    cap_rate: number;
  };
  financial_details: {
    purchase_price: number;
    monthly_costs: number;
    net_monthly_income: number;
    down_payment_20_percent: number;
    mortgage_payment: number;
  };
  location_analysis: {
    city: string;
    country: string;
    neighborhood?: string;
    walk_score?: number;
    transit_score?: number;
    coordinates?: { lat: number; lng: number };
  };
  market_analysis: {
    price_vs_market: string;
    comparable_count: number;
    property_premium_discount: number;
    price_percentile: number;
  };
  features: {
    elevator: boolean;
    parking: boolean;
    balcony: boolean;
    terrace: boolean;
    air_conditioning: boolean;
    energy_certificate?: string;
  };
  metadata: {
    scraped_at: string;
    data_quality_score: number;
    has_real_data: boolean;
    missing_fields: string[];
    platform_source: string;
  };
  comparables: Array<{
    address: string;
    price: number;
    price_per_sqm: number;
    bedrooms: number;
  }>;
  charts: {
    roi_projection: {
      labels: string[];
      data: number[];
    };
    price_comparison: {
      data: Array<{
        property: string;
        price_per_sqm: number;
        highlight?: boolean;
      }>;
    };
    monthly_cashflow: {
      income: number;
      expenses: number;
      net: number;
    };
  };
}

interface AnalysisResponse {
  success: boolean;
  data?: PropertyData;
  error?: string;
  metadata?: {
    processing_time_ms: number;
    cached: boolean;
    data_quality_score: number;
  };
}

const EnhancedPropertyAnalysis: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<PropertyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisMetadata, setAnalysisMetadata] = useState<any>(null);

  const analyzeProperty = async (forceRefresh = false) => {
    if (!url.trim()) {
      setError('Please enter a valid property URL');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-property/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          force_refresh: forceRefresh,
          include_comparables: true,
          include_neighborhood_analysis: true,
        }),
      });

      const result: AnalysisResponse = await response.json();

      if (result.success && result.data) {
        setAnalysisData(result.data);
        setAnalysisMetadata(result.metadata);
        setError(null);
      } else {
        setError(result.error || 'Analysis failed');
        setAnalysisData(null);
      }
    } catch (err) {
      setError('Network error: Unable to analyze property');
      setAnalysisData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMarketPositionBadge = (position: string) => {
    switch (position) {
      case 'below_market':
        return <Badge variant="default" className="bg-green-100 text-green-800">Below Market</Badge>;
      case 'above_market':
        return <Badge variant="destructive">Above Market</Badge>;
      default:
        return <Badge variant="secondary">Market Rate</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced Property Analysis</h1>
        <p className="text-gray-600">
          Comprehensive real estate investment analysis with real-world data
        </p>
      </div>

      {/* URL Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Analysis
          </CardTitle>
          <CardDescription>
            Enter a property URL from Funda, Idealista, Fotocasa, or Habitaclia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.funda.nl/koop/amsterdam/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => analyzeProperty(false)} 
              disabled={isAnalyzing}
              className="min-w-[120px]"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Property'
              )}
            </Button>
          </div>
          
          {analysisData && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => analyzeProperty(true)}
                disabled={isAnalyzing}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Analysis
              </Button>
              {analysisMetadata?.cached && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Cached Data
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Data Quality Indicator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Data Quality & Processing</span>
                <div className="flex items-center gap-2">
                  {analysisData.metadata.has_real_data ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                  <span className={`font-semibold ${getScoreColor(analysisData.metadata.data_quality_score)}`}>
                    {analysisData.metadata.data_quality_score.toFixed(0)}% Quality
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={analysisData.metadata.data_quality_score} className="w-full" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Source:</span>
                    <p className="font-medium">{analysisData.metadata.platform_source}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Real Data:</span>
                    <p className="font-medium">
                      {analysisData.metadata.has_real_data ? 'Yes' : 'Estimated'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Analyzed:</span>
                    <p className="font-medium">
                      {new Date(analysisData.metadata.scraped_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Processing:</span>
                    <p className="font-medium">
                      {analysisMetadata?.processing_time_ms 
                        ? `${(analysisMetadata.processing_time_ms / 1000).toFixed(1)}s`
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>
                {analysisData.metadata.missing_fields.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Missing data: {analysisData.metadata.missing_fields.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Property Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Property Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{analysisData.property.address}</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{analysisData.property.property_type}</Badge>
                    <Badge variant="outline">{analysisData.location_analysis.city}</Badge>
                    {getMarketPositionBadge(analysisData.market_analysis.price_vs_market)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(analysisData.property.price)}
                    </p>
                    <p className="text-sm text-gray-600">Purchase Price</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {analysisData.property.living_area_sqm}m²
                    </p>
                    <p className="text-sm text-gray-600">Living Area</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      {analysisData.property.bedrooms}
                    </p>
                    <p className="text-sm text-gray-600">Bedrooms</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">
                      {analysisData.property.year_built}
                    </p>
                    <p className="text-sm text-gray-600">Year Built</p>
                  </div>
                </div>

                {/* Property Features */}
                <div className="space-y-2">
                  <h4 className="font-medium">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisData.features.elevator && <Badge variant="secondary">Elevator</Badge>}
                    {analysisData.features.parking && <Badge variant="secondary">Parking</Badge>}
                    {analysisData.features.balcony && <Badge variant="secondary">Balcony</Badge>}
                    {analysisData.features.terrace && <Badge variant="secondary">Terrace</Badge>}
                    {analysisData.features.air_conditioning && <Badge variant="secondary">A/C</Badge>}
                    {analysisData.features.energy_certificate && (
                      <Badge variant="secondary">Energy: {analysisData.features.energy_certificate}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Investment Score
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="relative">
                  <div className="text-6xl font-bold text-blue-600">
                    {analysisData.investment_analysis.investment_score}
                  </div>
                  <div className="text-gray-500">out of 100</div>
                </div>
                <Progress value={analysisData.investment_analysis.investment_score} className="w-full" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-green-600">
                      {formatPercentage(analysisData.investment_analysis.rental_yield)}
                    </p>
                    <p className="text-gray-600">Rental Yield</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-red-600">
                      {analysisData.investment_analysis.risk_score}/100
                    </p>
                    <p className="text-gray-600">Risk Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Tabs */}
          <Tabs defaultValue="financial" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
            </TabsList>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Cash Flow</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Rental Income:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(analysisData.investment_analysis.estimated_monthly_rent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Costs:</span>
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(analysisData.financial_details.monthly_costs)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Net Income:</span>
                      <span className={`font-bold ${
                        analysisData.financial_details.net_monthly_income > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {formatCurrency(analysisData.financial_details.net_monthly_income)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Investment Returns</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>5-Year ROI:</span>
                      <span className="font-semibold text-blue-600">
                        {formatPercentage(analysisData.investment_analysis.roi_5_year)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>10-Year ROI:</span>
                      <span className="font-semibold text-blue-600">
                        {formatPercentage(analysisData.investment_analysis.roi_10_year)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cap Rate:</span>
                      <span className="font-semibold text-purple-600">
                        {formatPercentage(analysisData.investment_analysis.cap_rate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cash-on-Cash:</span>
                      <span className="font-semibold text-orange-600">
                        {formatPercentage(analysisData.investment_analysis.cash_on_cash_return)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Purchase Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Price per m²:</span>
                      <span className="font-semibold">
                        {formatCurrency(analysisData.investment_analysis.price_per_sqm)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Down Payment (20%):</span>
                      <span className="font-semibold">
                        {formatCurrency(analysisData.financial_details.down_payment_20_percent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Mortgage:</span>
                      <span className="font-semibold">
                        {formatCurrency(analysisData.financial_details.mortgage_payment)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Market Position</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Market Position:</span>
                      {getMarketPositionBadge(analysisData.market_analysis.price_vs_market)}
                    </div>
                    <div className="flex justify-between">
                      <span>Price Percentile:</span>
                      <span className="font-semibold">
                        {analysisData.market_analysis.price_percentile}th percentile
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Premium/Discount:</span>
                      <span className={`font-semibold ${
                        analysisData.market_analysis.property_premium_discount > 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {analysisData.market_analysis.property_premium_discount > 0 ? '+' : ''}
                        {formatPercentage(analysisData.market_analysis.property_premium_discount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Comparables Found:</span>
                      <span className="font-semibold">
                        {analysisData.market_analysis.comparable_count} properties
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comparable Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisData.comparables.slice(0, 3).map((comp, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{comp.address}</p>
                            <p className="text-xs text-gray-600">{comp.bedrooms} bed</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(comp.price_per_sqm)}/m²</p>
                            <p className="text-xs text-gray-600">{formatCurrency(comp.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Walkability</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {analysisData.location_analysis.walk_score || 'N/A'}
                    </div>
                    <p className="text-gray-600">Walk Score</p>
                    {analysisData.location_analysis.walk_score && (
                      <Progress value={analysisData.location_analysis.walk_score} className="mt-2" />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transit Access</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {analysisData.location_analysis.transit_score || 'N/A'}
                    </div>
                    <p className="text-gray-600">Transit Score</p>
                    {analysisData.location_analysis.transit_score && (
                      <Progress value={analysisData.location_analysis.transit_score} className="mt-2" />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Location Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-gray-600">City:</span>
                      <p className="font-medium">{analysisData.location_analysis.city}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Country:</span>
                      <p className="font-medium">{analysisData.location_analysis.country}</p>
                    </div>
                    {analysisData.location_analysis.neighborhood && (
                      <div>
                        <span className="text-gray-600">Neighborhood:</span>
                        <p className="font-medium">{analysisData.location_analysis.neighborhood}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>ROI Projection (10 Years)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analysisData.charts.roi_projection.labels.map((label, index) => ({
                        year: label,
                        roi: analysisData.charts.roi_projection.data[index]
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="roi" stroke="#2563eb" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Price Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analysisData.charts.price_comparison.data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="property" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="price_per_sqm" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Monthly Cash Flow Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(analysisData.charts.monthly_cashflow.income)}
                        </div>
                        <p className="text-green-700">Monthly Income</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(analysisData.charts.monthly_cashflow.expenses)}
                        </div>
                        <p className="text-red-700">Monthly Expenses</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className={`text-2xl font-bold ${
                          analysisData.charts.monthly_cashflow.net > 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(analysisData.charts.monthly_cashflow.net)}
                        </div>
                        <p className="text-blue-700">Net Cash Flow</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default EnhancedPropertyAnalysis;