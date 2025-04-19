from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
import asyncio
import random
import re
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class IdealistaScraper:
    def __init__(self, proxy=None):
        """
        Initialize Playwright with optional proxy.
        :param proxy: Proxy configuration dictionary (optional).
        """
        self.proxy = proxy
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None

    async def start(self):
        """
        Start Playwright and initialize the browser, context, and page.
        """
        self.playwright = await async_playwright().start()
        launch_options = {"headless": False} # Consider headless=True for production
        if self.proxy:
            logging.info(f"Using proxy: {self.proxy.get('server')}")
            launch_options["proxy"] = {
                "server": self.proxy["server"],
                "username": self.proxy.get("username"),
                "password": self.proxy.get("password"),
            }
        self.browser = await self.playwright.chromium.launch(**launch_options)
        self.context = await self.browser.new_context(ignore_https_errors=True)
        self.page = await self.context.new_page()
        await stealth_async(self.page)
        logging.info("IdealistaScraper started.")

    async def scrape_property(self, url: str):
        """
        Scrape basic property data from Idealista.
        :param url: The URL of the Idealista property page.
        :return: A dictionary containing property data or None if scraping fails.
        """
        logging.info(f"Attempting to scrape Idealista URL: {url}")
        try:
            await self.page.goto(url, timeout=60000, wait_until="domcontentloaded")
            # Add a small delay or wait for a specific element that indicates page load
            await self.page.wait_for_selector('div#headerMap', timeout=20000) # Wait for address section
            await self.page.wait_for_load_state("networkidle", timeout=30000)

            address = "Not found"
            price = "Not found"
            living_area = "Not found"
            bedrooms = "Not found"
            bathrooms = "Not found"
            year_built = "Not found" # As per user, year built is omitted

            # --- Address ---
            try:
                address_items = []
                # Select all list items within the specific ul in div#headerMap
                li_elements = await self.page.query_selector_all("div#headerMap ul li.header-map-list")
                for li in li_elements:
                    text = await li.inner_text()
                    address_items.append(text.strip())
                if address_items:
                    # Join the items, potentially reversing for standard address order
                    address = ", ".join(reversed(address_items))
            except Exception as e:
                logging.warning(f"Could not extract address: {e}")

            # --- Price ---
            try:
                # More specific selector using the preceding span's text
                price_elem = await self.page.query_selector("span:has-text('Precio del inmueble:') + strong")
                if price_elem:
                    price_text = await price_elem.inner_text()
                    # Basic cleaning, remove currency symbol and potential thousand separators (dots)
                    price = re.sub(r'[.€\s]', '', price_text).strip() + " €" # Keep space before €
            except Exception as e:
                logging.warning(f"Could not extract price: {e}")

            # --- Living Area (Square Meters) ---
            try:
                 # Assuming the span is within a features section, adjust selector if needed
                 # Trying a potentially more robust selector targeting the features area
                area_elem = await self.page.query_selector("div.info-features span:has-text('m²')")
                if area_elem:
                    living_area_text = await area_elem.inner_text()
                    match = re.search(r"(\d+)\s*m²", living_area_text)
                    if match:
                        living_area = f"{match.group(1)} m²"
            except Exception as e:
                logging.warning(f"Could not extract living area: {e}")

            # --- Bedrooms (Rooms) ---
            try:
                # Assuming the span is within a features section
                bedrooms_elem = await self.page.query_selector("div.info-features span:has-text('hab.')")
                if bedrooms_elem:
                    bedrooms_text = await bedrooms_elem.inner_text()
                    match = re.search(r"(\d+)", bedrooms_text)
                    if match:
                        bedrooms = match.group(1)
            except Exception as e:
                logging.warning(f"Could not extract bedrooms: {e}")

            # --- Bathrooms ---
            try:
                 # Assuming the li is within a features section/list
                bathrooms_elem = await self.page.query_selector("div.details-property_features li:has-text('baño')") # Using 'baño' singular/plural
                if bathrooms_elem:
                    bathrooms_text = await bathrooms_elem.inner_text()
                    match = re.search(r"(\d+)", bathrooms_text) # Extract the number
                    if match:
                        bathrooms = match.group(1)
            except Exception as e:
                logging.warning(f"Could not extract bathrooms: {e}")

            # --- Year Built ---
            # Initialize year_built to "Not found"
            year_built = "Not found"
            try:
                # Look for the list item containing "Construido en" within the same features block
                year_elem = await self.page.query_selector("div.details-property_features li:has-text('Construido en')")
                if year_elem:
                    year_text = await year_elem.inner_text()
                    # Use regex to find the 4-digit year
                    match = re.search(r"(\d{4})", year_text)
                    if match:
                        year_built = match.group(1) # Extract the 4-digit year
                        logging.info(f"Successfully extracted Year Built: {year_built}")
                    else:
                         logging.warning("Found 'Construido en' text but could not extract year number.")
            except Exception as e:
                logging.warning(f"Could not extract year built: {e}")

            scraped_data = {
                "Address": address,
                "Price": price,
                "Living Area": living_area,
                "Bedrooms": bedrooms,
                "Bathrooms": bathrooms,
                "Year Built": year_built, # Will remain "Not found"
            }
            logging.info(f"Successfully scraped data from Idealista: {scraped_data}")
            return scraped_data

        except Exception as e:
            logging.error(f"Error scraping Idealista property data: {e}", exc_info=True)
            return None

    async def close(self):
        """Close the browser and Playwright."""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        logging.info("IdealistaScraper closed.")

# Example usage (optional, for testing)
if __name__ == "__main__":
    async def main():
        # Replace with a valid Idealista URL for testing
        idealista_url = "https://www.idealista.com/inmueble/106481863/" # e.g., "https://www.idealista.com/inmueble/..."

        scraper = IdealistaScraper()
        await scraper.start()
        data = await scraper.scrape_property(idealista_url)
        await scraper.close()

        if data:
            print("Scraped Data:")
            for key, value in data.items():
                print(f"{key}: {value}")
            else:
                print("Failed to scrape data.")

    asyncio.run(main())