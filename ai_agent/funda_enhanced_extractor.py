#!/usr/bin/env python3
"""
Enhanced Funda Data Extractor
Uses structured JSON data from Funda pages for accurate property extraction
"""

import json
import re
import asyncio
import httpx
import time
from typing import Dict, List, Optional, Any
import os
from dotenv import load_dotenv

load_dotenv()

class FundaEnhancedExtractor:
    """
    Enhanced Funda data extractor that parses structured JSON data
    """
    
    def __init__(self, scrapingbee_api_key: Optional[str] = None):
        self.scrapingbee_api_key = scrapingbee_api_key or os.getenv('SCRAPINGBEE_API_KEY')
        if not self.scrapingbee_api_key:
            raise ValueError('SCRAPINGBEE_API_KEY must be set')
        
        self.session = httpx.AsyncClient(timeout=60)
        self.base_url = 'https://app.scrapingbee.com/api/v1/'
    
    async def extract_property_data(self, url: str) -> Dict[str, Any]:
        """
        Extract comprehensive property data using both JSON-LD and HTML parsing
        """
        try:
            # Get HTML content from ScrapingBee
            params = {
                'api_key': self.scrapingbee_api_key,
                'url': url,
                'render_js': 'true',
                'premium_proxy': 'true',
                'block_ads': 'true',
                'wait': '3000'
            }
            
            print(f"🔍 Fetching Funda property page...")
            response = await self.session.get(self.base_url, params=params)
            
            if response.status_code != 200:
                raise Exception(f"ScrapingBee request failed: {response.status_code}")
            
            html_content = response.text
            print(f"✅ Retrieved {len(html_content)} characters")
            
            # Extract structured data
            property_data = self._extract_comprehensive_data(html_content, url)
            
            return property_data
            
        except Exception as e:
            print(f"❌ Extraction failed: {e}")
            return {'error': str(e), 'url': url}
    
    def _extract_comprehensive_data(self, html: str, url: str) -> Dict[str, Any]:
        """
        Extract property data using multiple approaches for maximum accuracy
        """
        result = {
            'url': url,
            'extraction_method': 'enhanced_json_and_html',
            'extracted_at': time.time()
        }
        
        # 1. Extract JSON-LD structured data (most reliable)
        json_data = self._extract_json_ld_data(html)
        
        # 2. Parse property description from meta tags
        meta_description = self._extract_meta_description(html)
        
        # 3. Extract property images from JSON-LD photo array
        property_images = self._extract_images_from_json(json_data)
        
        # 4. Build comprehensive result
        if json_data:
            result.update({
                'address': self._clean_address(json_data.get('name', '')),
                'full_address': self._build_full_address(json_data.get('address', {})),
                'price': self._format_price(json_data.get('offers', {}).get('price')),
                'price_currency': json_data.get('offers', {}).get('priceCurrency', 'EUR'),
                'property_type': self._determine_property_type(json_data.get('@type', [])),
                'canonical_url': json_data.get('url', url),
                'description': meta_description or json_data.get('description', ''),
                'property_images': property_images,
                'main_image': property_images[0] if property_images else None
            })
        
        # 5. Extract detailed features from HTML content
        detailed_features = self._extract_detailed_features(html)
        result.update(detailed_features)
        
        # 6. Calculate derived values
        if result.get('price') and result.get('size'):
            result['price_per_sqm'] = self._calculate_price_per_sqm(
                result['price'], 
                result['size']
            )
        
        return result
    
    def _extract_json_ld_data(self, html: str) -> Optional[Dict[str, Any]]:
        """
        Extract JSON-LD structured data from Funda page
        """
        # Find JSON-LD script tags
        json_ld_patterns = [
            r'<script type="application/ld\+json">\s*({[^<]+})\s*</script>',
            r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>'
        ]
        
        for pattern in json_ld_patterns:
            matches = re.findall(pattern, html, re.DOTALL | re.IGNORECASE)
            for match in matches:
                try:
                    data = json.loads(match)
                    # Look for property/house data
                    if isinstance(data, dict) and (
                        'Huis' in data.get('@type', []) or 
                        'Product' in data.get('@type', []) or
                        data.get('@type') == 'BreadcrumbList'
                    ):
                        if data.get('@type') != 'BreadcrumbList':  # Skip breadcrumb data
                            print(f"✅ Found JSON-LD property data")
                            return data
                except json.JSONDecodeError:
                    continue
        
        print("⚠️ No valid JSON-LD data found")
        return None
    
    def _extract_meta_description(self, html: str) -> Optional[str]:
        """
        Extract property description from meta tags
        """
        patterns = [
            r'<meta name="description" content="([^"]+)"',
            r'<meta property="og:description" content="([^"]+)"'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                description = match.group(1).strip()
                if len(description) > 50:  # Ensure substantial description
                    return description
        
        return None
    
    def _extract_images_from_json(self, json_data: Dict[str, Any]) -> List[str]:
        """
        Extract property images from JSON-LD photo array
        """
        images = []
        
        if not json_data:
            return images
        
        # Check main image
        main_image = json_data.get('image')
        if main_image:
            images.append(main_image)
        
        # Check photo array
        photos = json_data.get('photo', [])
        if isinstance(photos, list):
            for photo in photos:
                if isinstance(photo, dict):
                    content_url = photo.get('contentUrl')
                    if content_url and content_url not in images:
                        images.append(content_url)
                elif isinstance(photo, str):
                    if photo not in images:
                        images.append(photo)
        
        return images[:10]  # Limit to 10 images
    
    def _extract_detailed_features(self, html: str) -> Dict[str, Any]:
        """
        Extract detailed property features from HTML
        """
        features = {}
        
        # Extract living area from multiple sources
        size_patterns = [
            r'woonoppervlakte.*?(\d+)\s*m²',
            r'living.*?area.*?(\d+)\s*m²',
            r'(\d+)\s*m².*woon',
            r'"livingArea":(\d+)',
            r'oppervlakte.*?(\d+)'
        ]
        
        for pattern in size_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                size = int(match.group(1))
                if 20 <= size <= 2000:  # Reasonable size range
                    features['size'] = size
                    break
        
        # Extract bedrooms
        bedroom_patterns = [
            r'(\d+)\s*slaapkamer',
            r'bedrooms?.*?(\d+)',
            r'kamers.*?(\d+)',
            r'"bedrooms":(\d+)'
        ]
        
        for pattern in bedroom_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                bedrooms = int(match.group(1))
                if 1 <= bedrooms <= 20:  # Reasonable range
                    features['bedrooms'] = bedrooms
                    break
        
        # Extract bathrooms
        bathroom_patterns = [
            r'(\d+)\s*badkamer',
            r'bathroom?s.*?(\d+)',
            r'"bathrooms":(\d+)'
        ]
        
        for pattern in bathroom_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                bathrooms = int(match.group(1))
                if 1 <= bathrooms <= 10:  # Reasonable range
                    features['bathrooms'] = bathrooms
                    break
        
        # Extract year built
        year_patterns = [
            r'bouwjaar.*?(\d{4})',
            r'built.*?(\d{4})',
            r'year.*?(\d{4})',
            r'"yearBuilt":(\d{4})'
        ]
        
        for pattern in year_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                year = int(match.group(1))
                if 1800 <= year <= 2030:  # Reasonable year range
                    features['year_built'] = year
                    break
        
        # Extract energy label
        energy_patterns = [
            r'energielabel\s*([A-G][\+]*)',
            r'energy.*?label.*?([A-G][\+]*)',
            r'"energyLabel":"([A-G][\+]*)"'
        ]
        
        for pattern in energy_patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                features['energy_label'] = match.group(1).upper()
                break
        
        # Extract building type
        if 'appartement' in html.lower():
            features['building_type'] = 'apartment'
        elif 'eengezinswoning' in html.lower():
            features['building_type'] = 'house'
        elif 'boerderij' in html.lower():
            features['building_type'] = 'farm'
        elif 'villa' in html.lower():
            features['building_type'] = 'villa'
        else:
            features['building_type'] = 'house'  # Default
        
        return features
    
    def _clean_address(self, raw_address: str) -> str:
        """
        Clean and format address string
        """
        if not raw_address:
            return None
        
        # Remove common prefixes/suffixes
        address = raw_address.strip()
        address = re.sub(r'^(Huis te koop:\s*)', '', address, flags=re.IGNORECASE)
        address = re.sub(r'\s*\[Funda\].*$', '', address, flags=re.IGNORECASE)
        address = re.sub(r'\s*\[funda\].*$', '', address, flags=re.IGNORECASE)
        
        return address.strip()
    
    def _build_full_address(self, address_data: Dict[str, Any]) -> str:
        """
        Build full address from structured data
        """
        if not address_data:
            return None
        
        parts = []
        
        street = address_data.get('streetAddress', '')
        if street:
            parts.append(street)
        
        locality = address_data.get('addressLocality', '')
        if locality:
            parts.append(locality)
        
        region = address_data.get('addressRegion', '')
        if region:
            parts.append(region)
        
        return ', '.join(parts) if parts else None
    
    def _format_price(self, price: Any) -> Optional[str]:
        """
        Format price value consistently
        """
        if not price:
            return None
        
        if isinstance(price, (int, float)):
            if price >= 1000:
                return f"€ {price:,.0f}"
            else:
                return f"€ {price}"
        
        return str(price)
    
    def _determine_property_type(self, type_list: List[str]) -> str:
        """
        Determine property type from JSON-LD @type
        """
        if not isinstance(type_list, list):
            return 'house'
        
        for prop_type in type_list:
            if prop_type.lower() in ['huis', 'house']:
                return 'house'
            elif prop_type.lower() in ['appartement', 'apartment']:
                return 'apartment'
        
        return 'house'  # Default
    
    def _calculate_price_per_sqm(self, price_str: str, size: int) -> Optional[float]:
        """
        Calculate price per square meter
        """
        try:
            # Extract numeric value from price string
            price_clean = re.sub(r'[^\d.]', '', price_str.replace(',', ''))
            price_value = float(price_clean)
            
            if size > 0:
                return round(price_value / size, 2)
        except:
            pass
        
        return None
    
    async def close(self):
        """Close HTTP session"""
        await self.session.aclose()

# Test the enhanced extractor
async def test_enhanced_extractor():
    """Test the enhanced Funda extractor"""
    
    extractor = FundaEnhancedExtractor()
    test_url = 'https://www.funda.nl/detail/koop/bemmel/huis-vossenhol-16/89281255/'
    
    print(f"🧪 Testing Enhanced Funda Extractor")
    print(f"URL: {test_url}")
    print("=" * 60)
    
    try:
        result = await extractor.extract_property_data(test_url)
        
        print("📊 Enhanced Extraction Results:")
        print(f"   Address: {result.get('address', 'Not found')}")
        print(f"   Full Address: {result.get('full_address', 'Not found')}")
        print(f"   Price: {result.get('price', 'Not found')}")
        print(f"   Size: {result.get('size', 'Not found')} m²")
        print(f"   Bedrooms: {result.get('bedrooms', 'Not found')}")
        print(f"   Bathrooms: {result.get('bathrooms', 'Not found')}")
        print(f"   Year built: {result.get('year_built', 'Not found')}")
        print(f"   Building type: {result.get('building_type', 'Not found')}")
        print(f"   Energy label: {result.get('energy_label', 'Not found')}")
        print(f"   Property images: {len(result.get('property_images', []))}")
        print(f"   Description length: {len(result.get('description', '') or '')}")
        
        if result.get('price_per_sqm'):
            print(f"   Price per m²: €{result['price_per_sqm']:,.2f}")
        
        if result.get('main_image'):
            print(f"   Main image: {result['main_image']}")
        
        # Save detailed results
        import json
        import time
        with open('enhanced_funda_result.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Enhanced results saved to: enhanced_funda_result.json")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    finally:
        await extractor.close()

if __name__ == "__main__":
    import time
    asyncio.run(test_enhanced_extractor()) 