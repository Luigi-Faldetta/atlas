#!/usr/bin/env python3
"""
ScrapingBee Enhanced Screenshot Scraper for Atlas Real Estate Analysis
Implements advanced screenshot capture with popup handling and dropdown expansion
"""

import asyncio
import base64
import io
import json
import os
import time
from typing import Dict, List, Optional, Any, Tuple
from PIL import Image
import httpx
import openai
from dataclasses import dataclass, asdict
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

@dataclass
class ScrapingBeeScreenshotResult:
    """Enhanced result structure with screenshot-based data extraction"""
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
    
    # Enhanced extracted data from screenshots
    description: Optional[str] = None
    features: List[str] = None
    floor_plan_details: Optional[str] = None
    location_highlights: List[str] = None
    
    # Financial data from visual elements
    price_per_sqm: Optional[float] = None
    monthly_costs: Optional[float] = None
    community_fees: Optional[float] = None
    property_taxes: Optional[float] = None
    
    # Screenshot metadata
    full_page_screenshot_url: Optional[str] = None
    full_page_screenshot_base64: Optional[str] = None
    dropdown_screenshots: Dict[str, str] = None
    popup_screenshots: Dict[str, str] = None
    
    # Enhanced visual data
    property_images: List[str] = None
    virtual_tour_available: bool = False
    floor_plan_available: bool = False
    neighborhood_map_available: bool = False
    
    # Processing metadata
    screenshot_capture_time: float = 0.0
    ai_vision_processing_time: float = 0.0
    total_processing_time: float = 0.0
    scrapingbee_credits_used: int = 0
    
    # Quality metrics
    screenshot_quality_score: float = 0.0
    data_extraction_confidence: Dict[str, float] = None
    visual_clarity_score: float = 0.0
    
    # Advanced features detected
    interactive_elements_found: List[str] = None
    dropdown_menus_expanded: List[str] = None
    popups_handled: List[str] = None
    cookies_accepted: bool = False
    
    # Reasoning and validation
    extraction_reasoning: str = ""
    potential_issues: List[str] = None
    improvement_suggestions: List[str] = None

