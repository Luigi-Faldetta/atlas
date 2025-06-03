#!/usr/bin/env python3
"""
Optimized Funda Scraper - Addresses All Test Issues
Fixes data extraction failures and improves processing time
"""

import asyncio
import json
import logging
import os
import re
import time
from typing import Dict, List, Optional, Any
import httpx
import requests
from bs4 import BeautifulSoup
from dataclasses import dataclass
from urllib.parse import urlparse, urljoin
from dotenv import load_dotenv

load_dotenv()

@dataclass
class FundaScrapingResult:
    """Structured result for Funda scraping"""
    success: bool
    data: Dict[str, Any] = None
    error: str = None
    processing_time: float = 0.0
    data_quality_score: float = 0.0
    method_used: str = 'unknown'
    api_credits_used: int = 0

class OptimizedFundaScraper:
    """
    Optimized Funda scraper that addresses test failures and improves performance
    Uses multiple extraction strategies for maximum reliability
    """
    
    def __init__(self, scrapingbee_api_key: str = None):
        self.scrapingbee_api_key = scrapingbee_api_key or os.getenv('SCRAPINGBEE_API_KEY')
        self.session = None
        self.requests_session = None
        self.logger = logging.getLogger(__name__)
        
        # Funda-specific selectors (updated for current layout)
        self.selectors = {
            'address_primary': [
                'h1[data-test-id="street-name-house-number"]',
                'h1 span.object-header__title',
                '.object-header h1',
                'h1.object-header__title'
            ],
            'address_secondary': [
                'h1[data-test-id="postal-code-city"]', 
                '.object-header__subtitle',
                'h1 + div',
                '.object-header .fd-text--nowrap'
            ],
            'price': [
                '[data-test-id="price-label"]',
                '.object-header__price',
                '.object-price span',
                '.price-label span',
                'div[class*="price"] span'
            ],
            'living_area': [
                '[data-test-id="usable-surface"]',
                '.object-kenmerken-body dt:contains("Woonoppervlakte") + dd',
                '.kenmerken dt:contains("Woonoppervlakte") + dd',
                '.fd-list dt:contains("Woonoppervlakte") + dd'
            ],
            'bedrooms': [
                '[data-test-id="bedrooms"]',
                '.object-kenmerken-body dt:contains("slaapkamer") + dd',
                '.kenmerken dt:contains("Aantal kamers") + dd',
                '.fd-list dt:contains("kamers") + dd'
            ],
            'bathrooms': [
                '[data-test-id="bathrooms"]',
                '.object-kenmerken-body dt:contains("Badkamer") + dd',
                '.kenmerken dt:contains("Badkamer") + dd',
                '.fd-list dt:contains("Badkamer") + dd'
            ],
            'year_built': [
                '[data-test-id="year-of-construction"]',
                '.object-kenmerken-body dt:contains("Bouwjaar") + dd',
                '.kenmerken dt:contains("Bouwjaar") + dd',
                '.fd-list dt:contains("Bouwjaar") + dd'
            ],
            'images': [
                'img[data-test-id="object-media-image"]',
                '.object-media-gallery img',
                '.media-gallery img',
                '.object-media img'
            ]
        }
        
        # Regex patterns for fallback extraction
        self.patterns = {
            'price': [
                r'vraagprijs["\s:]*[€\s]*([0-9.,]+)',
                r'koopprijs["\s:]*[€\s]*([0-9.,]+)',
                r'€\s*([0-9]{1,3}(?:\.[0-9]{3})*)',
                r'([0-9]{1,3}(?:\.[0-9]{3})*)\s*euro',
                r'"price"[:\s]*([0-9]+)',
                r'price["\s:]*[€\s]*([0-9.,]+)'
            ],
            'living_area': [
                r'woonoppervlakte["\s:]*([0-9]+(?:[.,][0-9]+)?)',
                r'gebruiksoppervlakte["\s:]*([0-9]+(?:[.,][0-9]+)?)',
                r'([0-9]+(?:[.,][0-9]+)?)\s*m[²2](?:\s*woon)',
                r'"usableSurface"[:\s]*([0-9]+)',
                r'usable_surface["\s:]*([0-9]+)'
            ],
            'bedrooms': [
                r'aantal\s*kamers["\s:]*([0-9]+)',
                r'slaapkamers?["\s:]*([0-9]+)',
                r'([0-9]+)\s*slaapkamer',
                r'"numberOfRooms"[:\s]*([0-9]+)',
                r'number_of_rooms["\s:]*([0-9]+)'
            ],
            'bathrooms': [
                r'badkamers?["\s:]*([0-9]+)',
                r'([0-9]+)\s*badkamer',
                r'"numberOfBathrooms"[:\s]*([0-9]+)',
                r'number_of_bathrooms["\s:]*([0-9]+)'
            ],
            'year_built': [
                r'bouwjaar["\s:]*([0-9]{4})',
                r'gebouwd\s*(?:in\s*)?([0-9]{4})',
                r'"yearOfConstruction"[:\s]*([0-9]{4})',
                r'year_of_construction["\s:]*([0-9]{4})',
                r'constructionYear["\s:]*([0-9]{4})'
            ]
        }
    
    async def start(self):
        """Initialize HTTP sessions"""
        # Async session for ScrapingBee
        self.session = httpx.AsyncClient(
            timeout=httpx.Timeout(60.0),
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        )
        
        # Sync session for direct requests
        self.requests_session = requests.Session()
        self.requests_session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'nl-NL,nl;q=0.9,en-US,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none'
        })
        
        self.logger.info("Optimized Funda scraper initialized")
    
    async def close(self):
        """Close HTTP sessions"""
        if self.session:
            await self.session.aclose()
        if self.requests_session:
            self.requests_session.close()
    
    async def scrape_property_optimized(self, url: str) -> FundaScrapingResult:
        """
        Main scraping method with multiple strategies for maximum reliability
        """
        start_time = time.time()
        
        try:
            self.logger.info(f"🏠 Starting optimized Funda scraping: {url}")
            
            # Strategy 1: Try enhanced direct scraping (fastest)
            result = await self._scrape_direct_enhanced(url)
            if result.success and result.data_quality_score >= 70:
                result.processing_time = time.time() - start_time
                self.logger.info(f"✅ Direct scraping successful (Quality: {result.data_quality_score:.1f}%)")
                return result
            
            # Strategy 2: Try ScrapingBee if available and direct failed
            if self.scrapingbee_api_key:
                self.logger.info("🔄 Trying ScrapingBee as fallback...")
                scrapingbee_result = await self._scrape_scrapingbee_optimized(url)
                if scrapingbee_result.success and scrapingbee_result.data_quality_score >= 50:
                    scrapingbee_result.processing_time = time.time() - start_time
                    self.logger.info(f"✅ ScrapingBee scraping successful (Quality: {scrapingbee_result.data_quality_score:.1f}%)")
                    return scrapingbee_result
            
            # Strategy 3: Enhanced pattern matching on any available HTML
            if result.data and 'raw_html' in result.data:
                enhanced_result = await self._enhance_with_patterns(result.data['raw_html'], url)
                if enhanced_result.data_quality_score > result.data_quality_score:
                    enhanced_result.processing_time = time.time() - start_time
                    return enhanced_result
            
            # Return best available result
            result.processing_time = time.time() - start_time
            return result
            
        except Exception as e:
            self.logger.error(f"❌ Optimized scraping failed: {e}")
            return FundaScrapingResult(
                success=False,
                error=str(e),
                processing_time=time.time() - start_time,
                method_used='error'
            )
    
    async def _scrape_direct_enhanced(self, url: str) -> FundaScrapingResult:
        """
        Enhanced direct scraping with improved headers and error handling
        """
        try:
            # Add random delay to avoid detection
            await asyncio.sleep(0.5)
            
            response = await self.session.get(url)
            response.raise_for_status()
            
            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            # Extract data using multiple strategies
            data = await self._extract_data_comprehensive(soup, html, url)
            quality_score = self._calculate_quality_score(data)
            
            return FundaScrapingResult(
                success=True,
                data=data,
                data_quality_score=quality_score,
                method_used='direct_enhanced',
                api_credits_used=0
            )
            
        except Exception as e:
            self.logger.warning(f"Direct scraping failed: {e}")
            return FundaScrapingResult(
                success=False,
                error=str(e),
                method_used='direct_enhanced'
            )
    
    async def _scrape_scrapingbee_optimized(self, url: str) -> FundaScrapingResult:
        """
        Optimized ScrapingBee scraping with corrected parameters
        """
        if not self.scrapingbee_api_key:
            return FundaScrapingResult(
                success=False,
                error="ScrapingBee API key not available",
                method_used='scrapingbee'
            )
        
        try:
            # Optimized parameters to avoid 400 errors
            params = {
                'api_key': self.scrapingbee_api_key,
                'url': url,
                'render_js': 'true',
                'premium_proxy': 'true',
                'country_code': 'nl',
                'wait': '3000',
                'block_ads': 'true'
            }
            
            response = await self.session.get(
                'https://app.scrapingbee.com/api/v1/',
                params=params,
                timeout=60
            )
            
            if response.status_code != 200:
                self.logger.error(f"ScrapingBee error: {response.status_code} - {response.text}")
                return FundaScrapingResult(
                    success=False,
                    error=f"ScrapingBee API error: {response.status_code}",
                    method_used='scrapingbee',
                    api_credits_used=1
                )
            
            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            data = await self._extract_data_comprehensive(soup, html, url)
            quality_score = self._calculate_quality_score(data)
            
            return FundaScrapingResult(
                success=True,
                data=data,
                data_quality_score=quality_score,
                method_used='scrapingbee',
                api_credits_used=1
            )
            
        except Exception as e:
            self.logger.error(f"ScrapingBee scraping failed: {e}")
            return FundaScrapingResult(
                success=False,
                error=str(e),
                method_used='scrapingbee',
                api_credits_used=1
            )
    
    async def _extract_data_comprehensive(self, soup: BeautifulSoup, html: str, url: str) -> Dict[str, Any]:
        """
        Comprehensive data extraction using multiple strategies
        """
        data = {
            'Address': 'Not found',
            'Price': 'Not found',
            'Living Area': 'Not found',
            'Bedrooms': 'Not found',
            'Bathrooms': 'Not found',
            'Year Built': 'Not found',
            'Property Image': None,
            'URL': url,
            'Platform': 'Funda',
            'raw_html': html[:10000]  # Store partial HTML for debugging
        }
        
        # Extract address
        data['Address'] = await self._extract_address(soup, html)
        
        # Extract price
        data['Price'] = await self._extract_price(soup, html)
        
        # Extract living area
        data['Living Area'] = await self._extract_living_area(soup, html)
        
        # Extract bedrooms
        data['Bedrooms'] = await self._extract_bedrooms(soup, html)
        
        # Extract bathrooms
        data['Bathrooms'] = await self._extract_bathrooms(soup, html)
        
        # Extract year built
        data['Year Built'] = await self._extract_year_built(soup, html)
        
        # Extract property image
        data['Property Image'] = await self._extract_property_image(soup, url)
        
        return data
    
    async def _extract_address(self, soup: BeautifulSoup, html: str) -> str:
        """Extract property address with multiple strategies"""
        
        # Strategy 1: Current Funda layout selectors
        for selector in self.selectors['address_primary']:
            elem = soup.select_one(selector)
            if elem:
                street = elem.get_text(strip=True)
                
                # Try to get city/postal code
                for city_selector in self.selectors['address_secondary']:
                    city_elem = soup.select_one(city_selector)
                    if city_elem:
                        city = city_elem.get_text(strip=True)
                        return f"{street}, {city}"
                
                # Return just street if city not found
                if street and len(street) > 5:
                    return street
        
        # Strategy 2: JSON-LD structured data
        json_scripts = soup.find_all('script', type='application/ld+json')
        for script in json_scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and 'address' in data:
                    address = data['address']
                    if isinstance(address, dict):
                        street = address.get('streetAddress', '')
                        city = address.get('addressLocality', '')
                        postal = address.get('postalCode', '')
                        if street:
                            return f"{street}, {postal} {city}".strip()
            except:
                continue
        
        # Strategy 3: Meta tags
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            title = og_title['content']
            # Funda titles often contain address
            if any(word in title.lower() for word in ['te koop', 'verkocht', 'amsterdam', 'utrecht', 'rotterdam']):
                return title.split(' te koop')[0].split(' verkocht')[0].strip()
        
        # Strategy 4: Regex patterns in HTML
        address_patterns = [
            r'<h1[^>]*>([^<]+(?:\s+[^<]*)?)</h1>',
            r'"streetAddress"\s*:\s*"([^"]+)"',
            r'"address"\s*:\s*"([^"]+)"',
            r'property-address["\s:]*"([^"]+)"'
        ]
        
        for pattern in address_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                address = re.sub(r'<[^>]+>', '', match.group(1)).strip()
                if len(address) > 10 and not any(skip in address.lower() for skip in ['javascript', 'function', 'var ']):
                    return address
        
        return 'Not found'
    
    async def _extract_price(self, soup: BeautifulSoup, html: str) -> str:
        """Extract property price with multiple strategies"""
        
        # Strategy 1: Selector-based extraction
        for selector in self.selectors['price']:
            elem = soup.select_one(selector)
            if elem:
                price_text = elem.get_text(strip=True)
                if any(char.isdigit() for char in price_text):
                    return price_text
        
        # Strategy 2: Regex patterns
        for pattern in self.patterns['price']:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                price_value = match.group(1)
                # Validate it's a reasonable price (> 50k)
                clean_price = re.sub(r'[^\d]', '', price_value)
                if clean_price.isdigit() and int(clean_price) > 50000:
                    return f"€ {price_value}"
        
        # Strategy 3: Look for common price formats
        price_formats = [
            r'€\s*([0-9]{1,3}(?:\.[0-9]{3})*)',
            r'([0-9]{1,3}(?:\.[0-9]{3})*)\s*euro',
            r'k\.k\.\s*€?\s*([0-9.,]+)',
            r'vraagprijs[^0-9]*([0-9.,]+)'
        ]
        
        for pattern in price_formats:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                return f"€ {match.group(1)}"
        
        return 'Not found'
    
    async def _extract_living_area(self, soup: BeautifulSoup, html: str) -> str:
        """Extract living area with multiple strategies"""
        
        # Strategy 1: Selector-based extraction
        for selector in self.selectors['living_area']:
            elem = soup.select_one(selector)
            if elem:
                area_text = elem.get_text(strip=True)
                area_match = re.search(r'([0-9]+(?:[.,][0-9]+)?)', area_text)
                if area_match:
                    return f"{area_match.group(1)} m²"
        
        # Strategy 2: Regex patterns
        for pattern in self.patterns['living_area']:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                area_value = match.group(1).replace(',', '.')
                return f"{area_value} m²"
        
        # Strategy 3: Look for m² anywhere in the text
        area_patterns = [
            r'([0-9]+(?:[.,][0-9]+)?)\s*m[²2]',
            r'([0-9]+)\s*vierkante\s*meter',
            r'oppervlakte[^0-9]*([0-9]+)'
        ]
        
        for pattern in area_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                area_value = match.group(1).replace(',', '.')
                # Validate reasonable area (20-1000 m²)
                try:
                    area_num = float(area_value)
                    if 20 <= area_num <= 1000:
                        return f"{area_value} m²"
                except:
                    continue
        
        return 'Not found'
    
    async def _extract_bedrooms(self, soup: BeautifulSoup, html: str) -> str:
        """Extract number of bedrooms"""
        
        # Strategy 1: Selector-based extraction
        for selector in self.selectors['bedrooms']:
            elem = soup.select_one(selector)
            if elem:
                bedroom_text = elem.get_text(strip=True)
                bedroom_match = re.search(r'([0-9]+)', bedroom_text)
                if bedroom_match:
                    return bedroom_match.group(1)
        
        # Strategy 2: Regex patterns
        for pattern in self.patterns['bedrooms']:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                bedroom_count = match.group(1)
                # Validate reasonable number (1-20)
                if bedroom_count.isdigit() and 1 <= int(bedroom_count) <= 20:
                    return bedroom_count
        
        return 'Not found'
    
    async def _extract_bathrooms(self, soup: BeautifulSoup, html: str) -> str:
        """Extract number of bathrooms"""
        
        # Strategy 1: Selector-based extraction
        for selector in self.selectors['bathrooms']:
            elem = soup.select_one(selector)
            if elem:
                bathroom_text = elem.get_text(strip=True)
                bathroom_match = re.search(r'([0-9]+)', bathroom_text)
                if bathroom_match:
                    return bathroom_match.group(1)
        
        # Strategy 2: Regex patterns
        for pattern in self.patterns['bathrooms']:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                bathroom_count = match.group(1)
                # Validate reasonable number (1-10)
                if bathroom_count.isdigit() and 1 <= int(bathroom_count) <= 10:
                    return bathroom_count
        
        return 'Not found'
    
    async def _extract_year_built(self, soup: BeautifulSoup, html: str) -> str:
        """Extract year built"""
        
        # Strategy 1: Selector-based extraction
        for selector in self.selectors['year_built']:
            elem = soup.select_one(selector)
            if elem:
                year_text = elem.get_text(strip=True)
                year_match = re.search(r'([0-9]{4})', year_text)
                if year_match:
                    year = int(year_match.group(1))
                    # Validate reasonable year (1800-2030)
                    if 1800 <= year <= 2030:
                        return str(year)
        
        # Strategy 2: Regex patterns
        for pattern in self.patterns['year_built']:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                year = int(match.group(1))
                if 1800 <= year <= 2030:
                    return str(year)
        
        return 'Not found'
    
    async def _extract_property_image(self, soup: BeautifulSoup, url: str) -> Optional[str]:
        """Extract main property image"""
        
        # Strategy 1: Selector-based extraction
        for selector in self.selectors['images']:
            img = soup.select_one(selector)
            if img and img.get('src'):
                img_src = img.get('src')
                # Make URL absolute
                if img_src.startswith('//'):
                    img_src = 'https:' + img_src
                elif img_src.startswith('/'):
                    img_src = urljoin(url, img_src)
                
                # Validate it's a property image
                if any(keyword in img_src.lower() for keyword in ['object', 'property', 'media', 'foto']):
                    return img_src
        
        # Strategy 2: Meta tags
        og_image = soup.find('meta', property='og:image')
        if og_image and og_image.get('content'):
            return og_image['content']
        
        return None
    
    async def _enhance_with_patterns(self, html: str, url: str) -> FundaScrapingResult:
        """Enhanced pattern matching for failed extractions"""
        data = {
            'Address': 'Not found',
            'Price': 'Not found',
            'Living Area': 'Not found',
            'Bedrooms': 'Not found',
            'Bathrooms': 'Not found',
            'Year Built': 'Not found',
            'Property Image': None,
            'URL': url,
            'Platform': 'Funda'
        }
        
        # Enhanced regex patterns with more variations
        enhanced_patterns = {
            'Address': [
                r'<title>([^|<]+(?:Amsterdam|Utrecht|Rotterdam|Den Haag|Eindhoven|Tilburg|Groningen|Almere|Breda|Nijmegen)[^<]*)</title>',
                r'"name"\s*:\s*"([^"]+)"',
                r'property-title["\s:]*"([^"]+)"'
            ],
            'Price': [
                r'vraagprijs[^€]*€\s*([0-9]{1,3}(?:\.[0-9]{3})*)',
                r'koopprijs[^€]*€\s*([0-9]{1,3}(?:\.[0-9]{3})*)',
                r'"price"[:\s]*([0-9]+)',
                r'price["\s:]*[€\s]*([0-9.,]+)'
            ],
            'Living Area': [
                r'woonoppervlakte[^0-9]*([0-9]+(?:[.,][0-9]+)?)[^0-9]*m',
                r'gebruiksoppervlakte[^0-9]*([0-9]+(?:[.,][0-9]+)?)[^0-9]*m',
                r'([0-9]+(?:[.,][0-9]+)?)\s*m[²2](?:\s*woon)',
                r'"usableSurface"[:\s]*([0-9]+)'
            ]
        }
        
        for field, patterns in enhanced_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    value = match.group(1).strip()
                    if field == 'Address':
                        data[field] = re.sub(r'<[^>]+>', '', value).strip()
                    elif field == 'Price':
                        data[field] = f"€ {value}"
                    elif field == 'Living Area':
                        data[field] = f"{value} m²"
                    else:
                        data[field] = value
                    break
        
        quality_score = self._calculate_quality_score(data)
        
        return FundaScrapingResult(
            success=True,
            data=data,
            data_quality_score=quality_score,
            method_used='enhanced_patterns'
        )
    
    def _calculate_quality_score(self, data: Dict[str, Any]) -> float:
        """Calculate data quality score"""
        required_fields = ['Address', 'Price', 'Living Area', 'Bedrooms', 'Bathrooms', 'Year Built']
        found_fields = 0
        
        for field in required_fields:
            if field in data and data[field] != 'Not found' and data[field] is not None:
                found_fields += 1
        
        base_score = (found_fields / len(required_fields)) * 100
        
        # Bonus for property image
        if data.get('Property Image'):
            base_score += 10
        
        # Penalty for completely failed extraction
        if found_fields == 0:
            base_score = 0
        
        return min(base_score, 100.0)

