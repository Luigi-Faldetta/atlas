import { useState, useEffect } from 'react';
import mcpApiClient, { AirQualityData, NewsArticle, PropertyAnalysisData } from './mcpClient';

interface UseMcpDataOptions {
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseMcpDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

// Custom hook for fetching air quality data
export function useAirQualityData(propertyIdentifier: string | null, options: UseMcpDataOptions = {}): UseMcpDataResult<AirQualityData> {
  const [data, setData] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  
  const { enabled = true, onSuccess, onError } = options;
  
  const fetchData = async () => {
    if (!propertyIdentifier) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mcpApiClient.getAirQualityData(propertyIdentifier);
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err);
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (enabled && propertyIdentifier) {
      fetchData();
    }
  }, [propertyIdentifier, enabled]);
  
  return { data, isLoading, error, refetch: fetchData };
}

// Custom hook for fetching local news
export function useLocalNews(propertyIdentifier: string | null, options: UseMcpDataOptions = {}): UseMcpDataResult<NewsArticle[]> {
  const [data, setData] = useState<NewsArticle[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  
  const { enabled = true, onSuccess, onError } = options;
  
  const fetchData = async () => {
    if (!propertyIdentifier) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mcpApiClient.getLocalNews(propertyIdentifier);
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err);
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (enabled && propertyIdentifier) {
      fetchData();
    }
  }, [propertyIdentifier, enabled]);
  
  return { data, isLoading, error, refetch: fetchData };
}

// Custom hook for fetching property analysis summary
export function usePropertyAnalysisSummary(propertyIdentifier: string | null, options: UseMcpDataOptions = {}): UseMcpDataResult<PropertyAnalysisData['summary']> {
  const [data, setData] = useState<PropertyAnalysisData['summary'] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  
  const { enabled = true, onSuccess, onError } = options;
  
  const fetchData = async () => {
    if (!propertyIdentifier) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mcpApiClient.getPropertyAnalysisSummary(propertyIdentifier);
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err);
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (enabled && propertyIdentifier) {
      fetchData();
    }
  }, [propertyIdentifier, enabled]);
  
  return { data, isLoading, error, refetch: fetchData };
}

// Main hook that combines all property data
export function useFullPropertyAnalysis(propertyIdentifier: string | null, options: UseMcpDataOptions = {}): UseMcpDataResult<PropertyAnalysisData> {
  const [data, setData] = useState<PropertyAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  
  const { enabled = true, onSuccess, onError } = options;
  
  const fetchData = async () => {
    if (!propertyIdentifier) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await mcpApiClient.getFullPropertyAnalysis(propertyIdentifier);
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err);
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (enabled && propertyIdentifier) {
      fetchData();
    }
  }, [propertyIdentifier, enabled]);
  
  return { data, isLoading, error, refetch: fetchData };
} 