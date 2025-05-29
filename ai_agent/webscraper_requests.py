"""
Unified webscraper interface for real estate property data extraction.
Supports multiple real estate platforms across different markets.
"""

import asyncio
import logging
from typing import Dict, Any, Optional
from urllib.parse import urlparse

# Import all available scrapers
from .new_funda_scraper import FundaScraper
from .fotocasa_scraper import FotocasaScraper
from .habitaclia_scraper import HabitacliaScraper
from .idealista_scraper import IdealistaScraper
from .base_scraper import BaseScraper

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# URL domain to scraper mapping
SCRAPER_MAPPING = {
    'funda.nl': FundaScraper,
    'fotocasa.es': FotocasaScraper,
    'habitaclia.com': HabitacliaScraper,
    'idealista.com': IdealistaScraper,
    'idealista.pt': IdealistaScraper,
    'idealista.it': IdealistaScraper,
}

def get_scraper_for_url(url: str) -> Optional[BaseScraper]:
    """
    Determine which scraper to use based on the URL domain.
    
    Args:
        url: The property URL to scrape
        
    Returns:
        An instance of the appropriate scraper class, or None if no match
    """
    try:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()
        
        # Remove 'www.' prefix if present
        if domain.startswith('www.'):
            domain = domain[4:]
        
        scraper_class = SCRAPER_MAPPING.get(domain)
        if scraper_class:
            logger.info(f"Using {scraper_class.__name__} for domain: {domain}")
            return scraper_class()
        else:
            logger.warning(f"No scraper available for domain: {domain}")
            return None
            
    except Exception as e:
        logger.error(f"Error parsing URL {url}: {e}")
        return None

async def scrape_property_data(url: str) -> Dict[str, Any]:
    """
    Unified function to scrape property data from any supported platform.
    
    Args:
        url: The property URL to scrape
        
    Returns:
        Dictionary containing scraped property data or error information
    """
    logger.info(f"Starting property scraping for URL: {url}")
    
    try:
        # Get the appropriate scraper
        scraper = get_scraper_for_url(url)
        if not scraper:
            return {
                "error": "No scraper available for this URL domain",
                "url": url,
                "supported_domains": list(SCRAPER_MAPPING.keys())
            }
        
        # Scrape the property data
        property_data = await scraper.scrape_property(url)
        
        if property_data:
            logger.info(f"Successfully scraped property data: {property_data.get('address', 'Unknown address')}")
            
            # Add metadata
            property_data.update({
                "scraped_url": url,
                "scraper_used": scraper.__class__.__name__,
                "scraping_timestamp": asyncio.get_event_loop().time()
            })
            
            return property_data
        else:
            logger.error(f"Scraping returned no data for URL: {url}")
            return {
                "error": "Scraping returned no data",
                "url": url,
                "scraper_used": scraper.__class__.__name__
            }
            
    except Exception as e:
        logger.error(f"Error during scraping: {e}")
        return {
            "error": f"Scraping failed: {str(e)}",
            "url": url
        }

# Additional utility functions for testing and validation
async def test_scraper_availability():
    """Test which scrapers are available and working."""
    results = {}
    
    test_urls = {
        'funda.nl': "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/",
        'fotocasa.es': "https://www.fotocasa.es/es/comprar/vivienda/madrid-capital/aire-acondicionado-calefaccion-terraza-trastero-ascensor-piscina-jardin/162447099/d",
        'habitaclia.com': "https://www.habitaclia.com/comprar-piso-en-barcelona.htm",
        'idealista.com': "https://www.idealista.com/inmueble/103456789/"
    }
    
    for domain, test_url in test_urls.items():
        try:
            scraper = get_scraper_for_url(test_url)
            if scraper:
                results[domain] = {
                    "available": True,
                    "scraper_class": scraper.__class__.__name__
                }
            else:
                results[domain] = {
                    "available": False,
                    "error": "No scraper found"
                }
        except Exception as e:
            results[domain] = {
                "available": False,
                "error": str(e)
            }
    
    return results

if __name__ == "__main__":
    # Simple test
    import asyncio
    
    async def test():
        # Test scraper availability
        availability = await test_scraper_availability()
        print("Scraper Availability:", availability)
        
        # Test a sample URL (if available)
        test_url = "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/"
        result = await scrape_property_data(test_url)
        print(f"Test scraping result: {result}")
    
    asyncio.run(test()) 