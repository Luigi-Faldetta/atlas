#!/usr/bin/env python3
"""
Test script for the updated Habitaclia scraper.
This script tests the scraper against real Habitaclia property URLs to validate
the extraction logic based on the actual HTML structure.
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

# Add the ai_agent directory to the path
sys.path.append(str(Path(__file__).parent / "ai_agent"))

from habitaclia_scraper import HabitacliaScraper


async def test_habitaclia_scraper():
    """Test the Habitaclia scraper with real property URLs"""
    
    # Configure detailed logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('habitaclia_scraper_test.log')
        ]
    )
    
    logger = logging.getLogger(__name__)
    
    # Test URLs - you can replace these with actual Habitaclia property URLs
    test_urls = [
        # Add real Habitaclia property URLs here for testing
        # Example format: "https://www.habitaclia.com/vivienda-barcelona-12345.htm"
        "https://www.habitaclia.com/comprar-piso-amplio_exterior_y_esquinero_con_garaje_cerca_de_la_ctra_de_pego_oliva_pueblo-oliva-i8137003995980.htm?f=&geo=p&from=list&lo=55"
    ]
    
    # If no test URLs provided, create some example patterns
    if not test_urls:
        logger.warning("No test URLs provided. Please add real Habitaclia property URLs to test_urls list.")
        logger.info("Example URL patterns:")
        logger.info("- https://www.habitaclia.com/vivienda-barcelona-12345.htm")
        logger.info("- https://www.habitaclia.com/piso-madrid-67890.htm")
        return
    
    # Initialize the scraper
    scraper = HabitacliaScraper()
    
    try:
        logger.info("Starting Habitaclia scraper test...")
        await scraper.start()
        
        successful_scrapes = 0
        failed_scrapes = 0
        
        for i, url in enumerate(test_urls, 1):
            logger.info(f"\n{'='*60}")
            logger.info(f"Testing URL {i}/{len(test_urls)}: {url}")
            logger.info(f"{'='*60}")
            
            try:
                # Scrape the property
                result = await scraper.scrape_property(url)
                
                if result:
                    successful_scrapes += 1
                    logger.info("✅ Scraping successful!")
                    
                    # Display the extracted data
                    print(f"\n🏠 Property Data for {url}:")
                    print("-" * 50)
                    
                    for key, value in result.items():
                        print(f"{key:15}: {value}")
                    
                    # Validate key fields
                    validation_results = []
                    required_fields = ["Price", "Address", "Living Area", "Bedrooms", "Bathrooms"]
                    
                    for field in required_fields:
                        if result.get(field) and result[field] != "Not found":
                            validation_results.append(f"✅ {field}: Found")
                        else:
                            validation_results.append(f"❌ {field}: Missing")
                    
                    print(f"\n📊 Validation Results:")
                    print("-" * 30)
                    for validation in validation_results:
                        print(validation)
                        
                else:
                    failed_scrapes += 1
                    logger.error(f"❌ Failed to scrape property from {url}")
                    
            except Exception as e:
                failed_scrapes += 1
                logger.error(f"❌ Error processing {url}: {e}", exc_info=True)
            
            # Add delay between requests to be respectful
            if i < len(test_urls):
                logger.info("Waiting 3 seconds before next request...")
                await asyncio.sleep(3)
        
        # Summary
        total = len(test_urls)
        success_rate = (successful_scrapes / total * 100) if total > 0 else 0
        
        print(f"\n{'='*60}")
        print(f"📈 SCRAPING SUMMARY")
        print(f"{'='*60}")
        print(f"Total URLs tested: {total}")
        print(f"Successful scrapes: {successful_scrapes}")
        print(f"Failed scrapes: {failed_scrapes}")
        print(f"Success rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 Scraper is working well!")
        elif success_rate >= 50:
            print("⚠️ Scraper needs some improvements")
        else:
            print("❌ Scraper needs significant fixes")
            
    except Exception as e:
        logger.error(f"Fatal error during testing: {e}", exc_info=True)
        
    finally:
        logger.info("Closing scraper...")
        await scraper.close()
        logger.info("Test completed.")


def add_test_url():
    """Helper function to add a test URL to this script"""
    print("To test the scraper with a real Habitaclia URL:")
    print("1. Find a property on habitaclia.com")
    print("2. Copy the property URL")
    print("3. Add it to the test_urls list in this script")
    print("4. Run the script again")
    print()
    print("Example URL format:")
    print("https://www.habitaclia.com/vivienda-barcelona-12345.htm")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        add_test_url()
    else:
        asyncio.run(test_habitaclia_scraper()) 