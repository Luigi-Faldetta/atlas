interface ValidationRule {
  field: string;
  type: 'numeric' | 'date' | 'text' | 'percentage' | 'currency' | 'range';
  required: boolean;
  min?: number;
  max?: number;
  format?: RegExp;
  customValidator?: (value: any) => boolean;
}

interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  validity: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  qualityScore: number;
  confidence: number;
  lastValidated: Date;
  dataSource: string;
}

class RealEstateDataValidator {
  private validationRules: ValidationRule[] = [
    // Financial Metrics Validation
    { field: 'price', type: 'currency', required: true, min: 0, max: 1000000000 },
    { field: 'pricePerSqm', type: 'currency', required: true, min: 0, max: 100000 },
    { field: 'roi', type: 'percentage', required: false, min: -100, max: 1000 },
    { field: 'capRate', type: 'percentage', required: false, min: 0, max: 50 },
    { field: 'cashOnCashReturn', type: 'percentage', required: false, min: -100, max: 100 },
    
    // Property Details Validation
    { field: 'buildingAge', type: 'numeric', required: false, min: 0, max: 200 },
    { field: 'totalSquareMeters', type: 'numeric', required: true, min: 1, max: 1000000 },
    { field: 'occupancyRate', type: 'percentage', required: false, min: 0, max: 100 },
    
    // Market Data Validation
    { field: 'marketValue', type: 'currency', required: false, min: 0 },
    { field: 'rentalYield', type: 'percentage', required: false, min: 0, max: 50 },
    
    // Environmental & Sustainability
    { field: 'energyEfficiencyRating', type: 'text', required: false },
    { field: 'walkScore', type: 'numeric', required: false, min: 0, max: 100 },
    { field: 'transitScore', type: 'numeric', required: false, min: 0, max: 100 },
  ];

