"""
Abstract base class for all property scrapers.
Provides a unified interface for different real estate websites.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import logging
import asyncio
import random
from datetime import datetime


class BaseScraper(ABC):
    """Abstract base class for all property scrapers"""
    
    def __init__(self, proxy: Optional[Dict[str, str]] = None, logger: Optional[logging.Logger] = None):
        """
        Initialize base scraper with common configuration.
        
        Args:
            proxy: Optional proxy configuration with 'server', 'username', 'password'
            logger: Optional logger instance, creates one if not provided
        """
        self.proxy = proxy
        self.logger = logger or logging.getLogger(self.__class__.__name__)
        self.session_start_time = None
        self.request_count = 0
        
    @abstractmethod
    async def start(self) -> None:
        """
        Initialize scraper resources (browser, session, etc.).
        Must be called before scraping.
        """
        self.session_start_time = datetime.now()
        self.logger.info(f"{self.get_site_name()} scraper started")
        
    @abstractmethod
    async def scrape_property(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape property data from a single URL.
        
        Args:
            url: The property listing URL
            
        Returns:
            Dictionary containing property data or None if scraping failed
            
        Expected keys:
            - Address: Full property address
            - Price: Property price (with currency)
            - Living Area: Living area in m²
            - Bedrooms: Number of bedrooms
            - Bathrooms: Number of bathrooms
            - Year Built: Construction year
            - Property Type: Type of property (apartment, house, etc.)
            - Description: Property description (optional)
            - Plot Size: Plot size in m² (optional)
            - Energy Label: Energy efficiency rating (optional)
            - Listing Date: When the property was listed (optional)
        """
        pass
        
    @abstractmethod
    async def close(self) -> None:
        """
        Clean up scraper resources.
        Must be called when done scraping.
        """
        if self.session_start_time:
            duration = datetime.now() - self.session_start_time
            self.logger.info(
                f"{self.get_site_name()} scraper closed. "
                f"Session duration: {duration}, Requests made: {self.request_count}"
            )
            
    @abstractmethod
    def get_site_name(self) -> str:
        """
        Return the name of the site being scraped.
        Used for logging and identification.
        """
        pass
        
    async def scrape_multiple(self, urls: List[str], delay_range: tuple = (5, 15)) -> List[Dict[str, Any]]:
        """
        Scrape multiple property URLs with delays between requests.
        
        Args:
            urls: List of property URLs to scrape
            delay_range: Tuple of (min, max) seconds to wait between requests
            
        Returns:
            List of scraped property data dictionaries
        """
        results = []
        
        for i, url in enumerate(urls):
            self.logger.info(f"Scraping {i+1}/{len(urls)}: {url}")
            
            try:
                data = await self.scrape_property(url)
                if data:
                    data['URL'] = url
                    data['Site'] = self.get_site_name()
                    data['Scraped'] = True
                    data['Scraped At'] = datetime.now().isoformat()
                    results.append(data)
                else:
                    results.append({
                        'URL': url,
                        'Site': self.get_site_name(),
                        'Scraped': False,
                        'Error': 'Scraping returned no data'
                    })
                    
                self.request_count += 1
                
            except Exception as e:
                self.logger.error(f"Error scraping {url}: {str(e)}")
                results.append({
                    'URL': url,
                    'Site': self.get_site_name(),
                    'Scraped': False,
                    'Error': str(e)
                })
                
            # Add delay between requests (except for the last one)
            if i < len(urls) - 1:
                delay = random.uniform(*delay_range)
                self.logger.info(f"Waiting {delay:.1f} seconds before next request...")
                await asyncio.sleep(delay)
                
        return results
        
    def standardize_price(self, price_str: str) -> str:
        """
        Standardize price format across different sites.
        Override if needed for specific formatting.
        
        Args:
            price_str: Raw price string from the website
            
        Returns:
            Standardized price string
        """
        # Remove common separators and ensure currency symbol
        price_str = price_str.strip()
        if '€' not in price_str and '$' not in price_str:
            price_str = f"{price_str} €"
        return price_str
        
    def standardize_area(self, area_str: str) -> str:
        """
        Standardize area format across different sites.
        
        Args:
            area_str: Raw area string from the website
            
        Returns:
            Standardized area string with m²
        """
        area_str = area_str.strip()
        if 'm²' not in area_str and 'm2' not in area_str:
            area_str = f"{area_str} m²"
        return area_str.replace('m2', 'm²') 