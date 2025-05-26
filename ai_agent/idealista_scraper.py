# idealista_scraper.py
"""
Idealista scraper implementation using ScrapingBee API.
Handles Spanish and English real estate listings from idealista.com
Enhanced fallback for Price and Year Built in both languages.
"""

import os
import re
import json
import logging
import httpx
import asyncio
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from base_scraper import BaseScraper

load_dotenv()


class IdealistaScraper(BaseScraper):
    """
    Scraper for Idealista using ScrapingBee premium proxy with HTTP fallback.
    Supports both Spanish and English Idealista pages.
    """
    
    def __init__(self, proxy=None, logger=None):
        """
        Initialize Idealista scraper with ScrapingBee API.
        Note: proxy parameter is ignored as ScrapingBee provides its own proxy.
        Requires SCRAPINGBEE_API_KEY in environment.
        """
        super().__init__(proxy, logger)
        self.api_key = os.getenv('SCRAPINGBEE_API_KEY')
        if not self.api_key:
            raise ValueError('SCRAPINGBEE_API_KEY must be set in environment')
        self.session = None
        
    async def start(self) -> None:
        """Initialize HTTP session for ScrapingBee requests"""
        await super().start()
        self.session = httpx.AsyncClient(timeout=60)
        
    async def close(self) -> None:
        """Close HTTP session"""
        if self.session:
            await self.session.aclose()
        await super().close()
        
    def get_site_name(self) -> str:
        """Return the site name"""
        return "Idealista"

    async def fetch_html(self, url: str) -> str:
        """
        Tiered fetch: ScrapingBee no-JS, then with-JS, then direct HTTP.
        """
        sb_url = 'https://app.scrapingbee.com/api/v1/'
        common = {
            'api_key': self.api_key,
            'url': url,
            'premium_proxy': 'true',
            'country_code': 'es',
        }
        
        # 1) no-JS
        params = {**common, 'render_js': 'false'}
        self.logger.info(f'[*] ScrapingBee no-JS: {url}')
        try:
            resp = await self.session.get(sb_url, params=params)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            self.logger.warning(f'No-JS fetch failed: {e}')
            
        # 2) with-JS
        params['render_js'] = 'true'
        self.logger.info(f'[*] ScrapingBee with-JS: {url}')
        try:
            resp = await self.session.get(sb_url, params=params)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            self.logger.warning(f'JS fetch failed: {e}')
            
        # 3) direct HTTP
        self.logger.info(f'[*] HTTP fallback: {url}')
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0',
            'Accept-Language': 'es-ES,es;q=0.9,en-US,en;q=0.8',
        }
        resp = await self.session.get(url, headers=headers)
        resp.raise_for_status()
        return resp.text

    def parse_json_data(self, html: str) -> dict:
        """
        Extract Next.js __NEXT_DATA__ JSON for server-side props.
        Handles Spanish and English keys.
        """
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
        if not m:
            self.logger.info('No __NEXT_DATA__ found')
            return {}
        try:
            data = json.loads(m.group(1))
            props = data.get('props', {}).get('pageProps', {})
            estate = props.get('estate') or props.get('inmueble') or props.get('property') or props
            return estate if isinstance(estate, dict) else {}
        except json.JSONDecodeError as e:
            self.logger.error(f'JSON decode error: {e}')
            return {}

    async def scrape_property(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Scrape property details: Address, Price, Living Area, Bedrooms, Bathrooms, Year Built.
        Supports Spanish and English pages.
        """
        try:
            html = await self.fetch_html(url)
            estate = self.parse_json_data(html)

            # Initialize all fields to 'Not found'
            fields = ['Address','Price','Living Area','Bedrooms','Bathrooms','Year Built']
            result = {k: 'Not found' for k in fields}
            result['URL'] = url
            result['Site'] = self.get_site_name()
            result['Property Image'] = None

            def to_int(x):
                try:
                    return int(float(x))
                except:
                    return None

            # 1) From JSON
            if estate:
                # Address
                addr = estate.get('address', {})
                if isinstance(addr, dict):
                    parts = [addr.get(k) for k in ('streetAddress','postalCode','addressLocality') if addr.get(k)]
                    if parts:
                        result['Address'] = ', '.join(parts)
                        
                # Price
                price_val = estate.get('price') or estate.get('offers', {}).get('price')
                price_int = to_int(price_val)
                if price_int is not None:
                    result['Price'] = f"{price_int} €"
                    
                # Living Area
                sa = estate.get('floorSize', {}).get('value') or estate.get('size') or estate.get('surface')
                si = to_int(sa)
                if si is not None:
                    result['Living Area'] = f"{si} m²"
                    
                # Bedrooms
                bd = estate.get('numberOfRooms') or estate.get('rooms') or estate.get('bedrooms')
                bi = to_int(bd)
                if bi is not None:
                    result['Bedrooms'] = str(bi)
                    
                # Bathrooms
                bt = estate.get('bathrooms') or estate.get('wc')
                bti = to_int(bt)
                if bti is not None:
                    result['Bathrooms'] = str(bti)
                    
                # Year Built
                yr = estate.get('constructionYear') or estate.get('builtYear') or estate.get('yearBuilt')
                yri = to_int(yr)
                if yri is not None:
                    result['Year Built'] = str(yri)
                    
                # Property Image - extract from JSON data
                images = estate.get('images') or estate.get('photos') or estate.get('multimedia', {}).get('images', [])
                if images and isinstance(images, list) and len(images) > 0:
                    first_image = images[0]
                    if isinstance(first_image, dict):
                        # Try different possible keys for image URL
                        img_url = first_image.get('url') or first_image.get('src') or first_image.get('href')
                        if img_url:
                            # Ensure it's a full URL
                            if img_url.startswith('//'):
                                img_url = 'https:' + img_url
                            elif img_url.startswith('/'):
                                img_url = 'https://img.idealista.com' + img_url
                            result['Property Image'] = img_url
                    elif isinstance(first_image, str):
                        # Direct URL string
                        img_url = first_image
                        if img_url.startswith('//'):
                            img_url = 'https:' + img_url
                        elif img_url.startswith('/'):
                            img_url = 'https://img.idealista.com' + img_url
                        result['Property Image'] = img_url

            # 2) HTML fallback for address
            if result['Address'] == 'Not found':
                ul = re.search(r'<h2[^>]*>(?:Ubicación|Location)</h2>\s*<ul>(.*?)</ul>', html, re.S)
                if ul:
                    lis = re.findall(r'<li[^>]*>([^<]+)</li>', ul.group(1))
                    items = [li.strip() for li in lis if li.strip()]
                    if items:
                        result['Address'] = ', '.join(items)

            # 3) Specific HTML fallback for Price
            if result['Price'] == 'Not found':
                m = re.search(
                    r'<p[^>]*class="flex-feature"[^>]*>\s*<span[^>]*>'
                    r'(?:Property price:|Precio del inmueble:)\s*</span>\s*'
                    r'<strong[^>]*>\s*([\d\.,]+)\s*€', html)
                if m:
                    amt = m.group(1).replace('.', '').replace(',', '.')
                    result['Price'] = f"{amt} €"

            # 4) Specific HTML fallback for Year Built under "Basic features"
            if result['Year Built'] == 'Not found':
                sec = re.search(
                    r'<h2[^>]*>(?:Basic features|Características básicas)</h2>\s*<ul>(.*?)</ul>', html, re.S)
                if sec:
                    m2 = re.search(r'(?:Built in|Construido en)\s*(\d{4})', sec.group(1))
                    if m2:
                        result['Year Built'] = m2.group(1)

            # 5) General regex fallback for remaining fields
            regex_map = {
                'Price': r'([\d\.,]+)\s*€',
                'Living Area': r'(\d+)\s*m²',
                'Bedrooms': r'(\d+)\s*(?:hab|bed)',
                'Bathrooms': r'(\d+)\s*(?:baño|bath)',
                'Year Built': r'(\d{4})'
            }
            for key, pat in regex_map.items():
                if result[key] == 'Not found':
                    m3 = re.search(pat, html, re.IGNORECASE)
                    if m3:
                        val = m3.group(1).replace('.', '')
                        suffix = ' €' if key=='Price' else ' m²' if key=='Living Area' else ''
                        result[key] = val + suffix
                        
            # 6) HTML fallback for Property Image
            if result['Property Image'] is None:
                # Try to find the main property image in HTML
                img_patterns = [
                    r'<img[^>]*class="[^"]*main-photo[^"]*"[^>]*src="([^"]+)"',
                    r'<img[^>]*class="[^"]*property-image[^"]*"[^>]*src="([^"]+)"',
                    r'<img[^>]*data-src="([^"]+)"[^>]*class="[^"]*photo[^"]*"',
                    r'<img[^>]*src="([^"]+)"[^>]*alt="[^"]*(?:property|inmueble)[^"]*"',
                    r'<meta[^>]*property="og:image"[^>]*content="([^"]+)"'
                ]
                
                for pattern in img_patterns:
                    match = re.search(pattern, html, re.IGNORECASE)
                    if match:
                        img_url = match.group(1)
                        # Clean up the URL
                        if img_url.startswith('//'):
                            img_url = 'https:' + img_url
                        elif img_url.startswith('/'):
                            img_url = 'https://img.idealista.com' + img_url
                        # Validate it's actually an image URL
                        if any(ext in img_url.lower() for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                            result['Property Image'] = img_url
                            break
                        
            # Extract property type
            type_patterns = [
                (r'tipo["\s:]+["\']*([^"\'<>]+)', 'es'),
                (r'property[_\s]?type["\s:]+["\']*([^"\'<>]+)', 'en'),
                (r'<span[^>]*class="[^"]*property-type[^"]*"[^>]*>([^<]+)', 'html')
            ]
            
            for pattern, lang in type_patterns:
                match = re.search(pattern, html, re.IGNORECASE)
                if match:
                    result['Property Type'] = match.group(1).strip()
                    break
            else:
                # Fallback based on URL
                if 'piso' in url.lower() or 'apartamento' in url.lower():
                    result['Property Type'] = 'Piso'
                elif 'casa' in url.lower() or 'chalet' in url.lower():
                    result['Property Type'] = 'Casa'
                else:
                    result['Property Type'] = 'Not found'

            self.request_count += 1
            return result
            
        except Exception as e:
            self.logger.error(f"Error scraping {url}: {e}", exc_info=True)
            return None


# Example usage
if __name__ == '__main__':
    async def test_scraper():
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        scraper = IdealistaScraper()
        await scraper.start()
        
        try:
            test_url = os.getenv('TEST_IDEALISTA_URL') or 'https://www.idealista.com/en/inmueble/105090633/'
            result = await scraper.scrape_property(test_url)
            
            if result:
                print("\nScraped data:")
                for key, value in result.items():
                    print(f"{key}: {value}")
            else:
                print("Failed to scrape property")
                
        finally:
            await scraper.close()
            
    asyncio.run(test_scraper())
