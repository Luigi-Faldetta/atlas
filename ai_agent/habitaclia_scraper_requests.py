import requests
from bs4 import BeautifulSoup
import re
import os
import time
import random
import urllib3
from dotenv import load_dotenv
import logging
from typing import Optional, Dict, Any

# Disable SSL warnings when using proxies
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

class HabitacliaScraperRequests:
    def __init__(self, proxy=None, logger=None):
        """
        Initialize the requests-based Habitaclia scraper with Bright Data proxy support.
        """
        self.session = requests.Session()
        self.logger = logger or logging.getLogger(__name__)
        
        # Set up proxy if available
        proxy_server = os.getenv("PROXY_SERVER")
        proxy_username = os.getenv("PROXY_USERNAME") 
        proxy_password = os.getenv("PROXY_PASSWORD")
        
        if proxy_server and proxy_username and proxy_password:
            # Format proxy URL with authentication
            proxy_url = f"http://{proxy_username}:{proxy_password}@{proxy_server.replace('http://', '')}"
            self.session.proxies = {
                'http': proxy_url,
                'https': proxy_url
            }
            self.logger.info(f"Using Bright Data proxy: {proxy_server}")
        else:
            self.logger.info("No proxy configuration found, using direct connection")
        
        # Set realistic headers for Spanish market
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en-US,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })

    async def start(self):
        """Async start method for compatibility with existing code"""
        self.logger.info("Habitaclia requests scraper started")

    async def close(self):
        """Async close method for compatibility with existing code"""
        self.session.close()
        self.logger.info("Habitaclia requests scraper closed")

    def get_site_name(self) -> str:
        return "Habitaclia"

    async def scrape_property(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape property data from Habitaclia using requests and BeautifulSoup.
        """
        try:
            # Add random delay to mimic human behavior
            time.sleep(random.uniform(2, 5))
            
            # Make the request with SSL verification disabled for proxy compatibility
            response = self.session.get(url, timeout=30, verify=False)
            response.raise_for_status()
            
            # Parse the HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Initialize result
            result = {
                'Address': 'Not found',
                'Price': 'Not found', 
                'Living Area': 'Not found',
                'Bedrooms': 'Not found',
                'Bathrooms': 'Not found',
                'Year Built': 'Not found',
                'Property Image': None,
                'URL': url,
                'Site': self.get_site_name()
            }
            
            # Extract address
            try:
                # Habitaclia typically has address in h1 or specific location elements
                address_selectors = [
                    'h1.property-title',
                    '.property-location h1',
                    '.detail-title',
                    '[data-testid="property-address"]',
                    '.address-container h1'
                ]
                
                for selector in address_selectors:
                    address_elem = soup.select_one(selector)
                    if address_elem:
                        result['Address'] = address_elem.get_text(strip=True)
                        break
                        
                # Fallback: look for address in breadcrumbs or meta tags
                if result['Address'] == 'Not found':
                    breadcrumb = soup.select_one('.breadcrumb li:last-child')
                    if breadcrumb:
                        result['Address'] = breadcrumb.get_text(strip=True)
                    else:
                        meta_address = soup.find('meta', property='og:title')
                        if meta_address:
                            result['Address'] = meta_address.get('content', '').strip()
                        
            except Exception as e:
                self.logger.warning(f"Error extracting address: {e}")
            
            # Extract price
            try:
                price_selectors = [
                    '.price-container .price',
                    '.property-price .price-value',
                    '[data-testid="property-price"]',
                    '.detail-price',
                    '.price-main .price'
                ]
                
                for selector in price_selectors:
                    price_elem = soup.select_one(selector)
                    if price_elem:
                        price_text = price_elem.get_text(strip=True)
                        # Clean up price text
                        price_match = re.search(r'([\d.,]+)\s*€', price_text)
                        if price_match:
                            result['Price'] = f"{price_match.group(1)} €"
                            break
                            
            except Exception as e:
                self.logger.warning(f"Error extracting price: {e}")
            
            # Extract property details (bedrooms, bathrooms, living area)
            try:
                # Look for property characteristics in various containers
                feature_selectors = [
                    '.property-characteristics li',
                    '.features-list li',
                    '.detail-characteristics li',
                    '.property-features .feature'
                ]
                
                features = []
                for selector in feature_selectors:
                    feature_elems = soup.select(selector)
                    if feature_elems:
                        features = [elem.get_text(strip=True) for elem in feature_elems]
                        break
                
                # Also check for specific data attributes or structured data
                if not features:
                    # Try to find structured property data
                    structured_selectors = [
                        '[data-rooms]',
                        '[data-bathrooms]', 
                        '[data-surface]'
                    ]
                    
                    for elem in soup.select('[data-rooms], [data-bathrooms], [data-surface]'):
                        if elem.get('data-rooms'):
                            result['Bedrooms'] = elem.get('data-rooms')
                        if elem.get('data-bathrooms'):
                            result['Bathrooms'] = elem.get('data-bathrooms')
                        if elem.get('data-surface'):
                            result['Living Area'] = f"{elem.get('data-surface')} m²"
                
                # Parse features for specific data
                for feature in features:
                    feature_lower = feature.lower()
                    
                    # Living area
                    if 'm²' in feature or 'm2' in feature:
                        area_match = re.search(r'(\d+)\s*m[²2]', feature)
                        if area_match:
                            result['Living Area'] = f"{area_match.group(1)} m²"
                    
                    # Bedrooms
                    if any(word in feature_lower for word in ['habitacion', 'dormitor', 'bedroom', 'hab']):
                        bed_match = re.search(r'(\d+)', feature)
                        if bed_match:
                            result['Bedrooms'] = bed_match.group(1)
                    
                    # Bathrooms
                    if any(word in feature_lower for word in ['baño', 'bathroom', 'aseo']):
                        bath_match = re.search(r'(\d+)', feature)
                        if bath_match:
                            result['Bathrooms'] = bath_match.group(1)
                            
            except Exception as e:
                self.logger.warning(f"Error extracting property features: {e}")
            
            # Extract year built
            try:
                # Look for construction year in various places
                year_patterns = [
                    r'(?:construido|built|año|construcción)\s*:?\s*(\d{4})',
                    r'(\d{4})\s*(?:construcción|construction)',
                    r'año\s*(\d{4})'
                ]
                
                page_text = soup.get_text()
                for pattern in year_patterns:
                    year_match = re.search(pattern, page_text, re.IGNORECASE)
                    if year_match:
                        result['Year Built'] = year_match.group(1)
                        break
                        
            except Exception as e:
                self.logger.warning(f"Error extracting year built: {e}")
            
            # Extract property image
            try:
                image_selectors = [
                    '.property-gallery img:first-child',
                    '.gallery-container img:first-child',
                    '.detail-gallery img:first-child',
                    '[data-testid="property-image"]',
                    '.property-image img',
                    '.main-image img',
                    'img[src*="habitaclia"]'
                ]
                
                for selector in image_selectors:
                    img_element = soup.select_one(selector)
                    if img_element and img_element.get('src'):
                        img_src = img_element.get('src')
                        
                        # Handle relative URLs
                        if img_src.startswith('//'):
                            img_src = 'https:' + img_src
                        elif img_src.startswith('/'):
                            img_src = 'https://www.habitaclia.com' + img_src
                        
                        # Validate it's likely a property image
                        if any(keyword in img_src.lower() for keyword in ['property', 'house', 'apartment', 'foto', 'image']):
                            result['Property Image'] = img_src
                            break
                        elif 'habitaclia' in img_src.lower():
                            result['Property Image'] = img_src
                            break
                
                # Fallback: try Open Graph image
                if result['Property Image'] is None:
                    og_image = soup.find('meta', property='og:image')
                    if og_image and og_image.get('content'):
                        result['Property Image'] = og_image.get('content')
                        
            except Exception as e:
                self.logger.warning(f"Error extracting property image: {e}")
            
            self.logger.info(f"Successfully scraped Habitaclia property: {result['Address']}")
            return result
            
        except requests.RequestException as e:
            self.logger.error(f"Request error: {e}")
            return {"error": f"Failed to fetch page: {str(e)}"}
        except Exception as e:
            self.logger.error(f"Error extracting property data: {e}")
            return {"error": f"Failed to parse property data: {str(e)}"}

# For testing
if __name__ == "__main__":
    import asyncio
    
    async def test():
        logging.basicConfig(level=logging.INFO)
        scraper = HabitacliaScraperRequests()
        await scraper.start()
        
        # Test URL (you'll need to provide a real Habitaclia URL)
        url = "https://www.habitaclia.com/vivienda-en-barcelona-12345"
        
        result = await scraper.scrape_property(url)
        print("Scraped data:", result)
        
        await scraper.close()
    
    asyncio.run(test()) 