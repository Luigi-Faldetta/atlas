# idealista_scraper.py
# Robust Idealista scraper with ScrapingBee and HTML/JSON parsing
# Enhanced fallback for Price and Year Built in both English and Spanish
import os
import re
import json
import logging
import httpx
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)

class IdealistaScraper:
    def __init__(self, api_key: str = None):
        """
        Scraper using ScrapingBee premium proxy with HTTP fallback.
        Supports both Spanish and English Idealista pages.
        Requires SCRAPINGBEE_API_KEY in environment.
        """
        self.api_key = api_key or os.getenv('SCRAPINGBEE_API_KEY')
        if not self.api_key:
            raise ValueError('SCRAPINGBEE_API_KEY must be set in environment')
        self.session = httpx.Client(timeout=60)

    def fetch_html(self, url: str) -> str:
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
        logging.info(f'[*] ScrapingBee no-JS: {url}')
        try:
            resp = self.session.get(sb_url, params=params)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            logging.warning(f'No-JS fetch failed: {e}')
        # 2) with-JS
        params['render_js'] = 'true'
        logging.info(f'[*] ScrapingBee with-JS: {url}')
        try:
            resp = self.session.get(sb_url, params=params)
            resp.raise_for_status()
            return resp.text
        except Exception as e:
            logging.warning(f'JS fetch failed: {e}')
        # 3) direct HTTP
        logging.info(f'[*] HTTP fallback: {url}')
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0',
            'Accept-Language': 'es-ES,es;q=0.9,en-US,en;q=0.8',
        }
        resp = self.session.get(url, headers=headers)
        resp.raise_for_status()
        return resp.text

    def parse_json_data(self, html: str) -> dict:
        """
        Extract Next.js __NEXT_DATA__ JSON for server-side props.
        Handles Spanish and English keys.
        """
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
        if not m:
            logging.info('No __NEXT_DATA__ found')
            return {}
        try:
            data = json.loads(m.group(1))
            props = data.get('props', {}).get('pageProps', {})
            estate = props.get('estate') or props.get('inmueble') or props.get('property') or props
            return estate if isinstance(estate, dict) else {}
        except json.JSONDecodeError as e:
            logging.error(f'JSON decode error: {e}')
            return {}

    def scrape_property(self, url: str) -> dict:
        """
        Scrape property details: Address, Price, Living Area, Bedrooms, Bathrooms, Year Built.
        Supports Spanish and English pages.
        """
        html = self.fetch_html(url)
        estate = self.parse_json_data(html)

        # Initialize all fields to 'Not found'
        fields = ['Address','Price','Living Area','Bedrooms','Bathrooms','Year Built']
        result = {k: 'Not found' for k in fields}

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

        return result

# Example usage
if __name__ == '__main__':
    scraper = IdealistaScraper()
    test_url = os.getenv('TEST_IDEALISTA_URL') or 'https://www.idealista.com/en/inmueble/105090633/'
    print(scraper.scrape_property(test_url))
