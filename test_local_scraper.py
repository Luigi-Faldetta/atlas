#!/usr/bin/env python3
"""
Test script to verify local scraper functionality with translation and analysis features.
This tests the complete pipeline: scraping → translation → investment analysis.
"""

import asyncio
import json
import sys
import os
from datetime import datetime

# Add the ai_agent directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai_agent'))

# Import our modules
from ai_agent.webscraper_requests import scrape_property_data, test_scraper_availability
from ai_agent.language_translator import translate_scraped_property_data
from ai_agent.investment_analyzer import InvestmentAnalyzer
from ai_agent.analysis_coordinator import analyze_property_url

class LocalScraperTester:
    """Test suite for local scraper functionality"""
    
    def __init__(self):
        self.test_urls = {
            'Dutch (Funda)': [
                "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/",
                "https://www.funda.nl/detail/koop/rotterdam/appartement-coolhaven-26-a/44156789/"
            ],
            'Spanish (Idealista)': [
                "https://www.idealista.com/inmueble/103456789/",
                "https://www.idealista.com/en/inmueble/105090633/"
            ],
            'Spanish (Fotocasa)': [
                "https://www.fotocasa.es/es/comprar/vivienda/madrid-capital/aire-acondicionado-calefaccion-terraza-trastero-ascensor-piscina-jardin/162447099/d"
            ]
        }
    
    async def test_scraper_availability(self):
        """Test which scrapers are available"""
        print("🔍 Testing Scraper Availability...")
        print("=" * 50)
        
        try:
            availability = await test_scraper_availability()
            
            for domain, status in availability.items():
                icon = "✅" if status.get('available') else "❌"
                print(f"{icon} {domain}: {status}")
            
            return any(status.get('available') for status in availability.values())
            
        except Exception as e:
            print(f"❌ Error testing scraper availability: {e}")
            return False
    
    async def test_basic_scraping(self):
        """Test basic scraping functionality"""
        print("\n🕷️  Testing Basic Scraping...")
        print("=" * 50)
        
        # Test with a simple URL
        test_url = "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/"
        
        try:
            print(f"Scraping: {test_url}")
            result = await scrape_property_data(test_url)
            
            if 'error' in result:
                print(f"❌ Scraping failed: {result['error']}")
                return False
            else:
                print(f"✅ Scraping successful!")
                print(f"   Address: {result.get('address', 'N/A')}")
                print(f"   Price: {result.get('price', 'N/A')}")
                print(f"   Size: {result.get('size', 'N/A')}")
                print(f"   Scraper used: {result.get('scraper_used', 'N/A')}")
                return True
                
        except Exception as e:
            print(f"❌ Scraping test failed: {e}")
            return False
    
    async def test_translation_features(self):
        """Test translation and data standardization"""
        print("\n🌐 Testing Translation Features...")
        print("=" * 50)
        
        # Mock Dutch property data
        mock_dutch_data = {
            "description": "Prachtig appartement in het centrum van Amsterdam met 2 slaapkamers, balkon en lift.",
            "price": "€ 450.000 k.k.",
            "features": ["badkamer", "slaapkamer", "balkon", "lift"],
            "location": "Centrum Amsterdam, Noord-Holland",
            "property_type": "appartement",
            "address": "Amsterdam, Nederland"
        }
        
        try:
            print("Testing Dutch → English translation...")
            translated_data = translate_scraped_property_data(mock_dutch_data)
            
            print(f"✅ Translation completed!")
            print(f"   Source language: {translated_data.get('source_language', 'N/A')}")
            print(f"   Translation confidence: {translated_data.get('translation_confidence', 0) * 100:.1f}%")
            print(f"   Original price: {mock_dutch_data['price']}")
            print(f"   Standardized price: {translated_data.get('currency_symbol', '€')}{translated_data.get('price_standardized', 0):,.0f}")
            print(f"   Translated description: {translated_data.get('description_translated', 'N/A')[:100]}...")
            
            return True
            
        except Exception as e:
            print(f"❌ Translation test failed: {e}")
            return False
    
    async def test_investment_analysis(self):
        """Test investment analysis functionality"""
        print("\n📊 Testing Investment Analysis...")
        print("=" * 50)
        
        # Sample property data
        sample_data = {
            "price": "€ 450.000",
            "size": 85,
            "bedrooms": 2,
            "bathrooms": 1,
            "address": "Amsterdam, Netherlands",
            "description": "Beautiful apartment in city center",
            "features": ["elevator", "balcony", "parking"],
            "property_type": "apartment"
        }
        
        try:
            analyzer = InvestmentAnalyzer()
            result = await analyzer.analyze_property_investment(sample_data)
            
            if 'error' in result:
                print(f"❌ Investment analysis failed: {result['error']}")
                return False
            else:
                print(f"✅ Investment analysis completed!")
                print(f"   Investment Score: {result.get('investment_score', 'N/A')}/100")
                print(f"   Estimated Rent: €{result.get('estimated_rent', 0):,.0f}/month")
                print(f"   Yearly Yield: {result.get('yearly_yield', 0):.1f}%")
                print(f"   5-Year ROI: {result.get('roi_5_years', 0):.1f}%")
                print(f"   Analysis Type: {result.get('analysis_type', 'N/A')}")
                return True
                
        except Exception as e:
            print(f"❌ Investment analysis test failed: {e}")
            return False
    
    async def test_complete_pipeline(self):
        """Test the complete enhanced pipeline"""
        print("\n🚀 Testing Complete Enhanced Pipeline...")
        print("=" * 50)
        
        test_url = "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/"
        
        try:
            print(f"Running complete analysis for: {test_url}")
            result = await analyze_property_url(test_url)
            
            if 'error' in result:
                print(f"❌ Complete pipeline failed: {result['error']}")
                return False
            else:
                print(f"✅ Complete pipeline successful!")
                
                # Check for translation metadata
                if 'translation_metadata' in result:
                    tm = result['translation_metadata']
                    print(f"   Translation: {tm.get('source_language', 'N/A')} → English")
                    print(f"   Data Accuracy: {tm.get('translation_confidence', 0) * 100:.1f}%")
                    print(f"   Market: {tm.get('market_context', {}).get('market_name', 'N/A')}")
                
                # Check for analysis results
                if 'investment_score' in result:
                    print(f"   Investment Score: {result['investment_score']}/100")
                
                # Check processing metadata
                if 'processing_metadata' in result:
                    pm = result['processing_metadata']
                    print(f"   Processing Time: {pm.get('total_processing_time', 0):.2f}s")
                    print(f"   Version: {pm.get('version', 'N/A')}")
                
                return True
                
        except Exception as e:
            print(f"❌ Complete pipeline test failed: {e}")
            return False
    
    def check_dependencies(self):
        """Check if required dependencies are available"""
        print("📦 Checking Dependencies...")
        print("=" * 50)
        
        dependencies = {
            'OpenAI API Key': os.getenv('OPENAI_API_KEY') is not None,
            'Python asyncio': True,  # Always available in Python 3.7+
        }
        
        for dep, available in dependencies.items():
            icon = "✅" if available else "❌"
            print(f"{icon} {dep}")
        
        return all(dependencies.values())
    
    async def run_all_tests(self):
        """Run all tests and provide summary"""
        print("🧪 Local Scraper Test Suite")
        print("=" * 50)
        print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print()
        
        # Check dependencies first
        deps_ok = self.check_dependencies()
        if not deps_ok:
            print("\n❌ Some dependencies are missing. Tests may fail.")
        
        # Run tests
        tests = [
            ("Scraper Availability", self.test_scraper_availability()),
            ("Basic Scraping", self.test_basic_scraping()),
            ("Translation Features", self.test_translation_features()),
            ("Investment Analysis", self.test_investment_analysis()),
            ("Complete Pipeline", self.test_complete_pipeline())
        ]
        
        results = {}
        for test_name, test_coro in tests:
            try:
                results[test_name] = await test_coro
            except Exception as e:
                print(f"❌ {test_name} crashed: {e}")
                results[test_name] = False
        
        # Summary
        print("\n" + "=" * 50)
        print("📋 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(results.values())
        total = len(results)
        
        for test_name, passed_test in results.items():
            icon = "✅" if passed_test else "❌"
            print(f"{icon} {test_name}")
        
        print(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Local scraper is working correctly.")
            return True
        else:
            print(f"⚠️  {total - passed} test(s) failed. Check the output above for details.")
            return False

async def main():
    """Main test function"""
    tester = LocalScraperTester()
    success = await tester.run_all_tests()
    
    if success:
        print("\n✅ Local scraper setup is working correctly!")
        print("You can proceed with local development before pushing to Vercel/Docker.")
    else:
        print("\n❌ There are issues with the local setup.")
        print("Please check the error messages above and fix any issues.")
    
    return success

if __name__ == "__main__":
    # Run the test suite
    try:
        result = asyncio.run(main())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test suite crashed: {e}")
        sys.exit(1) 