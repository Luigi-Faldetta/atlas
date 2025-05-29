import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import dataValidator from '../lib/validation/dataValidator';

interface DataQualityIndicatorProps {
  data: any;
  comparableData?: any[];
  className?: string;
  showDetails?: boolean;
}

interface QualityAlert {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({ 
  data, 
  comparableData = [], 
  className = '', 
  showDetails = false 
}) => {
  const [validation, setValidation] = useState<any>(null);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<QualityAlert[]>([]);
  const [showFullDetails, setShowFullDetails] = useState(false);

  useEffect(() => {
    if (data) {
      // Validate data
      const validationResult = dataValidator.validatePropertyData(data);
      setValidation(validationResult);

      // Calculate quality metrics
      const metrics = dataValidator.calculateDataQuality(data);
      setQualityMetrics(metrics);

      // Detect anomalies if comparable data is available
      const detectedAnomalies = comparableData.length > 0 
        ? dataValidator.detectAnomalies(data, comparableData)
        : [];
      setAnomalies(detectedAnomalies);

      // Generate alerts
      const newAlerts: QualityAlert[] = [];
      
      // Add errors as high-priority alerts
      validationResult.errors.forEach((error: string) => {
        newAlerts.push({ type: 'error', message: error });
      });

      // Add warnings as medium-priority alerts
      validationResult.warnings.forEach((warning: string) => {
        newAlerts.push({ type: 'warning', message: warning });
      });

      // Add anomalies as info alerts
      detectedAnomalies.forEach((anomaly: string) => {
        newAlerts.push({ type: 'info', message: anomaly });
      });

      // Add data freshness alerts
      if (metrics.timeliness < 70) {
        newAlerts.push({ 
          type: 'warning', 
          message: `Data is ${Math.round((100 - metrics.timeliness) / 10)} days old - consider updating` 
        });
      }

      setAlerts(newAlerts);
    }
  }, [data, comparableData]);

  const getQualityLevel = (score: number): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  };

  const getQualityColor = (level: string): string => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info': return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default: return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const overallQuality = validation?.qualityScore || 0;
  const qualityLevel = getQualityLevel(overallQuality);
  const qualityColorClass = getQualityColor(qualityLevel);

  if (!validation || !qualityMetrics) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg p-4 ${className}`}>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${qualityColorClass} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className="h-5 w-5" />
          <span className="font-semibold text-sm">Data Quality</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${qualityColorClass}`}>
            {qualityLevel.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold">{Math.round(overallQuality)}%</span>
          {showDetails && (
            <button
              onClick={() => setShowFullDetails(!showFullDetails)}
              className="text-xs underline hover:no-underline"
            >
              {showFullDetails ? 'Less' : 'Details'}
            </button>
          )}
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3 text-xs">
        <div className="text-center">
          <div className="font-medium">{Math.round(qualityMetrics.completeness)}%</div>
          <div className="text-gray-600">Complete</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{Math.round(qualityMetrics.accuracy)}%</div>
          <div className="text-gray-600">Accurate</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{Math.round(qualityMetrics.consistency)}%</div>
          <div className="text-gray-600">Consistent</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{Math.round(qualityMetrics.timeliness)}%</div>
          <div className="text-gray-600">Fresh</div>
        </div>
        <div className="text-center">
          <div className="font-medium">{Math.round(qualityMetrics.validity)}%</div>
          <div className="text-gray-600">Valid</div>
        </div>
      </div>

      {/* Alerts Summary */}
      {alerts.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-4 text-xs">
            {alerts.filter(a => a.type === 'error').length > 0 && (
              <span className="flex items-center space-x-1 text-red-600">
                <XCircleIcon className="h-4 w-4" />
                <span>{alerts.filter(a => a.type === 'error').length} errors</span>
              </span>
            )}
            {alerts.filter(a => a.type === 'warning').length > 0 && (
              <span className="flex items-center space-x-1 text-yellow-600">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <span>{alerts.filter(a => a.type === 'warning').length} warnings</span>
              </span>
            )}
            {alerts.filter(a => a.type === 'info').length > 0 && (
              <span className="flex items-center space-x-1 text-blue-600">
                <InformationCircleIcon className="h-4 w-4" />
                <span>{alerts.filter(a => a.type === 'info').length} insights</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Data Source & Last Updated */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Source: {validation.dataSource}</span>
        <span className="flex items-center space-x-1">
          <ClockIcon className="h-3 w-3" />
          <span>Updated: {validation.lastValidated.toLocaleDateString()}</span>
        </span>
      </div>

      {/* Detailed View */}
      {showDetails && showFullDetails && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <h4 className="font-medium text-sm mb-3">Data Quality Details</h4>
          
          {/* Quality Breakdown */}
          <div className="space-y-2 mb-4">
            {Object.entries(qualityMetrics).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center text-xs">
                <span className="capitalize">{key}:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-current opacity-60"
                      style={{ width: `${Math.min(100, Number(value))}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{Math.round(Number(value))}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Alerts Detail */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-xs">Alerts & Recommendations:</h5>
              <div className="space-y-1">
                {alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="flex items-start space-x-2 text-xs">
                    {getAlertIcon(alert.type)}
                    <span className="flex-1">{alert.message}</span>
                  </div>
                ))}
                {alerts.length > 5 && (
                  <div className="text-xs text-gray-500">
                    +{alerts.length - 5} more alerts...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataQualityIndicator; 