"""
Investment Analysis Module for Real Estate Properties
Provides comprehensive financial analysis and investment scoring.
"""

import json
import logging
import os
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from openai import AsyncOpenAI
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class PropertyAnalysisV2:
    """Enhanced property analysis data structure"""
    investment_score: int
    estimated_rent: float
    yearly_yield: float
    yearly_appreciation_percentage: float
    yearly_appreciation_value: float
    roi_5_years: float
    roi_10_years: float
    strengths: List[str]
    weaknesses: List[str]
    analysis_explanation: str
    market_notes: str
    confidence_score: float = 0.85
    analysis_timestamp: str = None
    
    def __post_init__(self):
        if self.analysis_timestamp is None:
            self.analysis_timestamp = datetime.now().isoformat()

class InvestmentAnalyzer:
    """Advanced real estate investment analyzer with AI-powered analysis"""
    
    def __init__(self):
        self.client = None
        api_key = os.getenv('OPENAI_API_KEY')
        if api_key:
            self.client = AsyncOpenAI(api_key=api_key)
        else:
            logger.warning("OpenAI API key not found. Will use fallback analysis.")
    
    async def analyze_property_investment(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze property investment potential with comprehensive metrics.
        
        Args:
            property_data: Dictionary containing property information
            
        Returns:
            Dictionary with investment analysis results
        """
        try:
            logger.info(f"Starting investment analysis for property: {property_data.get('address', 'Unknown')}")
            
            # Try AI-powered analysis first
            if self.client:
                ai_result = await self._ai_investment_analysis(property_data)
                if ai_result and 'error' not in ai_result:
                    return ai_result
            
            # Fallback to rule-based analysis
            logger.info("Using fallback rule-based analysis")
            return self._fallback_investment_analysis(property_data)
            
        except Exception as e:
            logger.error(f"Investment analysis failed: {e}")
            return {
                "error": f"Analysis failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    async def _ai_investment_analysis(self, property_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Use AI for comprehensive investment analysis"""
        try:
            # Determine market type for appropriate analysis
            market_type = self._detect_market_type(property_data)
            
            # Prepare property data for AI
            property_summary = self._format_property_for_ai(property_data)
            
            # Get market-specific prompt
            prompt = self._get_analysis_prompt(market_type, property_summary)
            
            response = await self.client.chat.completions.create(
                model="gpt-4-turbo",
                messages=[
                    {"role": "system", "content": f"You are an expert real estate investment analyst specializing in the {market_type} market. Provide analysis in JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            
            analysis_json = response.choices[0].message.content
            analysis_data = json.loads(analysis_json)
            
            # Validate and enhance the AI response
            return self._enhance_ai_analysis(analysis_data, property_data)
            
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return None
    
    def _detect_market_type(self, property_data: Dict[str, Any]) -> str:
        """Detect market type from property data or URL"""
        url = property_data.get('scraped_url', property_data.get('url', ''))
        
        if 'funda.nl' in url:
            return 'Dutch'
        elif any(domain in url for domain in ['idealista.com', 'fotocasa.es', 'habitaclia.com']):
            return 'Spanish'
        else:
            return 'International'
    
    def _format_property_for_ai(self, property_data: Dict[str, Any]) -> str:
        """Format property data for AI analysis"""
        formatted_data = []
        
        # Key property information
        key_fields = [
            'address', 'price', 'size', 'bedrooms', 'bathrooms', 
            'description', 'features', 'energy_rating', 'property_type'
        ]
        
        for field in key_fields:
            value = property_data.get(field)
            if value:
                formatted_data.append(f"{field.title()}: {value}")
        
        return "\n".join(formatted_data)
    
    def _get_analysis_prompt(self, market_type: str, property_summary: str) -> str:
        """Get market-specific analysis prompt"""
        base_prompt = f"""
        Analyze the following {market_type} property for investment potential:

        {property_summary}

        Provide a comprehensive investment analysis with:
        - Investment score (0-100)
        - Estimated monthly rental income
        - Yearly rental yield (%)
        - Yearly appreciation percentage (%)
        - Yearly appreciation value (absolute)
        - 5-year ROI (%)
        - 10-year ROI (%)
        - List of investment strengths
        - List of investment weaknesses
        - Brief analysis explanation
        - Market-specific notes

        Return ONLY a JSON object with keys: "investment_score", "estimated_rent", 
        "yearly_yield", "yearly_appreciation_percentage", "yearly_appreciation_value", 
        "roi_5_years", "roi_10_years", "strengths", "weaknesses", "analysis_explanation", 
        "market_notes".
        """
        
        # Market-specific additions
        if market_type == 'Dutch':
            base_prompt += """
            
            Consider Dutch market factors:
            - Energy efficiency requirements and labels
            - Rental point system and regulations
            - High demand in major cities (Amsterdam, Rotterdam, Utrecht)
            - Property tax (WOZ) implications
            - Notary fees and transfer costs
            """
        elif market_type == 'Spanish':
            base_prompt += """
            
            Consider Spanish market factors:
            - Tourism rental potential
            - Regional tax variations
            - Golden Visa eligibility (500k€+)
            - Seasonal market fluctuations
            - Energy efficiency certificates
            """
        
        return base_prompt
    
    def _enhance_ai_analysis(self, ai_data: Dict[str, Any], property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance AI analysis with additional calculations and metadata"""
        # Ensure all required fields are present with defaults
        enhanced_analysis = {
            "investment_score": ai_data.get("investment_score", 50),
            "estimated_rent": ai_data.get("estimated_rent", 0),
            "yearly_yield": ai_data.get("yearly_yield", 0),
            "yearly_appreciation_percentage": ai_data.get("yearly_appreciation_percentage", 3.5),
            "yearly_appreciation_value": ai_data.get("yearly_appreciation_value", 0),
            "roi_5_years": ai_data.get("roi_5_years", 0),
            "roi_10_years": ai_data.get("roi_10_years", 0),
            "strengths": ai_data.get("strengths", []),
            "weaknesses": ai_data.get("weaknesses", []),
            "analysis_explanation": ai_data.get("analysis_explanation", "AI-powered investment analysis"),
            "market_notes": ai_data.get("market_notes", ""),
            
            # Additional metadata
            "analysis_type": "ai_powered",
            "confidence_score": 0.9,
            "timestamp": datetime.now().isoformat(),
            "market_type": self._detect_market_type(property_data)
        }
        
        return enhanced_analysis
    
    def _fallback_investment_analysis(self, property_data: Dict[str, Any]) -> Dict[str, Any]:
        """Rule-based fallback analysis when AI is not available"""
        try:
            # Extract basic property info
            price = self._extract_price(property_data.get('price', '0'))
            size = float(property_data.get('size', property_data.get('size_sqm', 85)))
            bedrooms = int(property_data.get('bedrooms', 2))
            
            # Basic calculations
            price_per_sqm = price / size if size > 0 else 0
            estimated_rent = self._estimate_rent(price, size, bedrooms)
            yearly_yield = (estimated_rent * 12 / price * 100) if price > 0 else 0
            
            # Investment scoring based on simple rules
            investment_score = self._calculate_investment_score(
                yearly_yield, price_per_sqm, size, bedrooms
            )
            
            return {
                "investment_score": investment_score,
                "estimated_rent": estimated_rent,
                "yearly_yield": yearly_yield,
                "yearly_appreciation_percentage": 3.5,  # Default assumption
                "yearly_appreciation_value": price * 0.035,
                "roi_5_years": yearly_yield * 5 + 3.5 * 5,  # Simplified calculation
                "roi_10_years": yearly_yield * 10 + 3.5 * 10,
                "strengths": ["Property analysis completed", "Basic financial metrics calculated"],
                "weaknesses": ["Limited market data", "General assumptions used"],
                "analysis_explanation": "Rule-based analysis using general market assumptions",
                "market_notes": "Consider professional market analysis for detailed insights",
                "analysis_type": "rule_based",
                "confidence_score": 0.6,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Fallback analysis failed: {e}")
            return {
                "error": f"Fallback analysis failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
    
    def _extract_price(self, price_str: str) -> float:
        """Extract numeric price from string"""
        try:
            # Remove common currency symbols and text
            cleaned = str(price_str).replace('€', '').replace('$', '').replace(',', '').replace('.', '')
            # Extract numbers
            import re
            numbers = re.findall(r'\d+', cleaned)
            if numbers:
                return float(''.join(numbers))
            return 320000  # Default fallback price
        except:
            return 320000
    
    def _estimate_rent(self, price: float, size: float, bedrooms: int) -> float:
        """Simple rent estimation based on property characteristics"""
        # Very basic estimation - in reality this would use market data
        base_rent = price * 0.004  # 0.4% of price per month as starting point
        
        # Adjust for size
        if size > 100:
            base_rent *= 1.1
        elif size < 50:
            base_rent *= 0.9
        
        # Adjust for bedrooms
        base_rent *= (1 + (bedrooms - 1) * 0.1)
        
        return round(base_rent, 2)
    
    def _calculate_investment_score(self, yield_pct: float, price_per_sqm: float, 
                                  size: float, bedrooms: int) -> int:
        """Calculate investment score based on basic metrics"""
        score = 50  # Base score
        
        # Yield scoring (30% weight)
        if yield_pct > 6:
            score += 25
        elif yield_pct > 4:
            score += 15
        elif yield_pct > 2:
            score += 5
        
        # Size scoring (20% weight)
        if 60 <= size <= 120:  # Optimal size range
            score += 15
        elif size > 40:
            score += 10
        
        # Bedroom scoring (15% weight)
        if bedrooms >= 2:
            score += 10
        
        # Ensure score is within bounds
        return max(0, min(100, score))

# Utility functions for backwards compatibility
async def analyze_property_url(url: str) -> Dict[str, Any]:
    """Convenience function for URL-based analysis"""
    from .webscraper_requests import scrape_property_data
    
    # Scrape property data
    property_data = await scrape_property_data(url)
    
    if 'error' in property_data:
        return property_data
    
    # Analyze investment potential
    analyzer = InvestmentAnalyzer()
    analysis_result = await analyzer.analyze_property_investment(property_data)
    
    # Combine results
    return {
        **property_data,
        "investment_analysis": analysis_result
    }

if __name__ == "__main__":
    # Test the analyzer
    import asyncio
    
    async def test():
        analyzer = InvestmentAnalyzer()
        
        # Test with sample data
        test_data = {
            "price": "€ 450.000",
            "size": 85,
            "bedrooms": 2,
            "bathrooms": 1,
            "address": "Amsterdam, Netherlands",
            "description": "Beautiful apartment in city center"
        }
        
        result = await analyzer.analyze_property_investment(test_data)
        print(json.dumps(result, indent=2))
    
    asyncio.run(test()) 