
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
        Scraper using ScrapingBee premium proxy and HTTP fallback.
        Requires SCRAPINGBEE_API_KEY env var.
        """
        self.api_key = api_key or os.getenv('SCRAPINGBEE_API_KEY')
        if not self.api_key:
            raise ValueError('SCRAPINGBEE_API_KEY must be set')
        self.session = httpx.Client(timeout=60)

    def fetch_html(self, url: str) -> str:
        """
        Fetch HTML via ScrapingBee (no-JS first, then JS), else direct HTTP.
        """
        base_url = 'https://app.scrapingbee.com/api/v1/'
        common = {
            'api_key': self.api_key,
            'url': url,
            'premium_proxy': 'true',
            'country_code': 'es',
        }
        # 1) ScrapingBee no-JS
        params = {**common, 'render_js': 'false'}
        logging.info(f'[*] ScrapingBee no-JS: {url}')
        try:
            r = self.session.get(base_url, params=params)
            r.raise_for_status()
            return r.text
        except Exception as e:
            logging.warning(f'ScrapingBee no-JS failed: {e}')
        # 2) ScrapingBee with-JS
        params['render_js'] = 'true'
        logging.info(f'[*] ScrapingBee with-JS: {url}')
        try:
            r = self.session.get(base_url, params=params)
            r.raise_for_status()
            return r.text
        except Exception as e:
            logging.warning(f'ScrapingBee JS fetch failed: {e}')
        # 3) Direct HTTP
        logging.info(f'[*] HTTP fallback: {url}')
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:115.0) Gecko/20100101 Firefox/115.0',
            'Accept-Language': 'es-ES,es;q=0.9',
        }
        resp = self.session.get(url, headers=headers)
        resp.raise_for_status()
        return resp.text

    def parse_json_data(self, html: str) -> dict:
        """
        Extract Next.js __NEXT_DATA__ payload for server-side data.
        """
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.S)
        if not m:
            logging.info('No __NEXT_DATA__ found')
            return {}
        try:
            payload = json.loads(m.group(1))
            props = payload.get('props', {}).get('pageProps', {})
            estate = (props.get('estate') or props.get('inmueble') or
                      props.get('property') or props)
            return estate if isinstance(estate, dict) else {}
        except json.JSONDecodeError:
            logging.error('JSON decode error in NEXT_DATA')
            return {}

    def scrape_property(self, url: str) -> dict:
        """
        Scrape and return a dict with:
        Address, Price, Living Area, Bedrooms, Bathrooms, Year Built.
        """
        # Fetch HTML
        try:
            html = self.fetch_html(url)
        except Exception as e:
            logging.error(f'Failed to fetch HTML: {e}')
            return {'error': 'Failed to fetch HTML'}

        # Parse server-side JSON data
        estate = self.parse_json_data(html)

        # Initialize defaults
        fields = ['Address', 'Price', 'Living Area', 'Bedrooms', 'Bathrooms', 'Year Built']
        data = {k: 'Not found' for k in fields}

        def to_int(v):
            try: return int(float(v))
            except: return None

        # 1) Populate from JSON
        if isinstance(estate, dict) and estate:
            # Address
            addr = estate.get('address', {})
            if isinstance(addr, dict):
                parts = [addr.get(k) for k in ('streetAddress', 'postalCode', 'addressLocality') if addr.get(k)]
                if parts:
                    data['Address'] = ', '.join(parts)
            # Price
            pv = estate.get('price') or estate.get('offers', {}).get('price')
            pi = to_int(pv)
            if pi is not None:
                data['Price'] = f"{pi} €"
            # Living Area
            sv = (estate.get('floorSize', {}).get('value') or
                  estate.get('size') or estate.get('surface'))
            si = to_int(sv)
            if si is not None:
                data['Living Area'] = f"{si} m²"
            # Bedrooms
            rm = estate.get('numberOfRooms') or estate.get('bedrooms') or estate.get('rooms')
            ri = to_int(rm)
            if ri is not None:
                data['Bedrooms'] = str(ri)
            # Bathrooms
            bt = estate.get('bathrooms') or estate.get('wc')
            bi = to_int(bt)
            if bi is not None:
                data['Bathrooms'] = str(bi)
            # Year Built
            yr = (estate.get('constructionYear') or estate.get('yearBuilt') or
                  estate.get('builtYear'))
            yi = to_int(yr)
            if yi is not None:
                data['Year Built'] = str(yi)

        # 2) Fallback: parse headerMap <ul> after 'Ubicación'
        if data['Address'] == 'Not found':
            ul_match = re.search(r'<h2[^>]*>Ubicación</h2>\s*<ul>(.*?)</ul>', html, re.S)
            if ul_match:
                lis = re.findall(r'<li[^>]*>([^<]+)</li>', ul_match.group(1))
                items = [li.strip() for li in lis if li.strip()]
                if items:
                    data['Address'] = ', '.join(items)

        # 3) Other regex fallbacks if still missing
        patterns = {
            'Price': r'([\d\.]+)\s*€',
            'Living Area': r'(\d+)\s*m²',
            'Bedrooms': r'(\d+)\s*hab',
            'Bathrooms': r'(\d+)\s*baño',
            'Year Built': r'Construido en\s*(\d{4})',
        }
        for k, pat in patterns.items():
            if data[k] == 'Not found':
                m = re.search(pat, html)
                if m:
                    val = m.group(1).replace('.', '')
                    suffix = ' €' if k == 'Price' else ' m²' if k == 'Living Area' else ''
                    data[k] = val + suffix

        return data

# Example usage
if __name__ == '__main__':
    scraper = IdealistaScraper()
    url = os.getenv('TEST_IDEALISTA_URL') or 'https://www.idealista.com/inmueble/106396109/'
    result = scraper.scrape_property(url)
    print(result)

