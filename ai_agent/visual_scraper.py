"""
Visual Property Scraper with Screenshot Analysis
Captures full webpage screenshots and uses AI vision models to extract comprehensive data
"""

import asyncio
import base64
import io
import json
import os
from typing import Dict, List, Optional, Any
from PIL import Image
from playwright.async_api import async_playwright
from dotenv import load_dotenv
import openai
from dataclasses import dataclass

load_dotenv()

@dataclass
class VisualScrapingResult:
    """Enhanced result structure matching InvestmentAnalysis.tsx props"""
    # Basic property info
    address: Optional[str] = None
    price: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    size: Optional[int] = None
    year_built: Optional[int] = None
    property_type: Optional[str] = None
    
    # Enhanced visual extracted data
    description: Optional[str] = None
    features: List[str] = None
    images: List[str] = None
    
    # Financial indicators (if visible on page)
    price_per_sqm: Optional[float] = None
    monthly_costs: Optional[float] = None
    energy_label: Optional[str] = None
    
    # Visual context data
    neighborhood_description: Optional[str] = None
    nearby_amenities: Dict[str, Any] = None
    listing_agent_info: Dict[str, str] = None
    
    # Screenshots for verification
    full_page_screenshot: Optional[str] = None
    key_sections_screenshots: Dict[str, str] = None
    
    # Quality indicators
    data_completeness_score: float = 0.0
    visual_quality_score: float = 0.0
    extraction_confidence: Dict[str, float] = None

