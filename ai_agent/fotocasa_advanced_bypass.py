#!/usr/bin/env python3
"""
Advanced Fotocasa Bypass Strategy - Agentic AI Anti-Detection
Implements sophisticated evasion techniques for 403 Forbidden bypassing
"""

import asyncio
import random
import time
import os
import json
import base64
from typing import Dict, Any, Optional, List
from playwright.async_api import async_playwright, Page, BrowserContext
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FotocasaAdvancedBypass:
    """Advanced agentic AI strategy for bypassing fotocasa 403 protection"""
    
    def __init__(self):
        self.proxy_config = self._get_proxy_config()
        self.browser = None
        self.context = None
        self.page = None
        self.session_cookies = {}
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
        
    def _get_proxy_config(self):
        """Get proxy configuration with enhanced session management"""
        if os.getenv('PROXY_ENABLED', 'false').lower() != 'true':
            return None
            
        # Use session-based proxy for consistent IP
        session_id = f"atlas_{int(time.time())}"
        proxy_username = f"{os.getenv('PROXY_USERNAME')}-session-{session_id}"
        
        return {
            "server": f"http://{os.getenv('PROXY_SERVER')}",
            "username": proxy_username,
            "password": os.getenv('PROXY_PASSWORD')
        }
    
    async def start_browser_stealth(self):
        """Initialize browser with maximum stealth capabilities"""
        self.playwright = await async_playwright().start()
        
        # Enhanced stealth arguments
        stealth_args = [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=VizDisplayCompositor,WebAssembly',
            '--disable-extensions',
            '--disable-plugins-discovery',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
            '--disable-component-extensions-with-background-pages',
            '--disable-ipc-flooding-protection',
            '--window-size=1366,768',
            '--start-maximized'
        ]
        
        launch_options = {
            "headless": True,
            "args": stealth_args,
            "slow_mo": random.randint(50, 150)  # Random delays
        }
        
        if self.proxy_config:
            launch_options["proxy"] = self.proxy_config
            logger.info(f"🔒 Using session-based Spanish proxy: {self.proxy_config['username']}")
        
        self.browser = await self.playwright.chromium.launch(**launch_options)
        
        # Create stealth context
        await self._create_stealth_context()
        
    async def _create_stealth_context(self):
        """Create browser context with realistic Spanish user profile"""
        
        # Random realistic Spanish viewport
        viewports = [
            {'width': 1366, 'height': 768},
            {'width': 1920, 'height': 1080},
            {'width': 1440, 'height': 900},
            {'width': 1280, 'height': 720}
        ]
        
        viewport = random.choice(viewports)
        user_agent = random.choice(self.user_agents)
        
        context_options = {
            'locale': 'es-ES',
            'timezone_id': 'Europe/Madrid',
            'viewport': viewport,
            'user_agent': user_agent,
            'device_scale_factor': random.uniform(1.0, 2.0),
            'is_mobile': False,
            'has_touch': False,
            'color_scheme': 'light',
            'extra_http_headers': {
                'Accept-Language': 'es-ES,es;q=0.9,en-US;q=0.8,en;q=0.7',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Cache-Control': 'max-age=0',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
        }
        
        self.context = await self.browser.new_context(**context_options)
        
        # Advanced stealth scripts
        await self.context.add_init_script("""
            // Remove webdriver traces
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
            
            // Mock chrome runtime
            window.chrome = {
                runtime: {
                    onConnect: undefined,
                    onMessage: undefined
                }
            };
            
            // Override permissions API
            const originalQuery = window.navigator.permissions.query;
            window.navigator.permissions.query = (parameters) => (
                parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
            );
            
            // Mock plugins
            Object.defineProperty(navigator, 'plugins', {
                get: () => [
                    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
                    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai' },
                    { name: 'Native Client', filename: 'internal-nacl-plugin' }
                ],
            });
            
            // Mock languages
            Object.defineProperty(navigator, 'languages', {
                get: () => ['es-ES', 'es', 'en-US', 'en'],
            });
            
            // Override getTimezoneOffset
            Date.prototype.getTimezoneOffset = function() {
                return -60; // Madrid timezone
            };
            
            // Mock battery API
            Object.defineProperty(navigator, 'getBattery', {
                get: () => () => Promise.resolve({
                    level: 0.8 + Math.random() * 0.2,
                    charging: Math.random() > 0.5,
                    chargingTime: Infinity,
                    dischargingTime: 3600 + Math.random() * 7200
                })
            });
        """)
        
        self.page = await self.context.new_page()
        
        # Block tracking and fingerprinting requests
        await self._setup_request_interception()
        
    async def _setup_request_interception(self):
        """Setup intelligent request blocking and modification"""
        
        blocked_domains = [
            'google-analytics.com', 'googletagmanager.com', 'doubleclick.net',
            'hotjar.com', 'segment.com', 'mixpanel.com', 'amplitude.com',
            'facebook.com', 'connect.facebook.net', 'fbcdn.net'
        ]
        
        async def handle_route(route):
            url = route.request.url
            
            # Block tracking requests
            if any(domain in url for domain in blocked_domains):
                await route.abort()
                return
            
            # Add realistic headers to requests
            headers = route.request.headers
            headers.update({
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            })
            
            await route.continue_(headers=headers)
        
        await self.page.route("**/*", handle_route)
    
    async def establish_session(self) -> bool:
        """Establish a valid session with fotocasa through natural browsing"""
        try:
            logger.info("🏠 Establishing stealth session with fotocasa...")
            
            # Step 1: Visit homepage with random delay
            await self.page.goto("https://www.fotocasa.es", 
                                wait_until="domcontentloaded", 
                                timeout=30000)
            
            # Human-like delay
            await asyncio.sleep(random.uniform(2, 5))
            
            # Step 2: Simulate mouse movement and scrolling
            await self._simulate_human_behavior()
            
            # Step 3: Handle cookie consent
            await self._handle_cookie_consent()
            
            # Step 4: Browse a few listings to establish credibility
            await self._browse_listings_naturally()
            
            # Store session cookies
            cookies = await self.context.cookies()
            self.session_cookies = {cookie['name']: cookie['value'] for cookie in cookies}
            
            logger.info(f"✅ Session established with {len(self.session_cookies)} cookies")
            return True
            
        except Exception as e:
            logger.error(f"❌ Session establishment failed: {e}")
            return False
    
    async def _simulate_human_behavior(self):
        """Simulate realistic human browsing patterns"""
        
        # Random mouse movements
        for _ in range(3):
            x = random.randint(100, 800)
            y = random.randint(100, 600)
            await self.page.mouse.move(x, y)
            await asyncio.sleep(random.uniform(0.1, 0.3))
        
        # Scroll naturally
        for _ in range(random.randint(2, 5)):
            await self.page.mouse.wheel(0, random.randint(100, 300))
            await asyncio.sleep(random.uniform(0.5, 1.5))
    
    async def _handle_cookie_consent(self):
        """Handle cookie consent banner intelligently"""
        
        cookie_selectors = [
            'button:has-text("Aceptar")',
            'button:has-text("Accept")', 
            'button:has-text("Acepto")',
            '[id*="accept"]',
            '[class*="accept"]',
            '.cookie-accept',
            '#cookieAccept'
        ]
        
        for selector in cookie_selectors:
            try:
                element = await self.page.query_selector(selector)
                if element:
                    await element.click()
                    logger.info("✅ Cookie consent accepted")
                    await asyncio.sleep(random.uniform(1, 2))
                    return
            except:
                continue
        
        logger.info("⚠️ No cookie banner found")
    
    async def _browse_listings_naturally(self):
        """Browse some listings to establish natural user behavior"""
        
        try:
            # Look for property links
            property_links = await self.page.query_selector_all('a[href*="/comprar/"]')
            
            if property_links and len(property_links) > 0:
                # Visit 1-2 random properties
                for _ in range(min(2, len(property_links))):
                    random_link = random.choice(property_links)
                    href = await random_link.get_attribute('href')
                    
                    if href:
                        logger.info(f"📍 Browsing: {href[:50]}...")
                        await self.page.goto(f"https://www.fotocasa.es{href}", 
                                           wait_until="domcontentloaded", 
                                           timeout=20000)
                        
                        # Stay on page briefly
                        await asyncio.sleep(random.uniform(3, 8))
                        
                        # Scroll a bit
                        await self.page.mouse.wheel(0, random.randint(200, 500))
                        await asyncio.sleep(random.uniform(1, 3))
            
        except Exception as e:
            logger.warning(f"Natural browsing failed: {e}")
    
    async def access_property_stealth(self, property_url: str) -> Dict[str, Any]:
        """Access specific property with maximum stealth"""
        
        try:
            # Ensure session is established
            if not self.session_cookies:
                session_ok = await self.establish_session()
                if not session_ok:
                    return {"error": "Failed to establish session", "success": False}
            
            logger.info(f"🎯 Accessing property with stealth: {property_url}")
            
            # Navigate with referrer
            await self.page.goto(property_url, 
                                wait_until="networkidle", 
                                timeout=30000,
                                referer="https://www.fotocasa.es/")
            
            # Check response status
            response = await self.page.evaluate("() => ({ status: window.performance?.navigation?.type || 0 })")
            
            # Detect protection pages
            content = await self.page.content()
            
            if self._is_blocked_page(content):
                return await self._handle_protection_page(property_url)
            
            # Extract property data if successful
            await asyncio.sleep(random.uniform(2, 4))
            property_data = await self._extract_property_data_advanced()
            
            return {
                "success": True,
                "property_data": property_data,
                "session_cookies": len(self.session_cookies),
                "page_url": self.page.url
            }
            
        except Exception as e:
            logger.error(f"❌ Stealth access failed: {e}")
            return {"error": str(e), "success": False}
    
    def _is_blocked_page(self, content: str) -> bool:
        """Detect if page shows blocking/protection message"""
        
        blocking_indicators = [
            'sentimos la interrupción', 'acceso restringido', 'access restricted',
            'cookies deshabilitadas', 'blocked', 'forbidden', '403', 'captcha',
            'verificación', 'security check', 'robot', 'bot detected'
        ]
        
        content_lower = content.lower()
        return any(indicator in content_lower for indicator in blocking_indicators)
    
    async def _handle_protection_page(self, original_url: str) -> Dict[str, Any]:
        """Handle protection/CAPTCHA pages intelligently"""
        
        logger.warning("🛡️ Protection page detected - attempting bypass...")
        
        # Wait and retry with different approach
        await asyncio.sleep(random.uniform(10, 20))
        
        # Try refreshing with different user agent
        await self.context.close()
        await self._create_stealth_context()
        
        # Re-establish session
        await self.establish_session()
        
        # Try accessing again
        await self.page.goto(original_url, wait_until="domcontentloaded", timeout=30000)
        
        content = await self.page.content()
        if self._is_blocked_page(content):
            return {
                "error": "Property blocked by anti-bot protection",
                "success": False,
                "requires_manual": True
            }
        
        # If successful, extract data
        property_data = await self._extract_property_data_advanced()
        return {
            "success": True,
            "property_data": property_data,
            "bypass_successful": True
        }
    
    async def _extract_property_data_advanced(self) -> Dict[str, Any]:
        """Advanced property data extraction with multiple strategies"""
        
        data = {}
        
        # Enhanced selectors for fotocasa
        extraction_rules = {
            'price': [
                '.fc-Price', '.price-container', '[data-testid="price"]',
                '.re-DetailHeader-price', '.detail-info-price'
            ],
            'address': [
                '.fc-PropertyLocation', '[data-testid="address"]',
                '.re-DetailHeader-location', '.property-location'
            ],
            'features': [
                '.fc-PropertyFeatures .fc-PropertyFeatures__item',
                '.re-DetailPropertyFeatures-list .re-DetailPropertyFeatures-item',
                '.property-features .feature-item'
            ]
        }
        
        for field, selectors in extraction_rules.items():
            for selector in selectors:
                try:
                    if field == 'features':
                        elements = await self.page.query_selector_all(selector)
                        features = []
                        for element in elements:
                            text = await element.inner_text()
                            if text.strip():
                                features.append(text.strip())
                        if features:
                            data[field] = features
                            break
                    else:
                        element = await self.page.query_selector(selector)
                        if element:
                            text = await element.inner_text()
                            if text.strip():
                                data[field] = text.strip()
                                break
                except:
                    continue
        
        # Additional metadata
        data['extraction_timestamp'] = time.time()
        data['user_agent'] = await self.page.evaluate('navigator.userAgent')
        data['viewport'] = await self.page.evaluate('({width: window.innerWidth, height: window.innerHeight})')
        
        return data
    
    async def close(self):
        """Clean up browser resources"""
        try:
            if self.context:
                await self.context.close()
            if self.browser:
                await self.browser.close()
            if self.playwright:
                await self.playwright.stop()
        except:
            pass

# Test function
async def test_advanced_bypass():
    """Test the advanced bypass strategy"""
    
    bypass = FotocasaAdvancedBypass()
    
    try:
        await bypass.start_browser_stealth()
        
        test_url = "https://www.fotocasa.es/es/comprar/vivienda/barcelona-capital/la-guineueta/186640774/d"
        
        result = await bypass.access_property_stealth(test_url)
        
        logger.info(f"🎯 Advanced bypass result: {result}")
        return result
        
    finally:
        await bypass.close()

if __name__ == "__main__":
    asyncio.run(test_advanced_bypass()) 