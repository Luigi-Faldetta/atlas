#!/usr/bin/env python3
"""
Enhanced Multi-Platform Real Estate Scraping Strategy
Implements robust, tiered scraping with comprehensive data validation
and direct integration with investment analysis dashboard.
"""

import asyncio
import json
import logging
import re
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
import httpx
import openai
from PIL import Image
import io
import base64
from pydantic import BaseModel, validator, Field
import pandas as pd

# Data Models for Structured Property Information
@dataclass
class PropertyImageData:
    """Structured property image information"""
    url: str
    alt_text: Optional[str] = None
    image_type: str = "main"  # main, gallery, floor_plan, virtual_tour
    width: Optional[int] = None
    height: Optional[int] = None
    file_size: Optional[int] = None

@dataclass
class PropertyFinancials:
    """Structured financial data for investment analysis"""
    purchase_price: Optional[float] = None
    price_per_sqm: Optional[float] = None
    monthly_costs: Optional[float] = None
    community_fees: Optional[float] = None
    property_tax: Optional[float] = None
    estimated_rental_income: Optional[float] = None
    estimated_yield: Optional[float] = None

@dataclass
class PropertyFeatures:
    """Structured property features and amenities"""
    elevator: Optional[bool] = None
    parking: Optional[bool] = None
    balcony: Optional[bool] = None
    terrace: Optional[bool] = None
    garden: Optional[bool] = None
    pool: Optional[bool] = None
    air_conditioning: Optional[bool] = None
    heating_type: Optional[str] = None
    energy_certificate: Optional[str] = None
    furnished: Optional[bool] = None

@dataclass
class PropertyLocation:
    """Structured location and neighborhood data"""
    full_address: str
    street_address: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    region: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    neighborhood: Optional[str] = None
    walk_score: Optional[int] = None
    transit_score: Optional[int] = None

@dataclass
class EnhancedPropertyData:
    """Complete structured property data for investment analysis"""
    # Basic Information
    url: str
    platform: str
    scraped_at: datetime
    
    # Core Property Details
    location: PropertyLocation
    price: Optional[float] = None
    living_area_sqm: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    year_built: Optional[int] = None
    property_type: Optional[str] = None
    building_type: Optional[str] = None
    
    # Enhanced Data
    images: List[PropertyImageData] = None
    features: PropertyFeatures = None
    financials: PropertyFinancials = None
    description: Optional[str] = None
    
    # Investment Analysis Fields
    investment_score: Optional[int] = None
    rental_yield: Optional[float] = None
    roi_5_year: Optional[float] = None
    roi_10_year: Optional[float] = None
    risk_score: Optional[int] = None
    
    # Data Quality Metrics
    data_quality_score: float = 0.0
    extraction_confidence: Dict[str, float] = None
    missing_fields: List[str] = None
    
    def __post_init__(self):
        if self.images is None:
            self.images = []
        if self.features is None:
            self.features = PropertyFeatures()
        if self.financials is None:
            self.financials = PropertyFinancials()
        if self.extraction_confidence is None:
            self.extraction_confidence = {}
        if self.missing_fields is None:
            self.missing_fields = []

