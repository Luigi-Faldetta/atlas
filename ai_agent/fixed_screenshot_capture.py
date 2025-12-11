#!/usr/bin/env python3
"""
Fixed Screenshot Capture System for Atlas Real Estate Scraping
Addresses screenshot capture failures and improves reliability
"""

import asyncio
import base64
import io
import json
import logging
import os
import time
from typing import Dict, List, Optional, Any, Tuple
import httpx
import openai
from dataclasses import dataclass
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

@dataclass
class ScreenshotResult:
    """Result structure for screenshot operations"""
    success: bool
    screenshot_base64: str = None
    screenshot_size: int = 0
    error: str = None
    method_used: str = 'unknown'
    processing_time: float = 0.0
    api_credits_used: int = 0
    quality_score: float = 0.0

@dataclass 
class ScreenshotAnalysisResult:
    """Result structure for screenshot analysis"""
    success: bool
    extracted_data: Dict[str, Any] = None
    confidence_scores: Dict[str, float] = None
    error: str = None
    processing_time: float = 0.0

class FixedScreenshotCapture:
    """
    Fixed screenshot capture system that addresses all identified issues
    """
    
    def __init__(self, scrapingbee_api_key: str = None, openai_api_key: str = None):
        self.scrapingbee_api_key = scrapingbee_api_key or os.getenv('SCRAPINGBEE_API_KEY')
        self.openai_client = openai.OpenAI(
            api_key=openai_api_key or os.getenv('OPENAI_API_KEY')
        ) if openai_api_key or os.getenv('OPENAI_API_KEY') else None
        
        self.session = None
        self.logger = logging.getLogger(__name__)
        
        # Platform-specific screenshot configurations
        self.screenshot_configs = {
            'funda.nl': {
                'name': 'Funda',
                'wait_time': 8000,
                'country_code': 'nl',
                'viewport': {'width': 1920, 'height': 1080},
                'wait_for_selectors': [
                    '.object-header',
                    '.object-price',
                    '.kenmerken-list',
                    '[data-test-id="price-label"]'
                ],
                'css_selectors_to_hide': [
                    '.cookie-consent',
                    '.gdpr-banner', 
                    '.notification-banner',
                    '.chat-widget',
                    '.floating-button'
                ]
            },
            'idealista.com': {
                'name': 'Idealista',
                'wait_time': 10000,
                'country_code': 'es',
                'viewport': {'width': 1920, 'height': 1080},
                'wait_for_selectors': [
                    '.main-info__title',
                    '.info-data-price',
                    '.details-property'
                ],
                'css_selectors_to_hide': [
                    '#didomi-notice',
                    '.cookies-banner',
                    '.modal-overlay',
                    '.popup-container'
                ]
            },
            'fotocasa.es': {
                'name': 'Fotocasa',
                'wait_time': 8000,
                'country_code': 'es',
                'viewport': {'width': 1920, 'height': 1080},
                'wait_for_selectors': [
                    '.re-DetailPrice',
                    '.re-DetailHeader'
                ],
                'css_selectors_to_hide': [
                    '.tc-privacy-wrapper',
                    '.cookie-banner',
                    '.modal'
                ]
            },
            'habitaclia.com': {
                'name': 'Habitaclia',
                'wait_time': 6000,
                'country_code': 'es',
                'viewport': {'width': 1920, 'height': 1080},
                'wait_for_selectors': [
                    '.property-price',
                    '.property-details'
                ],
                'css_selectors_to_hide': [
                    '.cookie-accept',
                    '.modal-backdrop'
                ]
            }
        }
    
    async def start(self):
        """Initialize HTTP session"""
        self.session = httpx.AsyncClient(
            timeout=httpx.Timeout(180.0),  # 3 minute timeout for screenshots
            limits=httpx.Limits(max_connections=5),
            headers={
                'User-Agent': 'Atlas-Screenshot-Service/1.0'
            }
        )
        self.logger.info("Fixed screenshot capture service initialized")
    
    async def close(self):
        """Close HTTP session"""
        if self.session:
            await self.session.aclose()
    
    def _detect_platform(self, url: str) -> Optional[str]:
        """Detect platform from URL"""
        for platform in self.screenshot_configs.keys():
            if platform in url:
                return platform
        return None
    
    async def capture_screenshot_fixed(self, url: str, full_page: bool = True) -> ScreenshotResult:
        """
        Main screenshot capture method with all fixes applied
        """
        start_time = time.time()
        
        if not self.scrapingbee_api_key:
            return ScreenshotResult(
                success=False,
                error="ScrapingBee API key not available",
                processing_time=time.time() - start_time
            )
        
        platform = self._detect_platform(url)
        if not platform:
            # Use generic configuration for unknown platforms
            platform = 'generic'
        
        try:
            self.logger.info(f"📸 Capturing screenshot for {platform}: {url}")
            
            # Try optimized screenshot capture
            result = await self._capture_with_optimized_params(url, platform, full_page)
            
            if result.success:
                # Validate screenshot quality
                result.quality_score = await self._validate_screenshot_quality(result.screenshot_base64)
                result.processing_time = time.time() - start_time
                
                if result.quality_score >= 70:
                    self.logger.info(f"✅ High-quality screenshot captured (Quality: {result.quality_score:.1f}%)")
                    return result
                else:
                    self.logger.warning(f"⚠️ Low-quality screenshot (Quality: {result.quality_score:.1f}%), trying fallback...")
            
            # Fallback: Try simplified parameters
            fallback_result = await self._capture_with_fallback_params(url, platform, full_page)
            fallback_result.processing_time = time.time() - start_time
            
            if fallback_result.success:
                fallback_result.quality_score = await self._validate_screenshot_quality(fallback_result.screenshot_base64)
                return fallback_result
            
            # Return best available result
            return result if result.success else fallback_result
            
        except Exception as e:
            self.logger.error(f"❌ Screenshot capture failed: {e}")
            return ScreenshotResult(
                success=False,
                error=str(e),
                processing_time=time.time() - start_time
            )
    
    async def _capture_with_optimized_params(self, url: str, platform: str, full_page: bool) -> ScreenshotResult:
        """
        Capture screenshot with optimized parameters for reliability
        """
        config = self.screenshot_configs.get(platform, self.screenshot_configs['funda.nl'])
        
        # Build JavaScript for better screenshot preparation
        preparation_js = self._build_preparation_javascript(config)
        
        # Optimized parameters that avoid 400 errors
        params = {
            'api_key': self.scrapingbee_api_key,
            'url': url,
            'screenshot': 'true',
            'screenshot_full_page': str(full_page).lower(),
            'render_js': 'true',
            'premium_proxy': 'true',
            'js_snippet': preparation_js,
            'wait': str(config['wait_time']),
            'window_width': str(config['viewport']['width']),
            'window_height': str(config['viewport']['height']),
            'block_ads': 'true',
            'block_resources': 'false'  # Keep resources for visual completeness
        }
        
        # Add country code if available
        if config.get('country_code'):
            params['country_code'] = config['country_code']
        
        try:
            self.logger.debug(f"🔧 Screenshot params: {list(params.keys())}")
            
            response = await self.session.get(
                'https://app.scrapingbee.com/api/v1/',
                params=params,
                timeout=180
            )
            
            self.logger.debug(f"📡 Screenshot response: {response.status_code}")
            
            if response.status_code == 200:
                screenshot_data = response.content
                
                if len(screenshot_data) > 5000:  # Valid screenshots should be larger
                    screenshot_base64 = base64.b64encode(screenshot_data).decode('utf-8')
                    
                    self.logger.info(f"✅ Screenshot captured successfully ({len(screenshot_data)} bytes)")
                    
                    return ScreenshotResult(
                        success=True,
                        screenshot_base64=screenshot_base64,
                        screenshot_size=len(screenshot_data),
                        method_used='optimized',
                        api_credits_used=1
                    )
                else:
                    return ScreenshotResult(
                        success=False,
                        error=f"Screenshot too small ({len(screenshot_data)} bytes)",
                        method_used='optimized',
                        api_credits_used=1
                    )
            
            elif response.status_code == 400:
                error_text = response.text[:500]
                self.logger.error(f"❌ Screenshot 400 error: {error_text}")
                return ScreenshotResult(
                    success=False,
                    error=f"ScrapingBee 400 error: {error_text}",
                    method_used='optimized',
                    api_credits_used=1
                )
            
            elif response.status_code == 422:
                return ScreenshotResult(
                    success=False,
                    error="Invalid URL or parameters for screenshot",
                    method_used='optimized',
                    api_credits_used=1
                )
            
            else:
                return ScreenshotResult(
                    success=False,
                    error=f"Screenshot API error: {response.status_code}",
                    method_used='optimized',
                    api_credits_used=1
                )
                
        except httpx.TimeoutException:
            return ScreenshotResult(
                success=False,
                error="Screenshot capture timeout",
                method_used='optimized',
                api_credits_used=1
            )
        except Exception as e:
            return ScreenshotResult(
                success=False,
                error=f"Screenshot capture error: {str(e)}",
                method_used='optimized',
                api_credits_used=1
            )
    
    async def _capture_with_fallback_params(self, url: str, platform: str, full_page: bool) -> ScreenshotResult:
        """
        Fallback screenshot capture with minimal parameters
        """
        # Simplified parameters that are more likely to work
        params = {
            'api_key': self.scrapingbee_api_key,
            'url': url,
            'screenshot': 'true',
            'screenshot_full_page': str(full_page).lower(),
            'render_js': 'true',
            'wait': '5000'
        }
        
        try:
            self.logger.info("🔄 Trying fallback screenshot capture...")
            
            response = await self.session.get(
                'https://app.scrapingbee.com/api/v1/',
                params=params,
                timeout=120
            )
            
            if response.status_code == 200:
                screenshot_data = response.content
                
                if len(screenshot_data) > 1000:
                    screenshot_base64 = base64.b64encode(screenshot_data).decode('utf-8')
                    
                    self.logger.info(f"✅ Fallback screenshot captured ({len(screenshot_data)} bytes)")
                    
                    return ScreenshotResult(
                        success=True,
                        screenshot_base64=screenshot_base64,
                        screenshot_size=len(screenshot_data),
                        method_used='fallback',
                        api_credits_used=1
                    )
            
            return ScreenshotResult(
                success=False,
                error=f"Fallback screenshot failed: {response.status_code}",
                method_used='fallback',
                api_credits_used=1
            )
            
        except Exception as e:
            return ScreenshotResult(
                success=False,
                error=f"Fallback screenshot error: {str(e)}",
                method_used='fallback',
                api_credits_used=1
            )
    
    def _build_preparation_javascript(self, config: Dict[str, Any]) -> str:
        """
        Build JavaScript code to prepare page for screenshot
        """
        selectors_to_hide = config.get('css_selectors_to_hide', [])
        wait_for_selectors = config.get('wait_for_selectors', [])
        
        js_code = f"""
        console.log('Starting page preparation for screenshot...');
        
        // Function to wait for elements
        function waitForElements(selectors, timeout = 10000) {{
            return new Promise((resolve) => {{
                const startTime = Date.now();
                const checkElements = () => {{
                    let found = 0;
                    for (const selector of selectors) {{
                        if (document.querySelector(selector)) {{
                            found++;
                        }}
                    }}
                    
                    if (found > 0 || Date.now() - startTime > timeout) {{
                        console.log(`Found ${{found}} elements out of ${{selectors.length}}`);
                        resolve();
                    }} else {{
                        setTimeout(checkElements, 100);
                    }}
                }};
                checkElements();
            }});
        }}
        
        // Function to hide unwanted elements
        function hideElements(selectors) {{
            selectors.forEach(selector => {{
                try {{
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(el => {{
                        el.style.display = 'none';
                        console.log(`Hidden element: ${{selector}}`);
                    }});
                }} catch (e) {{
                    console.log(`Could not hide selector: ${{selector}}`);
                }}
            }});
        }}
        
        // Function to handle cookie banners
        function handleCookies() {{
            const cookieSelectors = [
                '[id*="cookie"] button[id*="accept"]',
                '[class*="cookie"] button[class*="accept"]',
                '.gdpr-accept',
                '.privacy-accept',
                '[data-accept-cookies]',
                'button:contains("Accept")',
                'button:contains("Accepteren")',
                'button:contains("Aceptar")'
            ];
            
            cookieSelectors.forEach(selector => {{
                try {{
                    const button = document.querySelector(selector);
                    if (button && button.offsetParent !== null) {{
                        button.click();
                        console.log(`Clicked cookie button: ${{selector}}`);
                    }}
                }} catch (e) {{
                    // Ignore errors
                }}
            }});
        }}
        
        // Main preparation sequence
        async function preparePage() {{
            try {{
                // Handle cookies first
                handleCookies();
                
                // Wait a bit for cookie handling
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Wait for important elements to load
                const waitSelectors = {json.dumps(wait_for_selectors)};
                if (waitSelectors.length > 0) {{
                    await waitForElements(waitSelectors);
                }}
                
                // Hide unwanted elements
                const hideSelectors = {json.dumps(selectors_to_hide)};
                hideElements(hideSelectors);
                
                // Scroll to top
                window.scrollTo(0, 0);
                
                // Wait for any animations
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                console.log('Page preparation completed');
                
            }} catch (error) {{
                console.log('Page preparation error:', error);
            }}
        }}
        
        // Execute preparation
        preparePage();
        """
        
        return js_code
    
    async def _validate_screenshot_quality(self, screenshot_base64: str) -> float:
        """
        Validate screenshot quality by checking image properties
        """
        try:
            # Decode base64 to image
            image_data = base64.b64decode(screenshot_base64)
            image = Image.open(io.BytesIO(image_data))
            
            width, height = image.size
            file_size = len(image_data)
            
            # Calculate quality score based on various factors
            quality_score = 0.0
            
            # Size check (good screenshots should be reasonably large)
            if width >= 1200 and height >= 800:
                quality_score += 30
            elif width >= 800 and height >= 600:
                quality_score += 20
            else:
                quality_score += 10
            
            # File size check (indicates content richness)
            if file_size > 500000:  # > 500KB
                quality_score += 25
            elif file_size > 200000:  # > 200KB
                quality_score += 15
            elif file_size > 100000:  # > 100KB
                quality_score += 10
            else:
                quality_score += 5
            
            # Image format check
            if image.format in ['PNG', 'JPEG']:
                quality_score += 10
            
            # Color analysis (screenshots should not be mostly white/empty)
            try:
                # Convert to RGB if necessary
                if image.mode != 'RGB':
                    image = image.convert('RGB')
                
                # Sample pixels to check for content
                sample_size = min(100, width * height // 10000)
                pixels = list(image.getdata())
                
                # Check for variation in pixel values (indicates content)
                if len(pixels) >= sample_size:
                    sampled_pixels = pixels[::len(pixels)//sample_size][:sample_size]
                    
                    # Calculate color variance
                    r_values = [p[0] for p in sampled_pixels]
                    g_values = [p[1] for p in sampled_pixels]
                    b_values = [p[2] for p in sampled_pixels]
                    
                    r_var = max(r_values) - min(r_values)
                    g_var = max(g_values) - min(g_values)
                    b_var = max(b_values) - min(b_values)
                    
                    avg_variance = (r_var + g_var + b_var) / 3
                    
                    if avg_variance > 100:  # Good color variation
                        quality_score += 25
                    elif avg_variance > 50:
                        quality_score += 15
                    else:
                        quality_score += 5
                else:
                    quality_score += 10
                    
            except Exception as e:
                self.logger.warning(f"Color analysis failed: {e}")
                quality_score += 10  # Default bonus
            
            # Additional bonus for reasonable aspect ratio
            aspect_ratio = width / height
            if 1.0 <= aspect_ratio <= 2.5:  # Reasonable for web pages
                quality_score += 10
            
            self.logger.debug(f"Screenshot quality: {width}x{height}, {file_size} bytes, score: {quality_score:.1f}%")
            
            return min(quality_score, 100.0)
            
        except Exception as e:
            self.logger.error(f"Screenshot validation failed: {e}")
            return 0.0  # Failed validation
    
    async def analyze_screenshot_with_ai(self, screenshot_base64: str, platform: str) -> ScreenshotAnalysisResult:
        """
        Analyze screenshot using OpenAI Vision API to extract property data
        """
        if not self.openai_client:
            return ScreenshotAnalysisResult(
                success=False,
                error="OpenAI API client not available"
            )
        
        start_time = time.time()
        
        try:
            platform_name = self.screenshot_configs.get(platform, {}).get('name', platform)
            
            prompt = f"""
            Analyze this {platform_name} real estate property listing screenshot and extract property information.
            
            Extract the following data with high accuracy:
            1. Complete property address (street, number, postal code, city)
            2. Property price (with currency)
            3. Living area/size (in square meters)
            4. Number of bedrooms
            5. Number of bathrooms
            6. Year built/construction year
            7. Property type (apartment, house, villa, etc.)
            
            Also note:
            - Energy label/certificate if visible
            - Key features (elevator, parking, balcony, etc.)
            - Any visible issues or quality problems with the screenshot
            
            Return the information in this exact JSON format:
            {{
                "address": "complete address",
                "price": "price with currency symbol",
                "living_area": "area with m² unit",
                "bedrooms": "number as string",
                "bathrooms": "number as string", 
                "year_built": "year as string",
                "property_type": "type of property",
                "energy_label": "energy certificate if visible",
                "features": ["list", "of", "visible", "features"],
                "screenshot_quality": "high/medium/low",
                "extraction_confidence": {{
                    "address": 0.95,
                    "price": 0.90,
                    "living_area": 0.85
                }}
            }}
            
            Use "Not found" for missing information. Be precise with numbers and units.
            Rate your confidence for each field from 0.0 to 1.0.
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
                max_tokens=1000,
                temperature=0.1
            )
            
            content = response.choices[0].message.content
            
            # Extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                extracted_data = json.loads(json_match.group())
                confidence_scores = extracted_data.pop('extraction_confidence', {})
                
                return ScreenshotAnalysisResult(
                    success=True,
                    extracted_data=extracted_data,
                    confidence_scores=confidence_scores,
                    processing_time=time.time() - start_time
                )
            else:
                return ScreenshotAnalysisResult(
                    success=False,
                    error="Could not parse AI response JSON",
                    processing_time=time.time() - start_time
                )
                
        except Exception as e:
            self.logger.error(f"AI screenshot analysis failed: {e}")
            return ScreenshotAnalysisResult(
                success=False,
                error=str(e),
                processing_time=time.time() - start_time
            )
    
    async def capture_and_analyze(self, url: str) -> Tuple[ScreenshotResult, Optional[ScreenshotAnalysisResult]]:
        """
        Convenience method to capture screenshot and analyze it in one call
        """
        # Capture screenshot
        screenshot_result = await self.capture_screenshot_fixed(url, full_page=True)
        
        if not screenshot_result.success:
            return screenshot_result, None
        
        # Analyze screenshot if AI is available
        analysis_result = None
        if self.openai_client and screenshot_result.screenshot_base64:
            platform = self._detect_platform(url) or 'unknown'
            analysis_result = await self.analyze_screenshot_with_ai(
                screenshot_result.screenshot_base64, 
                platform
            )
        
        return screenshot_result, analysis_result

# Test function
async def test_fixed_screenshot_capture():
    """Test the fixed screenshot capture system"""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    capture_service = FixedScreenshotCapture()
    await capture_service.start()
    
    test_urls = [
        "https://www.funda.nl/koop/amsterdam/appartement-43038135-keizersgracht-123/",
        "https://www.idealista.com/inmueble/98765432/",
        "https://www.fotocasa.es/es/comprar/vivienda/madrid/madrid/Centro/123456789/d"
    ]
    
    for url in test_urls:
        try:
            print(f"\n📸 Testing screenshot capture: {url}")
            
            # Test capture and analysis
            screenshot_result, analysis_result = await capture_service.capture_and_analyze(url)
            
            if screenshot_result.success:
                print(f"✅ Screenshot captured successfully!")
                print(f"   Method: {screenshot_result.method_used}")
                print(f"   Size: {screenshot_result.screenshot_size} bytes")
                print(f"   Quality: {screenshot_result.quality_score:.1f}%")
                print(f"   Processing time: {screenshot_result.processing_time:.2f}s")
                print(f"   API credits: {screenshot_result.api_credits_used}")
                
                if analysis_result and analysis_result.success:
                    print(f"   AI Analysis: ✅ Success")
                    print(f"   Extracted address: {analysis_result.extracted_data.get('address', 'N/A')}")
                    print(f"   Extracted price: {analysis_result.extracted_data.get('price', 'N/A')}")
                elif analysis_result:
                    print(f"   AI Analysis: ❌ {analysis_result.error}")
                else:
                    print(f"   AI Analysis: ⚠️ Not available")
            else:
                print(f"❌ Screenshot failed: {screenshot_result.error}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    await capture_service.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_fixed_screenshot_capture())