# Test function
async def test_optimized_funda_scraper():
    """Test the optimized Funda scraper"""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    scraper = OptimizedFundaScraper()
    await scraper.start()
    
    test_urls = [
        "https://www.funda.nl/koop/amsterdam/appartement-43038135-keizersgracht-123/",
        "https://www.funda.nl/koop/rotterdam/appartement-01234567-coolsingel-1/",
        "https://www.funda.nl/koop/utrecht/huis-12345678-oudegracht-100/"
    ]
    
    for url in test_urls:
        try:
            print(f"\n🧪 Testing optimized Funda scraper: {url}")
            result = await scraper.scrape_property_optimized(url)
            
            if result.success:
                print(f"✅ Success! Quality: {result.data_quality_score:.1f}%")
                print(f"   Method: {result.method_used}")
                print(f"   Processing time: {result.processing_time:.2f}s")
                print(f"   API credits: {result.api_credits_used}")
                print(f"   Address: {result.data.get('Address', 'N/A')}")
                print(f"   Price: {result.data.get('Price', 'N/A')}")
                print(f"   Living Area: {result.data.get('Living Area', 'N/A')}")
                print(f"   Bedrooms: {result.data.get('Bedrooms', 'N/A')}")
                print(f"   Bathrooms: {result.data.get('Bathrooms', 'N/A')}")
                print(f"   Year Built: {result.data.get('Year Built', 'N/A')}")
                print(f"   Image: {'Yes' if result.data.get('Property Image') else 'No'}")
            else:
                print(f"❌ Failed: {result.error}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    await scraper.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_optimized_funda_scraper())