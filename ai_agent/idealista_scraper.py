from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeoutError, Error as PlaywrightError
from playwright_stealth import stealth_async
import asyncio
import random
import re
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Custom error for target closed
class TargetClosedError(PlaywrightError):
    pass

# List of realistic User-Agent strings
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
]

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
        Start Playwright and initialize the browser, context, and page with enhanced anti-detection.
        """
        try:
            self.playwright = await async_playwright().start()
            launch_options = {
                "headless": False, # Keep headless=False for debugging anti-bot issues
                "args": [ # Add some common args to look less like a bot
                    "--disable-blink-features=AutomationControlled",
                    "--disable-infobars",
                    "--window-position=0,0",
                    "--ignore-certifcate-errors",
                    "--ignore-certifcate-errors-spki-list",
                    "--disable-dev-shm-usage", # Often needed in Docker/Linux environments
                    "--no-sandbox", # Often needed in Docker/Linux environments
                ]
            }
            if self.proxy:
                logging.info(f"Using proxy: {self.proxy.get('server')}")
                launch_options["proxy"] = {
                    "server": self.proxy["server"],
                    "username": self.proxy.get("username"),
                    "password": self.proxy.get("password"),
                }
            self.browser = await self.playwright.chromium.launch(**launch_options)

            # Create context with specific settings
            self.context = await self.browser.new_context(
                user_agent=random.choice(USER_AGENTS), # Use a random realistic user agent
                viewport={'width': 1920, 'height': 1080}, # Set a common viewport size
                ignore_https_errors=True,
                java_script_enabled=True, # Ensure JS is enabled
                bypass_csp=True, # Can sometimes help with tricky sites
            )
            # Add custom JS to further hide automation
            await self.context.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
                Object.defineProperty(navigator, 'languages', {get: () => ['en-US', 'en']});
                Object.defineProperty(navigator, 'plugins', {get: () => [1, 2, 3]});
            """)

            self.context.on("page", lambda page: page.on("close", self._handle_page_close))
            self.page = await self.context.new_page()

            # Apply stealth AFTER page creation
            await stealth_async(self.page)

            logging.info("IdealistaScraper started with enhanced anti-detection.")
        except Exception as e:
            logging.error(f"Error during IdealistaScraper start: {e}", exc_info=True)
            await self.close() # Ensure cleanup on startup failure
            raise # Re-raise the exception

    def _handle_page_close(self):
        """Handle unexpected page close events."""
        logging.warning("Page closed unexpectedly during operation.")
        # Set page to None to prevent further operations on closed page
        self.page = None

    async def scrape_property(self, url: str):
        """
        Scrape basic property data from Idealista with enhanced waiting and error handling.
        :param url: The URL of the Idealista property page.
        :return: A dictionary containing property data or None if scraping fails.
        """
        if not self.page or self.page.is_closed():
             logging.error("Scrape attempt failed: Page is not available or closed.")
             return None

        logging.info(f"Attempting to scrape Idealista URL: {url}")
        try:
            # Add a small random delay before navigating
            await asyncio.sleep(random.uniform(2.0, 4.0)) # Slightly increased delay

            # Navigate with a longer timeout and wait for load state
            # 'load' might be slightly faster than 'networkidle' and sometimes less prone to timeout
            await self.page.goto(url, timeout=90000, wait_until="load")

            # Wait a brief moment *after* load for dynamic anti-bot scripts to potentially run
            await asyncio.sleep(random.uniform(1.0, 2.5))

            # Check for anti-bot messages after navigation and brief wait
            page_content = await self.page.content()
            if "enable JS" in page_content or "disable your ad blocker" in page_content or "enable javascript" in page_content.lower() or "human verification" in page_content.lower():
                logging.error(f"Anti-bot page detected for URL: {url}. Aborting scrape.")
                # Optionally save the HTML for debugging
                # try:
                #     with open(f"antibot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html", "w", encoding='utf-8') as f:
                #         f.write(page_content)
                #     await self.page.screenshot(path=f"antibot_screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
                # except Exception as ss_err:
                #     logging.warning(f"Could not save anti-bot debug info: {ss_err}")
                return None

            # Wait for a key element to ensure the main content is loaded
            try:
                # Wait for the price element or main title as an indicator
                await self.page.wait_for_selector('span.price, h1.main-info__title', timeout=40000) # Increased timeout slightly
                logging.info("Key content element found.")
            except PlaywrightTimeoutError as e:
                logging.error(f"Timeout while waiting for key content element: {e}")
                # Optionally save screenshot or HTML
                # await self.page.screenshot(path=f"error_screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png")
                return None
            except Exception as e: # Catch broader exceptions during wait
                 if not self.page or self.page.is_closed() or "Target page, context or browser has been closed" in str(e):
                     logging.error(f"Page closed during wait_for_selector: {e}")
                     return None
                 else:
                     logging.error(f"Unexpected error during wait_for_selector: {e}", exc_info=True)
                     return None

            # Add a small delay after waiting
            await asyncio.sleep(random.uniform(2.5, 4.5)) # Slightly increased delay

            # --- Extraction Logic (Address, Price, Area, Bedrooms, Bathrooms, Year Built) ---
            # ... (Keep the existing extraction logic from the previous version) ...
            # --- Address ---
            address = "Not found"
            try:
                # Try the original selector first
                address_elem = await self.page.query_selector('div#headerMap ul')
                if address_elem:
                    address_items = await address_elem.query_selector_all("li.header-map-list")
                    address_parts = [await item.inner_text() for item in address_items]
                    if address_parts:
                        address = ", ".join(reversed([part.strip() for part in address_parts]))
                else:
                    # Fallback: Try using the main title structure if #headerMap fails
                    main_title_elem = await self.page.query_selector('h1.main-info__title-main')
                    sub_title_elem = await self.page.query_selector('span.main-info__title-address') # Adjusted selector
                    if main_title_elem and sub_title_elem:
                         main_title = await main_title_elem.inner_text()
                         sub_title = await sub_title_elem.inner_text()
                         address = f"{main_title.strip()}, {sub_title.strip()}"
                    else:
                        # Last resort: Try container with location icon
                        loc_container = await self.page.query_selector("div.location")
                        if loc_container:
                            address = await loc_container.inner_text()
                            address = address.strip() # Clean whitespace

                logging.info(f"Extracted Address: {address}")
            except Exception as e:
                if not self.page or self.page.is_closed(): logging.warning("Address extraction failed: Page closed."); return None
                logging.warning(f"Could not extract address: {e}")

            # --- Price ---
            price = "Not found"
            try:
                price_elem = await self.page.query_selector("span.price") # Simpler selector for price
                if price_elem:
                    price_text = await price_elem.inner_text()
                    # Clean price: remove dots, euro symbol, spaces, then add " €"
                    cleaned_price = re.sub(r'[.€\s]', '', price_text).strip()
                    if cleaned_price.isdigit(): # Ensure it's a number before adding currency
                        price = f"{cleaned_price} €"
                    else:
                        price = price_text # Fallback to original text if cleaning fails
                logging.info(f"Extracted Price: {price}")
            except Exception as e:
                if not self.page or self.page.is_closed(): logging.warning("Price extraction failed: Page closed."); return None
                logging.warning(f"Could not extract price: {e}")

            # --- Living Area (Square Meters) ---
            living_area = "Not found"
            try:
                # Look for the feature item containing 'm²'
                # Combine selectors for different layouts
                area_elem = await self.page.query_selector("div.details-property-feature-one span:has-text('m²'), div.info-features span:has-text('m²'), li:has-text('m²')")
                if area_elem:
                    living_area_text = await area_elem.inner_text()
                    match = re.search(r"(\d+)\s*m²", living_area_text)
                    if match:
                        living_area = f"{match.group(1)} m²"
                logging.info(f"Extracted Living Area: {living_area}")
            except Exception as e:
                if not self.page or self.page.is_closed(): logging.warning("Living Area extraction failed: Page closed."); return None
                logging.warning(f"Could not extract living area: {e}")

            # --- Bedrooms ---
            bedrooms = "Not found"
            try:
                # Look for the feature item containing 'hab.' or 'dormitorio'
                bedrooms_elem = await self.page.query_selector("div.details-property-feature-one span:has-text('hab.'), div.info-features span:has-text('hab.'), div.details-property-feature-one span:has-text('dormitorio'), div.info-features span:has-text('dormitorio'), li:has-text('hab.'), li:has-text('dormitorio')")
                if bedrooms_elem:
                    bedrooms_text = await bedrooms_elem.inner_text()
                    match = re.search(r"(\d+)", bedrooms_text)
                    if match:
                        bedrooms = match.group(1)
                logging.info(f"Extracted Bedrooms: {bedrooms}")
            except Exception as e:
                if not self.page or self.page.is_closed(): logging.warning("Bedrooms extraction failed: Page closed."); return None
                logging.warning(f"Could not extract bedrooms: {e}")

            # --- Bathrooms ---
            bathrooms = "Not found"
            try:
                # Look for the feature item containing 'baño'
                bathrooms_elem = await self.page.query_selector("div.details-property-feature-one span:has-text('baño'), div.info-features span:has-text('baño'), li:has-text('baño')")
                if bathrooms_elem:
                    bathrooms_text = await bathrooms_elem.inner_text()
                    match = re.search(r"(\d+)", bathrooms_text)
                    if match:
                        bathrooms = match.group(1)
                logging.info(f"Extracted Bathrooms: {bathrooms}")
            except Exception as e:
                if not self.page or self.page.is_closed(): logging.warning("Bathrooms extraction failed: Page closed."); return None
                logging.warning(f"Could not extract bathrooms: {e}")

            # --- Year Built ---
            year_built = "Not found"
            try:
                # Look for the list item containing "Construido en" or similar text
                # Combine potential selectors
                year_elem = await self.page.query_selector("div.details-property_features li:has-text('Construido en'), div.building-features li:has-text('Construido en'), li:has-text('Año construcción')")
                if year_elem:
                    year_text = await year_elem.inner_text()
                    # Use regex to find the 4-digit year
                    match = re.search(r"(\d{4})", year_text)
                    if match:
                        year_built = match.group(1) # Extract the 4-digit year
                        logging.info(f"Successfully extracted Year Built: {year_built}")
                    else:
                         logging.warning("Found year text but could not extract year number.")
                else:
                    # Fallback: Check basic details section if specific feature list fails
                    # This selector needs verification based on actual Idealista structure
                    # basic_details_text = await self.page.inner_text("div.details-property-feature-item:has-text('Construido')") # Example selector, adjust if needed
                    # if basic_details_text:
                    #      match = re.search(r"(\d{4})", basic_details_text)
                    #      if match:
                    #          year_built = match.group(1)
                    #          logging.info(f"Successfully extracted Year Built (fallback): {year_built}")
                    pass # Keep silent if not found

            except Exception as e:
                # Don't log error if element simply not found, only for actual exceptions
                if not self.page or self.page.is_closed(): logging.warning("Year Built extraction failed: Page closed."); return None
                if "selector resolved to no elements" not in str(e):
                    logging.warning(f"Could not extract year built: {e}")
            # --- End Extraction Logic ---

            scraped_data = {
                "Address": address,
                "Price": price,
                "Living Area": living_area,
                "Bedrooms": bedrooms,
                "Bathrooms": bathrooms,
                "Year Built": year_built,
            }
            logging.info(f"Successfully scraped data from Idealista: {scraped_data}")
            return scraped_data

        except PlaywrightTimeoutError as e:
             logging.error(f"PlaywrightTimeoutError during Idealista scraping. URL: {url}. Error: {e}", exc_info=False)
             return None
        except Exception as e:
            # Check if it's a target closed error or if page is None
            if not self.page or self.page.is_closed() or "Target page, context or browser has been closed" in str(e):
                 logging.error(f"TargetClosedError during Idealista scraping: Page closed unexpectedly. URL: {url}. Error: {e}", exc_info=False)
            else:
                 logging.error(f"General error scraping Idealista property data: {e}", exc_info=True)
            return None

    async def close(self):
        """Close the browser and Playwright."""
        # Add checks for is_closed() before attempting to close
        if self.page and not self.page.is_closed():
            try:
                await self.page.close()
            except Exception as e:
                logging.warning(f"Error closing page: {e}")
        if self.context:
             try:
                 # Check if context is still connected before closing
                 if self.context and hasattr(self.context, 'close') and callable(getattr(self.context, 'close')):
                     await self.context.close()
             except Exception as e:
                 logging.warning(f"Error closing context: {e}")
        if self.browser and self.browser.is_connected(): # Check if browser is connected
            try:
                await self.browser.close()
            except Exception as e:
                logging.warning(f"Error closing browser: {e}")
        if self.playwright:
            try:
                await self.playwright.stop()
            except Exception as e:
                logging.warning(f"Error stopping playwright: {e}")
        self.page = None
        self.context = None
        self.browser = None
        self.playwright = None
        logging.info("IdealistaScraper closed.")

# Example usage (optional, for testing)
if __name__ == "__main__":
    async def main():
        # Replace with a valid Idealista URL for testing
        # idealista_url = "https://www.idealista.com/inmueble/106481863/" # Example 1
        idealista_url = "https://www.idealista.com/en/inmueble/105813590/" # Example 2 (from user error)

        scraper = IdealistaScraper()
        data = None # Initialize data to None
        try:
            await scraper.start()
            # Add a check if start was successful before scraping
            if scraper.page:
                data = await scraper.scrape_property(idealista_url)
            else:
                logging.error("Scraper failed to start properly, cannot scrape.")
        except Exception as e:
             logging.error(f"An error occurred during the main execution: {e}", exc_info=True)
        finally:
            await scraper.close() # Ensure close is always called

        if data:
            print("\nScraped Data:")
            for key, value in data.items():
                print(f"{key}: {value}")
        else:
            print("\nFailed to scrape data.")

    asyncio.run(main())