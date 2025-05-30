#!/usr/bin/env python3
"""
Atlas Comprehensive Test Execution Script
Following Atlas Master Agent Rules for systematic validation

This script executes the comprehensive testing framework to validate:
- InvestmentAnalysis.tsx metrics integration 
- Visual Scraper data extraction accuracy
- Translation quality for Dutch and Spanish content
- Frontend data integration with 95% accuracy target
"""

import asyncio
import json
import time
from datetime import datetime
import sys
import os

# Import the testing framework
from comprehensive_metrics_tester import (
    AtlasMetricsTester, 
    ComprehensiveTestSuite,
    TestMetrics
)

def create_test_configuration() -> ComprehensiveTestSuite:
    """
    Create comprehensive test configuration for real property platforms
    
    Using real URLs from major European real estate platforms:
    - Funda (Netherlands) - Dutch language
    - Idealista (Spain) - Spanish language
    - Fotocasa (Spain) - Spanish language with advanced protection
    - Habitaclia (Spain) - Spanish language
    """
    
    # Real test URLs for comprehensive validation
    test_suite = ComprehensiveTestSuite(
        funda_test_urls=[
            # Amsterdam properties (Dutch language)
            "https://www.funda.nl/koop/amsterdam/huis-49542649/",
            "https://www.funda.nl/koop/amsterdam/appartement-49546789/",
        ],
        idealista_test_urls=[
            # Madrid/Barcelona properties (Spanish language)
            "https://www.idealista.com/inmueble/100653458/",
            "https://www.idealista.com/inmueble/100653459/",
        ],
        fotocasa_test_urls=[
            # Barcelona properties (Spanish language with protection)
            "https://www.fotocasa.es/es/comprar/vivienda/barcelona-capital/la-guineueta/186640774/d",
            "https://www.fotocasa.es/es/comprar/vivienda/barcelona-capital/guinardo/186641000/d"
        ],
        habitaclia_test_urls=[
            # Barcelona properties (Spanish language)
            "https://www.habitaclia.com/vivienda-barcelona-gracia-86-m2-3-habitaciones-1-bano-piso-en-venta-1749378.htm"
        ],
        
        # Enhanced accuracy requirements
        minimum_accuracy_threshold=0.95,  # 95% as specified in requirements
        translation_accuracy_threshold=0.92,
        extraction_completeness_threshold=0.88,
        
        # Enable all validation features
        enable_screenshot_validation=True,
        enable_translation_validation=True,
        enable_performance_benchmarking=True,
        enable_comparative_analysis=True
    )
    
    return test_suite

