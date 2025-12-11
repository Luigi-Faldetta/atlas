#!/usr/bin/env python3
"""
Test Script for ScrapingBee Enhanced Integration
Tests the complete workflow from screenshot capture to enhanced property analysis
"""

import asyncio
import os
import sys
import time
import json
import logging
from typing import Dict, Any
import httpx
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

load_dotenv()

class ScrapingBeeIntegrationTester:
    """Test the ScrapingBee enhanced integration"""
    
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=180.0)  # 3 minutes timeout
        
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()
    
    async def test_service_health(self) -> bool:
        """Test if the ScrapingBee enhanced service is running"""
        logger.info("🔧 Testing service health...")
        
        try:
            response = await self.client.get(f"{self.base_url}/")
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Service running: {data.get('service', 'Unknown')}")
                logger.info(f"   Features: {', '.join(data.get('features', []))}")
                return True
            else:
                logger.error(f"❌ Service health check failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Service health check failed: {e}")
            return False
    
    async def test_scraper_status(self) -> bool:
        """Test scraper configuration status"""
        logger.info("🔍 Testing scraper status...")
        
        try:
            response = await self.client.get(f"{self.base_url}/api/scraper-status")
            if response.status_code == 200:
                data = response.json()
                logger.info(f"✅ Scraper status: {data.get('status', 'Unknown')}")
                logger.info(f"   API configured: {data.get('api_configured', False)}")
                logger.info(f"   OpenAI configured: {data.get('openai_configured', False)}")
                logger.info(f"   Capabilities: {', '.join(data.get('capabilities', []))}")
                return data.get('status') == 'active'
            else:
                logger.error(f"❌ Scraper status check failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Scraper status check failed: {e}")
            return False
    
    async def test_supported_sites(self) -> bool:
        """Test supported sites endpoint"""
        logger.info("🌍 Testing supported sites...")
        
        try:
            response = await self.client.get(f"{self.base_url}/api/supported-sites")
            if response.status_code == 200:
                data = response.json()
                sites = data.get('supported_sites', {})
                logger.info(f"✅ Supported sites: {len(sites)} sites configured")
                
                for domain, config in sites.items():
                    logger.info(f"   {domain}: {config.get('name', 'Unknown')}")
                    features = config.get('features', {})
                    feature_list = [k for k, v in features.items() if v]
                    if feature_list:
                        logger.info(f"     Features: {', '.join(feature_list)}")
                
                return len(sites) > 0
            else:
                logger.error(f"❌ Supported sites check failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Supported sites check failed: {e}")
            return False
    
    async def test_screenshot_capture(self, test_url: str = "https://www.funda.nl/koop/amsterdam/huis-42513854-aragohof-4-1/") -> bool:
        """Test screenshot capture functionality"""
        logger.info(f"📸 Testing screenshot capture for: {test_url}")
        
        try:
            payload = {
                "url": test_url,
                "capture_type": "full_page",
                "handle_interactions": True
            }
            
            response = await self.client.post(
                f"{self.base_url}/api/capture-screenshot",
                json=payload
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    logger.info("✅ Screenshot captured successfully")
                    
                    metadata = data.get('metadata', {})
                    if metadata:
                        logger.info(f"   Capture type: {metadata.get('capture_type', 'Unknown')}")
                        logger.info(f"   Site detected: {metadata.get('site_detected', 'Unknown')}")
                    
                    # Check if screenshot data is present
                    screenshot_base64 = data.get('screenshot_base64')
                    if screenshot_base64:
                        logger.info(f"   Screenshot size: {len(screenshot_base64)} characters")
                        return True
                    else:
                        logger.warning("⚠️ No screenshot data returned")
                        return False
                else:
                    logger.error(f"❌ Screenshot capture failed: {data.get('error', 'Unknown error')}")
                    return False
            else:
                logger.error(f"❌ Screenshot capture request failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Screenshot capture test failed: {e}")
            return False
    
    async def test_enhanced_analysis(self, test_url: str = "https://www.funda.nl/koop/amsterdam/huis-42513854-aragohof-4-1/") -> bool:
        """Test enhanced property analysis with screenshots"""
        logger.info(f"🎯 Testing enhanced property analysis for: {test_url}")
        
        try:
            payload = {
                "url": test_url,
                "capture_dropdowns": True,
                "handle_popups": True,
                "full_page": True,
                "enhanced_extraction": True
            }
            
            start_time = time.time()
            
            response = await self.client.post(
                f"{self.base_url}/api/analyze-property",
                json=payload
            )
            
            processing_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    logger.info("✅ Enhanced analysis completed successfully")
                    logger.info(f"   Processing time: {processing_time:.2f}s")
                    logger.info(f"   API processing time: {data.get('processing_time', 0):.2f}s")
                    logger.info(f"   Credits used: {data.get('credits_used', 0)}")
                    logger.info(f"   Quality score: {data.get('screenshot_quality_score', 0):.1f}/100")
                    
                    # Check for extracted data
                    property_data = data.get('data', {})
                    if property_data:
                        logger.info("   Extracted property data:")
                        logger.info(f"     Address: {property_data.get('address', 'N/A')}")
                        logger.info(f"     Price: {property_data.get('price', 'N/A')}")
                        logger.info(f"     Size: {property_data.get('size', 'N/A')}")
                        logger.info(f"     Bedrooms: {property_data.get('bedrooms', 'N/A')}")
                        logger.info(f"     Bathrooms: {property_data.get('bathrooms', 'N/A')}")
                        
                        # Check for enhanced features
                        if property_data.get('isEnhancedAnalysis'):
                            logger.info("     🎯 Enhanced analysis features detected")
                            
                        screenshot_metadata = property_data.get('screenshotMetadata', {})
                        if screenshot_metadata:
                            logger.info(f"     Cookies handled: {screenshot_metadata.get('cookies_handled', False)}")
                            logger.info(f"     Dropdowns captured: {screenshot_metadata.get('dropdowns_captured', 0)}")
                        
                        return True
                    else:
                        logger.warning("⚠️ No property data extracted")
                        return False
                else:
                    logger.error(f"❌ Enhanced analysis failed: {data.get('error', 'Unknown error')}")
                    return False
            else:
                logger.error(f"❌ Enhanced analysis request failed: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Enhanced analysis test failed: {e}")
            return False
    
    async def run_all_tests(self, test_url: str = None) -> Dict[str, bool]:
        """Run all integration tests"""
        logger.info("🚀 Starting ScrapingBee Enhanced Integration Tests")
        logger.info("=" * 60)
        
        test_url = test_url or "https://www.funda.nl/koop/amsterdam/huis-42513854-aragohof-4-1/"
        
        results = {}
        
        # Test 1: Service Health
        results['service_health'] = await self.test_service_health()
        
        if not results['service_health']:
            logger.error("❌ Service health check failed - skipping other tests")
            return results
        
        # Test 2: Scraper Status
        results['scraper_status'] = await self.test_scraper_status()
        
        # Test 3: Supported Sites
        results['supported_sites'] = await self.test_supported_sites()
        
        # Test 4: Screenshot Capture
        results['screenshot_capture'] = await self.test_screenshot_capture(test_url)
        
        # Test 5: Enhanced Analysis (only if API keys are configured)
        if os.getenv('SCRAPINGBEE_API_KEY') and os.getenv('OPENAI_API_KEY'):
            results['enhanced_analysis'] = await self.test_enhanced_analysis(test_url)
        else:
            logger.warning("⚠️ Skipping enhanced analysis test - API keys not configured")
            results['enhanced_analysis'] = False
        
        # Summary
        logger.info("=" * 60)
        logger.info("🏁 Test Results Summary:")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, passed_test in results.items():
            status = "✅ PASS" if passed_test else "❌ FAIL"
            logger.info(f"   {test_name}: {status}")
        
        logger.info(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            logger.info("🎉 All tests passed! ScrapingBee integration is working correctly.")
        else:
            logger.warning(f"⚠️ {total - passed} test(s) failed. Check configuration and API keys.")
        
        return results

async def main():
    """Main test runner"""
    # Parse command line arguments
    test_url = sys.argv[1] if len(sys.argv) > 1 else None
    
    # Check environment variables
    required_env_vars = ['SCRAPINGBEE_API_KEY', 'OPENAI_API_KEY']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        logger.warning(f"⚠️ Missing environment variables: {', '.join(missing_vars)}")
        logger.warning("Some tests may be skipped or fail")
    
    # Run tests
    tester = ScrapingBeeIntegrationTester()
    
    try:
        results = await tester.run_all_tests(test_url)
        
        # Exit with appropriate code
        all_passed = all(results.values())
        sys.exit(0 if all_passed else 1)
        
    finally:
        await tester.close()

if __name__ == "__main__":
    asyncio.run(main()) 