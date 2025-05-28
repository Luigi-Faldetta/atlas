"""
Agent Context Manager
Following atlas.mdc: Adaptive context handling for enhanced agent behavior
"""

from typing import Dict, Any, Optional
from dataclasses import dataclass
from urllib.parse import urlparse
import re


@dataclass
class AgentContext:
    """
    Context container for adaptive agent behavior
    Following atlas.mdc: Context-aware adaptation patterns
    """
    market_type: str
    data_quality_score: int
    user_expertise: str
    complexity_level: str
    confidence_threshold: int
    fallback_required: bool
    market_specific_factors: Dict[str, Any]
    

class ContextManager:
    """
    Manages adaptive context for enhanced agent behavior
    Following atlas.mdc: Dynamic behavior based on data quality and user expertise
    """
    
    # Market detection patterns
    MARKET_PATTERNS = {
        'dutch': [
            'funda.nl', 'jaap.nl', 'pararius.nl', 'kamernet.nl',
            'netherlands', 'amsterdam', 'rotterdam', 'utrecht', 'den haag'
        ],
        'spanish': [
            'idealista.com', 'fotocasa.es', 'habitaclia.com', 'pisos.com',
            'spain', 'madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao'
        ]
    }
    
    # Data quality assessment criteria
    QUALITY_CRITERIA = {
        'essential_fields': ['price', 'address', 'living_area'],
        'important_fields': ['bedrooms', 'bathrooms', 'year_built'],
        'optional_fields': ['energy_label', 'garden', 'parking', 'balcony'],
        'financial_fields': ['monthly_costs', 'property_tax', 'hoa_fees']
    }
    
    def __init__(self):
        """Initialize context manager with default settings"""
        self.default_context = AgentContext(
            market_type='general',
            data_quality_score=50,
            user_expertise='professional',
            complexity_level='standard',
            confidence_threshold=70,
            fallback_required=False,
            market_specific_factors={}
        )
    
    def create_agent_context(self, property_data: Dict[str, Any], 
                           url: Optional[str] = None,
                           user_preferences: Optional[Dict[str, Any]] = None) -> AgentContext:
        """
        Create adaptive context based on property data and user preferences
        Following atlas.mdc: Context-aware adaptation
        """
        
        # Detect market type
        market_type = self._detect_market_type(property_data, url)
        
        # Assess data quality
        data_quality_score = self._assess_data_quality(property_data)
        
        # Determine complexity level
        complexity_level = self._determine_complexity_level(data_quality_score, market_type)
        
        # Set user expertise level
        user_expertise = self._get_user_expertise(user_preferences)
        
        # Calculate confidence threshold
        confidence_threshold = self._calculate_confidence_threshold(
            data_quality_score, user_expertise
        )
        
        # Determine if fallback is required
        fallback_required = data_quality_score < 30 or self._has_critical_missing_data(property_data)
        
        # Get market-specific factors
        market_specific_factors = self._get_market_specific_factors(market_type, property_data)
        
        return AgentContext(
            market_type=market_type,
            data_quality_score=data_quality_score,
            user_expertise=user_expertise,
            complexity_level=complexity_level,
            confidence_threshold=confidence_threshold,
            fallback_required=fallback_required,
            market_specific_factors=market_specific_factors
        )
    
    def _detect_market_type(self, property_data: Dict[str, Any], url: Optional[str] = None) -> str:
        """Detect market type from URL and property data"""
        
        # Check URL domain
        if url:
            domain = urlparse(url).netloc.lower()
            for market, patterns in self.MARKET_PATTERNS.items():
                if any(pattern in domain for pattern in patterns):
                    return market
        
        # Check address/location data
        address_text = str(property_data.get('address', '')).lower()
        location_text = str(property_data.get('location', '')).lower()
        combined_text = f"{address_text} {location_text}"
        
        for market, patterns in self.MARKET_PATTERNS.items():
            if any(pattern in combined_text for pattern in patterns):
                return market
        
        return 'general'
    
    def _assess_data_quality(self, property_data: Dict[str, Any]) -> int:
        """
        Assess data quality based on completeness and reliability
        Returns score 0-100
        """
        score = 0
        total_possible = 100
        
        # Essential fields (40 points)
        essential_score = 0
        for field in self.QUALITY_CRITERIA['essential_fields']:
            if self._has_valid_data(property_data, field):
                essential_score += 40 // len(self.QUALITY_CRITERIA['essential_fields'])
        score += essential_score
        
        # Important fields (30 points)
        important_score = 0
        for field in self.QUALITY_CRITERIA['important_fields']:
            if self._has_valid_data(property_data, field):
                important_score += 30 // len(self.QUALITY_CRITERIA['important_fields'])
        score += important_score
        
        # Optional fields (20 points)
        optional_score = 0
        for field in self.QUALITY_CRITERIA['optional_fields']:
            if self._has_valid_data(property_data, field):
                optional_score += 20 // len(self.QUALITY_CRITERIA['optional_fields'])
        score += optional_score
        
        # Financial fields (10 points)
        financial_score = 0
        for field in self.QUALITY_CRITERIA['financial_fields']:
            if self._has_valid_data(property_data, field):
                financial_score += 10 // len(self.QUALITY_CRITERIA['financial_fields'])
        score += financial_score
        
        return min(score, 100)
    
    def _has_valid_data(self, property_data: Dict[str, Any], field: str) -> bool:
        """Check if field has valid, non-empty data"""
        value = property_data.get(field)
        if value is None or value == "" or value == "N/A":
            return False
        
        # Check for numeric fields
        if field in ['price', 'living_area', 'bedrooms', 'bathrooms', 'year_built']:
            try:
                float(str(value).replace('€', '').replace(',', '').replace(' ', ''))
                return True
            except (ValueError, TypeError):
                return False
        
        return True
    
    def _determine_complexity_level(self, data_quality_score: int, market_type: str) -> str:
        """Determine analysis complexity level based on data quality and market"""
        
        if data_quality_score >= 80:
            return 'comprehensive'
        elif data_quality_score >= 60:
            return 'standard'
        elif data_quality_score >= 40:
            return 'simplified'
        else:
            return 'basic'
    
    def _get_user_expertise(self, user_preferences: Optional[Dict[str, Any]]) -> str:
        """Determine user expertise level from preferences"""
        if not user_preferences:
            return 'professional'
        
        return user_preferences.get('expertise_level', 'professional')
    
    def _calculate_confidence_threshold(self, data_quality_score: int, user_expertise: str) -> int:
        """Calculate appropriate confidence threshold based on context"""
        
        base_threshold = 70
        
        # Adjust for data quality
        if data_quality_score >= 80:
            base_threshold -= 10
        elif data_quality_score < 50:
            base_threshold += 15
        
        # Adjust for user expertise
        if user_expertise == 'beginner':
            base_threshold += 10
        elif user_expertise == 'expert':
            base_threshold -= 5
        
        return max(50, min(90, base_threshold))
    
    def _has_critical_missing_data(self, property_data: Dict[str, Any]) -> bool:
        """Check if critical data is missing that would require fallback"""
        
        critical_fields = ['price', 'address']
        for field in critical_fields:
            if not self._has_valid_data(property_data, field):
                return True
        
        return False
    
    def _get_market_specific_factors(self, market_type: str, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get market-specific factors for analysis adaptation"""
        
        factors = {}
        
        if market_type == 'dutch':
            factors.update({
                'rental_point_system': True,
                'energy_label_required': True,
                'woz_tax_applicable': True,
                'social_housing_regulations': True,
                'typical_yield_range': (3.5, 6.5),
                'appreciation_rate': 4.2
            })
        
        elif market_type == 'spanish':
            factors.update({
                'golden_visa_eligible': self._check_golden_visa_eligibility(property_data),
                'tourism_potential': self._assess_tourism_potential(property_data),
                'regional_tax_variations': True,
                'seasonal_rental_potential': True,
                'typical_yield_range': (4.0, 7.5),
                'appreciation_rate': 3.8
            })
        
        else:
            factors.update({
                'general_analysis': True,
                'typical_yield_range': (4.0, 8.0),
                'appreciation_rate': 3.0
            })
        
        return factors
    
    def _check_golden_visa_eligibility(self, property_data: Dict[str, Any]) -> bool:
        """Check if property is eligible for Spanish Golden Visa (€500k+)"""
        try:
            price_str = str(property_data.get('price', '0'))
            price = float(re.sub(r'[^\d.]', '', price_str))
            return price >= 500000
        except (ValueError, TypeError):
            return False
    
    def _assess_tourism_potential(self, property_data: Dict[str, Any]) -> str:
        """Assess tourism potential for Spanish properties"""
        address = str(property_data.get('address', '')).lower()
        location = str(property_data.get('location', '')).lower()
        combined = f"{address} {location}"
        
        high_tourism_areas = [
            'barcelona', 'madrid', 'valencia', 'sevilla', 'bilbao',
            'costa del sol', 'costa brava', 'mallorca', 'ibiza',
            'canarias', 'tenerife', 'gran canaria'
        ]
        
        if any(area in combined for area in high_tourism_areas):
            return 'high'
        elif 'costa' in combined or 'playa' in combined:
            return 'medium'
        else:
            return 'low'
    
    def update_context_from_feedback(self, context: AgentContext, 
                                   feedback: Dict[str, Any]) -> AgentContext:
        """
        Update context based on user feedback for iterative improvement
        Following atlas.mdc: Adaptive learning patterns
        """
        
        # Adjust confidence threshold based on feedback
        if feedback.get('analysis_too_conservative'):
            context.confidence_threshold = max(50, context.confidence_threshold - 5)
        elif feedback.get('analysis_too_aggressive'):
            context.confidence_threshold = min(90, context.confidence_threshold + 5)
        
        # Adjust complexity level based on user preference
        if feedback.get('too_detailed'):
            complexity_map = {
                'comprehensive': 'standard',
                'standard': 'simplified',
                'simplified': 'basic'
            }
            context.complexity_level = complexity_map.get(context.complexity_level, context.complexity_level)
        
        elif feedback.get('too_simple'):
            complexity_map = {
                'basic': 'simplified',
                'simplified': 'standard', 
                'standard': 'comprehensive'
            }
            context.complexity_level = complexity_map.get(context.complexity_level, context.complexity_level)
        
        return context 