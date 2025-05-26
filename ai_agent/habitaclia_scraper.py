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
            
            # Wait for main content
            await self.page.wait_for_selector("h1", timeout=30000)
            
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
            
            # Try to extract JSON-LD structured data first
            json_ld_scripts = soup.find_all('script', type='application/ld+json')
            property_json = None
            
            for script in json_ld_scripts:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and data.get('@type') in ['Residence', 'Apartment', 'House', 'SingleFamilyResidence']:
                        property_json = data
                        break
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and item.get('@type') in ['Residence', 'Apartment', 'House', 'SingleFamilyResidence']:
                                property_json = item
                                break
                except:
                    continue
            
            # Extract from JSON-LD if available
            if property_json:
                # Address
                address = property_json.get('address', {})
                if isinstance(address, dict):
                    street = address.get('streetAddress', '')
                    locality = address.get('addressLocality', '')
                    postal = address.get('postalCode', '')
                    property_data["Address"] = f"{street}, {postal} {locality}".strip(', ')
                    
                # Price
                offers = property_json.get('offers', {})
                if isinstance(offers, dict):
                    price = offers.get('price')
                    if price:
                        property_data["Price"] = f"{price} €"
                        
                # Property type
                property_data["Property Type"] = property_json.get('@type', 'Not found')
                
            # Extract from HTML (fallback or complement)
            
            # Title/Address
            title_elem = soup.find('h1')
            if title_elem and "Address" not in property_data:
                property_data["Title"] = title_elem.text.strip()
                property_data["Address"] = title_elem.text.strip()
            
            # Location breadcrumb
            breadcrumb = soup.select('nav.breadcrumb li')
            if breadcrumb and len(breadcrumb) > 2:
                location_parts = [li.text.strip() for li in breadcrumb[2:] if li.text.strip()]
                if location_parts and property_data.get("Address") == "Not found":
                    property_data["Address"] = ", ".join(location_parts)
                    
            # Price
            if "Price" not in property_data or property_data.get("Price") == "Not found":
                price_elem = soup.select_one('span.h1') or soup.select_one('div.price span')
                if price_elem:
                    price_text = price_elem.text.strip()
                    # Clean price
                    price_text = re.sub(r'[^\d,.]', '', price_text)
                    if price_text:
                        property_data["Price"] = f"{price_text} €"
                        
            # Features section
            features_section = soup.select('div.features li') or soup.select('ul.feature-list li')
            
            for feature in features_section:
                text = feature.text.strip().lower()
                
                # Surface area
                if ("m²" in text or "m2" in text) and "superficie" in text:
                    match = re.search(r'(\d+(?:\.\d+)?)\s*m[²2]', text)
                    if match:
                        property_data["Living Area"] = self.standardize_area(f"{match.group(1)} m²")
                        
                # Bedrooms
                elif "habitaci" in text or "dormitori" in text:
                    match = re.search(r'(\d+)', text)
                    if match:
                        property_data["Bedrooms"] = match.group(1)
                        
                # Bathrooms
                elif "baño" in text or "aseo" in text or "lavabo" in text:
                    match = re.search(r'(\d+)', text)
                    if match:
                        property_data["Bathrooms"] = match.group(1)
                        
                # Year built
                elif "año" in text and "construc" in text:
                    match = re.search(r'(\d{4})', text)
                    if match:
                        property_data["Year Built"] = match.group(1)
                        
                # Plot size
                elif "parcela" in text or "solar" in text:
                    match = re.search(r'(\d+(?:\.\d+)?)\s*m[²2]', text)
                    if match:
                        property_data["Plot Size"] = self.standardize_area(f"{match.group(1)} m²")
                        
            # Property characteristics grid
            char_grid = soup.select('div.characteristics-grid div.item') or soup.select('dl.details dt, dl.details dd')
            
            i = 0
            while i < len(char_grid):
                if hasattr(char_grid[i], 'name') and char_grid[i].name == 'dt':
                    label = char_grid[i].text.strip().lower()
                    value = char_grid[i + 1].text.strip() if i + 1 < len(char_grid) else ""
                    
                    if "superficie" in label and "Living Area" not in property_data:
                        property_data["Living Area"] = self.standardize_area(value)
                    elif "habitaci" in label and "Bedrooms" not in property_data:
                        match = re.search(r'(\d+)', value)
                        if match:
                            property_data["Bedrooms"] = match.group(1)
                    elif "baño" in label and "Bathrooms" not in property_data:
                        match = re.search(r'(\d+)', value)
                        if match:
                            property_data["Bathrooms"] = match.group(1)
                    elif "año" in label and "Year Built" not in property_data:
                        match = re.search(r'(\d{4})', value)
                        if match:
                            property_data["Year Built"] = match.group(1)
                            
                    i += 2
                else:
                    i += 1
                    
            # Property type
            if "Property Type" not in property_data:
                type_elem = soup.select_one('span.property-type') or soup.select_one('div.type')
                if type_elem:
                    property_data["Property Type"] = type_elem.text.strip()
                else:
                    # Infer from URL or title
                    if "piso" in url.lower() or "apartamento" in property_data.get("Title", "").lower():
                        property_data["Property Type"] = "Piso"
                    elif "casa" in url.lower() or "chalet" in property_data.get("Title", "").lower():
                        property_data["Property Type"] = "Casa"
                    else:
                        property_data["Property Type"] = "Not found"
                        
            # Description
            desc_elem = soup.select_one('div.description p') or soup.select_one('section.description')
            if desc_elem:
                property_data["Description"] = desc_elem.text.strip()[:500] + "..."
                
            # Energy label
            energy_elem = soup.select_one('div.energy-rating span.rating') or soup.select_one('span.energy-label')
            if energy_elem:
                match = re.search(r'[A-G](?:\+|-)?', energy_elem.text.upper())
                if match:
                    property_data["Energy Label"] = match.group(0)
                    
            # Listing date
            date_elem = soup.select_one('span.publication-date') or soup.select_one('time')
            if date_elem:
                property_data["Listing Date"] = date_elem.text.strip()
                
            # Set defaults for missing required fields
            for field in ["Address", "Price", "Living Area", "Bedrooms", "Bathrooms", "Year Built"]:
                if field not in property_data or not property_data.get(field):
                    property_data[field] = "Not found"
                    
            self.request_count += 1
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