class VisualPropertyScraper:
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_client = openai.OpenAI(
            api_key=openai_api_key or os.getenv('OPENAI_API_KEY')
        )
        self.browser = None
        self.context = None
        self.page = None
        
    async def start(self, headless: bool = True):
        """Initialize browser with enhanced visual capabilities"""
        self.playwright = await async_playwright().start()
        
        # Launch with high resolution for better visual extraction
        self.browser = await self.playwright.chromium.launch(
            headless=headless,
            args=[
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--window-size=1920,1080'
            ]
        )
        
        # High-resolution context for detailed screenshots
        self.context = await self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            device_scale_factor=2,  # High DPI for crisp screenshots
            ignore_https_errors=True,
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        
        self.page = await self.context.new_page()
        
    async def capture_enhanced_screenshots(self, url: str) -> Dict[str, str]:
        """Capture multiple screenshots including expanded sections"""
        await self.page.goto(url, wait_until='networkidle', timeout=60000)
        
        # Wait for dynamic content
        await asyncio.sleep(3)
        
        # Check for verification/CAPTCHA pages
        verification_indicators = [
            "verification", "captcha", "recaptcha", "verify", "blocked", 
            "Je bent bijna op de pagina", "almost there", "security check"
        ]
        
        page_content = await self.page.content()
        is_verification_page = any(indicator in page_content.lower() for indicator in verification_indicators)
        
        if is_verification_page:
            print("⚠️ Verification page detected - attempting bypass...")
            # Wait longer for manual verification or try refresh
            await asyncio.sleep(5)
            await self.page.reload(wait_until='networkidle')
            await asyncio.sleep(3)
        
        screenshots = {}
        
        # 1. Full page screenshot
        screenshots['full_page'] = await self.page.screenshot(
            full_page=True,
            type='png'
        )
        
        # 2. Expand minimized sections (common patterns)
        expandable_selectors = [
            '[data-testid="expand"]', '[aria-expanded="false"]',
            '.expand-button', '.show-more', '.read-more',
            '.collapse', '.accordion-trigger'
        ]
        
        for selector in expandable_selectors:
            try:
                elements = await self.page.query_selector_all(selector)
                for element in elements:
                    await element.click()
                    await asyncio.sleep(0.5)
            except:
                continue
        
        # Wait for expansions to complete
        await asyncio.sleep(2)
        
        # 3. Expanded sections screenshot
        screenshots['expanded_content'] = await self.page.screenshot(
            full_page=True,
            type='png'
        )
        
        # 4. Scroll through page to trigger lazy loading
        await self.scroll_and_capture(screenshots)
        
        # 5. Key sections screenshots
        await self.capture_key_sections(screenshots)
        
        return {k: base64.b64encode(v).decode() if isinstance(v, bytes) else v 
                for k, v in screenshots.items()}
        
    async def scroll_and_capture(self, screenshots: Dict[str, bytes]):
        """Scroll through page to trigger lazy loading and capture content"""
        # Get page height
        page_height = await self.page.evaluate('document.body.scrollHeight')
        
        # Scroll in chunks to trigger lazy loading
        for i in range(0, page_height, 500):
            await self.page.evaluate(f'window.scrollTo(0, {i})')
            await asyncio.sleep(0.3)
        
        # Final screenshot after scrolling
        screenshots['post_scroll'] = await self.page.screenshot(
            full_page=True,
            type='png'
        )
        
    async def capture_key_sections(self, screenshots: Dict[str, bytes]):
        """Capture specific sections of interest"""
        key_sections = {
            'price_section': [
                '[data-testid="price"]', '.price', '.listing-price',
                '[class*="price"]', '.cost', '.value'
            ],
            'features_section': [
                '[data-testid="features"]', '.features', '.amenities',
                '.specifications', '.details', '.property-features'
            ],
            'description_section': [
                '[data-testid="description"]', '.description', '.about',
                '.property-description', '.listing-description'
            ],
            'location_section': [
                '[data-testid="location"]', '.location', '.address',
                '.neighborhood', '.area-info'
            ]
        }
        
        for section_name, selectors in key_sections.items():
            for selector in selectors:
                try:
                    element = await self.page.query_selector(selector)
                    if element:
                        screenshot = await element.screenshot(type='png')
                        screenshots[section_name] = screenshot
                        break
                except:
                    continue
                    
    async def extract_with_ai_vision(self, screenshots: Dict[str, str], url: str) -> VisualScrapingResult:
        """Use GPT-4 Vision to extract comprehensive data from screenshots"""
        
        # Primary extraction prompt
        extraction_prompt = f"""
        You are a real estate data extraction expert. Analyze these screenshots from {url} and extract ALL visible property information.
        
        Please extract:
        
        1. BASIC PROPERTY DATA:
        - Full address (exactly as shown)
        - Price (include currency and any fees/conditions)
        - Bedrooms, bathrooms, total size (m²)
        - Year built, property type
        
        2. DETAILED PROPERTY FEATURES:
        - ALL listed features/amenities (elevator, parking, balcony, etc.)
        - Energy label if visible
        - Floor number, building type
        - Garden/outdoor space details
        
        3. FINANCIAL INFORMATION (if visible):
        - Price per m²
        - Monthly costs/HOA fees
        - Property taxes
        - Utilities information
        
        4. LOCATION & NEIGHBORHOOD:
        - Neighborhood name
        - Nearby amenities (schools, shops, transport)
        - Distance to city center
        - Any location highlights mentioned
        
        5. LISTING DETAILS:
        - Listing agent information
        - Days on market
        - Previous price changes
        - Viewing information
        
        6. VISUAL QUALITY ASSESSMENT:
        - Rate data completeness (0-100)
        - Note any sections that seem incomplete
        - Identify areas where visual extraction worked well
        
        Return as detailed JSON matching the structure needed for comprehensive real estate analysis.
        Focus on accuracy and extracting EVERY piece of visible information.
        """
        
        try:
            # Use the most comprehensive screenshot for main extraction
            main_screenshot = screenshots.get('expanded_content') or screenshots.get('full_page')
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4o",  # Latest vision model
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": extraction_prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/png;base64,{main_screenshot}",
                                    "detail": "high"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=4000,
                temperature=0.1
            )
            
            # Parse AI response
            try:
                extracted_data = json.loads(response.choices[0].message.content)
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                print(f"Response content: {response.choices[0].message.content[:500]}...")
                extracted_data = {}
            except Exception as e:
                print(f"Response parsing error: {e}")
                extracted_data = {}
            
            # Create structured result
            result = VisualScrapingResult()
            
            # Map extracted data to result structure
            result.address = extracted_data.get('address')
            result.price = extracted_data.get('price')
            result.bedrooms = extracted_data.get('bedrooms')
            result.bathrooms = extracted_data.get('bathrooms')
            result.size = extracted_data.get('size')
            result.year_built = extracted_data.get('year_built')
            result.property_type = extracted_data.get('property_type')
            result.description = extracted_data.get('description')
            result.features = extracted_data.get('features', [])
            result.energy_label = extracted_data.get('energy_label')
            result.price_per_sqm = extracted_data.get('price_per_sqm')
            result.monthly_costs = extracted_data.get('monthly_costs')
            result.neighborhood_description = extracted_data.get('neighborhood_description')
            result.nearby_amenities = extracted_data.get('nearby_amenities', {})
            result.listing_agent_info = extracted_data.get('listing_agent_info', {})
            
            # Store screenshots for verification
            result.full_page_screenshot = screenshots.get('full_page')
            result.key_sections_screenshots = {
                k: v for k, v in screenshots.items() 
                if k not in ['full_page', 'expanded_content', 'post_scroll']
            }
            
            # Quality scores
            result.data_completeness_score = extracted_data.get('data_completeness_score', 0)
            result.visual_quality_score = extracted_data.get('visual_quality_score', 0)
            result.extraction_confidence = extracted_data.get('extraction_confidence', {})
            
            return result
            
        except Exception as e:
            print(f"AI vision extraction error: {e}")
            return VisualScrapingResult()
    
    async def scrape_property_comprehensive(self, url: str) -> VisualScrapingResult:
        """Main method - comprehensive property scraping with visual analysis"""
        if not self.browser:
            await self.start()
            
        try:
            print(f"Starting comprehensive visual scraping for: {url}")
            
            # 1. Capture enhanced screenshots
            screenshots = await self.capture_enhanced_screenshots(url)
            print(f"Captured {len(screenshots)} screenshots")
            
            # 2. Extract data using AI vision
            result = await self.extract_with_ai_vision(screenshots, url)
            print(f"AI extraction completed with confidence: {result.data_completeness_score}%")
            
            # 3. Enhance with traditional scraping for missing data
            if result.data_completeness_score < 80:
                print("Enhancing with traditional scraping...")
                await self.enhance_with_traditional_scraping(result)
            
            return result
            
        except Exception as e:
            print(f"Error in comprehensive scraping: {e}")
            return VisualScrapingResult()
    
    async def enhance_with_traditional_scraping(self, result: VisualScrapingResult):
        """Enhance visual extraction with traditional CSS/XPath scraping"""
        try:
            # Traditional selectors for common missing data
            selectors = {
                'price': [
                    '[data-testid="price"]', '.price', '.listing-price',
                    '[class*="price"]', '.cost'
                ],
                'address': [
                    '[data-testid="address"]', '.address', 'h1',
                    '.property-address', '.listing-address'
                ],
                'bedrooms': [
                    '[data-testid="bedrooms"]', '[class*="bedroom"]',
                    '[class*="bed"]', '.rooms'
                ],
                'size': [
                    '[data-testid="size"]', '[class*="size"]',
                    '[class*="area"]', '[class*="m2"]'
                ]
            }
            
            for field, field_selectors in selectors.items():
                if not getattr(result, field):
                    for selector in field_selectors:
                        try:
                            element = await self.page.query_selector(selector)
                            if element:
                                text = await element.inner_text()
                                setattr(result, field, text.strip())
                                break
                        except:
                            continue
                            
        except Exception as e:
            print(f"Error in traditional enhancement: {e}")
    
    async def close(self):
        """Clean up browser resources"""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

# Example usage
async def main():
    scraper = VisualPropertyScraper()
    
    # Test with a property URL
    test_url = "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/"
    
    result = await scraper.scrape_property_comprehensive(test_url)
    
    print("Comprehensive scraping results:")
    print(f"Address: {result.address}")
    print(f"Price: {result.price}")
    print(f"Features: {result.features}")
    print(f"Data completeness: {result.data_completeness_score}%")
    
    await scraper.close()

if __name__ == "__main__":
    asyncio.run(main()) 