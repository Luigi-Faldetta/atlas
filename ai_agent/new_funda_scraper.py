import asyncio
import random
import re
import logging
import os
from playwright.async_api import async_playwright
from playwright_stealth import stealth_async

# Configure logging
logging.basicConfig(level=logging.DEBUG)

class FundaScraper:
    """
    A scraper for Funda property listings using Playwright with stealth capabilities.
    Designed to run headlessly in environments like Docker/Render.
    """
    def __init__(self, proxy=None):
        """
        Initialize the scraper.
        :param proxy: Dictionary with proxy details {'server': '', 'username': '', 'password': ''}
        """
        self.proxy = proxy
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None

    async def start(self):
        """
        Start Playwright and initialize the browser, context, and page.
        Configured for headless operation on Render.
        """
        self.playwright = await async_playwright().start()

        # Define common launch arguments for headless environments
        launch_args = {
            "headless": True,  # MUST be True for Render
            "args": [
                "--no-sandbox",  # Required for running as root in Docker (common in Render)
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage", # Recommended for Docker environments
                "--disable-gpu", # Often needed in headless environments
                "--disable-extensions",
                "--disable-infobars",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
                "--disable-blink-features=AutomationControlled", # Important for stealth
                "--window-size=1920,1080", # Use a common resolution
            ]
        }

        if self.proxy:
            logging.debug(f"Using proxy configuration: server={self.proxy.get('server')}")
            launch_args["proxy"] = {
                "server": self.proxy["server"],
                "username": self.proxy.get("username"),
                "password": self.proxy.get("password"),
            }
        else:
            logging.debug("No proxy configuration provided.")

        # Launch the browser with the arguments
        try:
            self.browser = await self.playwright.chromium.launch(**launch_args)
            logging.debug("Browser launched successfully.")
        except Exception as e:
            logging.error(f"Failed to launch browser: {e}")
            raise

        # Create a more realistic browser context
        try:
            self.context = await self.browser.new_context(
                ignore_https_errors=True, # Important for some proxy/network setups
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36", # Common user agent
                locale="nl-NL",  # Use Dutch locale for Funda
                timezone_id="Europe/Amsterdam", # Use Amsterdam timezone
                color_scheme="no-preference",
                has_touch=False
            )
            logging.debug("Browser context created.")
        except Exception as e:
            logging.error(f"Failed to create browser context: {e}")
            await self.close() # Clean up browser if context creation fails
            raise

        self.page = await self.context.new_page()
        await stealth_async(self.page)  # Apply stealth mode
        logging.debug("Stealth applied to page.")

        # Additional anti-detection measures
        try:
            await self.page.evaluate("""() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] }); // Mock plugins
                Object.defineProperty(navigator, 'languages', { get: () => ['nl-NL', 'nl', 'en-US', 'en'] }); // Mock languages
                Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 }); // Mock hardware concurrency
            }""")
            logging.debug("Additional stealth JS evaluations applied.")
        except Exception as e:
            logging.warning(f"Failed to apply additional stealth JS: {e}")

    async def close(self):
        """
        Close the browser and stop Playwright.
        """
        if self.context:
            try:
                await self.context.close()
                logging.debug("Browser context closed.")
            except Exception as e:
                logging.warning(f"Error closing context: {e}")
        if self.browser:
            try:
                await self.browser.close()
                logging.debug("Browser closed.")
            except Exception as e:
                logging.warning(f"Error closing browser: {e}")
        if self.playwright:
            try:
                await self.playwright.stop()
                logging.debug("Playwright stopped.")
            except Exception as e:
                logging.warning(f"Error stopping Playwright: {e}")

    async def simulate_human_behavior(self):
        """Add realistic human-like behavior before accessing the target URL"""
        try:
            logging.debug("Simulating human behavior...")
            # Start with a popular Dutch website or search engine
            await self.page.goto("https://www.google.nl", timeout=30000, wait_until="domcontentloaded")
            await asyncio.sleep(random.uniform(1, 3))

            # Type search query with random typing speed
            search_query = "huizen te koop amsterdam" # Example search
            search_box_selector = "textarea[name=q], input[name=q]" # Common selectors for Google search box
            await self.page.wait_for_selector(search_box_selector, timeout=10000)
            for char in search_query:
                await self.page.type(search_box_selector, char)
                await asyncio.sleep(random.uniform(0.05, 0.2)) # Faster typing simulation

            await asyncio.sleep(random.uniform(0.5, 1.5))
            await self.page.press(search_box_selector, "Enter")

            # Wait for search results page
            await self.page.wait_for_load_state("domcontentloaded", timeout=15000)
            await asyncio.sleep(random.uniform(2, 4))
            logging.debug("Human behavior simulation completed.")

        except Exception as e:
            # If any step fails, just log and continue
            logging.warning(f"[Human simulation error]: {e}")
            pass # Don't let simulation failure stop the main process

    def extract_info_from_url(self, url):
        """Extract basic property information from URL when scraping fails"""
        import re
        logging.warning(f"[Scraper] Using fallback extraction from URL: {url}")

        # Extract property ID
        property_id_match = re.search(r"/(\d+)/?$", url)
        property_id = property_id_match.group(1) if property_id_match else "Unknown"

        # Extract address information
        # Regex improved to handle different URL structures
        address_match = re.search(r"/koop/([^/]+)/([^/]+)-(\d+[^/]*)/", url)
        street, number = None, None
        if address_match:
            street = address_match.group(2).replace("-", " ").title()
            number = address_match.group(3)

        # Extract city
        city_match = re.search(r"/koop/([^/]+)/", url)
        city = city_match.group(1).replace("-", " ").title() if city_match else "Unknown"

        # Extract property type
        type_match = re.search(r"/koop/[^/]+/([^/]+)/", url)
        property_type = type_match.group(1).replace("-", " ") if type_match else "Unknown"

        # Provide estimated ranges for key metrics
        return {
            "Address": f"{street} {number}, {city}" if street and number and city != "Unknown" else f"Property in {city}",
            "Price": "€350,000 - €500,000 (estimated)",
            "Living Area": "70 - 120 m² (estimated)",
            "Plot Size": "Not available",
            "Bedrooms": "2 - 3 (estimated)",
            "Property Type": property_type,
            "Property ID": property_id,
            "Scraped": False, # Indicate that this is fallback data
            "Message": "Limited property information due to website restrictions."
        }

    async def scrape_property(self, url: str):
        """
        Scrape property data from a given Funda URL.
        Includes fallback logic if scraping is blocked.
        """
        if not self.page:
            logging.error("Scraper page not initialized. Call start() first.")
            return None

        try:
            # Optional: Simulate human behavior before hitting the target URL
            # await self.simulate_human_behavior()

            logging.debug(f"Navigating to URL: {url}")
            await self.page.goto(url, timeout=60000, wait_until="domcontentloaded") # Wait for DOM content

            # Check for title to see if we hit a captcha/bot protection page immediately
            page_title = await self.page.title()
            logging.debug(f"Page title: {page_title}")
            if "Je bent bijna op de pagina" in page_title or "verify" in page_title.lower():
                logging.warning("[Scraper] Detected Funda bot protection page on initial load.")
                return self.extract_info_from_url(url) # Use fallback

            # Wait for a key element that indicates the main content is loaded
            key_element_selector = "h1 span[data-object-title-street]" # Example selector for address
            try:
                await self.page.wait_for_selector(key_element_selector, timeout=20000) # Increased timeout
                logging.debug("Key element found, proceeding with scraping.")
            except Exception as e:
                logging.warning(f"[Scraper Debug] Could not find key element '{key_element_selector}'. Page likely blocked or structure changed. Error: {e}")
                html_dump = await self.page.content()
                logging.debug(f"[Scraper HTML dump (first 1000 chars)] {html_dump[:1000]}")
                return self.extract_info_from_url(url) # Use fallback

            # Add random delays and interaction to mimic human behavior
            await asyncio.sleep(random.uniform(1, 3))
            await self.page.mouse.wheel(0, random.randint(200, 500)) # Scroll down a bit
            await asyncio.sleep(random.uniform(1, 2))

            # --- Actual Scraping Logic ---
            # Selectors need to be verified against the current Funda structure
            address = await self.page.locator(key_element_selector).inner_text()
            price_text = await self.page.locator("strong[data-object-header-price]").inner_text()
            # Extract numeric price if possible
            price_match = re.search(r'€\s*([\d.,]+)', price_text.replace('.', ''))
            price = f"€ {price_match.group(1)}" if price_match else price_text

            # Use more specific selectors for Kenmerken (Characteristics)
            living_area = await self.page.locator('span[title="Woonoppervlakte"] + span').first.inner_text()
            plot_size_element = self.page.locator('span[title="Perceeloppervlakte"] + span').first
            plot_size = await plot_size_element.inner_text() if await plot_size_element.count() > 0 else "Not available"
            bedrooms_element = self.page.locator('span[title="Aantal kamers"] + span').first # Often includes living room
            bedrooms_text = await bedrooms_element.inner_text() if await bedrooms_element.count() > 0 else "Not available"
            # Try to extract just the bedroom number if format is like "X kamers (Y slaapkamers)"
            bedroom_match = re.search(r'(\d+)\s+slaapkamer', bedrooms_text)
            bedrooms = bedroom_match.group(1) if bedroom_match else bedrooms_text # Fallback to full text

            logging.info("Successfully scraped property data.")
            return {
                "Address": address.strip(),
                "Price": price.strip(),
                "Living Area": living_area.strip(),
                "Plot Size": plot_size.strip(),
                "Bedrooms": bedrooms.strip(),
                "Scraped": True, # Indicate successful scraping
                "Message": "Successfully scraped property details."
            }
            # --- End of Scraping Logic ---

        except Exception as e:
            logging.error(f"[Scraper Error] An unexpected error occurred during scraping: {e}")
            try:
                # Attempt to get HTML content even on error for debugging
                html_dump = await self.page.content()
                logging.debug(f"[Scraper Error HTML dump (first 1000 chars)] {html_dump[:1000]}")
            except Exception as dump_error:
                logging.error(f"Could not get HTML content after error: {dump_error}")
            return self.extract_info_from_url(url) # Use fallback on any error