async def execute_comprehensive_test() -> dict:
    """
    Execute comprehensive testing with detailed progress reporting
    
    Chain-of-thought execution:
    1. Initialize testing environment
    2. Create test configuration
    3. Execute comprehensive test suite
    4. Generate detailed analysis report
    5. Validate 95% accuracy requirement
    6. Provide improvement recommendations
    """
    
    print("🎯 ATLAS COMPREHENSIVE METRICS TESTING")
    print("=" * 60)
    print("Following Atlas Master Agent Rules for systematic validation")
    print("Target: 95% accuracy across all platforms and metrics")
    print()
    
    start_time = time.time()
    
    try:
        # STEP 1: Initialize testing framework
        print("📋 STEP 1: Initializing Atlas Metrics Tester...")
        tester = AtlasMetricsTester()
        
        # STEP 2: Create comprehensive test configuration
        print("⚙️ STEP 2: Creating comprehensive test configuration...")
        test_suite = create_test_configuration()
        
        total_urls = (
            len(test_suite.funda_test_urls or []) +
            len(test_suite.idealista_test_urls or []) +
            len(test_suite.fotocasa_test_urls or []) +
            len(test_suite.habitaclia_test_urls or [])
        )
        
        print(f"📊 Test Configuration:")
        print(f"   • Funda URLs: {len(test_suite.funda_test_urls or [])}")
        print(f"   • Idealista URLs: {len(test_suite.idealista_test_urls or [])}")
        print(f"   • Fotocasa URLs: {len(test_suite.fotocasa_test_urls or [])}")
        print(f"   • Habitaclia URLs: {len(test_suite.habitaclia_test_urls or [])}")
        print(f"   • Total URLs: {total_urls}")
        print(f"   • Accuracy Target: {test_suite.minimum_accuracy_threshold:.1%}")
        print()
        
        # STEP 3: Execute comprehensive test suite
        print("🚀 STEP 3: Executing comprehensive test suite...")
        print("⏰ This may take several minutes for thorough analysis...")
        print()
        
        results = await tester.execute_comprehensive_test_suite(test_suite)
        
        # STEP 4: Generate detailed analysis
        execution_time = time.time() - start_time
        
        print("📊 COMPREHENSIVE TEST RESULTS")
        print("=" * 60)
        
        if 'error' in results:
            print(f"❌ Testing failed: {results['error']}")
            return results
        
        # Overall metrics
        overall_metrics = results.get('overall_metrics', {})
        test_summary = results.get('test_summary', {})
        quality_assessment = results.get('quality_assessment', {})
        
        print(f"✅ Overall Accuracy: {overall_metrics.get('average_accuracy_score', 0):.2%}")
        print(f"🎯 95% Requirement: {'✅ MET' if quality_assessment.get('meets_95_percent_requirement', False) else '❌ NOT MET'}")
        print(f"📈 Success Rate: {test_summary.get('overall_success_rate', 0):.2%}")
        print(f"⏱️ Total Execution Time: {execution_time:.2f}s")
        print(f"🔧 Tests Executed: {test_summary.get('total_tests_executed', 0)}")
        print()
        
        # Platform-specific analysis
        platform_analysis = results.get('platform_analysis', {})
        if platform_analysis:
            print("🌍 PLATFORM-SPECIFIC RESULTS")
            print("-" * 40)
            for platform, metrics in platform_analysis.items():
                accuracy = metrics.get('average_accuracy', 0)
                success_rate = metrics.get('success_rate', 0)
                test_count = metrics.get('tests_count', 0)
                
                status = "✅" if accuracy >= 0.9 else "⚠️" if accuracy >= 0.8 else "❌"
                print(f"{status} {platform.upper():>12}: {accuracy:.1%} accuracy ({test_count} tests, {success_rate:.1%} success)")
            print()
        
        # Quality breakdown
        print("📋 QUALITY METRICS BREAKDOWN")
        print("-" * 40)
        print(f"Visual Extraction: {overall_metrics.get('visual_extraction_average', 0):.1%}")
        print(f"Translation Quality: {overall_metrics.get('translation_accuracy_average', 0):.1%}")
        print(f"Frontend Integration: {overall_metrics.get('frontend_integration_average', 0):.1%}")
        print()
        
        # Recommendations
        if not quality_assessment.get('meets_95_percent_requirement', False):
            print("🔧 IMPROVEMENT RECOMMENDATIONS")
            print("-" * 40)
            
            if overall_metrics.get('visual_extraction_average', 0) < 0.9:
                print("• Enhance visual scraper with better element detection")
                print("• Improve dynamic content handling")
                
            if overall_metrics.get('translation_accuracy_average', 0) < 0.9:
                print("• Strengthen translation context preservation")
                print("• Expand real estate terminology dictionaries")
                
            if overall_metrics.get('frontend_integration_average', 0) < 0.9:
                print("• Verify InvestmentAnalysis.tsx prop mapping")
                print("• Enhance data structure consistency")
            
            print()
        
        # Save detailed results
        timestamp = int(time.time())
        results_filename = f"atlas_comprehensive_test_results_{timestamp}.json"
        
        with open(results_filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str, ensure_ascii=False)
        
        print(f"💾 Detailed results saved to: {results_filename}")
        print()
        
        # Final assessment
        if quality_assessment.get('meets_95_percent_requirement', False):
            print("🎊 SUCCESS: Atlas metrics integration meets 95% accuracy requirement!")
            print("✅ InvestmentAnalysis.tsx is receiving high-quality data from all scrapers")
        else:
            accuracy = overall_metrics.get('average_accuracy_score', 0)
            gap = 0.95 - accuracy
            print(f"⚠️ IMPROVEMENT NEEDED: {accuracy:.1%} accuracy achieved, {gap:.1%} gap to 95% target")
            print("🔧 Review recommendations above for optimization strategies")
        
        return results
        
    except Exception as e:
        print(f"❌ Testing execution failed: {str(e)}")
        return {"error": f"Testing execution failed: {str(e)}"}

def display_help():
    """Display help information for the test script"""
    print("Atlas Comprehensive Test Execution Script")
    print("=" * 50)
    print()
    print("USAGE:")
    print("  python3 run_comprehensive_test.py")
    print()
    print("DESCRIPTION:")
    print("  Executes comprehensive testing of Atlas metrics integration following")
    print("  Atlas Master Agent Rules for systematic validation.")
    print()
    print("FEATURES:")
    print("  • Tests InvestmentAnalysis.tsx metrics integration")
    print("  • Validates Visual Scraper data extraction accuracy") 
    print("  • Assesses translation quality for Dutch/Spanish content")
    print("  • Measures frontend data integration completeness")
    print("  • Generates detailed performance and accuracy reports")
    print("  • Validates 95% accuracy requirement")
    print()
    print("OUTPUT:")
    print("  • Console progress reporting with real-time status")
    print("  • Detailed JSON results file with comprehensive metrics")
    print("  • Platform-specific accuracy breakdown")
    print("  • Improvement recommendations if accuracy < 95%")
    print()
    print("REQUIREMENTS:")
    print("  • Valid OPENAI_API_KEY in environment")
    print("  • Web Unlocker proxy credentials configured")
    print("  • All Atlas scraper dependencies installed")

async def main():
    """Main execution function"""
    
    # Check for help flag
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help', 'help']:
        display_help()
        return
    
    # Validate environment
    if not os.getenv('OPENAI_API_KEY'):
        print("❌ Error: OPENAI_API_KEY not found in environment")
        print("Please set your OpenAI API key in the .env file")
        return
    
    # Execute comprehensive testing
    results = await execute_comprehensive_test()
    
    # Exit with appropriate code
    if 'error' in results:
        sys.exit(1)
    elif results.get('quality_assessment', {}).get('meets_95_percent_requirement', False):
        sys.exit(0)  # Success
    else:
        sys.exit(2)  # Accuracy below threshold

if __name__ == "__main__":
    asyncio.run(main()) 