#!/usr/bin/env python3
"""
Test Web Unlocker Proxy with Atlas Visual Scraper
"""

import os
import asyncio
import sys
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import Atlas scrapers
from visual_scraper import VisualPropertyScraper
from fotocasa_advanced_bypass import FotocasaAdvancedBypass

async def test_web_unlocker_proxy():
    """Test Web Unlocker proxy with Spanish real estate sites"""
    
    print("🔓 ATLAS WEB UNLOCKER PROXY TEST")
    print("=" * 50)
    
    # Check proxy configuration
    proxy_enabled = os.getenv('PROXY_ENABLED', 'false').lower() == 'true'
    proxy_type = os.getenv('PROXY_TYPE', 'datacenter')
    proxy_server = os.getenv('PROXY_SERVER')
    proxy_username = os.getenv('PROXY_USERNAME')
    proxy_password = os.getenv('PROXY_PASSWORD')
    
    print(f"📊 Proxy Status: {'✅ Enabled' if proxy_enabled else '❌ Disabled'}")
    print(f"📊 Proxy Type: {proxy_type}")
    print(f"📊 Proxy Server: {proxy_server}")
    print("")
    
    if not proxy_enabled:
        print("❌ Proxy not enabled. Please check .env configuration.")
        return
    
    # Test 0: Simple HTTP request through Web Unlocker
    print("🧪 TEST 0: Direct HTTP Request with Web Unlocker")
    print("-" * 40)
    
    try:
        proxy_config = {
            "http": f"http://{proxy_username}:{proxy_password}@{proxy_server}",
            "https": f"http://{proxy_username}:{proxy_password}@{proxy_server}"
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate'
        }
        
        response = requests.get(
            "https://www.fotocasa.es/",
            proxies=proxy_config,
            headers=headers,
            timeout=30,
            verify=False  # Ignore SSL errors
        )
        
        print(f"✅ HTTP Request successful: {response.status_code}")
        print(f"   Content length: {len(response.content)} bytes")
        print(f"   Response headers: {dict(list(response.headers.items())[:3])}")
        
        if "fotocasa" in response.text.lower():
            print("✅ Fotocasa content detected - proxy working!")
        else:
            print("⚠️ Unexpected content - may be blocked")
            
    except Exception as e:
        print(f"❌ HTTP request failed: {e}")
    
    print("")
    
    # Test 1: Basic Visual Scraper with Web Unlocker
    print("🧪 TEST 1: Visual Scraper with Web Unlocker")
    print("-" * 40)
    
    scraper = VisualPropertyScraper()
    test_url = "https://www.fotocasa.es/es/comprar/vivienda/barcelona-capital/la-guineueta/186640774/d"
    
    try:
        await scraper.start(headless=True)
        result = await scraper.scrape_property_comprehensive(test_url)
        
        print(f"✅ Scraping completed")
        print(f"   Address: {result.address or 'Not found'}")
        print(f"   Price: {result.price or 'Not found'}")
        print(f"   Completeness: {result.data_completeness_score}%")
        
    except Exception as e:
        print(f"❌ Visual scraper error: {e}")
    finally:
        await scraper.close()
    
    print("")
    
    # Test 2: Advanced Bypass Strategy
    print("🧪 TEST 2: Advanced Bypass with Web Unlocker")
    print("-" * 40)
    
    bypass = FotocasaAdvancedBypass()
    
    try:
        await bypass.start_browser_stealth()
        result = await bypass.access_property_stealth(test_url)
        
        if result.get('success'):
            print("✅ Advanced bypass successful")
            print(f"   Property data: {result.get('property_data', {})}")
        else:
            print(f"❌ Advanced bypass failed: {result.get('error')}")
            
    except Exception as e:
        print(f"❌ Advanced bypass error: {e}")
    finally:
        await bypass.close()
    
    print("")
    print("🎯 WEB UNLOCKER PROXY TEST COMPLETED")

if __name__ == "__main__":
    asyncio.run(test_web_unlocker_proxy()) 