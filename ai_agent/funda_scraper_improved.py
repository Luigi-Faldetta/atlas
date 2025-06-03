#!/usr/bin/env python3
"""
Improved Funda Property Scraper
Fixes data extraction issues and adds enhanced property image handling
"""

import asyncio
import httpx
import json
import re
import time
from typing import Dict, List, Optional, Any
from urllib.parse import quote_plus
import os
from dotenv import load_dotenv

load_dotenv()

class ImprovedFundaScraper:
    """
    Improved Funda scraper with better data extraction and property image handling
    """
    
    def __init__(self, scrapingbee_api_key: Optional[str] = None):
        self.scrapingbee_api_key = scrapingbee_api_key or os.getenv('SCRAPINGBEE_API_KEY')
        if not self.scrapingbee_api_key:
            raise ValueError('SCRAPINGBEE_API_KEY must be set')
        
        self.session = httpx.AsyncClient(timeout=60)
        self.base_url = 'https://app.scrapingbee.com/api/v1/'
        
        # Updated Funda-specific selectors based on current page structure
        self.funda_selectors = {
            'address': [
                'h1[data-object-address-title]',
                '.object-header h1',
                'h1.object-address-title',
                '[data-test-id="object-address-title"]'
            ],
            'price': [
                '[data-test-id="price-asking"]',
                '.object-price',
                '.price-section .price',
                '.asking-price',
                '.price-value'
            ],
            'size': [
                '[data-test-id="size-living-area"]',
                '.object-kenmerken .living-area',
                '.kenmerken-living-area',
                'dd[data-test-id="living-area"]'
            ],
            'bedrooms': [
                '[data-test-id="bedrooms"]',
                '.object-kenmerken .bedrooms', 
                '.kenmerken-bedrooms',
                'dd[data-test-id="rooms"]'
            ],
            'bathrooms': [
                '[data-test-id="bathrooms"]',
                '.object-kenmerken .bathrooms',
                '.kenmerken-bathrooms'
            ],
            'year_built': [
                '[data-test-id="year-built"]',
                '.object-kenmerken .year-built',
                '.kenmerken-year-built'
            ],
            'property_images': [
                '.media-gallery img',
                '.object-media img',
                '.gallery-main img',
                '.property-image img',
                '[data-test-id="media-gallery"] img'
            ],
            'description': [
                '.object-description-text',
                '.description-text',
                '.object-description',
                '[data-test-id="description"]'
            ],
            'features': [
                '.object-kenmerken ul li',
                '.kenmerken-list li',
                '.features-list li',
                '.object-features li'
            ]
        }
    
    async def scrape_property_simple(self, url: str) -> Dict[str, Any]:
        """
        Simple scraping approach using basic ScrapingBee without complex JS
        """
        try:
            # Use simple ScrapingBee request without complex JavaScript
            params = {
                'api_key': self.scrapingbee_api_key,
                'url': url,
                'render_js': 'true',
                'premium_proxy': 'true',
                'block_ads': 'true',
                'wait': '3000',
                'window_width': '1920',
                'window_height': '1080'
            }
            
            print(f"🔍 Fetching Funda property page...")
            response = await self.session.get(self.base_url, params=params)
            
            if response.status_code != 200:
                raise Exception(f"ScrapingBee request failed: {response.status_code} - {response.text}")
            
            html_content = response.text
            print(f"✅ Retrieved {len(html_content)} characters of HTML")
            
            # Extract data using improved selectors and regex patterns
            extracted_data = self._extract_data_from_html(html_content, url)
            
            # Add metadata
            extracted_data.update({
                'scraping_method': 'simple_scrapingbee',
                'url': url,
                'scraped_at': time.time(),
                'html_length': len(html_content)
            })
            
            return extracted_data
            
        except Exception as e:
            print(f"❌ Simple scraping failed: {e}")
            return {'error': str(e), 'url': url}
    
    def _extract_data_from_html(self, html: str, url: str) -> Dict[str, Any]:
        """
        Extract property data from HTML using multiple approaches
        """
        result = {
            'address': None,
            'price': None,
            'size': None,
            'bedrooms': None,
            'bathrooms': None,
            'year_built': None,
            'building_type': 'apartment',
            'property_images': [],
            'description': None,
            'features': [],
            'extraction_method': 'html_parsing'
        }
        
        # 1. Extract address using multiple patterns
        result['address'] = self._extract_with_selectors(html, self.funda_selectors['address'])
        
        # Also try regex for address
        if not result['address']:
            address_patterns = [
                r'<h1[^>]*data-object-address-title[^>]*>([^<]+)</h1>',
                r'"address":\s*"([^"]+)"',
                r'<title>([^|]+)\|'
            ]
            for pattern in address_patterns:
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    result['address'] = match.group(1).strip()
                    break
        
        # 2. Extract price with improved patterns
        result['price'] = self._extract_price(html)
        
        # 3. Extract size/living area
        result['size'] = self._extract_size(html)
        
        # 4. Extract bedrooms
        result['bedrooms'] = self._extract_bedrooms(html)
        
        # 5. Extract bathrooms  
        result['bathrooms'] = self._extract_bathrooms(html)
        
        # 6. Extract year built
        result['year_built'] = self._extract_year_built(html)
        
        # 7. Extract property images
        result['property_images'] = self._extract_property_images(html, url)
        
        # 8. Extract description
        result['description'] = self._extract_description(html)
        
        # 9. Extract features
        result['features'] = self._extract_features(html)
        
        # 10. Calculate derived data
        if result['price'] and result['size']:
            result['price_per_sqm'] = self._calculate_price_per_sqm(result['price'], result['size'])
        
        return result
    
    def _extract_with_selectors(self, html: str, selectors: List[str]) -> Optional[str]:
        """
        Try multiple selectors and regex patterns to extract data
        """
        # Convert CSS selectors to regex patterns
        for selector in selectors:
            # Simple approach: look for data-test-id attributes
            if 'data-test-id' in selector:
                test_id = selector.split('"')[1] if '"' in selector else selector.split('=')[1]
                pattern = rf'data-test-id="{test_id}"[^>]*>([^<]+)</[^>]*>'
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    return match.group(1).strip()
            
            # Look for class-based selectors
            if '.' in selector:
                class_name = selector.replace('.', '').replace(' ', '-')
                pattern = rf'class="[^"]*{class_name}[^"]*"[^>]*>([^<]+)</[^>]*>'
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    return match.group(1).strip()
        
        return None
    
    def _extract_price(self, html: str) -> Optional[str]:
        """Extract price with multiple patterns"""
        price_patterns = [
            r'data-test-id="price-asking"[^>]*>([^<]+)</[^>]*>',
            r'"askingPrice":"([^"]+)"',
            r'"price":\s*"([^"]+)"',
            r'€\s*([\d.,]+)\s*k\.k\.',
            r'€\s*([\d.,]+)',
            r'class="[^"]*price[^"]*"[^>]*>([^<]*€[^<]+)</[^>]*>'
        ]
        
        for pattern in price_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                price = match.group(1).strip()
                # Clean up price
                if '€' not in price and not price.startswith('€'):
                    price = f"€ {price}"
                return price
        
        return None
    
    def _extract_size(self, html: str) -> Optional[int]:
        """Extract living area size"""
        size_patterns = [
            r'data-test-id="size-living-area"[^>]*>(\d+)\s*m²',
            r'"livingArea":(\d+)',
            r'(\d+)\s*m²',
            r'Woonoppervlakte:\s*(\d+)\s*m²'
        ]
        
        for pattern in size_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return None
    
    def _extract_bedrooms(self, html: str) -> Optional[int]:
        """Extract number of bedrooms"""
        bedroom_patterns = [
            r'data-test-id="bedrooms"[^>]*>(\d+)',
            r'"bedrooms":(\d+)',
            r'(\d+)\s*slaapkamer',
            r'Aantal kamers:\s*(\d+)',
            r'kamers.*?(\d+)'
        ]
        
        for pattern in bedroom_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return None
    
    def _extract_bathrooms(self, html: str) -> Optional[int]:
        """Extract number of bathrooms"""
        bathroom_patterns = [
            r'data-test-id="bathrooms"[^>]*>(\d+)',
            r'"bathrooms":(\d+)',
            r'(\d+)\s*badkamer',
            r'Badkamers:\s*(\d+)'
        ]
        
        for pattern in bathroom_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return None
    
    def _extract_year_built(self, html: str) -> Optional[int]:
        """Extract year built"""
        year_patterns = [
            r'data-test-id="year-built"[^>]*>(\d{4})',
            r'"yearBuilt":(\d{4})',
            r'Bouwjaar:\s*(\d{4})',
            r'(\d{4}).*bouw'
        ]
        
        for pattern in year_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                year = int(match.group(1))
                if 1800 <= year <= 2030:  # Sanity check
                    return year
        
        return None
    
    def _extract_property_images(self, html: str, base_url: str) -> List[str]:
        """Extract property images with proper URL handling"""
        images = []
        
        # Image patterns for Funda
        image_patterns = [
            r'<img[^>]+src="([^"]+)"[^>]*class="[^"]*media[^"]*"',
            r'<img[^>]+class="[^"]*media[^"]*"[^>]+src="([^"]+)"',
            r'"mediaUrls":\s*\[([^\]]+)\]',
            r'"images":\s*\[([^\]]+)\]',
            r'data-src="([^"]+\.jpg[^"]*)"',
            r'src="([^"]+\.jpg[^"]*)"'
        ]
        
        for pattern in image_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            for match in matches:
                if isinstance(match, str):
                    img_url = match.strip('"')
                    # Skip small/thumbnail images
                    if not any(skip in img_url.lower() for skip in ['thumb', 'small', 'icon', 'logo']):
                        if img_url.startswith('http'):
                            images.append(img_url)
                        elif img_url.startswith('//'):
                            images.append(f"https:{img_url}")
                        elif img_url.startswith('/'):
                            images.append(f"https://www.funda.nl{img_url}")
        
        # Remove duplicates and return first 10
        unique_images = list(dict.fromkeys(images))[:10]
        return unique_images
    
    def _extract_description(self, html: str) -> Optional[str]:
        """Extract property description"""
        desc_patterns = [
            r'<div[^>]+class="[^"]*description[^"]*"[^>]*>([^<]+)</div>',
            r'"description":"([^"]+)"',
            r'<p[^>]*class="[^"]*description[^"]*"[^>]*>([^<]+)</p>'
        ]
        
        for pattern in desc_patterns:
            match = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
            if match:
                desc = match.group(1).strip()
                # Clean HTML entities
                desc = re.sub(r'&[a-zA-Z]+;', ' ', desc)
                desc = re.sub(r'\s+', ' ', desc)
                if len(desc) > 50:  # Only return substantial descriptions
                    return desc
        
        return None
    
    def _extract_features(self, html: str) -> List[str]:
        """Extract property features"""
        features = []
        
        # Look for feature lists
        feature_patterns = [
            r'<li[^>]*>([^<]+)</li>',
            r'"features":\s*\[([^\]]+)\]'
        ]
        
        for pattern in feature_patterns:
            matches = re.findall(pattern, html, re.IGNORECASE)
            for match in matches:
                if isinstance(match, str):
                    feature = match.strip().strip('"')
                    if len(feature) > 2 and len(feature) < 100:  # Reasonable feature length
                        features.append(feature)
        
        # Remove duplicates and return first 20
        unique_features = list(dict.fromkeys(features))[:20]
        return unique_features
    
    def _calculate_price_per_sqm(self, price_str: str, size: int) -> Optional[float]:
        """Calculate price per square meter"""
        try:
            # Extract numeric value from price string
            price_clean = re.sub(r'[^\d.]', '', price_str.replace(',', '.'))
            price_value = float(price_clean)
            
            if size > 0:
                return round(price_value / size, 2)
        except:
            pass
        
        return None
    
    async def close(self):
        """Close the HTTP session"""
        await self.session.aclose()

