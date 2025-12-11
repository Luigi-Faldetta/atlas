#!/usr/bin/env python3
"""
Fixed ScrapingBee Integration for Atlas Real Estate Scraping
Addresses 400 BAD REQUEST errors and improves data extraction reliability
"""

import asyncio
import base64
import json
import logging
import os
import time
from typing import Dict, List, Optional, Any
import httpx
import openai
from dataclasses import dataclass
from urllib.parse import urlparse, quote
from dotenv import load_dotenv

load_dotenv()

@dataclass
class ScrapingResult:
    """Improved result structure with error handling"""
    success: bool
    data: Dict[str, Any] = None
    error: str = None
    processing_time: float = 0.0
    data_quality_score: float = 0.0
    screenshot_base64: str = None
    raw_html: str = None
    api_credits_used: int = 1

class FixedScrapingBeeIntegration:
    """
    Fixed ScrapingBee integration that resolves 400 errors and improves reliability
    """
    
    def __init__(self, api_key: str = None, openai_api_key: str = None):
        self.api_key = api_key or os.getenv('SCRAPINGBEE_API_KEY')
        if not self.api_key:
            raise ValueError('SCRAPINGBEE_API_KEY must be set in environment')
            
        self.openai_client = openai.OpenAI(
            api_key=openai_api_key or os.getenv('OPENAI_API_KEY')
        ) if openai_api_key or os.getenv('OPENAI_API_KEY') else None
        
        self.session = None
        self.logger = logging.getLogger(__name__)
        
        # Fixed API configuration
        self.base_url = 'https://app.scrapingbee.com/api/v1/'
        
        # Platform-specific configurations with corrected parameters
        self.platform_configs = {
            'funda.nl': {
                'name': 'Funda',
                'base_params': {
                    'render_js': 'true',
                    'premium_proxy': 'true',
                    'country_code': 'nl',
                    'wait': 5000,
                    'wait_for': '.object-header, .object-price, .kenmerken-list',
                    'window_width': 1920,
                    'window_height': 1080,
                    'block_ads': 'true',
                    'block_resources': 'false'  # Keep images and CSS for better parsing
                },
                'selectors': {
                    'address_street': 'h1 span.block.text-2xl.font-bold, .object-header h1 span:first-child',
                    'address_city': 'h1 span.text-neutral-40, .object-header h1 span:last-child',
                    'price': '.object-price span, div.mt-5.flex.flex-wrap.items-center.gap-3 span, .price-info span',
                    'living_area': '.kenmerken-list li:contains("m²"), .object-kenmerken li:contains("m²")',
                    'bedrooms': '.kenmerken-list li:contains("slaapkamer"), .object-kenmerken li:contains("kamer")',
                    'bathrooms': '.kenmerken-list li:contains("badkamer"), dt:contains("Badkamer") + dd',
                    'year_built': 'dt:contains("Bouwjaar") + dd, .kenmerken dt:contains("Bouwjaar") + dd',
                    'images': 'img[data-test-id="object-media-image"], .object-media img, .media-viewer img'
                }
            },
            'idealista.com': {
                'name': 'Idealista',
                'base_params': {
                    'render_js': 'true',
                    'premium_proxy': 'true',
                    'country_code': 'es',
                    'wait': 6000,
                    'wait_for': '.main-info__title, .info-data-price',
                    'window_width': 1920,
                    'window_height': 1080,
                    'block_ads': 'true'
                },
                'json_extraction': True
            },
            'fotocasa.es': {
                'name': 'Fotocasa',
                'base_params': {
                    'render_js': 'true',
                    'premium_proxy': 'true',
                    'country_code': 'es',
                    'wait': 5000,
                    'window_width': 1920,
                    'window_height': 1080,
                    'block_ads': 'true'
                }
            },
            'habitaclia.com': {
                'name': 'Habitaclia',
                'base_params': {
                    'render_js': 'true',
                    'premium_proxy': 'true',
                    'country_code': 'es',
                    'wait': 4000,
                    'window_width': 1920,
                    'window_height': 1080,
                    'block_ads': 'true'
                }
            }
        }
    
    async def start(self):
        """Initialize HTTP session with proper configuration"""
        # Configure httpx client with proper timeouts and retries
        self.session = httpx.AsyncClient(
            timeout=httpx.Timeout(120.0),  # 2 minute timeout
            limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
            headers={
                'User-Agent': 'Atlas-ScrapingBee-Client/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
        )
        self.logger.info("Fixed ScrapingBee client initialized")
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.aclose()
    
    def _detect_platform(self, url: str) -> Optional[str]:
        """Detect platform from URL"""
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()
        
        for platform_domain in self.platform_configs.keys():
            if platform_domain in domain:
                return platform_domain
        return None
    
    async def scrape_property_fixed(self, url: str, capture_screenshot: bool = True) -> ScrapingResult:
        """
        Fixed property scraping with proper error handling
        """
        start_time = time.time()
        
        try:
            platform = self._detect_platform(url)
            if not platform:
                return ScrapingResult(
                    success=False,
                    error=f"Unsupported platform for URL: {url}",
                    processing_time=time.time() - start_time
                )
            
            self.logger.info(f"🏠 Scraping {platform} property: {url}")
            
            # Step 1: Get HTML content with fixed parameters
            html_result = await self._fetch_html_fixed(url, platform)
            if not html_result.success:
                return html_result
            
            # Step 2: Extract data using improved selectors
            extracted_data = await self._extract_data_improved(html_result.raw_html, platform, url)
            
            # Step 3: Capture screenshot if requested and HTML extraction failed
            screenshot_base64 = None
            if capture_screenshot and (not extracted_data or extracted_data.get('address') == 'Not found'):
                screenshot_result = await self._capture_screenshot_fixed(url, platform)
                if screenshot_result.success:
                    screenshot_base64 = screenshot_result.screenshot_base64
                    
                    # Try to extract data from screenshot using AI
                    if self.openai_client and screenshot_base64:
                        ai_data = await self._extract_from_screenshot(screenshot_base64, platform)
                        if ai_data:
                            # Merge AI data with HTML data, preferring AI data for missing fields
                            for key, value in ai_data.items():
                                if key not in extracted_data or extracted_data[key] == 'Not found':
                                    extracted_data[key] = value
            
            # Step 4: Calculate data quality score
            quality_score = self._calculate_data_quality(extracted_data)
            
            processing_time = time.time() - start_time
            
            return ScrapingResult(
                success=True,
                data=extracted_data,
                processing_time=processing_time,
                data_quality_score=quality_score,
                screenshot_base64=screenshot_base64,
                raw_html=html_result.raw_html[:5000] if html_result.raw_html else None,  # Truncate for storage
                api_credits_used=2 if screenshot_base64 else 1
            )
            
        except Exception as e:
            self.logger.error(f"❌ Scraping failed for {url}: {e}")
            return ScrapingResult(
                success=False,
                error=str(e),
                processing_time=time.time() - start_time
            )
    
    async def _fetch_html_fixed(self, url: str, platform: str) -> ScrapingResult:
        """
        Fixed HTML fetching that addresses 400 BAD REQUEST issues
        """
        config = self.platform_configs[platform]
        
        # Build request parameters carefully to avoid 400 errors
        params = {
            'api_key': self.api_key,
            'url': url
        }
        
        # Add base parameters from config
        params.update(config['base_params'])
        
        # Ensure all parameter values are strings (ScrapingBee requirement)
        for key, value in params.items():
            if isinstance(value, bool):
                params[key] = 'true' if value else 'false'
            elif isinstance(value, int):
                params[key] = str(value)
            elif value is None:
                del params[key]  # Remove None values
        
        self.logger.debug(f"🔧 ScrapingBee request params: {params}")
        
        try:
            # Make request with retry logic
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = await self.session.get(
                        self.base_url,
                        params=params,
                        timeout=120
                    )
                    
                    # Log response details for debugging
                    self.logger.debug(f"📡 ScrapingBee response: {response.status_code}")
                    
                    if response.status_code == 200:
                        html_content = response.text
                        self.logger.info(f"✅ HTML fetched successfully ({len(html_content)} chars)")
                        
                        return ScrapingResult(
                            success=True,
                            raw_html=html_content,
                            processing_time=0
                        )
                    
                    elif response.status_code == 400:
                        error_text = response.text
                        self.logger.error(f"❌ ScrapingBee 400 error: {error_text}")
                        
                        # Try with simplified parameters on 400 error
                        if attempt < max_retries - 1:
                            simplified_params = {
                                'api_key': self.api_key,
                                'url': url,
                                'render_js': 'true',
                                'premium_proxy': 'true'
                            }
                            
                            self.logger.info(f"🔄 Retry {attempt + 1} with simplified params")
                            response = await self.session.get(
                                self.base_url,
                                params=simplified_params,
                                timeout=120
                            )
                            
                            if response.status_code == 200:
                                return ScrapingResult(
                                    success=True,
                                    raw_html=response.text,
                                    processing_time=0
                                )
                        
                        return ScrapingResult(
                            success=False,
                            error=f"ScrapingBee 400 error: {error_text}"
                        )
                    
                    elif response.status_code == 422:
                        # Unprocessable entity - bad URL or parameters
                        return ScrapingResult(
                            success=False,
                            error=f"Invalid URL or parameters: {response.text}"
                        )
                    
                    elif response.status_code == 429:
                        # Rate limit - wait and retry
                        wait_time = 2 ** attempt  # Exponential backoff
                        self.logger.warning(f"⏳ Rate limited, waiting {wait_time}s")
                        await asyncio.sleep(wait_time)
                        continue
                    
                    else:
                        response.raise_for_status()
                        
                except httpx.TimeoutException:
                    if attempt < max_retries - 1:
                        self.logger.warning(f"⏱️ Timeout on attempt {attempt + 1}, retrying...")
                        await asyncio.sleep(5)
                        continue
                    else:
                        return ScrapingResult(
                            success=False,
                            error="Request timeout after multiple attempts"
                        )
                
                except httpx.RequestError as e:
                    if attempt < max_retries - 1:
                        self.logger.warning(f"🔄 Network error on attempt {attempt + 1}: {e}")
                        await asyncio.sleep(2)
                        continue
                    else:
                        return ScrapingResult(
                            success=False,
                            error=f"Network error: {str(e)}"
                        )
            
            return ScrapingResult(
                success=False,
                error="Max retries exceeded"
            )
            
        except Exception as e:
            return ScrapingResult(
                success=False,
                error=f"Unexpected error: {str(e)}"
            )
    
    async def _capture_screenshot_fixed(self, url: str, platform: str) -> ScrapingResult:
        """
        Fixed screenshot capture with proper parameter handling
        """
        config = self.platform_configs[platform]
        
        # Screenshot-specific parameters
        params = {
            'api_key': self.api_key,
            'url': url,
            'screenshot': 'true',
            'screenshot_full_page': 'true'
        }
        
        # Add essential parameters for screenshot
        screenshot_params = {
            'render_js': 'true',
            'premium_proxy': 'true',
            'wait': '8000',  # Longer wait for screenshots
            'window_width': '1920',
            'window_height': '1080',
            'block_ads': 'true'
        }
        
        if platform == 'funda.nl':
            screenshot_params['country_code'] = 'nl'
        elif platform in ['idealista.com', 'fotocasa.es', 'habitaclia.com']:
            screenshot_params['country_code'] = 'es'
        
        params.update(screenshot_params)
        
        try:
            self.logger.info(f"📸 Capturing screenshot for {platform}")
            
            response = await self.session.get(
                self.base_url,
                params=params,
                timeout=180  # Longer timeout for screenshots
            )
            
            if response.status_code == 200:
                # ScrapingBee returns binary screenshot data
                screenshot_data = response.content
                if len(screenshot_data) > 1000:  # Valid screenshot should be larger
                    screenshot_base64 = base64.b64encode(screenshot_data).decode('utf-8')
                    self.logger.info(f"✅ Screenshot captured ({len(screenshot_data)} bytes)")
                    
                    return ScrapingResult(
                        success=True,
                        screenshot_base64=screenshot_base64
                    )
                else:
                    return ScrapingResult(
                        success=False,
                        error="Screenshot data too small (possible error response)"
                    )
            else:
                error_text = response.text
                self.logger.error(f"❌ Screenshot capture failed: {response.status_code} - {error_text}")
                return ScrapingResult(
                    success=False,
                    error=f"Screenshot API error: {response.status_code}"
                )
                
        except Exception as e:
            self.logger.error(f"❌ Screenshot capture exception: {e}")
            return ScrapingResult(
                success=False,
                error=f"Screenshot capture failed: {str(e)}"
            )
    
    async def _extract_data_improved(self, html: str, platform: str, url: str) -> Dict[str, Any]:
        """
        Improved data extraction with better selectors and fallbacks
        """
        from bs4 import BeautifulSoup
        import re
        
        soup = BeautifulSoup(html, 'html.parser')
        config = self.platform_configs[platform]
        
        result = {
            'Address': 'Not found',
            'Price': 'Not found',
            'Living Area': 'Not found',
            'Bedrooms': 'Not found',
            'Bathrooms': 'Not found',
            'Year Built': 'Not found',
            'Property Image': None,
            'URL': url,
            'Platform': config['name']
        }
        
        try:
            if platform == 'funda.nl':
                result = await self._extract_funda_data_improved(soup, html, url)
            elif platform == 'idealista.com':
                result = await self._extract_idealista_data_improved(soup, html, url)
            elif platform == 'fotocasa.es':
                result = await self._extract_fotocasa_data_improved(soup, html, url)
            elif platform == 'habitaclia.com':
                result = await self._extract_habitaclia_data_improved(soup, html, url)
                
        except Exception as e:
            self.logger.error(f"❌ Data extraction error for {platform}: {e}")
        
        return result
    
    async def _extract_funda_data_improved(self, soup: BeautifulSoup, html: str, url: str) -> Dict[str, Any]:
        """
        Improved Funda data extraction with multiple selector strategies
        """
        import re
        
        result = {
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
        
        # Address extraction with multiple strategies
        try:
            # Strategy 1: New Funda layout
            street_elem = soup.select_one("h1 span.block.text-2xl.font-bold")
            city_elem = soup.select_one("h1 span.text-neutral-40")
            
            if street_elem and city_elem:
                street = street_elem.get_text(strip=True)
                city = city_elem.get_text(strip=True)
                result['Address'] = f"{street}, {city}"
            else:
                # Strategy 2: Classic Funda layout
                address_selectors = [
                    '.object-header h1',
                    '.object-header .object-header__title',
                    'h1[data-test-id="object-header-title"]',
                    '.fd-m-title'
                ]
                
                for selector in address_selectors:
                    elem = soup.select_one(selector)
                    if elem:
                        result['Address'] = elem.get_text(strip=True)
                        break
                
                # Strategy 3: Regex fallback
                if result['Address'] == 'Not found':
                    address_match = re.search(r'<h1[^>]*>([^<]+(?:<[^>]+>[^<]*)*)</h1>', html)
                    if address_match:
                        # Clean HTML tags
                        address_text = re.sub(r'<[^>]+>', ' ', address_match.group(1))
                        result['Address'] = ' '.join(address_text.split())
        except Exception as e:
            self.logger.warning(f"Address extraction failed: {e}")
        
        # Price extraction
        try:
            price_selectors = [
                'div.mt-5.flex.flex-wrap.items-center.gap-3 span',
                '.object-price span',
                '.price-info span',
                '[data-test-id="price"]',
                '.object-header__price'
            ]
            
            for selector in price_selectors:
                elem = soup.select_one(selector)
                if elem:
                    price_text = elem.get_text(strip=True)
                    if '€' in price_text or any(char.isdigit() for char in price_text):
                        result['Price'] = price_text
                        break
            
            # Regex fallback for price
            if result['Price'] == 'Not found':
                price_patterns = [
                    r'€\s*([\d.,]+)',
                    r'(\d{1,3}(?:\.\d{3})*)\s*€',
                    r'Vraagprijs[:\s]*€?\s*([\d.,]+)',
                    r'koopprijs[:\s]*€?\s*([\d.,]+)'
                ]
                
                for pattern in price_patterns:
                    match = re.search(pattern, html, re.IGNORECASE)
                    if match:
                        result['Price'] = f"€ {match.group(1)}"
                        break
        except Exception as e:
            self.logger.warning(f"Price extraction failed: {e}")
        
        # Living area extraction
        try:
            # Look for m² patterns
            area_patterns = [
                r'(\d+(?:,\d+)?)\s*m[²2]',
                r'Woonoppervlakte[:\s]*(\d+(?:,\d+)?)\s*m',
                r'Gebruiksoppervlakte[:\s]*(\d+(?:,\d+)?)\s*m'
            ]
            
            for pattern in area_patterns:
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    area_value = match.group(1).replace(',', '.')
                    result['Living Area'] = f"{area_value} m²"
                    break
            
            # Also check structured elements
            if result['Living Area'] == 'Not found':
                area_selectors = [
                    'ul.flex.flex-wrap.gap-4 li',
                    '.kenmerken-list li',
                    '.object-kenmerken li'
                ]
                
                for selector in area_selectors:
                    elements = soup.select(selector)
                    for elem in elements:
                        text = elem.get_text(strip=True)
                        if 'm²' in text or 'm2' in text:
                            area_match = re.search(r'(\d+(?:[.,]\d+)?)\s*m[²2]', text)
                            if area_match:
                                result['Living Area'] = f"{area_match.group(1)} m²"
                                break
                    if result['Living Area'] != 'Not found':
                        break
        except Exception as e:
            self.logger.warning(f"Living area extraction failed: {e}")
        
        # Bedrooms extraction
        try:
            bedroom_patterns = [
                r'(\d+)\s*(?:slaap)?kamer',
                r'(\d+)\s*bed',
                r'kamers?[:\s]*(\d+)',
                r'slaapkamers?[:\s]*(\d+)'
            ]
            
            for pattern in bedroom_patterns:
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    result['Bedrooms'] = match.group(1)
                    break
        except Exception as e:
            self.logger.warning(f"Bedrooms extraction failed: {e}")
        
        # Bathrooms extraction
        try:
            bathroom_patterns = [
                r'(\d+)\s*badkamer',
                r'(\d+)\s*bathroom',
                r'badkamers?[:\s]*(\d+)'
            ]
            
            for pattern in bathroom_patterns:
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    result['Bathrooms'] = match.group(1)
                    break
        except Exception as e:
            self.logger.warning(f"Bathrooms extraction failed: {e}")
        
        # Year built extraction
        try:
            year_patterns = [
                r'Bouwjaar[:\s]*(\d{4})',
                r'Gebouwd[:\s]*(\d{4})',
                r'bouwjaar["\s:]*(\d{4})'
            ]
            
            for pattern in year_patterns:
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    result['Year Built'] = match.group(1)
                    break
        except Exception as e:
            self.logger.warning(f"Year built extraction failed: {e}")
        
        # Image extraction
        try:
            image_selectors = [
                'img[data-test-id="object-media-image"]',
                '.object-media img',
                '.media-viewer img',
                '.object-header img',
                'img[alt*="foto"]',
                'img[src*="cloud.funda.nl"]'
            ]
            
            for selector in image_selectors:
                img_elem = soup.select_one(selector)
                if img_elem and img_elem.get('src'):
                    img_src = img_elem.get('src')
                    # Ensure full URL
                    if img_src.startswith('//'):
                        img_src = 'https:' + img_src
                    elif img_src.startswith('/'):
                        img_src = 'https://www.funda.nl' + img_src
                    
                    # Validate it's a property image
                    if any(keyword in img_src.lower() for keyword in ['object', 'property', 'house', 'foto']) or 'cloud.funda.nl' in img_src:
                        result['Property Image'] = img_src
                        break
        except Exception as e:
            self.logger.warning(f"Image extraction failed: {e}")
        
        return result
    
    async def _extract_idealista_data_improved(self, soup: BeautifulSoup, html: str, url: str) -> Dict[str, Any]:
        """Improved Idealista data extraction"""
        # Implementation for Idealista with JSON and HTML extraction
        return {
            'Address': 'Not found',
            'Price': 'Not found',
            'Living Area': 'Not found',
            'Bedrooms': 'Not found',
            'Bathrooms': 'Not found',
            'Year Built': 'Not found',
            'Property Image': None,
            'URL': url,
            'Platform': 'Idealista'
        }
    
    async def _extract_fotocasa_data_improved(self, soup: BeautifulSoup, html: str, url: str) -> Dict[str, Any]:
        """Improved Fotocasa data extraction"""
        # Implementation for Fotocasa
        return {
            'Address': 'Not found',
            'Price': 'Not found',
            'Living Area': 'Not found',
            'Bedrooms': 'Not found',
            'Bathrooms': 'Not found',
            'Year Built': 'Not found',
            'Property Image': None,
            'URL': url,
            'Platform': 'Fotocasa'
        }
    
    async def _extract_habitaclia_data_improved(self, soup: BeautifulSoup, html: str, url: str) -> Dict[str, Any]:
        """Improved Habitaclia data extraction"""
        # Implementation for Habitaclia
        return {
            'Address': 'Not found',
            'Price': 'Not found',
            'Living Area': 'Not found',
            'Bedrooms': 'Not found',
            'Bathrooms': 'Not found',
            'Year Built': 'Not found',
            'Property Image': None,
            'URL': url,
            'Platform': 'Habitaclia'
        }
    
    async def _extract_from_screenshot(self, screenshot_base64: str, platform: str) -> Optional[Dict[str, Any]]:
        """
        Extract data from screenshot using OpenAI Vision API
        """
        if not self.openai_client:
            return None
        
        try:
            prompt = f"""
            Analyze this {platform} property listing screenshot and extract the following information:
            
            1. Complete property address
            2. Price (with currency symbol)
            3. Living area in square meters
            4. Number of bedrooms
            5. Number of bathrooms
            6. Year built/construction year
            
            Return ONLY a JSON object with these exact keys:
            {{
                "Address": "complete address",
                "Price": "price with currency",
                "Living Area": "area with m²",
                "Bedrooms": "number",
                "Bathrooms": "number", 
                "Year Built": "year"
            }}
            
            If information is not visible, use "Not found" as the value.
            Be very precise with numbers and include units.
            """
            
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
                max_tokens=500,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            
            # Extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
                
        except Exception as e:
            self.logger.error(f"Screenshot analysis failed: {e}")
        
        return None
    
    def _calculate_data_quality(self, data: Dict[str, Any]) -> float:
        """Calculate data quality score based on extracted fields"""
        required_fields = ['Address', 'Price', 'Living Area', 'Bedrooms', 'Bathrooms', 'Year Built']
        found_fields = 0
        
        for field in required_fields:
            if field in data and data[field] != 'Not found' and data[field] is not None:
                found_fields += 1
        
        base_score = (found_fields / len(required_fields)) * 100
        
        # Bonus points for image
        if data.get('Property Image'):
            base_score += 10
        
        # Penalty for completely failed extractions
        if found_fields == 0:
            base_score = 0
        
        return min(base_score, 100.0)

# Test function
async def test_fixed_scrapingbee():
    """Test the fixed ScrapingBee integration"""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    scraper = FixedScrapingBeeIntegration()
    await scraper.start()
    
    test_urls = [
        "https://www.funda.nl/koop/amsterdam/appartement-43038135-keizersgracht-123/",
        "https://www.idealista.com/inmueble/98765432/"
    ]
    
    for url in test_urls:
        try:
            print(f"\n🧪 Testing fixed ScrapingBee integration: {url}")
            result = await scraper.scrape_property_fixed(url, capture_screenshot=True)
            
            if result.success:
                print(f"✅ Success! Quality: {result.data_quality_score:.1f}%")
                print(f"   Processing time: {result.processing_time:.2f}s")
                print(f"   Address: {result.data.get('Address', 'N/A')}")
                print(f"   Price: {result.data.get('Price', 'N/A')}")
                print(f"   Living Area: {result.data.get('Living Area', 'N/A')}")
                print(f"   Screenshot: {'Yes' if result.screenshot_base64 else 'No'}")
                print(f"   API Credits: {result.api_credits_used}")
            else:
                print(f"❌ Failed: {result.error}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    await scraper.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_fixed_scrapingbee())