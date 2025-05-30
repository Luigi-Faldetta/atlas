#!/usr/bin/env python3
"""
Enhanced Fotocasa Scraping Strategy with Datacenter Proxy
Implements agentic AI patterns for bypassing protection measures
"""

import asyncio
import random
import time
import os
from typing import Dict, Any, Optional
from playwright.async_api import async_playwright
from dotenv import load_dotenv

load_dotenv()

class FotocasaEnhancedStrategy:
    """Agentic AI strategy for fotocasa with datacenter proxy and anti-detection"""
    
    def __init__(self):
        self.proxy_config = self._get_proxy_config()
        self.browser = None
        self.context = None
        self.page = None
        
    def _get_proxy_config(self):
        """Get proxy configuration for Spanish datacenter"""
        if os.getenv('PROXY_ENABLED', 'false').lower() != 'true':
            return None
            
        return {
            "server": f"http://{os.getenv('PROXY_SERVER')}",
            "username": os.getenv('PROXY_USERNAME'),
            "password": os.getenv('PROXY_PASSWORD')
        }
    
    async def start_browser(self):
        """Initialize browser with Spanish datacenter proxy and anti-detection"""
        self.playwright = await async_playwright().start()
        
        # Spanish browser fingerprint
        browser_args = [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=VizDisplayCompositor',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            '--accept-lang=es-ES,es;q=0.9,en;q=0.8'
        ]
        
        launch_options = {
            "headless": True,
            "args": browser_args
        }
        
        if self.proxy_config:
            launch_options["proxy"] = self.proxy_config
            print(f"🇪🇸 Using Spanish datacenter proxy: {self.proxy_config['server']}")
        
        self.browser = await self.playwright.chromium.launch(**launch_options)
        
        # Spanish context with realistic session
        self.context = await self.browser.new_context(
            locale='es-ES',
            timezone_id='Europe/Madrid',
            viewport={'width': 1366, 'height': 768},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            extra_http_headers={
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'DNT': '1',
                'Upgrade-Insecure-Requests': '1'
            }
        )
        
        # Remove automation indicators
        await self.context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            window.chrome = {
                runtime: {},
            };
            
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5],
            });
        """)
        
        self.page = await self.context.new_page()
        
        # Block some tracking requests for faster loading
        await self.page.route("**/*", lambda route: (
            route.abort() if any(tracker in route.request.url for tracker in [
                'google-analytics', 'googletagmanager', 'hotjar', 'segment'
            ]) else route.continue_()
        ))
    
    async def navigate_to_property(self, url: str) -> Dict[str, Any]:
        """Navigate to property with human-like behavior"""
        try:
            # First visit fotocasa homepage to establish session
            print("🏠 Establishing session with fotocasa.es...")
            await self.page.goto("https://www.fotocasa.es", wait_until="networkidle", timeout=30000)
            
            # Random delay to simulate human behavior
            await asyncio.sleep(random.uniform(2, 5))
            
            # Accept cookies if present
            try:
                await self.page.click('button:has-text("Aceptar")', timeout=3000)
                print("✅ Cookies accepted")
            except:
                print("⚠️ No cookie banner found")
            
            # Navigate to property page
            print(f"📍 Navigating to property: {url}")
            response = await self.page.goto(url, wait_until="networkidle", timeout=30000)
            
            # Check if page loaded successfully
            if response.status != 200:
                return {"error": f"HTTP {response.status}", "success": False}
            
            # Wait for content to load
            await asyncio.sleep(3)
            
            # Check for access restrictions
            content = await self.page.content()
            
            if any(phrase in content.lower() for phrase in [
                'sentimos la interrupción', 'acceso restringido', 'cookies deshabilitadas',
                'access restricted', 'timeout', 'blocked'
            ]):
                return {"error": "Access restricted by fotocasa", "success": False}
            
            # Take screenshot for AI analysis
            screenshot = await self.page.screenshot(full_page=True)
            
            # Extract basic data from page
            property_data = await self._extract_property_data()
            
            return {
                "success": True,
                "screenshot": screenshot,
                "property_data": property_data,
                "page_url": self.page.url
            }
            
        except Exception as e:
            return {"error": str(e), "success": False}
    
    async def _extract_property_data(self) -> Dict[str, Any]:
        """Extract property data using multiple selectors"""
        data = {}
        
        try:
            # Price extraction
            price_selectors = [
                '[data-testid="property-price"]',
                '.price-container .price',
                '.detail-header__price',
                '.fc-MainPrice'
            ]
            
            for selector in price_selectors:
                try:
                    price_element = await self.page.query_selector(selector)
                    if price_element:
                        data['price'] = await price_element.inner_text()
                        break
                except:
                    continue
            
            # Address extraction
            address_selectors = [
                '[data-testid="property-address"]',
                '.detail-header__address',
                '.fc-PropertyLocation'
            ]
            
            for selector in address_selectors:
                try:
                    address_element = await self.page.query_selector(selector)
                    if address_element:
                        data['address'] = await address_element.inner_text()
                        break
                except:
                    continue
            
            # Property details
            details_selectors = [
                '.fc-PropertyFeatures__item',
                '.detail-property__features .feature',
                '.property-features .feature-item'
            ]
            
            features = []
            for selector in details_selectors:
                try:
                    elements = await self.page.query_selector_all(selector)
                    for element in elements:
                        text = await element.inner_text()
                        features.append(text.strip())
                except:
                    continue
            
            data['features'] = features
            
        except Exception as e:
            print(f"Error extracting property data: {e}")
        
        return data
    
    async def close(self):
        """Clean up browser resources"""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()

async def test_fotocasa_strategy():
    """Test the enhanced fotocasa strategy"""
    strategy = FotocasaEnhancedStrategy()
    
    try:
        await strategy.start_browser()
        
        result = await strategy.navigate_to_property(
            "https://www.fotocasa.es/es/comprar/vivienda/madrid/capital/tetuan/cuenca/218965"
        )
        
        print(f"✅ Strategy result: {result.get('success', False)}")
        if result.get('property_data'):
            print(f"🏠 Property data: {result['property_data']}")
        
        return result
        
    finally:
        await strategy.close()

if __name__ == "__main__":
    asyncio.run(test_fotocasa_strategy()) 