# Test function
async def test_improved_funda_scraper():
    """Test the improved Funda scraper"""
    
    scraper = ImprovedFundaScraper()
    test_url = 'https://www.funda.nl/detail/koop/bemmel/huis-vossenhol-16/89281255/'
    
    print(f"🧪 Testing Improved Funda Scraper")
    print(f"URL: {test_url}")
    print("=" * 60)
    
    try:
        result = await scraper.scrape_property_simple(test_url)
        
        print("📊 Extraction Results:")
        print(f"   Address: {result.get('address', 'Not found')}")
        print(f"   Price: {result.get('price', 'Not found')}")
        print(f"   Size: {result.get('size', 'Not found')} m²")
        print(f"   Bedrooms: {result.get('bedrooms', 'Not found')}")
        print(f"   Bathrooms: {result.get('bathrooms', 'Not found')}")
        print(f"   Year built: {result.get('year_built', 'Not found')}")
        print(f"   Property images: {len(result.get('property_images', []))}")
        print(f"   Description length: {len(result.get('description', '') or '')}")
        print(f"   Features count: {len(result.get('features', []))}")
        
        if result.get('property_images'):
            print(f"   First image: {result['property_images'][0]}")
        
        if result.get('price_per_sqm'):
            print(f"   Price per m²: €{result['price_per_sqm']:,.2f}")
        
        # Save detailed results
        with open('improved_funda_result.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Detailed results saved to: improved_funda_result.json")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    finally:
        await scraper.close()

if __name__ == "__main__":
    asyncio.run(test_improved_funda_scraper()) 