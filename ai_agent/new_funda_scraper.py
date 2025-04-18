from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
import asyncio
import random
import os
import re  # Import the regex module
from dotenv import load_dotenv

load_dotenv()

class FundaScraper:
    def __init__(self, proxy=None):
        """
        Initialize Playwright with optional proxy.
        :param proxy: Proxy configuration dictionary with 'server', 'username', and 'password'.
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
        if self.proxy:
            print(f"Using proxy: {self.proxy}")  # Debugging proxy configuration
            self.browser = await self.playwright.chromium.launch(
                headless=False,
                proxy={
                    "server": self.proxy["server"],
                    "username": self.proxy.get("username"),
                    "password": self.proxy.get("password"),
                },
            )
        else:
            self.browser = await self.playwright.chromium.launch(headless=False)

        # Create a browser context with ignore_https_errors=True
        self.context = await self.browser.new_context(ignore_https_errors=True)
        self.page = await self.context.new_page()
        await stealth_async(self.page)  # Apply stealth mode

    async def scrape_property(self, url: str):
        """
        Scrape basic property data from Funda.
        :param url: The URL of the Funda property page.
        :return: A dictionary containing property data.
        """
        try:
            # Navigate to the URL
            await self.page.goto(url, timeout=60000)  # Wait up to 60 seconds for the page to load
            await self.page.wait_for_load_state("networkidle")  # Wait until the network is idle

            # Mimic human behavior
            await asyncio.sleep(random.uniform(5, 10))  # Random delay
            await self.page.mouse.wheel(0, random.randint(300, 800))  # Scroll down
            await asyncio.sleep(random.uniform(2, 5))  # Additional delay

            # Extract the full address
            street_elem = await self.page.query_selector("h1 span.block.text-2xl.font-bold")
            postal_city_elem = await self.page.query_selector("h1 span.text-neutral-40")

            street = await street_elem.inner_text() if street_elem else "Street not found"
            postal_city = await postal_city_elem.inner_text() if postal_city_elem else "Postal code and city not found"

            address = f"{street}, {postal_city}" if street and postal_city else "Address not found"

            # Extract the price
            price_elem = await self.page.query_selector("div.mt-5.flex.flex-wrap.items-center.gap-3 span")
            price = await price_elem.inner_text() if price_elem else "Price not found"

            # Extract the square meters and number of rooms
            features_elem = await self.page.query_selector_all("ul.flex.flex-wrap.gap-4 li")
            features = [await feature.inner_text() for feature in features_elem] if features_elem else []

            # Parse features into separate fields
            living_area = next((f.split("\n")[0] for f in features if "m²" in f), "Not found")

            # Extract bedrooms specifically
            bedrooms_elem = await self.page.query_selector("ul.flex.flex-wrap.gap-4 li:nth-child(2) span.md\\:font-bold")
            bedrooms = await bedrooms_elem.inner_text() if bedrooms_elem else "Not found"

            # --- Extract Bathrooms ---
            bathrooms = "Not found"
            try:
                # Find the 'dt' element containing 'Badkamers' and get the next 'dd' sibling
                bathroom_dd_elem = await self.page.query_selector("dt:has-text('Badkamers') + dd")
                if bathroom_dd_elem:
                    bathroom_text = await bathroom_dd_elem.inner_text()
                    # Use regex to find the number before 'badkamer' or 'badkamers'
                    match = re.search(r"(\d+)\s+badkamer", bathroom_text, re.IGNORECASE)
                    if match:
                        bathrooms = match.group(1)  # Extract the number as a string
            except Exception as e:
                print(f"Could not extract bathrooms: {e}")  # Log error if extraction fails

            # --- Extract Year Built (Bouwjaar) ---
            year_built = "Not found"
            try:
                # Find the 'dt' element containing 'Bouwjaar' and get the next 'dd' sibling
                year_dd_elem = await self.page.query_selector("dt:has-text('Bouwjaar') + dd")
                if year_dd_elem:
                    year_text = await year_dd_elem.inner_text()
                    # Use regex to find a 4-digit number (the year)
                    match = re.search(r"(\d{4})", year_text)
                    if match:
                        year_built = match.group(1)  # Extract the 4-digit year
            except Exception as e:
                print(f"Could not extract year built: {e}")  # Log error if extraction fails

            return {
                "Address": address,
                "Price": price,
                "Living Area": living_area,
                "Bedrooms": bedrooms,
                "Bathrooms": bathrooms,
                "Year Built": year_built,  # Add year built to the result
            }

        except Exception as e:
            print(f"Error extracting property data: {e}")
            return None

    async def close(self):
        """Close the browser and Playwright."""
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()


if __name__ == "__main__":
    import asyncio

    async def main():
        # Bright Data Residential Proxy Configuration (optional)
        proxy = None
        proxy_server = os.getenv("PROXY_SERVER")
        proxy_username = os.getenv("PROXY_USERNAME")
        proxy_password = os.getenv("PROXY_PASSWORD")

        if proxy_server and proxy_username and proxy_password:
            proxy = {
                "server": proxy_server,
                "username": proxy_username,
                "password": proxy_password
            }
            print("Using proxy configuration from environment variables")
        else:
            print("No proxy configuration found in environment variables")

        # Funda property URL
        funda_url = "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/"
        # Replace with your desired property URL

        # Initialize the scraper with the proxy
        scraper = FundaScraper(proxy=proxy)
        await scraper.start()  # Start the scraper

        # Scrape the property data
        scraped_data = await scraper.scrape_property(funda_url)

        # Print the scraped data
        if scraped_data:
            print("Scraped Data:")
            for key, value in scraped_data.items():
                print(f"{key}: {value}")
        else:
            print("Failed to scrape property data.")

        # Close the scraper
        await scraper.close()

    asyncio.run(main())