class EnhancedMultiPlatformScraper:
    """
    Advanced multi-platform scraper with tiered extraction strategies
    and comprehensive data validation for investment analysis
    """
    
    def __init__(self, openai_api_key: str, scrapingbee_api_key: str):
        self.openai_client = openai.OpenAI(api_key=openai_api_key)
        self.scrapingbee_key = scrapingbee_api_key
        self.session = None
        self.logger = logging.getLogger(__name__)
        
        # Platform-specific configurations
        self.platform_configs = {
            'funda.nl': {
                'name': 'Funda',
                'currency': 'EUR',
                'country': 'Netherlands',
                'language': 'nl',
                'selectors': {
                    'price': [
                        'div.mt-5.flex.flex-wrap.items-center.gap-3 span',
                        '.object-price',
                        '[data-test="price"]'
                    ],
                    'address': [
                        'h1 span.block.text-2xl.font-bold',
                        'h1 span.text-neutral-40'
                    ],
                    'features': [
                        'ul.flex.flex-wrap.gap-4 li',
                        '.characteristics li',
                        '.object-features li'
                    ],
                    'images': [
                        'img[data-test-id="object-media-image"]',
                        '.object-media img',
                        '.media-viewer img'
                    ]
                },
                'api_params': {
                    'country_code': 'nl',
                    'premium_proxy': True,
                    'wait': 3000
                }
            },
            'idealista.com': {
                'name': 'Idealista',
                'currency': 'EUR',
                'country': 'Spain',
                'language': 'es',
                'json_extraction': True,
                'selectors': {
                    'json_script': '#__NEXT_DATA__',
                    'images': [
                        '.main-photo img',
                        '.property-image img',
                        '[data-src]'
                    ]
                },
                'api_params': {
                    'country_code': 'es',
                    'premium_proxy': True,
                    'render_js': True,
                    'wait': 5000
                }
            },
            'fotocasa.es': {
                'name': 'Fotocasa',
                'currency': 'EUR', 
                'country': 'Spain',
                'language': 'es',
                'selectors': {
                    'price': [
                        '.detail-price',
                        '.price-container span',
                        '[data-testid="price"]'
                    ],
                    'address': [
                        '.detail-title h1',
                        '.property-title',
                        '.address-title'
                    ]
                },
                'api_params': {
                    'country_code': 'es',
                    'premium_proxy': True,
                    'wait': 4000
                }
            },
            'habitaclia.com': {
                'name': 'Habitaclia',
                'currency': 'EUR',
                'country': 'Spain', 
                'language': 'es',
                'selectors': {
                    'price': [
                        '.property-price',
                        '.price-section span'
                    ],
                    'address': [
                        '.property-address',
                        '.location-title'
                    ]
                },
                'api_params': {
                    'country_code': 'es',
                    'premium_proxy': True,
                    'wait': 4000
                }
            }
        }
    
    async def start(self):
        """Initialize HTTP session"""
        self.session = httpx.AsyncClient(timeout=60)
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.aclose()
    
    def _detect_platform(self, url: str) -> Optional[str]:
        """Detect platform from URL"""
        for domain in self.platform_configs.keys():
            if domain in url:
                return domain
        return None
    
    async def scrape_property_enhanced(self, url: str) -> Optional[EnhancedPropertyData]:
        """
        Main scraping method with tiered extraction strategy:
        1. ScrapingBee API with premium proxy
        2. OpenAI Vision API for screenshot analysis
        3. Direct HTTP with fallback selectors
        4. Structured data validation and enhancement
        """
        platform = self._detect_platform(url)
        if not platform:
            self.logger.error(f"Unsupported platform for URL: {url}")
            return None
        
        config = self.platform_configs[platform]
        self.logger.info(f"Scraping {config['name']} property: {url}")
        
        # Step 1: Try ScrapingBee API
        html_content = await self._fetch_with_scrapingbee(url, config)
        
        # Step 2: Extract data using multiple strategies
        raw_data = {}
        
        # Strategy A: JSON extraction (for platforms like Idealista)
        if config.get('json_extraction'):
            json_data = self._extract_json_data(html_content)
            raw_data.update(json_data)
        
        # Strategy B: HTML selector extraction
        html_data = self._extract_html_data(html_content, config)
        raw_data.update(html_data)
        
        # Strategy C: AI Vision analysis for missing data
        if not self._is_data_complete(raw_data):
            screenshot_data = await self._capture_and_analyze_screenshot(url, config)
            raw_data.update(screenshot_data)
        
        # Step 3: Structure and validate data
        property_data = self._structure_property_data(raw_data, url, platform)
        
        # Step 4: Calculate investment metrics
        property_data = await self._calculate_investment_metrics(property_data)
        
        # Step 5: Assess data quality
        property_data = self._assess_data_quality(property_data)
        
        return property_data
    
    async def _fetch_with_scrapingbee(self, url: str, config: Dict) -> str:
        """Fetch HTML using ScrapingBee with platform-specific optimization"""
        api_url = 'https://app.scrapingbee.com/api/v1/'
        
        params = {
            'api_key': self.scrapingbee_key,
            'url': url,
            **config['api_params']
        }
        
        try:
            response = await self.session.get(api_url, params=params)
            response.raise_for_status()
            return response.text
        except Exception as e:
            self.logger.warning(f"ScrapingBee failed for {url}: {e}")
            # Fallback to direct HTTP
            return await self._fetch_direct_http(url, config)
    
    async def _fetch_direct_http(self, url: str, config: Dict) -> str:
        """Fallback direct HTTP fetch with appropriate headers"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept-Language': f"{config['language']}-{config['country'][:2]},{config['language']};q=0.9,en;q=0.8",
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
        
        response = await self.session.get(url, headers=headers)
        response.raise_for_status()
        return response.text
    
    def _extract_json_data(self, html: str) -> Dict[str, Any]:
        """Extract structured data from JSON scripts (e.g., __NEXT_DATA__)"""
        patterns = [
            r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>',
            r'<script type="application/ld\+json"[^>]*>(.*?)</script>',
            r'window\.__INITIAL_STATE__\s*=\s*({.*?});'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group(1))
                    return self._parse_structured_json(data)
                except json.JSONDecodeError:
                    continue
        
        return {}
    
    def _parse_structured_json(self, json_data: Dict) -> Dict[str, Any]:
        """Parse structured JSON data into standardized format"""
        result = {}
        
        # Navigate common JSON structures
        estate_data = None
        if 'props' in json_data and 'pageProps' in json_data['props']:
            estate_data = json_data['props']['pageProps'].get('estate') or \
                         json_data['props']['pageProps'].get('property') or \
                         json_data['props']['pageProps'].get('inmueble')
        
        if estate_data:
            # Extract address
            if 'address' in estate_data and isinstance(estate_data['address'], dict):
                addr = estate_data['address']
                result['full_address'] = ', '.join([
                    addr.get('streetAddress', ''),
                    addr.get('postalCode', ''),
                    addr.get('addressLocality', '')
                ]).strip(', ')
                result['street_address'] = addr.get('streetAddress')
                result['postal_code'] = addr.get('postalCode')
                result['city'] = addr.get('addressLocality')
            
            # Extract price
            price = estate_data.get('price') or \
                   (estate_data.get('offers', {}).get('price') if isinstance(estate_data.get('offers'), dict) else None)
            if price:
                result['price'] = self._parse_numeric(price)
            
            # Extract area
            area = estate_data.get('floorSize', {}).get('value') if isinstance(estate_data.get('floorSize'), dict) else \
                  estate_data.get('size') or estate_data.get('surface')
            if area:
                result['living_area_sqm'] = self._parse_numeric(area)
            
            # Extract rooms
            rooms = estate_data.get('numberOfRooms') or estate_data.get('rooms') or estate_data.get('bedrooms')
            if rooms:
                result['bedrooms'] = self._parse_numeric(rooms, as_int=True)
            
            # Extract bathrooms
            bathrooms = estate_data.get('bathrooms') or estate_data.get('wc')
            if bathrooms:
                result['bathrooms'] = self._parse_numeric(bathrooms, as_int=True)
            
            # Extract year built
            year = estate_data.get('constructionYear') or estate_data.get('builtYear') or estate_data.get('yearBuilt')
            if year:
                result['year_built'] = self._parse_numeric(year, as_int=True)
            
            # Extract images
            images = estate_data.get('images') or estate_data.get('photos') or \
                    (estate_data.get('multimedia', {}).get('images') if isinstance(estate_data.get('multimedia'), dict) else [])
            if images and isinstance(images, list):
                result['images'] = self._parse_image_data(images)
        
        return result
    
    def _extract_html_data(self, html: str, config: Dict) -> Dict[str, Any]:
        """Extract data using HTML selectors and regex patterns"""
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')
        result = {}
        
        selectors = config.get('selectors', {})
        
        # Extract using configured selectors
        for field, selector_list in selectors.items():
            if field == 'json_script':
                continue
                
            for selector in selector_list:
                elements = soup.select(selector)
                if elements:
                    if field == 'price':
                        result['price'] = self._extract_price_from_elements(elements, config['currency'])
                    elif field == 'address':
                        result['full_address'] = self._extract_address_from_elements(elements)
                    elif field == 'features':
                        result.update(self._extract_features_from_elements(elements))
                    elif field == 'images':
                        result['images'] = self._extract_images_from_elements(elements)
                    break
        
        # Use regex patterns for missing data
        if 'price' not in result:
            result['price'] = self._extract_price_with_regex(html, config['currency'])
        
        if 'living_area_sqm' not in result:
            result['living_area_sqm'] = self._extract_area_with_regex(html)
        
        return result
    
    async def _capture_and_analyze_screenshot(self, url: str, config: Dict) -> Dict[str, Any]:
        """Capture screenshot using ScrapingBee and analyze with OpenAI Vision"""
        try:
            # Capture screenshot
            api_url = 'https://app.scrapingbee.com/api/v1/'
            params = {
                'api_key': self.scrapingbee_key,
                'url': url,
                'screenshot': 'true',
                'screenshot_full_page': 'true',
                **config['api_params']
            }
            
            response = await self.session.get(api_url, params=params)
            response.raise_for_status()
            
            # Encode screenshot for OpenAI
            screenshot_base64 = base64.b64encode(response.content).decode('utf-8')
            
            # Analyze with OpenAI Vision
            vision_response = await self._analyze_screenshot_with_ai(screenshot_base64, config)
            return vision_response
            
        except Exception as e:
            self.logger.error(f"Screenshot analysis failed: {e}")
            return {}
    
    async def _analyze_screenshot_with_ai(self, screenshot_base64: str, config: Dict) -> Dict[str, Any]:
        """Analyze property screenshot using OpenAI Vision API"""
        prompt = f"""
        Analyze this {config['name']} property listing screenshot and extract the following information:
        
        1. Property address (complete address)
        2. Price (in {config['currency']})
        3. Living area (in square meters)
        4. Number of bedrooms
        5. Number of bathrooms  
        6. Year built
        7. Property type (apartment, house, villa, etc.)
        8. Key features (elevator, parking, balcony, etc.)
        9. Energy certificate/label
        
        Return the data in JSON format with these exact keys:
        {{
            "full_address": "...",
            "price": numeric_value,
            "living_area_sqm": numeric_value,
            "bedrooms": integer,
            "bathrooms": integer,
            "year_built": integer,
            "property_type": "...",
            "features": ["feature1", "feature2"],
            "energy_certificate": "..."
        }}
        
        If information is not visible, use null. Be very accurate with numbers.
        """
        
        try:
            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user", 
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{screenshot_base64}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=1000,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
                
        except Exception as e:
            self.logger.error(f"OpenAI Vision analysis failed: {e}")
        
        return {}
    
    def _structure_property_data(self, raw_data: Dict, url: str, platform: str) -> EnhancedPropertyData:
        """Convert raw scraped data into structured PropertyData object"""
        
        # Create location object
        location = PropertyLocation(
            full_address=raw_data.get('full_address', 'Address not found'),
            street_address=raw_data.get('street_address'),
            postal_code=raw_data.get('postal_code'),
            city=raw_data.get('city'),
            country=self.platform_configs[platform]['country']
        )
        
        # Create features object
        features = PropertyFeatures()
        if 'features' in raw_data and isinstance(raw_data['features'], list):
            feature_list = [f.lower() for f in raw_data['features']]
            features.elevator = any('lift' in f or 'elevator' in f or 'ascensor' in f for f in feature_list)
            features.parking = any('parking' in f or 'garage' in f or 'aparcamiento' in f for f in feature_list)
            features.balcony = any('balcon' in f or 'balcony' in f for f in feature_list)
            features.terrace = any('terrace' in f or 'terraza' in f for f in feature_list)
            features.air_conditioning = any('aire' in f or 'air conditioning' in f or 'a/c' in f for f in feature_list)
        
        # Create financials object
        financials = PropertyFinancials()
        if raw_data.get('price'):
            financials.purchase_price = raw_data['price']
            if raw_data.get('living_area_sqm') and raw_data['living_area_sqm'] > 0:
                financials.price_per_sqm = raw_data['price'] / raw_data['living_area_sqm']
        
        # Create main property data object
        property_data = EnhancedPropertyData(
            url=url,
            platform=platform,
            scraped_at=datetime.now(),
            location=location,
            price=raw_data.get('price'),
            living_area_sqm=raw_data.get('living_area_sqm'),
            bedrooms=raw_data.get('bedrooms'),
            bathrooms=raw_data.get('bathrooms'),
            year_built=raw_data.get('year_built'),
            property_type=raw_data.get('property_type'),
            features=features,
            financials=financials,
            description=raw_data.get('description')
        )
        
        # Add images if available
        if 'images' in raw_data:
            property_data.images = raw_data['images']
        
        return property_data
    
    async def _calculate_investment_metrics(self, property_data: EnhancedPropertyData) -> EnhancedPropertyData:
        """Calculate investment metrics using AI analysis"""
        if not property_data.price or not property_data.living_area_sqm:
            return property_data
        
        # Create prompt for investment analysis
        prompt = f"""
        Analyze this {property_data.platform} property for investment potential:
        
        Location: {property_data.location.full_address}
        Price: €{property_data.price:,.0f}
        Area: {property_data.living_area_sqm} m²
        Bedrooms: {property_data.bedrooms}
        Bathrooms: {property_data.bathrooms}
        Year Built: {property_data.year_built}
        
        Calculate and return JSON with:
        {{
            "investment_score": 0-100,
            "rental_yield": percentage,
            "estimated_monthly_rent": euros,
            "roi_5_year": percentage,
            "roi_10_year": percentage,
            "risk_score": 0-100
        }}
        """
        
        try:
            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.3
            )
            
            content = response.choices[0].message.content
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                metrics = json.loads(json_match.group())
                property_data.investment_score = metrics.get('investment_score')
                property_data.rental_yield = metrics.get('rental_yield')
                property_data.roi_5_year = metrics.get('roi_5_year')
                property_data.roi_10_year = metrics.get('roi_10_year')
                property_data.risk_score = metrics.get('risk_score')
                
                if metrics.get('estimated_monthly_rent'):
                    property_data.financials.estimated_rental_income = metrics['estimated_monthly_rent']
                
        except Exception as e:
            self.logger.error(f"Investment metric calculation failed: {e}")
        
        return property_data
    
    def _assess_data_quality(self, property_data: EnhancedPropertyData) -> EnhancedPropertyData:
        """Assess data quality and completeness"""
        required_fields = [
            'price', 'living_area_sqm', 'bedrooms', 'bathrooms', 
            'year_built', 'property_type'
        ]
        
        missing_fields = []
        confidence_scores = {}
        
        for field in required_fields:
            value = getattr(property_data, field)
            if value is None or (isinstance(value, str) and 'not found' in value.lower()):
                missing_fields.append(field)
                confidence_scores[field] = 0.0
            else:
                confidence_scores[field] = 1.0
        
        # Calculate overall data quality score
        total_fields = len(required_fields)
        complete_fields = total_fields - len(missing_fields)
        data_quality_score = (complete_fields / total_fields) * 100
        
        # Bonus for having images and features
        if property_data.images:
            data_quality_score += 10
        if hasattr(property_data.features, 'elevator') and property_data.features.elevator is not None:
            data_quality_score += 5
        
        property_data.data_quality_score = min(data_quality_score, 100)
        property_data.extraction_confidence = confidence_scores
        property_data.missing_fields = missing_fields
        
        return property_data
    
    # Helper methods for data extraction
    def _parse_numeric(self, value: Any, as_int: bool = False) -> Optional[Union[int, float]]:
        """Parse numeric value from various formats"""
        if value is None:
            return None
        
        # Convert to string for processing
        str_value = str(value)
        
        # Remove common non-numeric characters
        cleaned = re.sub(r'[€$£,.\s]', '', str_value)
        cleaned = re.sub(r'[^\d]', '', cleaned)
        
        if not cleaned:
            return None
        
        try:
            return int(cleaned) if as_int else float(cleaned)
        except ValueError:
            return None
    
    def _extract_price_from_elements(self, elements, currency: str) -> Optional[float]:
        """Extract price from HTML elements"""
        for element in elements:
            text = element.get_text(strip=True)
            # Look for price patterns
            price_match = re.search(r'([\d.,]+)', text.replace(',', '').replace('.', ''))
            if price_match:
                return self._parse_numeric(price_match.group(1))
        return None
    
    def _extract_address_from_elements(self, elements) -> str:
        """Extract address from HTML elements"""
        address_parts = []
        for element in elements:
            text = element.get_text(strip=True)
            if text and text not in address_parts:
                address_parts.append(text)
        return ', '.join(address_parts) if address_parts else 'Address not found'
    
    def _extract_features_from_elements(self, elements) -> Dict[str, Any]:
        """Extract property features from HTML elements"""
        features = []
        area_match = None
        
        for element in elements:
            text = element.get_text(strip=True)
            features.append(text)
            
            # Look for area information
            if 'm²' in text or 'm2' in text:
                area_match = re.search(r'(\d+(?:[.,]\d+)?)\s*m[²2]', text)
        
        result = {'features': features}
        if area_match:
            result['living_area_sqm'] = self._parse_numeric(area_match.group(1))
        
        return result
    
    def _extract_images_from_elements(self, elements) -> List[PropertyImageData]:
        """Extract image data from HTML elements"""
        images = []
        for element in elements:
            src = element.get('src') or element.get('data-src')
            if src:
                # Ensure full URL
                if src.startswith('//'):
                    src = 'https:' + src
                elif src.startswith('/'):
                    src = 'https://' + self._extract_domain_from_element(element) + src
                
                images.append(PropertyImageData(
                    url=src,
                    alt_text=element.get('alt'),
                    image_type='gallery'
                ))
        
        return images
    
    def _extract_price_with_regex(self, html: str, currency: str) -> Optional[float]:
        """Extract price using regex patterns"""
        patterns = [
            r'price["\s:]*["\s]*([0-9.,]+)',
            r'precio["\s:]*["\s]*([0-9.,]+)',
            rf'{currency}["\s]*([0-9.,]+)',
            r'([0-9.,]+)\s*€'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                return self._parse_numeric(match.group(1))
        
        return None
    
    def _extract_area_with_regex(self, html: str) -> Optional[float]:
        """Extract living area using regex patterns"""
        patterns = [
            r'(\d+(?:[.,]\d+)?)\s*m[²2]',
            r'surface["\s:]*["\s]*(\d+)',
            r'area["\s:]*["\s]*(\d+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                return self._parse_numeric(match.group(1))
        
        return None
    
    def _is_data_complete(self, data: Dict) -> bool:
        """Check if extracted data is sufficiently complete"""
        required_fields = ['price', 'full_address', 'living_area_sqm']
        return all(field in data and data[field] is not None for field in required_fields)
    
    def _extract_domain_from_element(self, element) -> str:
        """Helper to extract domain for relative URLs"""
        # This is a simplified version - in practice you'd want to track the original URL
        return "example.com"  # Fallback
    
    def _parse_image_data(self, images_json: List) -> List[PropertyImageData]:
        """Parse image data from JSON structure"""
        result = []
        for img in images_json[:10]:  # Limit to first 10 images
            if isinstance(img, dict):
                url = img.get('url') or img.get('src') or img.get('href')
                if url:
                    if url.startswith('//'):
                        url = 'https:' + url
                    result.append(PropertyImageData(
                        url=url,
                        alt_text=img.get('alt'),
                        image_type='gallery'
                    ))
            elif isinstance(img, str) and img.startswith('http'):
                result.append(PropertyImageData(url=img, image_type='gallery'))
        
        return result

# Test the enhanced scraper
async def test_enhanced_scraper():
    """Test the enhanced scraper with sample URLs"""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    scraper = EnhancedMultiPlatformScraper(
        openai_api_key=os.getenv('OPENAI_API_KEY'),
        scrapingbee_api_key=os.getenv('SCRAPINGBEE_API_KEY')
    )
    
    await scraper.start()
    
    test_urls = [
        "https://www.funda.nl/koop/amsterdam/appartement-43038135-keizersgracht-123/",
        "https://www.idealista.com/inmueble/98765432/",
        "https://www.fotocasa.es/es/comprar/vivienda/madrid/madrid/Centro/123456789/d"
    ]
    
    for url in test_urls:
        try:
            print(f"\n🏠 Testing: {url}")
            result = await scraper.scrape_property_enhanced(url)
            
            if result:
                print(f"✅ Success! Data quality: {result.data_quality_score:.1f}%")
                print(f"   Address: {result.location.full_address}")
                print(f"   Price: €{result.price:,.0f}" if result.price else "   Price: Not found")
                print(f"   Investment Score: {result.investment_score}/100" if result.investment_score else "   Investment Score: Not calculated")
                print(f"   Missing fields: {result.missing_fields}")
            else:
                print("❌ Failed to scrape property")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    await scraper.close()

if __name__ == "__main__":
    asyncio.run(test_enhanced_scraper())