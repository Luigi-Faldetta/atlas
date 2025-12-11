#!/usr/bin/env python3
import asyncio
from scrapingbee_enhanced_scraper import ScrapingBeeEnhancedScraper
import json

async def test_funda_scraper():
    """Test the Funda scraper with the problematic URL"""
    
    scraper = ScrapingBeeEnhancedScraper()
    url = 'https://www.funda.nl/detail/koop/bemmel/huis-vossenhol-16/89281255/'
    
    print(f"🔍 Testing Funda URL: {url}")
    print("=" * 60)
    
    # 1. Test site detection
    print("1. Detecting site configuration...")
    site_config = scraper._detect_site_config(url)
    if site_config:
        print(f"   ✅ Site detected: {site_config['name']}")
        print(f"   Cookie selectors: {len(site_config.get('cookie_selectors', []))}")
        print(f"   Dropdown selectors: {len(site_config.get('dropdown_selectors', []))}")
        print(f"   Wait elements: {site_config.get('wait_for_elements', [])}")
    else:
        print("   ❌ Site not recognized - using generic configuration")
    
    # 2. Test basic screenshot capture
    print("\n2. Testing basic screenshot capture...")
    try:
        result = await scraper.scrape_property_with_screenshots(
            url=url,
            capture_dropdowns=False,  # Start simple
            handle_popups=True,
            full_page=False
        )
        
        print(f"   ✅ Screenshot capture successful!")
        print(f"   Screenshot quality: {result.screenshot_quality_score:.1f}/100")
        print(f"   Processing time: {result.total_processing_time:.2f}s")
        print(f"   Credits used: {result.scrapingbee_credits_used}")
        
        # 3. Check extracted data
        print("\n3. Extracted property data:")
        print(f"   Address: {result.address or 'Not found'}")
        print(f"   Price: {result.price or 'Not found'}")
        print(f"   Size: {result.size or 'Not found'} m²")
        print(f"   Bedrooms: {result.bedrooms or 'Not found'}")
        print(f"   Bathrooms: {result.bathrooms or 'Not found'}")
        print(f"   Year built: {result.year_built or 'Not found'}")
        print(f"   Building type: {result.building_type or 'Not found'}")
        
        # 4. Check enhanced features
        print("\n4. Enhanced features:")
        print(f"   Description length: {len(result.description or '') if result.description else 0} chars")
        print(f"   Features count: {len(result.features or [])}")
        print(f"   Property images: {len(result.property_images or [])}")
        print(f"   Cookies accepted: {result.cookies_accepted}")
        
        if result.features:
            print(f"   Features: {', '.join(result.features[:5])}...")
        
        # 5. Check for data quality issues
        print("\n5. Data quality analysis:")
        issues = []
        
        if not result.address or result.address == "Not found":
            issues.append("Address extraction failed")
        if not result.price or result.price == "Not found":
            issues.append("Price extraction failed")
        if not result.size:
            issues.append("Size extraction failed")
        if result.screenshot_quality_score < 50:
            issues.append(f"Low screenshot quality ({result.screenshot_quality_score:.1f}/100)")
        
        if issues:
            print("   ⚠️ Issues found:")
            for issue in issues:
                print(f"     - {issue}")
        else:
            print("   ✅ No major quality issues detected")
        
        # 6. Save detailed result for debugging
        result_dict = {
            "url": url,
            "address": result.address,
            "price": result.price,
            "size": result.size,
            "bedrooms": result.bedrooms,
            "bathrooms": result.bathrooms,
            "year_built": result.year_built,
            "building_type": result.building_type,
            "description": result.description[:200] + "..." if result.description and len(result.description) > 200 else result.description,
            "features": result.features,
            "screenshot_quality_score": result.screenshot_quality_score,
            "processing_time": result.total_processing_time,
            "credits_used": result.scrapingbee_credits_used,
            "cookies_accepted": result.cookies_accepted,
            "potential_issues": result.potential_issues,
            "extraction_reasoning": result.extraction_reasoning[:300] + "..." if result.extraction_reasoning and len(result.extraction_reasoning) > 300 else result.extraction_reasoning
        }
        
        with open('funda_test_result.json', 'w', encoding='utf-8') as f:
            json.dump(result_dict, f, indent=2, ensure_ascii=False)
        
        print(f"\n📄 Detailed results saved to: funda_test_result.json")
        
    except Exception as e:
        print(f"   ❌ Error occurred: {e}")
        print(f"   Error type: {type(e).__name__}")
        
        # Try to get more details about the error
        if hasattr(e, 'response'):
            print(f"   HTTP Status: {getattr(e.response, 'status_code', 'N/A')}")
        
    finally:
        await scraper.close()
        print("\n🔚 Test completed")

if __name__ == "__main__":
    asyncio.run(test_funda_scraper()) 