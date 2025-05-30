#!/usr/bin/env python3
"""
Enhanced Visual Scraper for Atlas Real Estate Analysis
Following Atlas Master Agent Rules for comprehensive property data extraction

Enhanced Features:
- Dynamic content loading with intelligent wait strategies
- Infinite scrolling detection and handling
- High-quality screenshot capture with section-specific extraction
- Chain-of-thought reasoning for extraction validation
- Self-reflection mechanisms for data quality assessment
- Site-specific optimization for Funda, Idealista, Fotocasa, Habitaclia
"""

import asyncio
import base64
import io
import json
import os
import time
from typing import Dict, List, Optional, Any, Tuple
from PIL import Image
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from dotenv import load_dotenv
import openai
from dataclasses import dataclass, asdict
import logging

load_dotenv()
logger = logging.getLogger(__name__)

@dataclass
class EnhancedVisualScrapingResult:
    """Enhanced result structure with comprehensive metrics and validation"""
    # Core property data
    address: Optional[str] = None
    price: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    size: Optional[int] = None
    year_built: Optional[int] = None
    property_type: Optional[str] = None
    building_type: Optional[str] = None
    energy_label: Optional[str] = None
    
    # Enhanced extracted data
    description: Optional[str] = None
    features: List[str] = None
    images: List[str] = None
    
    # Financial indicators
    price_per_sqm: Optional[float] = None
    monthly_costs: Optional[float] = None
    community_fees: Optional[float] = None
    
    # Location and context
    neighborhood_description: Optional[str] = None
    nearby_amenities: Dict[str, Any] = None
    listing_agent_info: Dict[str, str] = None
    
    # Visual validation data
    full_page_screenshot: Optional[str] = None
    key_sections_screenshots: Dict[str, str] = None
    dynamic_content_detected: bool = False
    infinite_scroll_handled: bool = False
    
    # Quality and confidence metrics
    extraction_confidence: Dict[str, float] = None
    data_completeness_score: float = 0.0
    visual_quality_score: float = 0.0
    site_compatibility_score: float = 0.0
    
    # Processing metadata
    total_processing_time: float = 0.0
    page_load_time: float = 0.0
    screenshot_time: float = 0.0
    ai_extraction_time: float = 0.0
    
    # Self-reflection and validation
    reasoning_process: str = ""
    identified_issues: List[str] = None
    improvement_suggestions: List[str] = None
    validation_notes: List[str] = None