class ScrapingBeeEnhancedScraper:
    """
    Advanced property scraper using ScrapingBee Screenshot API
    with intelligent popup handling and dropdown expansion
    """
    
    def __init__(self, api_key: Optional[str] = None, openai_api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('SCRAPINGBEE_API_KEY')
        if not self.api_key:
            raise ValueError('SCRAPINGBEE_API_KEY must be set in environment')
            
        self.openai_client = openai.OpenAI(
            api_key=openai_api_key or os.getenv('OPENAI_API_KEY')
        )
        
        self.session = httpx.AsyncClient(timeout=120)
        self.base_url = 'https://app.scrapingbee.com/api/v1/'
        
        # Site-specific configurations for popup and dropdown handling
        self.site_configs = {
            'funda.nl': {
                'name': 'Funda',
                'cookie_selectors': [
                    '[data-consent-accept]',
                    '.cookie-consent-accept',
                    '#cookie-accept-button',
                    'button[id*="accept"]',
                    'button[class*="accept"]'
                ],
                'dropdown_selectors': [
                    '.object-kenmerken-header',
                    '.characteristics-header',
                    '.features-toggle',
                    '.details-toggle'
                ],
                'popup_close_selectors': [
                    '.modal-close',
                    '.popup-close',
                    '[aria-label="close"]',
                    'button[data-dismiss]'
                ],
                'wait_for_elements': [
                    '.object-header',
                    '.price-section',
                    '.kenmerken-lijst'
                ]
            },
            'idealista.com': {
                'name': 'Idealista',
                'cookie_selectors': [
                    '#didomi-notice-agree-button',
                    '.didomi-continue-without-agreeing',
                    'button[id*="accept"]',
                    '.cookies-accept'
                ],
                'dropdown_selectors': [
                    '.details-property_features-header',
                    '.feature-toggle',
                    '.characteristics-toggle'
                ],
                'popup_close_selectors': [
                    '.modal-close-button',
                    '.popup-close',
                    '[data-dismiss="modal"]'
                ],
                'wait_for_elements': [
                    '.main-info__title-price',
                    '.info-data-price',
                    '.details-property'
                ]
            },
            'fotocasa.es': {
                'name': 'Fotocasa',
                'cookie_selectors': [
                    '#tc-privacy-button',
                    '.privacy-accept',
                    'button[data-accept-cookies]'
                ],
                'dropdown_selectors': [
                    '.re-DetailFeatures-header',
                    '.features-toggle'
                ],
                'popup_close_selectors': [
                    '.modal-close',
                    '.popup-dismiss'
                ],
                'wait_for_elements': [
                    '.re-DetailPrice',
                    '.re-DetailHeader'
                ]
            },
            'habitaclia.com': {
                'name': 'Habitaclia',
                'cookie_selectors': [
                    '.accept-cookies',
                    '#cookie-accept'
                ],
                'dropdown_selectors': [
                    '.property-features-toggle',
                    '.details-toggle'
                ],
                'popup_close_selectors': [
                    '.modal-close',
                    '.popup-close'
                ],
                'wait_for_elements': [
                    '.property-price',
                    '.property-details'
                ]
            }
        }
        
        logger.info("🎯 ScrapingBee Enhanced Screenshot Scraper initialized")
    
    def _detect_site_config(self, url: str) -> Optional[Dict[str, Any]]:
        """Detect site configuration based on URL"""
        for domain, config in self.site_configs.items():
            if domain in url:
                return config
        return None
    
    async def scrape_property_with_screenshots(
        self, 
        url: str,
        capture_dropdowns: bool = True,
        handle_popups: bool = True,
        full_page: bool = True
    ) -> ScrapingBeeScreenshotResult:
        """
        Main scraping method with enhanced screenshot capabilities
        """
        start_time = time.time()
        result = ScrapingBeeScreenshotResult()
        result.dropdown_screenshots = {}
        result.popup_screenshots = {}
        result.property_images = []
        result.interactive_elements_found = []
        result.dropdown_menus_expanded = []
        result.popups_handled = []
        result.potential_issues = []
        result.improvement_suggestions = []
        result.data_extraction_confidence = {}
        
        site_config = self._detect_site_config(url)
        logger.info(f"🔍 Scraping {url} with site config: {site_config['name'] if site_config else 'Generic'}")
        
        try:
            # Step 1: Capture initial screenshot with popup handling
            screenshot_start = time.time()
            initial_screenshot = await self._capture_initial_screenshot(url, site_config, handle_popups)
            result.full_page_screenshot_base64 = initial_screenshot
            
            # Step 2: Handle cookie consent and capture after acceptance
            if handle_popups and site_config:
                post_cookie_screenshot = await self._handle_cookies_and_capture(url, site_config)
                if post_cookie_screenshot:
                    result.cookies_accepted = True
                    result.full_page_screenshot_base64 = post_cookie_screenshot
            
            # Step 3: Expand dropdowns and capture sections
            if capture_dropdowns and site_config:
                dropdown_screenshots = await self._expand_dropdowns_and_capture(url, site_config)
                result.dropdown_screenshots.update(dropdown_screenshots)
                result.dropdown_menus_expanded = list(dropdown_screenshots.keys())
            
            # Step 4: Capture final full page screenshot
            final_screenshot = await self._capture_final_full_page(url, site_config, full_page)
            if final_screenshot:
                result.full_page_screenshot_base64 = final_screenshot
            
            screenshot_end = time.time()
            result.screenshot_capture_time = screenshot_end - screenshot_start
            
            # Step 5: Extract data using OpenAI Vision
            vision_start = time.time()
            extracted_data = await self._extract_data_with_vision(
                result.full_page_screenshot_base64, 
                result.dropdown_screenshots,
                url,
                site_config
            )
            vision_end = time.time()
            result.ai_vision_processing_time = vision_end - vision_start
            
            # Step 6: Populate result with extracted data
            self._populate_result_with_vision_data(result, extracted_data)
            
            # Step 7: Calculate quality metrics
            result.screenshot_quality_score = self._calculate_screenshot_quality(result)
            result.visual_clarity_score = self._calculate_visual_clarity(result)
            result.data_extraction_confidence = self._calculate_extraction_confidence(result, extracted_data)
            
            result.total_processing_time = time.time() - start_time
            result.scrapingbee_credits_used = self._estimate_credits_used(capture_dropdowns, handle_popups, full_page)
            
            logger.info(f"✅ Scraping completed in {result.total_processing_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"❌ Error during scraping: {e}")
            result.potential_issues.append(f"Scraping error: {str(e)}")
            result.total_processing_time = time.time() - start_time
            return result
    
    async def _capture_initial_screenshot(
        self, 
        url: str, 
        site_config: Optional[Dict], 
        handle_popups: bool
    ) -> Optional[str]:
        """Capture initial screenshot with basic popup handling"""
        params = {
            'api_key': self.api_key,
            'url': url,
            'screenshot': 'true',
            'screenshot_full_page': 'true',
            'premium_proxy': 'true',
            'render_js': 'true',
            'wait': '3000',  # Wait 3 seconds for page load
            'block_ads': 'true',
            'block_resources': 'false'  # Keep resources for full context
        }
        
        # Add site-specific optimizations
        if site_config:
            params['country_code'] = 'es' if 'es' in url else 'nl' if 'nl' in url else 'en'
            if site_config.get('wait_for_elements'):
                # Wait for specific elements to load
                params['wait_for'] = site_config['wait_for_elements'][0]
        
        try:
            response = await self.session.get(self.base_url, params=params)
            response.raise_for_status()
            
            # ScrapingBee returns the screenshot as binary data
            screenshot_data = response.content
            screenshot_base64 = base64.b64encode(screenshot_data).decode('utf-8')
            
            logger.info(f"📸 Initial screenshot captured ({len(screenshot_data)} bytes)")
            return screenshot_base64
            
        except Exception as e:
            logger.error(f"❌ Failed to capture initial screenshot: {e}")
            return None
    
    async def _handle_cookies_and_capture(
        self, 
        url: str, 
        site_config: Dict
    ) -> Optional[str]:
        """Handle cookie consent and capture screenshot after acceptance"""
        if not site_config.get('cookie_selectors'):
            return None
        
        # Use ScrapingBee's advanced JavaScript execution to handle cookies
        js_code = self._generate_cookie_handling_js(site_config['cookie_selectors'])
        
        params = {
            'api_key': self.api_key,
            'url': url,
            'screenshot': 'true',
            'screenshot_full_page': 'true',
            'premium_proxy': 'true',
            'render_js': 'true',
            'js_snippet': js_code,
            'wait': '5000',  # Wait longer after JS execution
            'block_ads': 'true'
        }
        
        try:
            response = await self.session.get(self.base_url, params=params)
            response.raise_for_status()
            
            screenshot_data = response.content
            screenshot_base64 = base64.b64encode(screenshot_data).decode('utf-8')
            
            logger.info(f"🍪 Cookie handling completed, screenshot captured")
            return screenshot_base64
            
        except Exception as e:
            logger.error(f"❌ Failed to handle cookies: {e}")
            return None
    
    async def _expand_dropdowns_and_capture(
        self, 
        url: str, 
        site_config: Dict
    ) -> Dict[str, str]:
        """Expand dropdown menus and capture individual screenshots"""
        dropdown_screenshots = {}
        
        if not site_config.get('dropdown_selectors'):
            return dropdown_screenshots
        
        for i, dropdown_selector in enumerate(site_config['dropdown_selectors']):
            try:
                # Generate JavaScript to expand specific dropdown
                js_code = self._generate_dropdown_expansion_js(dropdown_selector)
                
                params = {
                    'api_key': self.api_key,
                    'url': url,
                    'screenshot': 'true',
                    'screenshot_selector': dropdown_selector,  # Focus on dropdown area
                    'premium_proxy': 'true',
                    'render_js': 'true',
                    'js_snippet': js_code,
                    'wait': '3000',
                    'block_ads': 'true'
                }
                
                response = await self.session.get(self.base_url, params=params)
                response.raise_for_status()
                
                screenshot_data = response.content
                screenshot_base64 = base64.b64encode(screenshot_data).decode('utf-8')
                
                dropdown_name = f"dropdown_{i+1}_{dropdown_selector.split('.')[-1]}"
                dropdown_screenshots[dropdown_name] = screenshot_base64
                
                logger.info(f"📋 Dropdown screenshot captured: {dropdown_name}")
                
            except Exception as e:
                logger.warning(f"⚠️ Failed to capture dropdown {dropdown_selector}: {e}")
                continue
        
        return dropdown_screenshots
    
    async def _capture_final_full_page(
        self, 
        url: str, 
        site_config: Optional[Dict], 
        full_page: bool
    ) -> Optional[str]:
        """Capture final comprehensive screenshot with all interactions completed"""
        # Generate comprehensive JavaScript for final state
        js_code = self._generate_comprehensive_interaction_js(site_config)
        
        params = {
            'api_key': self.api_key,
            'url': url,
            'screenshot': 'true',
            'screenshot_full_page': str(full_page).lower(),
            'premium_proxy': 'true',
            'render_js': 'true',
            'js_snippet': js_code,
            'wait': '5000',  # Longer wait for final screenshot
            'block_ads': 'true',
            'window_width': '1920',
            'window_height': '1080'
        }
        
        try:
            response = await self.session.get(self.base_url, params=params)
            response.raise_for_status()
            
            screenshot_data = response.content
            screenshot_base64 = base64.b64encode(screenshot_data).decode('utf-8')
            
            logger.info(f"🎯 Final comprehensive screenshot captured ({len(screenshot_data)} bytes)")
            return screenshot_base64
            
        except Exception as e:
            logger.error(f"❌ Failed to capture final screenshot: {e}")
            return None
    
    def _generate_cookie_handling_js(self, cookie_selectors: List[str]) -> str:
        """Generate JavaScript code to handle cookie consent popups"""
        js_lines = [
            "// Cookie consent handling",
            "const cookieSelectors = " + json.dumps(cookie_selectors) + ";",
            """
            function handleCookies() {
                for (const selector of cookieSelectors) {
                    const elements = document.querySelectorAll(selector);
                    for (const element of elements) {
                        if (element && element.offsetParent !== null) {
                            console.log('Clicking cookie consent:', selector);
                            element.click();
                            return true;
                        }
                    }
                }
                return false;
            }
            
            // Try to handle cookies
            const cookieHandled = handleCookies();
            if (cookieHandled) {
                console.log('Cookie consent handled');
                // Wait a bit for the popup to disappear
                setTimeout(() => {
                    console.log('Cookie handling completed');
                }, 2000);
            }
            """
        ]
        return '\n'.join(js_lines)
    
    def _generate_dropdown_expansion_js(self, dropdown_selector: str) -> str:
        """Generate JavaScript to expand a specific dropdown menu"""
        return f"""
        // Expand dropdown: {dropdown_selector}
        const dropdown = document.querySelector('{dropdown_selector}');
        if (dropdown) {{
            console.log('Found dropdown:', '{dropdown_selector}');
            
            // Try different expansion methods
            if (dropdown.click) {{
                dropdown.click();
                console.log('Clicked dropdown');
            }}
            
            // Look for child clickable elements
            const clickables = dropdown.querySelectorAll('button, .toggle, .expand, [role="button"]');
            for (const clickable of clickables) {{
                if (clickable.offsetParent !== null) {{
                    clickable.click();
                    console.log('Clicked dropdown child element');
                    break;
                }}
            }}
            
            // Wait for animation
            setTimeout(() => {{
                console.log('Dropdown expansion completed');
            }}, 1500);
        }} else {{
            console.log('Dropdown not found:', '{dropdown_selector}');
        }}
        """
    
    def _generate_comprehensive_interaction_js(self, site_config: Optional[Dict]) -> str:
        """Generate comprehensive JavaScript for final interactions"""
        if not site_config:
            return "console.log('No site-specific interactions');"
        
        cookie_selectors = site_config.get('cookie_selectors', [])
        dropdown_selectors = site_config.get('dropdown_selectors', [])
        popup_close_selectors = site_config.get('popup_close_selectors', [])
        
        js_template = f"""
        console.log('Starting comprehensive interactions');
        
        // Handle cookies first
        const cookieSelectors = {json.dumps(cookie_selectors)};
        for (const selector of cookieSelectors) {{
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {{
                if (element && element.offsetParent !== null) {{
                    element.click();
                    console.log('Handled cookie consent');
                    break;
                }}
            }}
        }}
        
        // Close any remaining popups
        const popupSelectors = {json.dumps(popup_close_selectors)};
        for (const selector of popupSelectors) {{
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {{
                if (element && element.offsetParent !== null) {{
                    element.click();
                    console.log('Closed popup');
                }}
            }}
        }}
        
        // Expand all dropdowns
        const dropdownSelectors = {json.dumps(dropdown_selectors)};
        for (const selector of dropdownSelectors) {{
            const dropdown = document.querySelector(selector);
            if (dropdown && dropdown.offsetParent !== null) {{
                dropdown.click();
                console.log('Expanded dropdown:', selector);
                
                // Also try child elements
                const children = dropdown.querySelectorAll('button, .toggle, [role="button"]');
                for (const child of children) {{
                    if (child.offsetParent !== null) {{
                        child.click();
                        break;
                    }}
                }}
            }}
        }}
        
        // Scroll to reveal more content
        window.scrollTo(0, document.body.scrollHeight / 2);
        setTimeout(() => {{
            window.scrollTo(0, document.body.scrollHeight);
            setTimeout(() => {{
                window.scrollTo(0, 0);
                console.log('Comprehensive interactions completed');
            }}, 1000);
        }}, 1000);
        """
        
        return js_template
    
    async def _extract_data_with_vision(
        self, 
        main_screenshot: str, 
        dropdown_screenshots: Dict[str, str],
        url: str,
        site_config: Optional[Dict]
    ) -> Dict[str, Any]:
        """Extract property data using OpenAI Vision API"""
        if not main_screenshot:
            return {}
        
        # Prepare images for Vision API
        image_messages = [
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/png;base64,{main_screenshot}",
                    "detail": "high"
                }
            }
        ]
        
        # Add dropdown screenshots if available
        for name, screenshot in dropdown_screenshots.items():
            image_messages.append({
                "type": "image_url", 
                "image_url": {
                    "url": f"data:image/png;base64,{screenshot}",
                    "detail": "high"
                }
            })
        
        # Create comprehensive extraction prompt
        extraction_prompt = self._create_vision_extraction_prompt(url, site_config, len(dropdown_screenshots))
        
        try:
            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": extraction_prompt},
                            *image_messages
                        ]
                    }
                ],
                max_tokens=2000,
                temperature=0.1
            )
            
            extracted_text = response.choices[0].message.content
            return self._parse_vision_response(extracted_text)
            
        except Exception as e:
            logger.error(f"❌ Vision API extraction failed: {e}")
            return {}
    
    def _create_vision_extraction_prompt(
        self, 
        url: str, 
        site_config: Optional[Dict], 
        dropdown_count: int
    ) -> str:
        """Create comprehensive prompt for Vision API extraction"""
        site_name = site_config['name'] if site_config else 'Unknown'
        
        prompt = f"""
        You are analyzing {dropdown_count + 1} screenshots from a {site_name} real estate property listing.
        URL: {url}
        
        The first image is the main full-page screenshot. Additional images show expanded dropdown sections with detailed information.
        
        Extract ALL visible property information with high accuracy. Pay special attention to:
        
        **CORE PROPERTY DATA:**
        - Address (full address including postal code)
        - Price (exact amount with currency)
        - Size/Area (in square meters)
        - Number of bedrooms
        - Number of bathrooms
        - Year built/construction year
        - Property type (apartment, house, villa, etc.)
        - Building type (new construction, resale, etc.)
        - Energy label/rating
        
        **FINANCIAL DETAILS:**
        - Price per square meter
        - Monthly costs/expenses
        - Community fees
        - Property taxes
        - Any additional costs mentioned
        
        **DETAILED FEATURES & AMENITIES:**
        - All features listed (parking, elevator, balcony, garden, etc.)
        - Interior features (air conditioning, heating, flooring, etc.)
        - Building amenities (pool, gym, concierge, etc.)
        - Outdoor spaces (terrace, garden, patio dimensions)
        
        **LOCATION & CONTEXT:**
        - Neighborhood name
        - Nearby landmarks or transportation
        - Property description (extract key selling points)
        - Floor level (if apartment)
        - Orientation (if mentioned)
        
        **VISUAL ELEMENTS:**
        - Number of property images visible
        - Virtual tour availability
        - Floor plan availability
        - Interactive map presence
        
        **ENHANCED DETAILS FROM DROPDOWNS:**
        - Technical specifications
        - Detailed room descriptions
        - Building specifications
        - Legal/administrative details
        - Historical information
        
        Return the information in JSON format with this structure:
        {{
            "address": "...",
            "price": "...",
            "bedrooms": number,
            "bathrooms": number,
            "size": number,
            "year_built": number,
            "property_type": "...",
            "building_type": "...",
            "energy_label": "...",
            "description": "...",
            "features": ["...", "..."],
            "price_per_sqm": number,
            "monthly_costs": number,
            "community_fees": number,
            "property_taxes": number,
            "floor_plan_details": "...",
            "location_highlights": ["...", "..."],
            "property_images": ["url1", "url2"],
            "virtual_tour_available": boolean,
            "floor_plan_available": boolean,
            "neighborhood_map_available": boolean,
            "interactive_elements_found": ["...", "..."],
            "extraction_confidence": {{
                "address": 0.95,
                "price": 0.98,
                "bedrooms": 0.90
            }},
            "extraction_reasoning": "Detailed explanation of what was found and extraction confidence..."
        }}
        
        Be extremely thorough and accurate. If information is unclear, note it in the reasoning.
        """
        
        return prompt
    
    def _parse_vision_response(self, response_text: str) -> Dict[str, Any]:
        """Parse and validate the Vision API response"""
        try:
            # Try to extract JSON from the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx != -1 and end_idx != -1:
                json_str = response_text[start_idx:end_idx]
                return json.loads(json_str)
            else:
                logger.warning("No valid JSON found in Vision API response")
                return {}
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Vision API JSON response: {e}")
            return {}
    
    def _populate_result_with_vision_data(
        self, 
        result: ScrapingBeeScreenshotResult, 
        extracted_data: Dict[str, Any]
    ):
        """Populate result object with extracted vision data"""
        if not extracted_data:
            return
        
        # Core property data
        result.address = extracted_data.get('address')
        result.price = extracted_data.get('price')
        result.bedrooms = extracted_data.get('bedrooms')
        result.bathrooms = extracted_data.get('bathrooms')
        result.size = extracted_data.get('size')
        result.year_built = extracted_data.get('year_built')
        result.property_type = extracted_data.get('property_type')
        result.building_type = extracted_data.get('building_type')
        result.energy_label = extracted_data.get('energy_label')
        
        # Enhanced data
        result.description = extracted_data.get('description')
        result.features = extracted_data.get('features', [])
        result.floor_plan_details = extracted_data.get('floor_plan_details')
        result.location_highlights = extracted_data.get('location_highlights', [])
        
        # Financial data
        result.price_per_sqm = extracted_data.get('price_per_sqm')
        result.monthly_costs = extracted_data.get('monthly_costs')
        result.community_fees = extracted_data.get('community_fees')
        result.property_taxes = extracted_data.get('property_taxes')
        
        # Visual elements
        result.property_images = extracted_data.get('property_images', [])
        result.virtual_tour_available = extracted_data.get('virtual_tour_available', False)
        result.floor_plan_available = extracted_data.get('floor_plan_available', False)
        result.neighborhood_map_available = extracted_data.get('neighborhood_map_available', False)
        
        # Advanced features
        result.interactive_elements_found = extracted_data.get('interactive_elements_found', [])
        result.extraction_reasoning = extracted_data.get('extraction_reasoning', '')
        
        # Confidence scores
        if 'extraction_confidence' in extracted_data:
            result.data_extraction_confidence = extracted_data['extraction_confidence']
    
    def _calculate_screenshot_quality(self, result: ScrapingBeeScreenshotResult) -> float:
        """Calculate screenshot quality score based on captured data"""
        score = 0.0
        
        # Base score for having main screenshot
        if result.full_page_screenshot_base64:
            score += 40.0
        
        # Bonus for dropdown screenshots
        if result.dropdown_screenshots:
            score += min(len(result.dropdown_screenshots) * 10, 30)
        
        # Bonus for successful popup handling
        if result.cookies_accepted:
            score += 15.0
        
        # Bonus for expanded dropdowns
        if result.dropdown_menus_expanded:
            score += min(len(result.dropdown_menus_expanded) * 5, 15)
        
        return min(score, 100.0)
    
    def _calculate_visual_clarity(self, result: ScrapingBeeScreenshotResult) -> float:
        """Estimate visual clarity based on successful extractions"""
        score = 50.0  # Base score
        
        # Increase score based on successful extractions
        if result.address:
            score += 10
        if result.price:
            score += 15
        if result.features:
            score += 10
        if result.description:
            score += 10
        if result.property_images:
            score += 5
        
        return min(score, 100.0)
    
    def _calculate_extraction_confidence(
        self, 
        result: ScrapingBeeScreenshotResult,
        extracted_data: Dict[str, Any]
    ) -> Dict[str, float]:
        """Calculate confidence scores for extracted data"""
        confidence_scores = {}
        
        # Use provided confidence scores if available
        if 'extraction_confidence' in extracted_data:
            confidence_scores.update(extracted_data['extraction_confidence'])
        else:
            # Calculate basic confidence based on data presence
            fields = ['address', 'price', 'bedrooms', 'bathrooms', 'size', 'year_built']
            for field in fields:
                if getattr(result, field, None):
                    confidence_scores[field] = 0.8  # Default confidence
                else:
                    confidence_scores[field] = 0.0
        
        return confidence_scores
    
    def _estimate_credits_used(
        self, 
        capture_dropdowns: bool, 
        handle_popups: bool, 
        full_page: bool
    ) -> int:
        """Estimate ScrapingBee credits used"""
        credits = 1  # Base screenshot
        
        if handle_popups:
            credits += 1  # Additional request for popup handling
        
        if capture_dropdowns:
            credits += 3  # Estimate 3 dropdown expansions
        
        if full_page:
            credits += 1  # Final full page capture
        
        return credits
    
    async def close(self):
        """Close the HTTP session"""
        if self.session:
            await self.session.aclose()

