# habitaclia_scraper.py
"""
Habitaclia scraper implementation using Playwright for dynamic content.
Handles Spanish real estate listings from habitaclia.com
"""

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import stealth_async
import asyncio
import random
import re
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup
import logging
import json

from base_scraper import BaseScraper


class HabitacliaScraper(BaseScraper):
    """Scraper for Habitaclia Spanish real estate website"""
    
    def __init__(self, proxy=None, logger=None):
        """Initialize Habitaclia scraper with Playwright setup"""
        super().__init__(proxy, logger)
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None
        
    async def start(self) -> None:
        """Start Playwright and initialize browser"""
        await super().start()
        
        self.playwright = await async_playwright().start()
        
        # Browser launch options
        launch_options = {
            "headless": True,  # Set to False for debugging
            "args": [
                "--disable-blink-features=AutomationControlled",
                "--disable-features=IsolateOrigins,site-per-process",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-web-security",
                "--disable-gpu"
            ]
        }
        
        # Add proxy if configured
        if self.proxy:
            launch_options["proxy"] = {
                "server": self.proxy["server"],
                "username": self.proxy.get("username"),
                "password": self.proxy.get("password"),
            }
            self.logger.info(f"Using proxy: {self.proxy['server']}")
            
        self.browser = await self.playwright.chromium.launch(**launch_options)
        
        # Create context with Spanish locale
        context_options = {
            "locale": "es-ES",
            "timezone_id": "Europe/Madrid",
            "ignore_https_errors": True,
            "viewport": {"width": 1920, "height": 1080},
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        self.context = await self.browser.new_context(**context_options)
        
        # Add cookie consent to avoid popups
        await self.context.add_cookies([
            {
                "name": "euconsent-v2",
                "value": "1",
                "domain": ".habitaclia.com",
                "path": "/"
            }
        ])
        
        self.page = await self.context.new_page()
        
        # Apply stealth mode
        await stealth_async(self.page)
        
        # Set extra headers
        await self.page.set_extra_http_headers({
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
        })
        
    async def scrape_property(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape property data from a Habitaclia URL.
        
        Args:
            url: Habitaclia property URL
            
        Returns:
            Dictionary with property data or None if scraping failed
        """
        try:
            # Navigate to the property page
            await self.page.goto(url, wait_until="domcontentloaded", timeout=60000)
            
            # Wait for main content to load
            await self.page.wait_for_selector("main, body", timeout=30000)
            
            # Handle cookie banner if present
            try:
                cookie_button = await self.page.wait_for_selector("button#onetrust-accept-btn-handler", timeout=5000)
                if cookie_button:
                    await cookie_button.click()
                    await asyncio.sleep(1)
            except:
                pass  # Cookie banner might not appear
            
            # Mimic human behavior
            await asyncio.sleep(random.uniform(2, 4))
            await self.page.mouse.wheel(0, random.randint(100, 300))
            await asyncio.sleep(random.uniform(1, 2))
            
            # Get page content
            content = await self.page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Initialize property data
            property_data = {
                "URL": url,
                "Site": self.get_site_name()
            }
            
            # Extract price - targeting the specific structure from the HTML
            price_elem = (
                soup.select_one('span[itemprop="price"]') or
                soup.select_one('span.font-2[itemtype*="Offer"]') or
                soup.select_one('span.price') or
                soup.select_one('.price-down strong') or
                soup.select_one('strong:contains("€")')
            )
            
            if price_elem:
                price_text = price_elem.get_text(strip=True)
                # Clean and extract price
                price_match = re.search(r'([\d,.]+)\s*€', price_text)
                if price_match:
                    property_data["Price"] = price_match.group(0)
                else:
                    property_data["Price"] = price_text
            else:
                property_data["Price"] = "Not found"
            
            # Extract title/address from h1 or main heading
            title_selectors = [
                'h1',
                'h1.hidden',
                '.title',
                '[data-gtmtrace="title"]'
            ]
            
            for selector in title_selectors:
                title_elem = soup.select_one(selector)
                if title_elem:
                    title_text = title_elem.get_text(strip=True)
                    if title_text and title_text != "":
                        property_data["Title"] = title_text
                        property_data["Address"] = title_text  # Use title as address fallback
                        break
            
            # Extract location from breadcrumb or location elements
            location_selectors = [
                'nav.breadcrumb a',
                '.breadcrumb a',
                '[data-gtmtrace*="location"]',
                '.location'
            ]
            
            location_parts = []
            for selector in location_selectors:
                location_elems = soup.select(selector)
                if location_elems:
                    for elem in location_elems:
                        text = elem.get_text(strip=True)
                        if text and text not in location_parts and len(text) > 1:
                            location_parts.append(text)
            
            if location_parts and len(location_parts) > 1:
                # Skip first breadcrumb (usually "Home") and join the rest
                property_data["Address"] = ", ".join(location_parts[1:])
            
            # Extract property features from li elements
            feature_selectors = [
                'li.feature',
                'ul.feature-list li',
                '.features li',
                'ol.feature-container li'
            ]
            
            features = []
            for selector in feature_selectors:
                feature_elems = soup.select(selector)
                for feature in feature_elems:
                    feature_text = feature.get_text(strip=True)
                    if feature_text:
                        features.append(feature_text)
            
            # Process features to extract specific property details
            for feature_text in features:
                text_lower = feature_text.lower()
                
                # Living Area / Surface
                if ("m²" in feature_text or "m2" in feature_text) and not property_data.get("Living Area"):
                    match = re.search(r'(\d+(?:[.,]\d+)?)\s*m[²2]', feature_text)
                    if match:
                        area_value = match.group(1).replace(',', '.')
                        property_data["Living Area"] = self.standardize_area(f"{area_value} m²")
                
                # Bedrooms
                elif ("hab" in text_lower or "dormitori" in text_lower or "bedroom" in text_lower) and not property_data.get("Bedrooms"):
                    match = re.search(r'(\d+)', feature_text)
                    if match:
                        property_data["Bedrooms"] = match.group(1)
                
                # Bathrooms
                elif ("baño" in text_lower or "bathroom" in text_lower or "aseo" in text_lower) and not property_data.get("Bathrooms"):
                    match = re.search(r'(\d+)', feature_text)
                    if match:
                        property_data["Bathrooms"] = match.group(1)
            
            # Extract characteristics from data attributes and summary sections
            summary_selectors = [
                '.summary-left',
                '.summary',
                '.property-details',
                '.characteristics'
            ]
            
            for selector in summary_selectors:
                summary_section = soup.select_one(selector)
                if summary_section:
                    # Look for specific patterns in the summary
                    summary_text = summary_section.get_text()
                    
                    # Extract surface area if not found
                    if not property_data.get("Living Area"):
                        area_match = re.search(r'(\d+(?:[.,]\d+)?)\s*m[²2]', summary_text)
                        if area_match:
                            area_value = area_match.group(1).replace(',', '.')
                            property_data["Living Area"] = self.standardize_area(f"{area_value} m²")
                    
                    # Extract year if available
                    year_match = re.search(r'(19|20)\d{2}', summary_text)
                    if year_match and not property_data.get("Year Built"):
                        property_data["Year Built"] = year_match.group(0)
            
            # Extract property type from URL or context
            if "piso" in url.lower() or "apartamento" in url.lower():
                property_data["Property Type"] = "Piso"
            elif "casa" in url.lower() or "chalet" in url.lower():
                property_data["Property Type"] = "Casa"
            elif "duplex" in url.lower():
                property_data["Property Type"] = "Duplex"
            else:
                # Try to extract from page content
                type_indicators = soup.select_one('[data-propertytype], .property-type, .type')
                if type_indicators:
                    property_data["Property Type"] = type_indicators.get_text(strip=True)
                else:
                    property_data["Property Type"] = "Not found"
            
            # Extract description from description sections
            desc_selectors = [
                '.description p',
                '.property-description',
                '[data-description]',
                '.detail-description'
            ]
            
            for selector in desc_selectors:
                desc_elem = soup.select_one(selector)
                if desc_elem:
                    description = desc_elem.get_text(strip=True)
                    if description and len(description) > 50:  # Ensure it's substantial content
                        property_data["Description"] = description[:500] + ("..." if len(description) > 500 else "")
                        break
            
            # Extract energy rating if available
            energy_selectors = [
                'div.rating-box:nth-child(1) div.rating:nth-child(2)',  # Specific selector from user
                'div.rating-box div.rating',                            # More general rating box
                '.energy-rating',
                '[data-energy]',
                '.efficiency',
                'span:contains("Energía")'
            ]
            
            for selector in energy_selectors:
                energy_elem = soup.select_one(selector)
                if energy_elem:
                    # First try to extract from class name (e.g., "rating c-6" -> "C")
                    class_list = energy_elem.get('class', [])
                    for class_name in class_list:
                        if class_name.startswith('c-') or class_name.startswith('e-'):
                            # Extract energy rating from class name like "c-G" -> "G" or "c-6" -> "F"
                            energy_match = re.search(r'[c|e]-([A-G\d]+)', class_name.upper())
                            if energy_match:
                                rating_letter = energy_match.group(1)
                                # Convert number to letter if needed (e.g., "6" -> "F")
                                if rating_letter.isdigit():
                                    # Energy scale: A=1, B=2, C=3, D=4, E=5, F=6, G=7
                                    rating_map = {'1': 'A', '2': 'B', '3': 'C', '4': 'D', '5': 'E', '6': 'F', '7': 'G'}
                                    rating_letter = rating_map.get(rating_letter, rating_letter)
                                property_data["Energy Label"] = rating_letter
                                break
                    
                    # If not found in class, try to extract from text content
                    if "Energy Label" not in property_data or property_data["Energy Label"] == "Not found":
                        energy_text = energy_elem.get_text()
                        energy_match = re.search(r'[A-G](?:\+|-)?', energy_text.upper())
                        if energy_match:
                            property_data["Energy Label"] = energy_match.group(0)
                    
                    # Break if we found a valid energy label
                    if property_data.get("Energy Label") and property_data["Energy Label"] != "Not found":
                        break
            
            # Extract additional details from data attributes
            main_element = soup.select_one('main, [data-gtmtrace]')
            if main_element:
                # Look for data attributes that might contain useful info
                for attr_name, attr_value in main_element.attrs.items():
                    if 'price' in attr_name.lower() and not property_data.get("Price", "").replace("Not found", ""):
                        price_match = re.search(r'([\d,.]+)', str(attr_value))
                        if price_match:
                            property_data["Price"] = f"{price_match.group(1)} €"
            
            # Set defaults for missing fields
            required_fields = ["Address", "Price", "Living Area", "Bedrooms", "Bathrooms", "Year Built"]
            for field in required_fields:
                if field not in property_data or not property_data.get(field):
                    property_data[field] = "Not found"
            
            # Clean up the data
            if property_data.get("Address") == property_data.get("Title"):
                # Try to get more specific address
                if "," in property_data["Address"]:
                    property_data["Address"] = property_data["Address"]
                else:
                    property_data["Address"] = "Not found"
            
            self.request_count += 1
            self.logger.info(f"Successfully scraped property: {property_data.get('Title', 'Unknown')}")
            return property_data
            
        except PlaywrightTimeoutError as e:
            self.logger.error(f"Timeout error scraping {url}: {e}")
            return None
        except Exception as e:
            self.logger.error(f"Error scraping {url}: {e}", exc_info=True)
            return None
            
    async def close(self) -> None:
        """Close browser and Playwright resources"""
        if self.page:
            await self.page.close()
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
            
        await super().close()
        
    def get_site_name(self) -> str:
        """Return the site name"""
        return "Habitaclia"


# Test the scraper
if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    async def test_scraper():
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        # Example Habitaclia URLs
        test_urls = [
            "https://www.habitaclia.com/comprar-piso-en-barcelona.htm",
            "https://www.habitaclia.com/comprar-casa-en-madrid.htm",
        ]
        
        # Proxy configuration (optional)
        proxy = None
        if os.getenv("PROXY_SERVER"):
            proxy = {
                "server": os.getenv("PROXY_SERVER"),
                "username": os.getenv("PROXY_USERNAME"),
                "password": os.getenv("PROXY_PASSWORD")
            }
            
        # Initialize and run scraper
        scraper = HabitacliaScraper(proxy=proxy)
        await scraper.start()
        
        try:
            # Test single property
            if test_urls:
                print(f"\nTesting single property scrape: {test_urls[0]}")
                result = await scraper.scrape_property(test_urls[0])
                if result:
                    print("\nScraped data:")
                    for key, value in result.items():
                        print(f"{key}: {value}")
                else:
                    print("Failed to scrape property")
                    
            # Test multiple properties
            if len(test_urls) > 1:
                print(f"\n\nTesting batch scrape of {len(test_urls)} properties...")
                results = await scraper.scrape_multiple(test_urls, delay_range=(3, 6))
                print(f"\nSuccessfully scraped: {sum(1 for r in results if r.get('Scraped'))}/{len(results)}")
                
        finally:
            await scraper.close()
            
    # Run the test
    asyncio.run(test_scraper()) 