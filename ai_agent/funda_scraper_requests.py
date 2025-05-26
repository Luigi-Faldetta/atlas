import requests
from bs4 import BeautifulSoup
import re
import os
import time
import random
import urllib3
from dotenv import load_dotenv

# Disable SSL warnings when using proxies
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

class FundaScraperRequests:
    def __init__(self):
        """
        Initialize the requests-based Funda scraper with Bright Data proxy support.
        """
        self.session = requests.Session()
        
        # Set up proxy if available
        proxy_server = os.getenv("PROXY_SERVER")
        proxy_username = os.getenv("PROXY_USERNAME") 
        proxy_password = os.getenv("PROXY_PASSWORD")
        
        if proxy_server and proxy_username and proxy_password:
            # Format proxy URL with authentication
            proxy_url = f"http://{proxy_username}:{proxy_password}@{proxy_server.replace('http://', '')}"
            self.session.proxies = {
                'http': proxy_url,
                'https': proxy_url
            }
            print(f"Using Bright Data proxy: {proxy_server}")
        else:
            print("No proxy configuration found, using direct connection")
        
        # Set realistic headers
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })

    async def start(self):
        """Async start method for compatibility with existing code"""
        pass

    async def close(self):
        """Async close method for compatibility with existing code"""
        self.session.close()

    async def scrape_property(self, url: str):
        """
        Scrape property data from Funda using requests and BeautifulSoup.
        :param url: The URL of the Funda property page.
        :return: A dictionary containing property data.
        """
        try:
            # Add random delay to mimic human behavior
            time.sleep(random.uniform(2, 5))
            
            # Make the request with SSL verification disabled for proxy compatibility
            response = self.session.get(url, timeout=30, verify=False)
            response.raise_for_status()
            
            # Parse the HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract address
            street_elem = soup.select_one("h1 span.block.text-2xl.font-bold")
            postal_city_elem = soup.select_one("h1 span.text-neutral-40")
            
            street = street_elem.get_text(strip=True) if street_elem else "Street not found"
            postal_city = postal_city_elem.get_text(strip=True) if postal_city_elem else "Postal code and city not found"
            
            address = f"{street}, {postal_city}" if street and postal_city else "Address not found"
            
            # Extract price
            price_elem = soup.select_one("div.mt-5.flex.flex-wrap.items-center.gap-3 span")
            price = price_elem.get_text(strip=True) if price_elem else "Price not found"
            
            # Extract features (living area, bedrooms)
            features_elems = soup.select("ul.flex.flex-wrap.gap-4 li")
            features = [elem.get_text(strip=True) for elem in features_elems] if features_elems else []
            
            # Parse living area
            living_area = "Not found"
            for feature in features:
                if "m²" in feature:
                    living_area = feature.split("\n")[0]
                    break
            
            # Extract bedrooms
            bedrooms_elem = soup.select_one("ul.flex.flex-wrap.gap-4 li:nth-child(2) span.md\\:font-bold")
            bedrooms = bedrooms_elem.get_text(strip=True) if bedrooms_elem else "Not found"
            
            # Extract bathrooms
            bathrooms = "Not found"
            try:
                # Look for bathroom information in the details section
                bathroom_dt = soup.find('dt', string=re.compile(r'Badkamers?', re.IGNORECASE))
                if bathroom_dt:
                    bathroom_dd = bathroom_dt.find_next_sibling('dd')
                    if bathroom_dd:
                        bathroom_text = bathroom_dd.get_text(strip=True)
                        match = re.search(r"(\d+)\s+badkamer", bathroom_text, re.IGNORECASE)
                        if match:
                            bathrooms = match.group(1)
            except Exception as e:
                print(f"Could not extract bathrooms: {e}")
            
            # Extract year built
            year_built = "Not found"
            try:
                year_dt = soup.find('dt', string=re.compile(r'Bouwjaar', re.IGNORECASE))
                if year_dt:
                    year_dd = year_dt.find_next_sibling('dd')
                    if year_dd:
                        year_text = year_dd.get_text(strip=True)
                        match = re.search(r"(\d{4})", year_text)
                        if match:
                            year_built = match.group(1)
            except Exception as e:
                print(f"Could not extract year built: {e}")
            
            # Extract property image
            property_image = None
            try:
                # Look for the main property image - Funda typically uses specific selectors
                image_selectors = [
                    'img[data-test-id="object-media-image"]',  # Funda's main image
                    '.object-media img',  # Alternative Funda selector
                    '.media-viewer img',  # Another Funda selector
                    '.object-header img',  # Header image
                    'img[alt*="foto"]',  # Images with "foto" in alt text
                    'img[src*="cloud.funda.nl"]',  # Funda CDN images
                    '.media-container img:first-child',  # First image in media container
                    'img:first-of-type'  # Fallback to first image
                ]
                
                for selector in image_selectors:
                    img_element = soup.select_one(selector)
                    if img_element and img_element.get('src'):
                        img_src = img_element.get('src')
                        # Ensure it's a full URL
                        if img_src.startswith('//'):
                            img_src = 'https:' + img_src
                        elif img_src.startswith('/'):
                            img_src = 'https://www.funda.nl' + img_src
                        
                        # Validate it's likely a property image (not icon/logo)
                        if any(keyword in img_src.lower() for keyword in ['object', 'property', 'house', 'apartment', 'foto', 'image']):
                            property_image = img_src
                            break
                        elif img_src.startswith('https://cloud.funda.nl'):
                            property_image = img_src
                            break
                
                if property_image:
                    print(f"Found property image: {property_image}")
                else:
                    print("No property image found")
                    
            except Exception as e:
                print(f"Error extracting property image: {e}")
            
            return {
                "Address": address,
                "Price": price,
                "Living Area": living_area,
                "Bedrooms": bedrooms,
                "Bathrooms": bathrooms,
                "Year Built": year_built,
                "Property Image": property_image,
            }
            
        except requests.RequestException as e:
            print(f"Request error: {e}")
            return {"error": f"Failed to fetch page: {str(e)}"}
        except Exception as e:
            print(f"Error extracting property data: {e}")
            return {"error": f"Failed to parse property data: {str(e)}"}

# For testing
if __name__ == "__main__":
    import asyncio
    
    async def test():
        scraper = FundaScraperRequests()
        await scraper.start()
        
        # Test URL
        url = "https://www.funda.nl/detail/koop/rotterdam/appartement-noorderhavenkade-63-a03/89360538/"
        
        result = await scraper.scrape_property(url)
        print("Scraped data:", result)
        
        await scraper.close()
    
    asyncio.run(test()) 