# Test function
async def test_scrapingbee_enhanced_scraper():
    """Test the enhanced ScrapingBee scraper"""
    scraper = ScrapingBeeEnhancedScraper()
    
    test_urls = [
        "https://www.funda.nl/koop/amsterdam/appartement-43038135-keizersgracht-123/",
        "https://www.idealista.com/inmueble/98765432/",
        "https://www.fotocasa.es/es/comprar/vivienda/madrid/madrid/Centro/123456789/d"
    ]
    
    for url in test_urls:
        try:
            logger.info(f"🧪 Testing ScrapingBee Enhanced Scraper with: {url}")
            result = await scraper.scrape_property_with_screenshots(
                url=url,
                capture_dropdowns=True,
                handle_popups=True,
                full_page=True
            )
            
            logger.info(f"✅ Test completed for {url}")
            logger.info(f"   Address: {result.address}")
            logger.info(f"   Price: {result.price}")
            logger.info(f"   Dropdowns captured: {len(result.dropdown_screenshots)}")
            logger.info(f"   Processing time: {result.total_processing_time:.2f}s")
            logger.info(f"   Credits used: {result.scrapingbee_credits_used}")
            
        except Exception as e:
            logger.error(f"❌ Test failed for {url}: {e}")
    
    await scraper.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_scrapingbee_enhanced_scraper()) 