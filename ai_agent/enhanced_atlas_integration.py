"""
Enhanced Atlas Integration
Integration layer between enhanced agent and existing FastAPI backend
Following atlas.mdc: Seamless integration with backward compatibility
"""

import asyncio
import logging
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv

from agents.enhanced_atlas_agent import EnhancedAtlasAgent
from funda_scraper_requests import FundaScraperRequests
from idealista_scraper import IdealistaScraper
from fotocasa_scraper_requests import FotocasaScraperRequests
from habitaclia_scraper_requests import HabitacliaScraperRequests

load_dotenv()


class EnhancedAtlasIntegration:
    """
    Integration layer for enhanced Atlas agent
    Following atlas.mdc: Maintains compatibility while adding enhanced features
    """
    
    def __init__(self):
        """Initialize enhanced integration with existing scrapers"""
        
        # Initialize enhanced agent
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        
        self.enhanced_agent = EnhancedAtlasAgent(
            openai_api_key=api_key,
            model_name="gpt-4o"
        )
        
        # Initialize existing scrapers
        self.scrapers = {
            'funda': FundaScraperRequests(),
            'idealista': IdealistaScraper(),
            'fotocasa': FotocasaScraperRequests(),
            'habitaclia': HabitacliaScraperRequests()
        }
        
        # Configure logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
    
    async def analyze_property_url_enhanced(self, url: str, 
                                          user_preferences: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Enhanced property analysis from URL
        Following atlas.mdc: Complete workflow with agentic patterns
        """
        
        try:
            self.logger.info(f"Starting enhanced analysis for URL: {url}")
            
            # Step 1: Scrape property data using existing scrapers
            property_data = await self._scrape_property_data(url)
            
            if not property_data:
                return self._create_error_response("Failed to scrape property data", url)
            
            # Step 2: Enhanced analysis with agentic patterns
            enhanced_result = await self.enhanced_agent.analyze_property_enhanced(
                property_data=property_data,
                url=url,
                user_preferences=user_preferences
            )
            
            # Step 3: Add integration metadata
            enhanced_result['integration'] = {
                'scraper_used': property_data.get('scraper_source', 'unknown'),
                'original_url': url,
                'enhanced_analysis': True,
                'backward_compatible': True
            }
            
            self.logger.info(f"Enhanced analysis completed successfully")
            return enhanced_result
            
        except Exception as e:
            self.logger.error(f"Enhanced analysis failed: {str(e)}")
            return self._create_error_response(str(e), url)
    
    async def _scrape_property_data(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape property data using existing scrapers
        Maintains compatibility with current scraping infrastructure
        """
        
        try:
            # Determine which scraper to use based on URL
            scraper_name, scraper = self._get_scraper_for_url(url)
            
            if not scraper:
                self.logger.error(f"No suitable scraper found for URL: {url}")
                return None
            
            self.logger.info(f"Using {scraper_name} scraper for URL: {url}")
            
            # Execute scraping
            if scraper_name == 'funda':
                property_data = scraper.scrape_property(url)
            elif scraper_name == 'idealista':
                property_data = scraper.scrape_property(url)
            elif scraper_name == 'fotocasa':
                property_data = scraper.scrape_property(url)
            elif scraper_name == 'habitaclia':
                property_data = scraper.scrape_property(url)
            else:
                return None
            
            if property_data:
                property_data['scraper_source'] = scraper_name
                self.logger.info(f"Successfully scraped property data using {scraper_name}")
                return property_data
            else:
                self.logger.warning(f"No data returned from {scraper_name} scraper")
                return None
                
        except Exception as e:
            self.logger.error(f"Scraping failed: {str(e)}")
            return None
    
    def _get_scraper_for_url(self, url: str) -> tuple[str, Any]:
        """Determine appropriate scraper based on URL domain"""
        
        url_lower = url.lower()
        
        if 'funda.nl' in url_lower:
            return 'funda', self.scrapers['funda']
        elif 'idealista.com' in url_lower:
            return 'idealista', self.scrapers['idealista']
        elif 'fotocasa.es' in url_lower:
            return 'fotocasa', self.scrapers['fotocasa']
        elif 'habitaclia.com' in url_lower:
            return 'habitaclia', self.scrapers['habitaclia']
        else:
            # Try to determine by domain patterns
            if any(domain in url_lower for domain in ['.nl', 'netherlands', 'amsterdam', 'rotterdam']):
                return 'funda', self.scrapers['funda']  # Default Dutch scraper
            elif any(domain in url_lower for domain in ['.es', 'spain', 'madrid', 'barcelona']):
                return 'idealista', self.scrapers['idealista']  # Default Spanish scraper
            else:
                return None, None
    
    def _create_error_response(self, error_message: str, url: str) -> Dict[str, Any]:
        """Create standardized error response"""
        
        return {
            'analysis_type': 'error',
            'error': error_message,
            'url': url,
            'investment_score': None,
            'confidence_level': 'none',
            'message': f'Analysis failed: {error_message}',
            'recommendations': [
                'Verify the property URL is correct and accessible',
                'Check if the website is currently available',
                'Try again in a few minutes',
                'Contact support if the problem persists'
            ],
            'metadata': {
                'error_type': 'integration_error',
                'enhanced_analysis': False,
                'timestamp': str(asyncio.get_event_loop().time())
            }
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get comprehensive performance metrics"""
        
        agent_metrics = self.enhanced_agent.get_performance_metrics()
        
        return {
            'enhanced_agent': agent_metrics,
            'integration': {
                'scrapers_available': list(self.scrapers.keys()),
                'enhanced_features_active': True,
                'backward_compatibility': True
            }
        }
    
    async def analyze_property_legacy(self, url: str) -> Dict[str, Any]:
        """
        Legacy analysis method for backward compatibility
        Uses enhanced agent but returns simplified format
        """
        
        try:
            # Get enhanced analysis
            enhanced_result = await self.analyze_property_url_enhanced(url)
            
            # Convert to legacy format
            legacy_result = self._convert_to_legacy_format(enhanced_result)
            
            return legacy_result
            
        except Exception as e:
            self.logger.error(f"Legacy analysis failed: {str(e)}")
            return self._create_legacy_error_response(str(e), url)
    
    def _convert_to_legacy_format(self, enhanced_result: Dict[str, Any]) -> Dict[str, Any]:
        """Convert enhanced result to legacy format for backward compatibility"""
        
        # Extract key metrics for legacy format
        investment_score = enhanced_result.get('investment_score', 0)
        financial_metrics = enhanced_result.get('financial_metrics', {})
        
        # Build legacy response structure
        legacy_result = {
            'investment_score': investment_score,
            'address': enhanced_result.get('address', ''),
            'roi_5_year': financial_metrics.get('roi_5_year', 0),
            'roi_10_year': financial_metrics.get('roi_10_year', 0),
            'yearly_yield': financial_metrics.get('yearly_yield', 0),
            'monthly_rental': financial_metrics.get('monthly_rental', 0),
            'strengths': enhanced_result.get('strengths', []),
            'weaknesses': enhanced_result.get('weaknesses', []),
            'recommendations': enhanced_result.get('recommendations', []),
            
            # Legacy metadata
            'analysis_type': 'legacy_compatible',
            'enhanced_features_available': True,
            'upgrade_recommended': True
        }
        
        return legacy_result
    
    def _create_legacy_error_response(self, error_message: str, url: str) -> Dict[str, Any]:
        """Create legacy-compatible error response"""
        
        return {
            'investment_score': 0,
            'address': '',
            'error': error_message,
            'analysis_type': 'error',
            'recommendations': [
                'Please check the URL and try again',
                'Contact support if the issue persists'
            ]
        }


# Global integration instance for FastAPI
enhanced_integration = None

def get_enhanced_integration() -> EnhancedAtlasIntegration:
    """Get or create enhanced integration instance"""
    global enhanced_integration
    
    if enhanced_integration is None:
        enhanced_integration = EnhancedAtlasIntegration()
    
    return enhanced_integration


# Convenience functions for FastAPI integration
async def analyze_property_enhanced(url: str, user_preferences: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Enhanced property analysis - main entry point"""
    integration = get_enhanced_integration()
    return await integration.analyze_property_url_enhanced(url, user_preferences)


async def analyze_property_legacy(url: str) -> Dict[str, Any]:
    """Legacy property analysis - backward compatibility"""
    integration = get_enhanced_integration()
    return await integration.analyze_property_legacy(url)


def get_system_metrics() -> Dict[str, Any]:
    """Get system performance metrics"""
    integration = get_enhanced_integration()
    return integration.get_performance_metrics() 