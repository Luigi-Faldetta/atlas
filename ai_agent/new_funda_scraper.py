import asyncio
import random
import re
import logging
import os
from playwright.async_api import async_playwright, Error as PlaywrightError, TimeoutError as PlaywrightTimeoutError
from playwright_stealth import stealth_async

# Configure logging - Ensure DEBUG level to capture all logs
# If logging wasn't showing before, explicitly set format and level again
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# Get a logger instance for this module
logger = logging.getLogger(__name__)

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
        logger.info("FundaScraper initialized.") # Log initialization

    async def start(self):
        """
        Start Playwright and initialize the browser, context, and page.
        Configured for headless operation on Render.
        """
        logger.info("Starting Playwright and browser setup...")
        try:
            self.playwright = await async_playwright().start()
            logger.debug("Playwright started.")

            # Define common launch arguments for headless environments
            launch_args = {
                "headless": True,
                "args": [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                    "--disable-extensions",
                    "--disable-infobars",
                    "--disable-web-security",
                    "--disable-features=IsolateOrigins,site-per-process",
                    "--disable-blink-features=AutomationControlled",
                    "--window-size=1920,1080",
                ]
            }

            if self.proxy:
                # Avoid logging full proxy details if sensitive
                logger.info(f"Using proxy configuration: server={self.proxy.get('server')}")
                launch_args["proxy"] = {
                    "server": self.proxy["server"],
                    "username": self.proxy.get("username"),
                    "password": self.proxy.get("password"),
                }
            else:
                logger.info("No proxy configuration provided.")

            # Launch the browser with the arguments
            logger.debug("Launching browser with args: %s", launch_args)
            self.browser = await self.playwright.chromium.launch(**launch_args)
            logger.info("Browser launched successfully.")

            # Create a more realistic browser context
            logger.debug("Creating browser context...")
            self.context = await self.browser.new_context(
                ignore_https_errors=True,
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                locale="nl-NL",
                timezone_id="Europe/Amsterdam",
                color_scheme="no-preference",
                has_touch=False
            )
            logger.info("Browser context created.")

            self.page = await self.context.new_page()
            logger.debug("New page created.")
            await stealth_async(self.page)
            logger.info("Stealth applied to page.")

            # Additional anti-detection measures
            logger.debug("Applying additional stealth JS evaluations...")
            await self.page.evaluate("""() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
                Object.defineProperty(navigator, 'languages', { get: () => ['nl-NL', 'nl', 'en-US', 'en'] });
                Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
            }""")
            logger.debug("Additional stealth JS evaluations applied.")
            logger.info("Scraper start sequence completed.")

        except PlaywrightError as e:
            logger.error(f"Playwright error during start: {e}", exc_info=True)
            await self.close() # Attempt cleanup
            raise # Re-raise the exception
        except Exception as e:
            logger.error(f"Unexpected error during start: {e}", exc_info=True)
            await self.close() # Attempt cleanup
            raise # Re-raise the exception


    async def close(self):
        """
        Close the browser and stop Playwright.
        """
        logger.info("Closing scraper resources...")
        if self.page and not self.page.is_closed():
             try:
                 await self.page.close()
                 logger.debug("Page closed.")
             except Exception as e:
                 logger.warning(f"Error closing page: {e}")
        if self.context:
            try:
                await self.context.close()
                logger.debug("Browser context closed.")
            except Exception as e:
                logger.warning(f"Error closing context: {e}")
        if self.browser and self.browser.is_connected():
            try:
                await self.browser.close()
                logger.debug("Browser closed.")
            except Exception as e:
                logger.warning(f"Error closing browser: {e}")
        if self.playwright:
            try:
                # Check if playwright object exists and has stop method
                if hasattr(self.playwright, 'stop'):
                     await self.playwright.stop()
                     logger.debug("Playwright stopped.")
            except Exception as e:
                logger.warning(f"Error stopping Playwright: {e}")
        logger.info("Scraper resources closed.")

    # --- simulate_human_behavior remains the same ---
    async def simulate_human_behavior(self):
        """Add realistic human-like behavior before accessing the target URL"""
        try:
            logger.debug("Simulating human behavior...")
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
            logger.debug("Human behavior simulation completed.")

        except Exception as e:
            # If any step fails, just log and continue
            logger.warning(f"[Human simulation error]: {e}", exc_info=True)
            pass # Don't let simulation failure stop the main process

    # --- extract_info_from_url remains the same ---
    def extract_info_from_url(self, url):
        """Extract basic property information from URL when scraping fails"""
        import re
        # Use the module-level logger
        logger.warning(f"[Scraper Fallback] Using fallback extraction from URL: {url}")

        # Extract property ID
        property_id_match = re.search(r"/(\d+)/?$", url)
        property_id = property_id_match.group(1) if property_id_match else "Unknown"

        # Extract address information
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

        logger.debug(f"[Scraper Fallback] Extracted: ID={property_id}, Street={street}, Num={number}, City={city}, Type={property_type}")

        return {
            "Address": f"{street} {number}, {city}" if street and number and city != "Unknown" else f"Property in {city}",
            "Price": "€350,000 - €500,000 (estimated)",
            "Living Area": "70 - 120 m² (estimated)",
            "Plot Size": "Not available",
            "Bedrooms": "2 - 3 (estimated)",
            "Property Type": property_type,
            "Property ID": property_id,
            "Scraped": False,
            "Message": "Limited property information due to website restrictions."
        }

    # --- Enhanced scrape_property method ---
    async def scrape_property(self, url: str):
        """
        Scrape property data from a given Funda URL.
        Includes fallback logic if scraping is blocked.
        """
        logger.info(f"Starting scrape_property for URL: {url}")
        if not self.page or self.page.is_closed():
            logger.error("Scraper page is not initialized or closed. Cannot scrape.")
            # Cannot call fallback here as scraper state is invalid
            return None # Or raise an error

        try:
            # --- Navigation ---
            logger.debug(f"Navigating to URL: {url}")
            navigation_response = await self.page.goto(url, timeout=60000, wait_until="domcontentloaded")
            if navigation_response:
                 logger.info(f"Navigation completed with status: {navigation_response.status}")
            else:
                 logger.warning("Navigation response was null, might indicate issues.")


            # --- Initial Bot Check ---
            logger.debug("Checking page title for bot detection...")
            page_title = await self.page.title()
            logger.info(f"Page title: '{page_title}'")
            if "Je bent bijna op de pagina" in page_title or "verify" in page_title.lower() or "human" in page_title.lower():
                logger.warning("[Scraper] Detected Funda bot protection page on initial load via title.")
                logger.info("Triggering fallback: extract_info_from_url")
                return self.extract_info_from_url(url) # Use fallback

            # --- Wait for Key Element ---
            key_element_selector = "h1 span[data-object-title-street]"
            logger.debug(f"Waiting for key element: '{key_element_selector}'")
            try:
                await self.page.wait_for_selector(key_element_selector, timeout=25000, state="visible") # Increased timeout, wait for visible
                logger.info(f"Key element '{key_element_selector}' found and visible.")
            except PlaywrightTimeoutError:
                logger.warning(f"[Scraper Debug] Timeout waiting for key element '{key_element_selector}'. Page likely blocked or structure changed.")
                try:
                    html_dump = await self.page.content()
                    logger.debug(f"[Scraper HTML dump on key element timeout (first 1500 chars)] {html_dump[:1500]}")
                except Exception as dump_error:
                    logger.error(f"Could not get HTML content after key element timeout: {dump_error}")
                logger.info("Triggering fallback: extract_info_from_url")
                return self.extract_info_from_url(url) # Use fallback
            except Exception as e: # Catch other potential errors during wait_for_selector
                 logger.error(f"[Scraper Debug] Error waiting for key element '{key_element_selector}': {e}", exc_info=True)
                 logger.info("Triggering fallback: extract_info_from_url")
                 return self.extract_info_from_url(url) # Use fallback


            # --- Human-like Interaction ---
            logger.debug("Performing human-like interaction (sleep/scroll)...")
            await asyncio.sleep(random.uniform(1.5, 3.5)) # Slightly longer sleep
            await self.page.mouse.wheel(0, random.randint(300, 600)) # Scroll down
            await asyncio.sleep(random.uniform(1.0, 2.5))
            logger.debug("Human-like interaction finished.")

            # --- Actual Scraping Logic ---
            scraped_values = {}
            logger.info("Starting data extraction...")

            # Address
            try:
                logger.debug(f"Extracting address using selector: '{key_element_selector}'")
                address = await self.page.locator(key_element_selector).inner_text(timeout=5000)
                scraped_values["Address"] = address.strip()
                logger.debug(f"Extracted Address: '{scraped_values['Address']}'")
            except Exception as e:
                logger.warning(f"Could not extract Address: {e}")
                scraped_values["Address"] = "Not available"

            # Price
            price_selector = "strong[data-object-header-price]"
            try:
                logger.debug(f"Extracting price using selector: '{price_selector}'")
                price_text = await self.page.locator(price_selector).inner_text(timeout=5000)
                logger.debug(f"Raw price text: '{price_text}'")
                # Clean price text (remove non-breaking spaces, etc.)
                cleaned_price_text = price_text.replace('\xa0', '').replace('.', '')
                price_match = re.search(r'€\s*([\d,]+)', cleaned_price_text)
                if price_match:
                     # Format with space and keep original comma if present
                     price_num_str = price_match.group(1)
                     # Re-add thousand separators if needed for display consistency
                     # This part might need adjustment based on how you want to store/use the price
                     scraped_values["Price"] = f"€ {price_num_str}"
                else:
                     scraped_values["Price"] = price_text.strip() # Fallback to raw text
                logger.debug(f"Extracted Price: '{scraped_values['Price']}'")
            except Exception as e:
                logger.warning(f"Could not extract Price: {e}")
                scraped_values["Price"] = "Not available"

            # Living Area
            living_area_selector = 'span[title="Woonoppervlakte"] + span'
            try:
                logger.debug(f"Extracting living area using selector: '{living_area_selector}'")
                living_area = await self.page.locator(living_area_selector).first.inner_text(timeout=5000)
                scraped_values["Living Area"] = living_area.strip()
                logger.debug(f"Extracted Living Area: '{scraped_values['Living Area']}'")
            except Exception as e:
                logger.warning(f"Could not extract Living Area: {e}")
                scraped_values["Living Area"] = "Not available"

            # Plot Size
            plot_size_selector = 'span[title="Perceeloppervlakte"] + span'
            try:
                logger.debug(f"Extracting plot size using selector: '{plot_size_selector}'")
                plot_size_element = self.page.locator(plot_size_selector).first
                if await plot_size_element.count() > 0:
                    plot_size = await plot_size_element.inner_text(timeout=5000)
                    scraped_values["Plot Size"] = plot_size.strip()
                    logger.debug(f"Extracted Plot Size: '{scraped_values['Plot Size']}'")
                else:
                    logger.debug("Plot Size element not found.")
                    scraped_values["Plot Size"] = "Not available"
            except Exception as e:
                logger.warning(f"Could not extract Plot Size: {e}")
                scraped_values["Plot Size"] = "Not available"

            # Bedrooms
            bedrooms_selector = 'span[title="Aantal kamers"] + span' # This often includes living room
            try:
                logger.debug(f"Extracting bedrooms text using selector: '{bedrooms_selector}'")
                bedrooms_element = self.page.locator(bedrooms_selector).first
                if await bedrooms_element.count() > 0:
                    bedrooms_text = await bedrooms_element.inner_text(timeout=5000)
                    logger.debug(f"Raw bedrooms text: '{bedrooms_text}'")
                    # Try to extract just the bedroom number
                    bedroom_match = re.search(r'(\d+)\s+slaapkamer', bedrooms_text) # Look for "X slaapkamer(s)"
                    if bedroom_match:
                         bedrooms = bedroom_match.group(1)
                    else:
                         # Fallback: try to get the first number if no "slaapkamer" found
                         first_num_match = re.search(r'(\d+)', bedrooms_text)
                         bedrooms = first_num_match.group(1) if first_num_match else bedrooms_text.strip()

                    scraped_values["Bedrooms"] = bedrooms.strip()
                    logger.debug(f"Extracted Bedrooms: '{scraped_values['Bedrooms']}'")
                else:
                    logger.debug("Bedrooms element not found.")
                    scraped_values["Bedrooms"] = "Not available"
            except Exception as e:
                logger.warning(f"Could not extract Bedrooms: {e}")
                scraped_values["Bedrooms"] = "Not available"

            # --- Final Check & Return ---
            # Check if essential data like price or address was scraped
            if scraped_values.get("Price", "Not available") == "Not available" or scraped_values.get("Address", "Not available") == "Not available":
                 logger.warning("Essential data (Price or Address) could not be extracted. Assuming scrape failed.")
                 logger.info("Triggering fallback: extract_info_from_url")
                 return self.extract_info_from_url(url)

            logger.info("Successfully scraped property data.")
            scraped_values["Scraped"] = True
            scraped_values["Message"] = "Successfully scraped property details."
            return scraped_values

        except PlaywrightTimeoutError as e:
             logger.error(f"[Scraper Error] Playwright TimeoutError during scraping: {e}", exc_info=True)
             logger.info("Triggering fallback due to Playwright TimeoutError: extract_info_from_url")
             return self.extract_info_from_url(url)
        except PlaywrightError as e:
             logger.error(f"[Scraper Error] Playwright Error during scraping: {e}", exc_info=True)
             logger.info("Triggering fallback due to Playwright Error: extract_info_from_url")
             return self.extract_info_from_url(url)
        except Exception as e:
            logger.error(f"[Scraper Error] An unexpected error occurred during scraping: {e}", exc_info=True) # Log full traceback
            try:
                # Attempt to get HTML content even on error for debugging
                html_dump = await self.page.content()
                logger.debug(f"[Scraper Error HTML dump (first 1500 chars)] {html_dump[:1500]}")
            except Exception as dump_error:
                logger.error(f"Could not get HTML content after error: {dump_error}")
            logger.info("Triggering fallback due to unexpected error: extract_info_from_url")
            return self.extract_info_from_url(url) # Use fallback on any error

# --- main test block remains the same ---
# Example usage block (optional, can be removed for deployment)
async def main():
    """Example function to test the scraper directly."""
    from dotenv import load_dotenv
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