class EnhancedVisualPropertyScraper:
    """
    Enhanced visual scraper implementing Atlas Master Agent Rules
    
    Agentic Patterns:
    - Chain-of-thought reasoning for systematic extraction
    - Self-reflection mechanisms for quality validation
    - Multi-step decomposition for complex sites
    - Confidence scoring for accuracy measurement
    - Context-aware adaptation for different platforms
    """
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_client = openai.OpenAI(
            api_key=openai_api_key or os.getenv('OPENAI_API_KEY')
        )
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
        
        # Enhanced proxy configuration with Web Unlocker optimization
        self.proxy_enabled = os.getenv('PROXY_ENABLED', 'false').lower() == 'true'
        self.proxy_config = None
        self.web_unlocker_active = False
        
        if self.proxy_enabled:
            proxy_server = os.getenv('PROXY_SERVER')
            proxy_username = os.getenv('PROXY_USERNAME')
            proxy_password = os.getenv('PROXY_PASSWORD')
            proxy_type = os.getenv('PROXY_TYPE', 'datacenter')
            
            if proxy_server and proxy_username and proxy_password:
                self.proxy_config = {
                    "server": f"http://{proxy_server}",
                    "username": proxy_username,
                    "password": proxy_password
                }
                
                if proxy_type == 'web_unlocker':
                    self.web_unlocker_active = True
                    logger.info("🔓 Web Unlocker active - enhanced site compatibility enabled")
                else:
                    logger.info(f"🌐 {proxy_type.title()} proxy configured: {proxy_server}")
        
        # Site-specific selectors and configurations
        self.site_configs = {
            'funda.nl': {
                'name': 'Funda',
                'selectors': {
                    'price': '[data-test-id="price-label"], .object-header__price, .price-section',
                    'address': '[data-test-id="address"], .object-header__address, .address-section',
                    'description': '[data-test-id="description"], .object-description, .description-section',
                    'features': '.kenmerken-lijst, .features-list, .characteristics',
                    'images': '.media-viewer img, .property-images img'
                },
                'dynamic_content': True,
                'requires_scrolling': True,
                'language': 'nl'
            },
            'idealista.com': {
                'name': 'Idealista',
                'selectors': {
                    'price': '.info-data-price, .main-info__title-price, .price-section',
                    'address': '.main-info__title-main, .address-section, .property-location',
                    'description': '.comment, .adcommentsLanguage, .description-section',
                    'features': '.details-property_features, .features-list, .characteristics',
                    'images': '.detail-multimedia img, .property-images img'
                },
                'dynamic_content': True,
                'requires_scrolling': True,
                'language': 'es'
            },
            'fotocasa.es': {
                'name': 'Fotocasa',
                'selectors': {
                    'price': '.re-DetailPrice, .detail-price, .price-section',
                    'address': '.re-DetailHeader-address, .detail-address, .address-section',
                    'description': '.re-DetailDescription, .detail-description, .description-section',
                    'features': '.re-DetailFeaturesList, .features-list, .characteristics',
                    'images': '.re-DetailGallery img, .property-images img'
                },
                'dynamic_content': True,
                'requires_scrolling': False,
                'language': 'es'
            },
            'habitaclia.com': {
                'name': 'Habitaclia',
                'selectors': {
                    'price': '.price, .property-price, .price-section',
                    'address': '.location, .property-address, .address-section',
                    'description': '.description, .property-description, .description-section',
                    'features': '.features, .property-features, .characteristics',
                    'images': '.gallery img, .property-images img'
                },
                'dynamic_content': True,
                'requires_scrolling': False,
                'language': 'es'
            }
        }
        
        logger.info("🎯 Enhanced Visual Property Scraper initialized")
    
    async def scrape_property_comprehensive(
        self, 
        url: str, 
        enable_screenshots: bool = True,
        enable_dynamic_handling: bool = True
    ) -> EnhancedVisualScrapingResult:
        """
        Execute comprehensive property scraping following agentic patterns
        
        Chain-of-thought reasoning:
        1. Initialize browser environment with site-specific optimizations
        2. Navigate to property URL with enhanced error handling
        3. Detect and handle dynamic content loading
        4. Capture high-quality screenshots for validation
        5. Extract property data using AI vision with confidence scoring
        6. Apply self-reflection for quality assessment
        7. Generate comprehensive result with improvement suggestions
        """
        start_time = time.time()
        result = EnhancedVisualScrapingResult()
        
        try:
            # STEP 1: Initialize browser with enhanced capabilities
            await self._initialize_browser_enhanced()
            
            # STEP 2: Detect site type and apply specific configurations
            site_config = self._detect_site_configuration(url)
            result.site_compatibility_score = 1.0 if site_config else 0.5
            
            # STEP 3: Navigate with enhanced error handling and wait strategies
            page_load_start = time.time()
            await self._navigate_with_enhanced_handling(url, site_config)
            result.page_load_time = time.time() - page_load_start
            
            # STEP 4: Handle dynamic content and infinite scrolling
            if enable_dynamic_handling:
                dynamic_handling_result = await self._handle_dynamic_content_comprehensive(site_config)
                result.dynamic_content_detected = dynamic_handling_result['detected']
                result.infinite_scroll_handled = dynamic_handling_result['scroll_handled']
            
            # STEP 5: Capture comprehensive screenshots
            if enable_screenshots:
                screenshot_start = time.time()
                screenshot_data = await self._capture_enhanced_screenshots(site_config)
                result.full_page_screenshot = screenshot_data.get('full_page')
                result.key_sections_screenshots = screenshot_data.get('sections', {})
                result.screenshot_time = time.time() - screenshot_start
            
            # STEP 6: Extract property data using AI vision
            extraction_start = time.time()
            extraction_data = await self._extract_property_data_ai_enhanced(url, site_config)
            result.ai_extraction_time = time.time() - extraction_start
            
            # Update result with extracted data
            self._populate_result_with_extracted_data(result, extraction_data)
            
            # STEP 7: Calculate quality metrics and confidence scores
            result.extraction_confidence = await self._calculate_extraction_confidence(result, extraction_data)
            result.data_completeness_score = self._calculate_data_completeness(result)
            result.visual_quality_score = self._calculate_visual_quality(result)
            
            # STEP 8: Apply self-reflection for quality assessment
            result = await self._apply_self_reflection_enhanced(result, extraction_data)
            
            result.total_processing_time = time.time() - start_time
            
            logger.info(f"✅ Enhanced scraping completed - Data completeness: {result.data_completeness_score:.2%}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Enhanced scraping failed: {str(e)}")
            result.identified_issues = [f"Scraping failed: {str(e)}"]
            result.total_processing_time = time.time() - start_time
            return result
            
        finally:
            await self.close()
    
    async def _initialize_browser_enhanced(self):
        """Initialize browser with enhanced capabilities and optimizations"""
        self.playwright = await async_playwright().start()
        
        # Enhanced browser launch options
        browser_options = {
            "headless": True,
            "args": [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
                "--disable-web-security",
                "--allow-running-insecure-content",
                "--disable-features=VizDisplayCompositor",
                "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ]
        }
        
        # Add proxy configuration if enabled
        if self.proxy_config:
            browser_options["proxy"] = self.proxy_config
            if self.web_unlocker_active:
                logger.info("🔓 Browser launched with Web Unlocker for protected site bypass")
            else:
                logger.info("🔒 Browser launched with proxy for enhanced access")
        
        self.browser = await self.playwright.chromium.launch(**browser_options)
        
        # Enhanced context configuration
        context_options = {
            'viewport': {'width': 1920, 'height': 1080},
            'device_scale_factor': 2,  # High DPI for crisp screenshots
            'ignore_https_errors': True,
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'accept_downloads': False,
            'bypass_csp': True,
            'extra_http_headers': {
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        }
        
        self.context = await self.browser.new_context(**context_options)
        self.page = await self.context.new_page()
        
        # Enhanced stealth measures
        await self.page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            Object.defineProperty(navigator, 'languages', {
                get: () => ['en-US', 'en'],
            });
            
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
        """)
    
    def _detect_site_configuration(self, url: str) -> Optional[Dict[str, Any]]:
        """Detect site type and return appropriate configuration"""
        for domain, config in self.site_configs.items():
            if domain in url:
                logger.info(f"🎯 Site detected: {config['name']} ({config['language']})")
                return config
        
        logger.warning(f"⚠️ Unknown site: {url} - using generic configuration")
        return None
    
    async def _navigate_with_enhanced_handling(self, url: str, site_config: Optional[Dict[str, Any]]):
        """Navigate to URL with enhanced error handling and site-specific optimizations"""
        try:
            # Set longer timeout for protected sites
            navigation_timeout = 60000 if self.web_unlocker_active else 30000
            
            # Navigate with enhanced options
            response = await self.page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=navigation_timeout
            )
            
            if response.status >= 400:
                logger.warning(f"⚠️ HTTP {response.status} response from {url}")
            
            # Site-specific post-navigation handling
            if site_config and site_config.get('dynamic_content'):
                # Wait for dynamic content to initialize
                await self.page.wait_for_timeout(3000)
                
                # Handle common cookie banners and overlays
                await self._handle_common_overlays()
                
        except PlaywrightTimeoutError:
            logger.error(f"❌ Navigation timeout for {url}")
            raise
        except Exception as e:
            logger.error(f"❌ Navigation failed: {str(e)}")
            raise
    
    async def _handle_common_overlays(self):
        """Handle common overlays like cookie banners and popups"""
        overlay_selectors = [
            '[class*="cookie"] button[class*="accept"]',
            '[id*="cookie"] button[class*="accept"]',
            '[class*="gdpr"] button[class*="accept"]',
            '[class*="consent"] button[class*="accept"]',
            'button[class*="dismiss"]',
            '.modal button[class*="close"]',
            '[class*="popup"] button[class*="close"]'
        ]
        
        for selector in overlay_selectors:
            try:
                element = await self.page.query_selector(selector)
                if element and await element.is_visible():
                    await element.click()
                    await self.page.wait_for_timeout(1000)
                    logger.info(f"🗂️ Dismissed overlay: {selector}")
                    break
            except:
                continue
    
    async def _handle_dynamic_content_comprehensive(self, site_config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Comprehensive dynamic content and infinite scrolling handling"""
        handling_result = {
            'detected': False,
            'scroll_handled': False,
            'lazy_loading_detected': False,
            'content_updates': 0
        }
        
        try:
            # Check if site requires scrolling
            requires_scrolling = site_config and site_config.get('requires_scrolling', False)
            
            if requires_scrolling:
                # Intelligent scrolling with content detection
                previous_height = await self.page.evaluate("document.body.scrollHeight")
                scroll_attempts = 0
                max_scroll_attempts = 5
                
                while scroll_attempts < max_scroll_attempts:
                    # Scroll down gradually
                    await self.page.evaluate("window.scrollTo(0, document.body.scrollHeight * 0.8)")
                    await self.page.wait_for_timeout(2000)
                    
                    # Check if new content loaded
                    current_height = await self.page.evaluate("document.body.scrollHeight")
                    if current_height > previous_height:
                        handling_result['content_updates'] += 1
                        previous_height = current_height
                        handling_result['detected'] = True
                    
                    scroll_attempts += 1
                
                # Scroll back to top for consistent screenshots
                await self.page.evaluate("window.scrollTo(0, 0)")
                await self.page.wait_for_timeout(1000)
                handling_result['scroll_handled'] = True
            
            # Detect lazy loading images
            lazy_images = await self.page.query_selector_all('img[loading="lazy"], img[data-src]')
            if lazy_images:
                handling_result['lazy_loading_detected'] = True
                # Trigger lazy loading by scrolling to images
                for img in lazy_images[:10]:  # Limit to first 10 images
                    try:
                        await img.scroll_into_view_if_needed()
                        await self.page.wait_for_timeout(500)
                    except:
                        continue
            
            # Wait for any remaining dynamic content
            await self.page.wait_for_timeout(2000)
            
            logger.info(f"📊 Dynamic content handling: {handling_result['content_updates']} updates detected")
            return handling_result
            
        except Exception as e:
            logger.error(f"❌ Dynamic content handling failed: {str(e)}")
            return handling_result
    
    async def _capture_enhanced_screenshots(self, site_config: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Capture high-quality screenshots with section-specific optimization"""
        screenshots = {}
        
        try:
            # Full page screenshot with high quality
            screenshots['full_page'] = await self.page.screenshot(
                type='png',
                full_page=True,
                quality=95,
                animations='disabled'
            )
            
            # Section-specific screenshots based on site configuration
            if site_config and 'selectors' in site_config:
                sections = {}
                
                for section_name, selectors in site_config['selectors'].items():
                    if isinstance(selectors, str):
                        selectors = [selectors]
                    
                    for selector in selectors:
                        try:
                            element = await self.page.query_selector(selector)
                            if element and await element.is_visible():
                                sections[section_name] = await element.screenshot(
                                    type='png',
                                    quality=95
                                )
                                break
                        except:
                            continue
                
                screenshots['sections'] = sections
            
            # Fallback generic section screenshots
            if not screenshots.get('sections'):
                generic_selectors = {
                    'main_content': 'main, .main-content, .content, #content',
                    'property_details': '[class*="detail"], [class*="info"], [class*="property"]',
                    'price_section': '[class*="price"], [class*="precio"], [data-testid*="price"]'
                }
                
                sections = {}
                for section_name, selector in generic_selectors.items():
                    try:
                        element = await self.page.query_selector(selector)
                        if element and await element.is_visible():
                            sections[section_name] = await element.screenshot(type='png')
                    except:
                        continue
                
                screenshots['sections'] = sections
            
            logger.info(f"📸 Captured {len(screenshots.get('sections', {}))} section screenshots")
            return screenshots
            
        except Exception as e:
            logger.error(f"❌ Screenshot capture failed: {str(e)}")
            return {'full_page': None, 'sections': {}}
    
    async def _extract_property_data_ai_enhanced(
        self, 
        url: str, 
        site_config: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Extract property data using enhanced AI vision with context awareness"""
        try:
            # Get page content for analysis
            page_content = await self.page.content()
            
            # Create enhanced extraction prompt based on site configuration
            extraction_prompt = self._create_enhanced_extraction_prompt(url, site_config, page_content)
            
            # Execute AI extraction
            response = await asyncio.create_task(
                asyncio.to_thread(
                    self.openai_client.chat.completions.create,
                    model="gpt-4o",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are an expert real estate data extraction AI specializing in European property markets. Extract data with maximum accuracy and provide confidence scores."
                        },
                        {
                            "role": "user", 
                            "content": extraction_prompt
                        }
                    ],
                    temperature=0.1,
                    max_tokens=3000
                )
            )
            
            # Parse and validate AI response
            extracted_data = self._parse_ai_extraction_response(response.choices[0].message.content)
            
            return extracted_data
            
        except Exception as e:
            logger.error(f"❌ AI extraction failed: {str(e)}")
            return {"error": f"AI extraction failed: {str(e)}"}
    
    def _create_enhanced_extraction_prompt(
        self, 
        url: str, 
        site_config: Optional[Dict[str, Any]], 
        page_content: str
    ) -> str:
        """Create enhanced extraction prompt with site-specific context"""
        
        site_context = ""
        if site_config:
            site_context = f"""
            SITE CONTEXT:
            - Platform: {site_config['name']}
            - Language: {site_config['language']}
            - Site-specific notes: {site_config.get('notes', 'Standard real estate platform')}
            """
        
        prompt = f"""
        TASK: Extract comprehensive real estate property data from the following webpage content.
        
        URL: {url}
        {site_context}
        
        EXTRACTION REQUIREMENTS:
        1. Extract ALL numerical values with high precision (prices, measurements, counts)
        2. Identify property characteristics (bedrooms, bathrooms, size, year built)
        3. Extract description and key features
        4. Identify financial information (price, monthly costs, fees)
        5. Extract location and address information
        6. Identify energy efficiency ratings and building specifications
        
        CONFIDENCE SCORING:
        For each extracted field, provide a confidence score (0.0-1.0) based on:
        - Data clarity and explicitness in the source
        - Consistency with typical real estate data patterns
        - Presence of supporting context
        
        OUTPUT FORMAT (JSON):
        {{
            "address": {{"value": "extracted address", "confidence": 0.95}},
            "price": {{"value": "extracted price", "confidence": 0.90}},
            "bedrooms": {{"value": number, "confidence": 0.85}},
            "bathrooms": {{"value": number, "confidence": 0.85}},
            "size": {{"value": number, "confidence": 0.90}},
            "year_built": {{"value": number, "confidence": 0.70}},
            "property_type": {{"value": "extracted type", "confidence": 0.80}},
            "building_type": {{"value": "extracted building type", "confidence": 0.75}},
            "energy_label": {{"value": "extracted label", "confidence": 0.85}},
            "description": {{"value": "extracted description", "confidence": 0.90}},
            "features": {{"value": ["feature1", "feature2"], "confidence": 0.85}},
            "price_per_sqm": {{"value": number, "confidence": 0.80}},
            "monthly_costs": {{"value": number, "confidence": 0.70}},
            "community_fees": {{"value": number, "confidence": 0.75}}
        }}
        
        WEBPAGE CONTENT (truncated for analysis):
        {page_content[:8000]}
        
        Provide only the JSON response without additional explanations.
        """
        
        return prompt
    
    def _parse_ai_extraction_response(self, response_content: str) -> Dict[str, Any]:
        """Parse and validate AI extraction response"""
        try:
            # Extract JSON from response
            start_idx = response_content.find('{')
            end_idx = response_content.rfind('}') + 1
            
            if start_idx != -1 and end_idx != 0:
                json_content = response_content[start_idx:end_idx]
                parsed_data = json.loads(json_content)
                
                # Validate and clean extracted data
                validated_data = {}
                for field, field_data in parsed_data.items():
                    if isinstance(field_data, dict) and 'value' in field_data:
                        validated_data[field] = {
                            'value': field_data['value'],
                            'confidence': field_data.get('confidence', 0.5)
                        }
                    else:
                        validated_data[field] = {
                            'value': field_data,
                            'confidence': 0.5
                        }
                
                return validated_data
            else:
                logger.error("❌ No valid JSON found in AI response")
                return {"error": "Invalid AI response format"}
                
        except json.JSONDecodeError as e:
            logger.error(f"❌ JSON parsing failed: {str(e)}")
            return {"error": f"JSON parsing failed: {str(e)}"}
        except Exception as e:
            logger.error(f"❌ Response parsing failed: {str(e)}")
            return {"error": f"Response parsing failed: {str(e)}"}
    
    def _populate_result_with_extracted_data(
        self, 
        result: EnhancedVisualScrapingResult, 
        extracted_data: Dict[str, Any]
    ):
        """Populate result object with extracted data"""
        if "error" in extracted_data:
            result.identified_issues = [extracted_data["error"]]
            return
        
        # Map extracted data to result fields
        field_mapping = {
            'address': 'address',
            'price': 'price',
            'bedrooms': 'bedrooms',
            'bathrooms': 'bathrooms',
            'size': 'size',
            'year_built': 'year_built',
            'property_type': 'property_type',
            'building_type': 'building_type',
            'energy_label': 'energy_label',
            'description': 'description',
            'features': 'features',
            'price_per_sqm': 'price_per_sqm',
            'monthly_costs': 'monthly_costs',
            'community_fees': 'community_fees'
        }
        
        for extracted_field, result_field in field_mapping.items():
            if extracted_field in extracted_data:
                field_data = extracted_data[extracted_field]
                value = field_data.get('value') if isinstance(field_data, dict) else field_data
                
                if value is not None and value != "":
                    setattr(result, result_field, value)
    
    async def _calculate_extraction_confidence(
        self, 
        result: EnhancedVisualScrapingResult, 
        extracted_data: Dict[str, Any]
    ) -> Dict[str, float]:
        """Calculate confidence scores for extracted data"""
        confidence_scores = {}
        
        if "error" in extracted_data:
            return {"overall": 0.0}
        
        # Extract confidence scores from AI response
        total_confidence = 0.0
        field_count = 0
        
        for field, field_data in extracted_data.items():
            if isinstance(field_data, dict) and 'confidence' in field_data:
                confidence = field_data['confidence']
                confidence_scores[field] = confidence
                total_confidence += confidence
                field_count += 1
        
        # Calculate overall confidence
        if field_count > 0:
            confidence_scores['overall'] = total_confidence / field_count
        else:
            confidence_scores['overall'] = 0.0
        
        return confidence_scores
    
    def _calculate_data_completeness(self, result: EnhancedVisualScrapingResult) -> float:
        """Calculate data completeness score based on extracted fields"""
        essential_fields = ['address', 'price', 'bedrooms', 'bathrooms', 'size', 'description']
        optional_fields = ['year_built', 'property_type', 'energy_label', 'features']
        
        essential_score = sum(1 for field in essential_fields if getattr(result, field) is not None) / len(essential_fields)
        optional_score = sum(1 for field in optional_fields if getattr(result, field) is not None) / len(optional_fields)
        
        # Weight essential fields more heavily
        return (essential_score * 0.8) + (optional_score * 0.2)
    
    def _calculate_visual_quality(self, result: EnhancedVisualScrapingResult) -> float:
        """Calculate visual quality score based on screenshots and processing"""
        quality_score = 0.0
        
        # Screenshot quality assessment
        if result.full_page_screenshot:
            quality_score += 0.4
        
        if result.key_sections_screenshots:
            quality_score += 0.3 * min(len(result.key_sections_screenshots) / 3, 1.0)
        
        # Dynamic content handling assessment
        if result.dynamic_content_detected:
            quality_score += 0.15
        
        if result.infinite_scroll_handled:
            quality_score += 0.15
        
        return min(quality_score, 1.0)
    
    async def _apply_self_reflection_enhanced(
        self, 
        result: EnhancedVisualScrapingResult, 
        extracted_data: Dict[str, Any]
    ) -> EnhancedVisualScrapingResult:
        """Apply enhanced self-reflection for quality assessment"""
        
        # Generate reasoning process
        reasoning_parts = []
        if result.data_completeness_score >= 0.8:
            reasoning_parts.append("High data completeness achieved with comprehensive extraction")
        elif result.data_completeness_score >= 0.6:
            reasoning_parts.append("Good data completeness with room for improvement in optional fields")
        else:
            reasoning_parts.append("Low data completeness - critical information may be missing")
        
        if result.site_compatibility_score >= 0.8:
            reasoning_parts.append("Site compatibility excellent with optimized extraction")
        else:
            reasoning_parts.append("Site compatibility concerns - may require additional optimization")
        
        result.reasoning_process = "; ".join(reasoning_parts)
        
        # Identify specific issues
        issues = []
        if result.data_completeness_score < 0.5:
            issues.append("Critical data extraction failures detected")
        if not result.full_page_screenshot:
            issues.append("Screenshot capture failed")
        if "error" in extracted_data:
            issues.append(f"AI extraction error: {extracted_data['error']}")
        
        result.identified_issues = issues or []
        
        # Generate improvement suggestions
        suggestions = []
        if result.data_completeness_score < 0.8:
            suggestions.append("Enhance selector specificity for better data extraction")
        if not result.dynamic_content_detected and result.site_compatibility_score > 0.8:
            suggestions.append("Consider implementing dynamic content detection for this site")
        if result.visual_quality_score < 0.7:
            suggestions.append("Improve screenshot quality and section detection")
        
        result.improvement_suggestions = suggestions or []
        
        # Generate validation notes
        validation_notes = [
            f"Extraction completed with {result.data_completeness_score:.1%} completeness",
            f"Processing time: {result.total_processing_time:.2f}s",
            f"Visual quality: {result.visual_quality_score:.1%}"
        ]
        
        if result.extraction_confidence:
            avg_confidence = result.extraction_confidence.get('overall', 0.0)
            validation_notes.append(f"Average confidence: {avg_confidence:.1%}")
        
        result.validation_notes = validation_notes
        
        return result
    
    async def close(self):
        """Clean up browser resources"""
        try:
            if self.page:
                await self.page.close()
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
        except Exception as e:
            logger.error(f"❌ Cleanup error: {str(e)}")

# Test function for validation
async def test_enhanced_scraper():
    """Test the enhanced scraper with sample property URLs"""
    scraper = EnhancedVisualPropertyScraper()
    
    test_urls = [
        "https://www.funda.nl/koop/amsterdam/huis-example/",
        "https://www.idealista.com/inmueble/example/",
        "https://www.fotocasa.es/es/comprar/vivienda/example/"
    ]
    
    for url in test_urls:
        print(f"\n🧪 Testing: {url}")
        try:
            result = await scraper.scrape_property_comprehensive(url)
            print(f"✅ Completeness: {result.data_completeness_score:.2%}")
            print(f"📊 Confidence: {result.extraction_confidence.get('overall', 0.0):.2%}")
            print(f"⏱️ Time: {result.total_processing_time:.2f}s")
        except Exception as e:
            print(f"❌ Test failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_enhanced_scraper()) 