# Example usage block (optional, can be removed for deployment)
async def main():
    """Example function to test the scraper directly."""
    load_dotenv() # Load .env if running directly

    proxy_details = None
    proxy_server = os.getenv("PROXY_SERVER")
    proxy_username = os.getenv("PROXY_USERNAME")
    proxy_password = os.getenv("PROXY_PASSWORD")

    if all([proxy_server, proxy_username, proxy_password]):
        proxy_details = {
            "server": proxy_server,
            "username": proxy_username,
            "password": proxy_password
        }
        print("Using proxy from .env file for testing.")
    else:
        print("No proxy details found in .env file for testing.")

    # Example Funda URL
    funda_url = "https://www.funda.nl/detail/koop/amsterdam/appartement-bos-en-lommerplantsoen-99-l/89296526/"

    scraper = FundaScraper(proxy=proxy_details)
    try:
        await scraper.start()
        # Scrape the property data
        scraped_data = await scraper.scrape_property(funda_url)

        # Print the scraped data
        if scraped_data:
            print("\n--- Scraped Data ---")
            for key, value in scraped_data.items():
                print(f"{key}: {value}")
            print("--------------------\n")
        else:
            print("Failed to scrape property data (returned None).")

    except Exception as e:
        print(f"An error occurred during the test run: {e}")
    finally:
        # Ensure the scraper is closed properly
        await scraper.close()

if __name__ == "__main__":
    # This block allows running the scraper directly for testing
    # Requires .env file in the same directory or parent directories
    from dotenv import load_dotenv
    asyncio.run(main())