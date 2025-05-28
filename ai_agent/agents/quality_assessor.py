"""
Quality Assessor for Analysis Validation
Following atlas.mdc: Self-reflection and quality assessment patterns
"""

from typing import Dict, Any, List, Tuple
import re
import logging
import time
from .context_manager import AgentContext


class QualityAssessor:
    """
    Quality assessment for enhanced agent analysis
    Following atlas.mdc: Multi-layer verification and confidence calibration
    """
    
    def __init__(self):
        """Initialize quality assessor with validation criteria"""
        self.logger = logging.getLogger(__name__)
        
        # Quality assessment criteria weights
        self.criteria_weights = {
            'numerical_consistency': 0.25,
            'logical_coherence': 0.25,
            'data_utilization': 0.20,
            'market_appropriateness': 0.15,
            'confidence_calibration': 0.15
        }
        
        # Expected value ranges for validation
        self.value_ranges = {
            'investment_score': (0, 100),
            'roi_5_year': (-10, 50),
            'roi_10_year': (-10, 100),
            'yearly_yield': (0, 20),
            'monthly_rental': (100, 10000),
            'confidence_scores': (0, 100)
        }
    
    def assess_analysis_quality(self, analysis_result: Dict[str, Any], 
                              property_data: Dict[str, Any],
                              context: AgentContext) -> int:
        """
        Comprehensive quality assessment of analysis result
        Following atlas.mdc: Multi-dimensional quality evaluation
        """
        
        try:
            scores = {}
            
            # 1. Numerical Consistency Assessment
            scores['numerical_consistency'] = self._assess_numerical_consistency(analysis_result)
            
            # 2. Logical Coherence Assessment
            scores['logical_coherence'] = self._assess_logical_coherence(analysis_result, context)
            
            # 3. Data Utilization Assessment
            scores['data_utilization'] = self._assess_data_utilization(analysis_result, property_data)
            
            # 4. Market Appropriateness Assessment
            scores['market_appropriateness'] = self._assess_market_appropriateness(analysis_result, context)
            
            # 5. Confidence Calibration Assessment
            scores['confidence_calibration'] = self._assess_confidence_calibration(analysis_result, context)
            
            # Calculate weighted overall score
            overall_score = sum(
                scores[criterion] * weight 
                for criterion, weight in self.criteria_weights.items()
                if criterion in scores
            )
            
            self.logger.info(f"Quality assessment scores: {scores}, Overall: {overall_score}")
            
            return int(overall_score)
            
        except Exception as e:
            self.logger.error(f"Quality assessment failed: {str(e)}")
            return 50  # Default moderate score on error
    
    def _assess_numerical_consistency(self, analysis_result: Dict[str, Any]) -> int:
        """
        Assess numerical consistency and mathematical accuracy
        Returns score 0-100
        """
        
        score = 100
        issues = []
        
        try:
            # Check if investment score is within valid range
            investment_score = analysis_result.get('investment_score')
            if investment_score is not None:
                if not (0 <= investment_score <= 100):
                    score -= 20
                    issues.append(f"Investment score {investment_score} outside valid range")
            
            # Check financial metrics consistency
            financial_metrics = analysis_result.get('financial_metrics', {})
            
            # ROI consistency check
            roi_5 = financial_metrics.get('roi_5_year')
            roi_10 = financial_metrics.get('roi_10_year')
            if roi_5 is not None and roi_10 is not None:
                if roi_10 < roi_5:  # 10-year ROI should generally be higher
                    score -= 15
                    issues.append("10-year ROI lower than 5-year ROI")
            
            # Yield vs rental income consistency
            yearly_yield = financial_metrics.get('yearly_yield')
            monthly_rental = financial_metrics.get('monthly_rental')
            if yearly_yield and monthly_rental:
                # Basic sanity check - yield should correlate with rental income
                if yearly_yield > 15 and monthly_rental < 500:
                    score -= 10
                    issues.append("High yield with low rental income inconsistency")
            
            # Confidence scores validation
            for key, value in financial_metrics.items():
                if key.endswith('_confidence') and value is not None:
                    if not (0 <= value <= 100):
                        score -= 5
                        issues.append(f"Confidence score {key} outside valid range")
            
            if issues:
                self.logger.warning(f"Numerical consistency issues: {issues}")
            
        except Exception as e:
            self.logger.error(f"Numerical consistency assessment error: {str(e)}")
            score = 70  # Moderate score on error
        
        return max(0, score)
    
    def _assess_logical_coherence(self, analysis_result: Dict[str, Any], 
                                context: AgentContext) -> int:
        """
        Assess logical coherence between different analysis components
        Returns score 0-100
        """
        
        score = 100
        issues = []
        
        try:
            investment_score = analysis_result.get('investment_score', 50)
            strengths = analysis_result.get('strengths', [])
            weaknesses = analysis_result.get('weaknesses', [])
            
            # Check alignment between score and strengths/weaknesses
            if investment_score >= 80:
                if len(strengths) < len(weaknesses):
                    score -= 15
                    issues.append("High investment score but more weaknesses than strengths")
            elif investment_score <= 40:
                if len(weaknesses) < len(strengths):
                    score -= 15
                    issues.append("Low investment score but more strengths than weaknesses")
            
            # Check reasoning process coherence
            reasoning = analysis_result.get('reasoning_process', '')
            if reasoning:
                # Check if reasoning mentions key factors
                key_factors = ['location', 'price', 'market', 'yield', 'risk']
                mentioned_factors = sum(1 for factor in key_factors if factor.lower() in reasoning.lower())
                if mentioned_factors < 3:
                    score -= 10
                    issues.append("Reasoning process lacks comprehensive factor analysis")
            
            # Check recommendation alignment with score
            recommendations = analysis_result.get('recommendations', [])
            if investment_score >= 70 and recommendations:
                # Should have positive/action-oriented recommendations
                positive_indicators = ['invest', 'buy', 'consider', 'opportunity', 'proceed']
                has_positive = any(indicator in str(recommendations).lower() for indicator in positive_indicators)
                if not has_positive:
                    score -= 10
                    issues.append("High score but no positive recommendations")
            
            if issues:
                self.logger.warning(f"Logical coherence issues: {issues}")
                
        except Exception as e:
            self.logger.error(f"Logical coherence assessment error: {str(e)}")
            score = 70
        
        return max(0, score)
    
    def _assess_data_utilization(self, analysis_result: Dict[str, Any], 
                               property_data: Dict[str, Any]) -> int:
        """
        Assess how well the analysis utilizes available property data
        Returns score 0-100
        """
        
        score = 100
        issues = []
        
        try:
            # Check if key property data fields are referenced in analysis
            key_fields = ['price', 'living_area', 'bedrooms', 'bathrooms', 'address']
            available_fields = [field for field in key_fields if property_data.get(field)]
            
            # Check if analysis mentions these fields
            full_response = analysis_result.get('full_response', '')
            reasoning = analysis_result.get('reasoning_process', '')
            combined_text = f"{full_response} {reasoning}".lower()
            
            utilized_fields = []
            for field in available_fields:
                field_value = str(property_data.get(field, '')).lower()
                if field_value and (field_value in combined_text or field in combined_text):
                    utilized_fields.append(field)
            
            utilization_rate = len(utilized_fields) / max(1, len(available_fields))
            if utilization_rate < 0.5:
                score -= 20
                issues.append(f"Low data utilization: {utilization_rate:.1%}")
            elif utilization_rate < 0.7:
                score -= 10
                issues.append(f"Moderate data utilization: {utilization_rate:.1%}")
            
            # Check for assumption acknowledgment
            if 'assumption' not in combined_text and 'estimate' not in combined_text:
                score -= 10
                issues.append("No acknowledgment of assumptions or estimates")
            
            # Check for data limitation acknowledgment
            if context.data_quality_score < 70:
                if 'limitation' not in combined_text and 'incomplete' not in combined_text:
                    score -= 15
                    issues.append("No acknowledgment of data limitations")
            
            if issues:
                self.logger.warning(f"Data utilization issues: {issues}")
                
        except Exception as e:
            self.logger.error(f"Data utilization assessment error: {str(e)}")
            score = 70
        
        return max(0, score)
    
    def _assess_market_appropriateness(self, analysis_result: Dict[str, Any], 
                                     context: AgentContext) -> int:
        """
        Assess market-specific appropriateness of analysis
        Returns score 0-100
        """
        
        score = 100
        issues = []
        
        try:
            market_type = context.market_type
            full_response = analysis_result.get('full_response', '').lower()
            
            # Market-specific validation
            if market_type == 'dutch':
                dutch_factors = ['energy label', 'woz', 'rental point', 'social housing']
                mentioned_factors = sum(1 for factor in dutch_factors if factor in full_response)
                if mentioned_factors == 0:
                    score -= 20
                    issues.append("No Dutch market-specific factors mentioned")
                elif mentioned_factors < 2:
                    score -= 10
                    issues.append("Limited Dutch market-specific analysis")
            
            elif market_type == 'spanish':
                spanish_factors = ['golden visa', 'tourism', 'seasonal', 'costa', 'regional tax']
                mentioned_factors = sum(1 for factor in spanish_factors if factor in full_response)
                if mentioned_factors == 0:
                    score -= 20
                    issues.append("No Spanish market-specific factors mentioned")
                elif mentioned_factors < 2:
                    score -= 10
                    issues.append("Limited Spanish market-specific analysis")
            
            # Check yield ranges against market expectations
            financial_metrics = analysis_result.get('financial_metrics', {})
            yearly_yield = financial_metrics.get('yearly_yield')
            
            if yearly_yield and context.market_specific_factors:
                expected_range = context.market_specific_factors.get('typical_yield_range', (0, 20))
                if not (expected_range[0] <= yearly_yield <= expected_range[1]):
                    score -= 15
                    issues.append(f"Yield {yearly_yield}% outside typical market range {expected_range}")
            
            if issues:
                self.logger.warning(f"Market appropriateness issues: {issues}")
                
        except Exception as e:
            self.logger.error(f"Market appropriateness assessment error: {str(e)}")
            score = 70
        
        return max(0, score)
    
    def _assess_confidence_calibration(self, analysis_result: Dict[str, Any], 
                                     context: AgentContext) -> int:
        """
        Assess appropriateness of confidence scores
        Returns score 0-100
        """
        
        score = 100
        issues = []
        
        try:
            financial_metrics = analysis_result.get('financial_metrics', {})
            data_quality = context.data_quality_score
            
            # Extract confidence scores
            confidence_scores = {}
            for key, value in financial_metrics.items():
                if key.endswith('_confidence') and value is not None:
                    metric_name = key.replace('_confidence', '')
                    confidence_scores[metric_name] = value
            
            # Check if confidence scores are appropriately conservative for low data quality
            if data_quality < 50:
                high_confidence_metrics = [k for k, v in confidence_scores.items() if v > 80]
                if high_confidence_metrics:
                    score -= 20
                    issues.append(f"High confidence with low data quality: {high_confidence_metrics}")
            
            # Check confidence score variance (should have some variation)
            if len(confidence_scores) > 2:
                confidence_values = list(confidence_scores.values())
                variance = max(confidence_values) - min(confidence_values)
                if variance < 10:
                    score -= 10
                    issues.append("Confidence scores lack appropriate variation")
            
            # Check overall confidence alignment with investment score
            investment_score = analysis_result.get('investment_score')
            investment_confidence = analysis_result.get('investment_score_confidence')
            
            if investment_score and investment_confidence:
                # High investment scores should generally have reasonable confidence
                if investment_score > 80 and investment_confidence < 60:
                    score -= 10
                    issues.append("High investment score with low confidence")
                elif investment_score < 40 and investment_confidence > 80:
                    score -= 10
                    issues.append("Low investment score with high confidence")
            
            if issues:
                self.logger.warning(f"Confidence calibration issues: {issues}")
                
        except Exception as e:
            self.logger.error(f"Confidence calibration assessment error: {str(e)}")
            score = 70
        
        return max(0, score)
    
    def validate_numerical_consistency(self, analysis_result: Dict[str, Any]) -> Tuple[bool, List[str]]:
        """
        Detailed numerical validation with specific error messages
        Returns (is_valid, error_messages)
        """
        
        errors = []
        
        try:
            # Investment score validation
            investment_score = analysis_result.get('investment_score')
            if investment_score is not None:
                if not isinstance(investment_score, (int, float)):
                    errors.append("Investment score must be numeric")
                elif not (0 <= investment_score <= 100):
                    errors.append(f"Investment score {investment_score} must be between 0-100")
            
            # Financial metrics validation
            financial_metrics = analysis_result.get('financial_metrics', {})
            
            for metric, value in financial_metrics.items():
                if value is not None and not metric.endswith('_confidence'):
                    if not isinstance(value, (int, float)):
                        errors.append(f"{metric} must be numeric")
                        continue
                    
                    # Range validation
                    if metric in self.value_ranges:
                        min_val, max_val = self.value_ranges[metric]
                        if not (min_val <= value <= max_val):
                            errors.append(f"{metric} value {value} outside expected range {min_val}-{max_val}")
            
            # Confidence scores validation
            for key, value in financial_metrics.items():
                if key.endswith('_confidence') and value is not None:
                    if not isinstance(value, (int, float)):
                        errors.append(f"{key} must be numeric")
                    elif not (0 <= value <= 100):
                        errors.append(f"{key} value {value} must be between 0-100")
            
        except Exception as e:
            errors.append(f"Validation error: {str(e)}")
        
        return len(errors) == 0, errors
    
    def get_quality_report(self, analysis_result: Dict[str, Any], 
                          property_data: Dict[str, Any],
                          context: AgentContext) -> Dict[str, Any]:
        """
        Generate comprehensive quality assessment report
        Following atlas.mdc: Detailed quality documentation
        """
        
        # Individual criterion scores
        scores = {
            'numerical_consistency': self._assess_numerical_consistency(analysis_result),
            'logical_coherence': self._assess_logical_coherence(analysis_result, context),
            'data_utilization': self._assess_data_utilization(analysis_result, property_data),
            'market_appropriateness': self._assess_market_appropriateness(analysis_result, context),
            'confidence_calibration': self._assess_confidence_calibration(analysis_result, context)
        }
        
        # Overall quality score
        overall_score = sum(
            scores[criterion] * weight 
            for criterion, weight in self.criteria_weights.items()
        )
        
        # Numerical validation
        is_valid, validation_errors = self.validate_numerical_consistency(analysis_result)
        
        # Quality grade
        if overall_score >= 90:
            grade = 'A'
        elif overall_score >= 80:
            grade = 'B'
        elif overall_score >= 70:
            grade = 'C'
        elif overall_score >= 60:
            grade = 'D'
        else:
            grade = 'F'
        
        return {
            'overall_score': int(overall_score),
            'grade': grade,
            'criterion_scores': scores,
            'is_numerically_valid': is_valid,
            'validation_errors': validation_errors,
            'assessment_timestamp': str(time.time()),
            'data_quality_context': context.data_quality_score,
            'market_context': context.market_type
        } 