  /**
   * Validates property data against real estate industry standards
   */
  validatePropertyData(data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let qualityScore = 100;
    let confidence = 1.0;

    // Core validation checks
    for (const rule of this.validationRules) {
      const value = data[rule.field];
      
      // Required field check
      if (rule.required && (value === null || value === undefined || value === '')) {
        errors.push(`${rule.field} is required but missing`);
        qualityScore -= 10;
        continue;
      }

      if (value !== null && value !== undefined && value !== '') {
        // Type validation
        if (!this.validateType(value, rule.type)) {
          errors.push(`${rule.field} has invalid type. Expected: ${rule.type}`);
          qualityScore -= 5;
        }

        // Range validation
        if (rule.min !== undefined && Number(value) < rule.min) {
          errors.push(`${rule.field} (${value}) is below minimum allowed value (${rule.min})`);
          qualityScore -= 3;
        }

        if (rule.max !== undefined && Number(value) > rule.max) {
          warnings.push(`${rule.field} (${value}) seems unusually high (max expected: ${rule.max})`);
          qualityScore -= 2;
        }

        // Custom validation
        if (rule.customValidator && !rule.customValidator(value)) {
          errors.push(`${rule.field} failed custom validation`);
          qualityScore -= 3;
        }
      }
    }

    // Cross-field validation (business logic)
    this.performCrossFieldValidation(data, errors, warnings);

    // Calculate final confidence score
    confidence = Math.max(0, (qualityScore / 100) * confidence);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      qualityScore: Math.max(0, qualityScore),
      confidence,
      lastValidated: new Date(),
      dataSource: data.source || 'unknown'
    };
  }

  /**
   * Cross-field validation for business logic consistency
   */
  private performCrossFieldValidation(data: any, errors: string[], warnings: string[]): void {
    // ROI vs Cap Rate consistency
    if (data.roi && data.capRate && Math.abs(data.roi - data.capRate) > 20) {
      warnings.push('ROI and Cap Rate show significant variance - please verify calculations');
    }

    // Price vs Market Value consistency
    if (data.price && data.marketValue && Math.abs(data.price - data.marketValue) / data.price > 0.3) {
      warnings.push('Purchase price differs significantly from market value (>30%)');
    }

    // Occupancy vs Rental Income consistency
    if (data.occupancyRate && data.rentalIncome) {
      if (data.occupancyRate < 50 && data.rentalIncome > 0) {
        warnings.push('Low occupancy rate but positive rental income - please verify');
      }
    }

    // Energy efficiency vs building age
    if (data.buildingAge && data.energyEfficiencyRating) {
      if (data.buildingAge > 30 && ['A', 'A+', 'A++'].includes(data.energyEfficiencyRating)) {
        warnings.push('Older building with high energy rating - recent renovations?');
      }
    }
  }

  /**
   * Type validation helper
   */
  private validateType(value: any, type: string): boolean {
    switch (type) {
      case 'numeric':
        return !isNaN(Number(value)) && isFinite(Number(value));
      case 'currency':
        return !isNaN(Number(value)) && Number(value) >= 0;
      case 'percentage':
        return !isNaN(Number(value));
      case 'date':
        return !isNaN(Date.parse(value));
      case 'text':
        return typeof value === 'string';
      case 'range':
        return !isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100;
      default:
        return true;
    }
  }

  /**
   * Calculate comprehensive data quality metrics
   */
  calculateDataQuality(data: any): DataQualityMetrics {
    const totalFields = Object.keys(data).length;
    const completedFields = Object.values(data).filter(v => v !== null && v !== undefined && v !== '').length;
    
    const validation = this.validatePropertyData(data);
    
    return {
      completeness: (completedFields / totalFields) * 100,
      accuracy: validation.qualityScore,
      consistency: this.calculateConsistencyScore(data),
      timeliness: this.calculateTimelinessScore(data),
      validity: validation.isValid ? 100 : Math.max(0, 100 - validation.errors.length * 10)
    };
  }

  private calculateConsistencyScore(data: any): number {
    // Check for consistent data patterns
    let score = 100;
    
    // Example: Price consistency across different metrics
    if (data.pricePerSqm && data.price && data.totalSquareMeters) {
      const calculatedPrice = data.pricePerSqm * data.totalSquareMeters;
      const variance = Math.abs(calculatedPrice - data.price) / data.price;
      if (variance > 0.1) score -= 20; // 10% variance tolerance
    }
    
    return Math.max(0, score);
  }

  private calculateTimelinessScore(data: any): number {
    const lastUpdated = new Date(data.lastUpdated || data.createdAt || Date.now());
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    
    // Real estate data older than 30 days starts losing relevance
    if (daysSinceUpdate <= 7) return 100;
    if (daysSinceUpdate <= 30) return 90;
    if (daysSinceUpdate <= 90) return 70;
    if (daysSinceUpdate <= 180) return 50;
    return 30;
  }

  /**
   * Detect anomalies in data using statistical methods
   */
  detectAnomalies(data: any, comparableData: any[]): string[] {
    const anomalies: string[] = [];
    
    if (!comparableData || comparableData.length < 3) {
      return ['Insufficient comparable data for anomaly detection'];
    }

    // Check price per square meter anomalies
    if (data.pricePerSqm && comparableData.length > 0) {
      const prices = comparableData.map(d => d.pricePerSqm).filter(p => p > 0);
      if (prices.length > 0) {
        const mean = prices.reduce((a, b) => a + b) / prices.length;
        const std = Math.sqrt(prices.reduce((a, b) => a + Math.pow(b - mean, 2)) / prices.length);
        
        if (Math.abs(data.pricePerSqm - mean) > 2 * std) {
          anomalies.push(`Price per sqm (${data.pricePerSqm}) is ${Math.abs(data.pricePerSqm - mean) > 3 * std ? 'significantly' : 'moderately'} different from market average`);
        }
      }
    }

    return anomalies;
  }
}

export default new RealEstateDataValidator(); 