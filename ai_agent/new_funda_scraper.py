from playwright.async_api import async_playwright
from playwright_stealth import stealth_async
import asyncio
import random
import os
from dotenv import load_dotenv

load_dotenv()

class FundaScraper:
    def __init__(self, proxy=None):
        self.proxy = proxy
        self.playwright = None
        self.browser = None
        self.context = None
        self.page = None

    async def start(self):
        self.playwright = await async_playwright().start()

        launch_args = {
            "headless": True,
            "args": [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-gpu",
                "--disable-dev-shm-usage",
                "--disable-extensions",
                "--disable-infobars",
                "--disable-web-security",
                "--disable-features=IsolateOrigins,site-per-process",
            ]
        }

        if self.proxy:
            print(f"Using proxy: {self.proxy}")
            launch_args["proxy"] = {
                "server": self.proxy["server"],
                "username": self.proxy.get("username"),
                "password": self.proxy.get("password"),
            }

        self.browser = await self.playwright.chromium.launch(**launch_args)
        self.context = await self.browser.new_context(ignore_https_errors=True)
        self.page = await self.context.new_page()
        await stealth_async(self.page)

    async def scrape_property(self, url: str):
        try:
            await self.page.goto(url, timeout=60000)

            try:
                await self.page.wait_for_selector("h1 span", timeout=15000)
            except Exception:
                print("[Scraper Debug] Could not find title. Page likely blocked or redirected.")
                html = await self.page.content()
                print("[Scraper HTML dump]", html[:1000])
                return None

            await self.page.wait_for_load_state("networkidle")
            await asyncio.sleep(random.uniform(5, 10))
            await self.page.mouse.wheel(0, random.randint(300, 800))
            await asyncio.sleep(random.uniform(2, 5))

            street_elem = await self.page.query_selector("h1 span.block.text-2xl.font-bold") or await self.page.query_selector("h1 span")
            postal_city_elem = await self.page.query_selector("h1 span.text-neutral-40")

            street = await street_elem.inner_text() if street_elem else "Street not found"
            postal_city = await postal_city_elem.inner_text() if postal_city_elem else "Postal code and city not found"
            address = f"{street}, {postal_city}" if street and postal_city else "Address not found"

            price_elem = await self.page.query_selector("div.mt-5.flex.flex-wrap.items-center.gap-3 span")
            price = await price_elem.inner_text() if price_elem else "Price not found"

            features_elem = await self.page.query_selector_all("ul.flex.flex-wrap.gap-4 li")
            features = [await feature.inner_text() for feature in features_elem] if features_elem else []
            living_area = next((f.split("\n")[0] for f in features if "m²" in f), "Not found")

            bedrooms_elem = await self.page.query_selector("ul.flex.flex-wrap.gap-4 li:nth-child(2) span.md\\:font-bold")
            bedrooms = await bedrooms_elem.inner_text() if bedrooms_elem else "Not found"

            print(f"[Scraped] Address: {address}, Price: {price}, Living Area: {living_area}, Bedrooms: {bedrooms}")

            return {
                "Address": address,
                "Price": price,
                "Living Area": living_area,
                "Plot Size": "Not available",  # required by your AI prompt
                "Bedrooms": bedrooms,
            }

        except Exception as e:
            print(f"[Scraper Error] {e}")
            return None

    async def close(self):
        if self.context:
            await self.context.close()
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

if __name__ == "__main__":
    async def main():
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

        funda_url = "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/"

        scraper = FundaScraper(proxy=proxy)
        await scraper.start()
        scraped_data = await scraper.scrape_property(funda_url)

        if scraped_data:
            print("Scraped Data:")
            for key, value in scraped_data.items():
                print(f"{key}: {value}")
        else:
            print("❌ Failed to scrape property data.")

        await scraper.close()

    asyncio.run(main())
