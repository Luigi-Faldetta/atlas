# fotocasa_scraper.py
"""
Fotocasa scraper implementation using Playwright for dynamic content.
Handles Spanish real estate listings from fotocasa.es
"""

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import stealth_async
import asyncio
import random
import re
from typing import Dict, Any, Optional
from bs4 import BeautifulSoup
import logging

from base_scraper import BaseScraper


class FotocasaScraper(BaseScraper):
    """Scraper for Fotocasa Spanish real estate website"""
    
    def __init__(self, proxy=None, logger=None):
        """Initialize Fotocasa scraper with Playwright setup"""
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
                "--disable-dev-shm-usage"
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
        
        # Create context with Spanish locale and timezone
        context_options = {
            "locale": "es-ES",
            "timezone_id": "Europe/Madrid",
            "ignore_https_errors": True,
            "viewport": {"width": 1920, "height": 1080},
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        
        self.context = await self.browser.new_context(**context_options)
        self.page = await self.context.new_page()
        
        # Apply stealth mode to avoid detection
        await stealth_async(self.page)
        
        # Set extra headers
        await self.page.set_extra_http_headers({
            "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        })
        
    async def scrape_property(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape property data from a Fotocasa URL.
        
        Args:
            url: Fotocasa property URL
            
        Returns:
            Dictionary with property data or None if scraping failed
        """
        try:
            # Navigate to the property page
            await self.page.goto(url, wait_until="networkidle", timeout=60000)
            
            # Wait for main content to load
            await self.page.wait_for_selector("h1.re-DetailHeader-propertyTitle", timeout=30000)
            
            # Mimic human behavior
            await asyncio.sleep(random.uniform(2, 4))
            await self.page.mouse.wheel(0, random.randint(100, 300))
            await asyncio.sleep(random.uniform(1, 2))
            
            # Get page content
            content = await self.page.content()
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract property data
            property_data = {
                "URL": url,
                "Site": self.get_site_name()
            }
            
            # Extract title/address
            title_elem = soup.select_one("h1.re-DetailHeader-propertyTitle")
            if title_elem:
                property_data["Title"] = title_elem.text.strip()
                # Try to extract address from title (usually contains street info)
                property_data["Address"] = title_elem.text.strip()
            else:
                property_data["Address"] = "Not found"
                
            # Extract location details
            location_elem = soup.select_one("span.re-DetailHeader-propertyAddressText")
            if location_elem:
                location = location_elem.text.strip()
                if property_data["Address"] != "Not found":
                    property_data["Address"] = f"{property_data['Address']}, {location}"
                else:
                    property_data["Address"] = location
                    
            # Extract price
            price_elem = soup.select_one("span.re-DetailHeader-price")
            if price_elem:
                price_text = price_elem.text.strip()
                # Clean price format (remove dots for thousands, keep currency)
                price_text = re.sub(r'\.', '', price_text)
                property_data["Price"] = self.standardize_price(price_text)
            else:
                property_data["Price"] = "Not found"
                
            # Extract features (surface area, bedrooms, bathrooms)
            features = soup.select("div.re-DetailHeader-features span")
            
            for feature in features:
                text = feature.text.strip()
                
                # Surface area
                if "m²" in text or "m2" in text:
                    property_data["Living Area"] = self.standardize_area(text)
                    
                # Bedrooms (habitaciones or hab.)
                elif "hab" in text.lower():
                    match = re.search(r'(\d+)', text)
                    if match:
                        property_data["Bedrooms"] = match.group(1)
                        
                # Bathrooms (baños)
                elif "baño" in text.lower():
                    match = re.search(r'(\d+)', text)
                    if match:
                        property_data["Bathrooms"] = match.group(1)
                        
            # Extract property type
            property_type_elem = soup.select_one("span.re-DetailHeader-propertyType")
            if property_type_elem:
                property_data["Property Type"] = property_type_elem.text.strip()
            else:
                # Try to infer from title or URL
                if "piso" in url.lower() or "apartamento" in url.lower():
                    property_data["Property Type"] = "Piso"
                elif "casa" in url.lower() or "chalet" in url.lower():
                    property_data["Property Type"] = "Casa"
                else:
                    property_data["Property Type"] = "Not found"
                    
            # Extract additional details from characteristics section
            characteristics = soup.select("div.re-DetailCharacteristics li")
            
            for char in characteristics:
                text = char.text.strip().lower()
                
                # Year built (año de construcción)
                if "año de construcción" in text or "construido en" in text:
                    match = re.search(r'(\d{4})', text)
                    if match:
                        property_data["Year Built"] = match.group(1)
                        
                # Plot size (parcela)
                elif "parcela" in text:
                    match = re.search(r'(\d+\.?\d*)\s*m[²2]', text)
                    if match:
                        property_data["Plot Size"] = self.standardize_area(f"{match.group(1)} m²")
                        
                # Energy label (certificado energético)
                elif "certificado energético" in text or "calificación energética" in text:
                    match = re.search(r'[A-G](?:\+|-)?', text.upper())
                    if match:
                        property_data["Energy Label"] = match.group(0)
                        
            # Extract description
            desc_elem = soup.select_one("div.re-DetailDescription p")
            if desc_elem:
                property_data["Description"] = desc_elem.text.strip()[:500] + "..."  # Limit length
                
            # Extract listing date if available
            date_elem = soup.select_one("span.re-DetailUpdateDate")
            if date_elem:
                property_data["Listing Date"] = date_elem.text.strip()
                
            # Set defaults for missing required fields
            for field in ["Living Area", "Bedrooms", "Bathrooms", "Year Built"]:
                if field not in property_data:
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
        return "Fotocasa"


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
        
        # Example Fotocasa URLs
        test_urls = [
            "https://www.fotocasa.es/es/comprar/vivienda/madrid-capital/aire-acondicionado-calefaccion-terraza-trastero-ascensor-piscina-jardin/162447099/d",
            "https://www.fotocasa.es/es/comprar/vivienda/barcelona-barcelona/calefaccion-terraza-ascensor/161234567/d",
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
        scraper = FotocasaScraper(proxy=proxy)
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