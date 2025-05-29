#!/usr/bin/env python3
"""
Comprehensive Property Analysis Runner
Integrates visual scraping, traditional scraping, and enhanced data processing
Called by the Node.js backend to perform complete 1:1 data extraction
"""

import asyncio
import json
import logging
import sys
import traceback
from dataclasses import asdict
from datetime import datetime

# Try to import the full enhanced processor, fallback to simplified
try:
    from enhanced_data_processor import EnhancedDataProcessor
    FULL_PROCESSOR_AVAILABLE = True
    logger = logging.getLogger(__name__)
    logger.info("✅ Full enhanced data processor available")
except ImportError as e:
    logger = logging.getLogger(__name__)
    logger.warning(f"⚠️ Full processor not available: {e}")
    FULL_PROCESSOR_AVAILABLE = False

# Always import simplified processor as fallback
from enhanced_data_processor_simple import SimpleDataProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def run_comprehensive_analysis(analysis_data: dict) -> dict:
    """
    Main comprehensive analysis function that combines all data sources
    
    Args:
        analysis_data: Dict containing propertyUrl, address, and preferences
        
    Returns:
        Dict with comprehensive property data matching InvestmentAnalysis.tsx props
    """
    start_time = datetime.now()
    processor = None
    
    try:
        logger.info("Starting comprehensive property analysis")
        logger.info(f"Analysis data: {analysis_data}")
        
        # Extract parameters
        property_url = analysis_data.get('propertyUrl')
        address = analysis_data.get('address', '')
        user_preferences = analysis_data.get('userPreferences', {})
        enable_visual = analysis_data.get('enableVisualScraping', True)
        enable_screenshots = analysis_data.get('enableScreenshots', True)
        enable_ai_vision = analysis_data.get('enableAIVision', True)
        
        if not property_url and not address:
            raise ValueError("Either propertyUrl or address must be provided")
        
        # Determine which processor to use
        use_full_processor = FULL_PROCESSOR_AVAILABLE and enable_visual
        
        # Check visual scraping dependencies if full processor requested
        visual_capabilities_available = True
        if use_full_processor:
            try:
                # Test import of required libraries
                import openai
                from playwright.async_api import async_playwright
                from PIL import Image
                logger.info("✅ Visual scraping capabilities confirmed")
            except ImportError as e:
                logger.warning(f"⚠️ Visual scraping dependencies missing: {e}")
                visual_capabilities_available = False
                use_full_processor = False
        
        # Initialize the appropriate processor
        if use_full_processor and visual_capabilities_available:
            logger.info("🚀 Using full enhanced data processor with visual scraping")
            processor = EnhancedDataProcessor()
            processor_type = "enhanced_visual"
        else:
            logger.info("🔧 Using simplified data processor")
            processor = SimpleDataProcessor()
            processor_type = "simplified"
        
        # Run comprehensive processing
        if property_url:
            logger.info(f"Processing property URL: {property_url}")
            result = await processor.process_property_comprehensive(property_url, address)
        else:
            logger.info(f"Processing address only: {address}")
            # Create minimal analysis for address-only requests
            result = await processor.process_property_comprehensive("", address)
        
        # Convert result to dict for JSON serialization
        result_dict = asdict(result)
        
        # Add processing metadata
        processing_time = (datetime.now() - start_time).total_seconds()
        result_dict['processingMetadata'] = {
            'total_processing_time': processing_time,
            'timestamp': datetime.now().isoformat(),
            'version': 'comprehensive_v1.0',
            'processor_type': processor_type,
            'capabilities_used': {
                'visual_scraping': use_full_processor and visual_capabilities_available,
                'ai_vision_extraction': enable_ai_vision and visual_capabilities_available,
                'screenshot_analysis': enable_screenshots and visual_capabilities_available,
                'traditional_scraping': True,
                'external_apis': processor_type == "enhanced_visual",
                'financial_calculations': True,
                'simplified_processing': processor_type == "simplified"
            },
            'user_preferences': user_preferences
        }
        
        # Ensure required fields are present
        if 'investmentScore' not in result_dict:
            result_dict['investmentScore'] = result.investmentScore if hasattr(result, 'investmentScore') else 0
        if 'address' not in result_dict:
            result_dict['address'] = result.address if hasattr(result, 'address') else address
        if 'hasRealData' not in result_dict:
            result_dict['hasRealData'] = result.hasRealData if hasattr(result, 'hasRealData') else False
        
        # Log success metrics
        logger.info(f"✅ Analysis completed successfully in {processing_time:.2f}s")
        logger.info(f"📊 Data completeness: {result_dict.get('dataQuality', {}).get('completeness_score', 0)}%")
        logger.info(f"🔧 Sources used: {', '.join(result_dict.get('dataQuality', {}).get('sources_used', []))}")
        logger.info(f"📈 Investment score: {result_dict.get('investmentScore', 0)}")
        logger.info(f"🏠 Property: {result_dict.get('address', 'N/A')} - {result_dict.get('price', 'N/A')}")
        logger.info(f"🎯 Processor used: {processor_type}")
        
        return result_dict
        
    except Exception as e:
        logger.error(f"❌ Error in comprehensive analysis: {e}")
        logger.error(traceback.format_exc())
        
        # Return error result with fallback data
        processing_time = (datetime.now() - start_time).total_seconds()
        return {
            'investmentScore': 0,
            'address': analysis_data.get('address', 'Error processing property'),
            'price': '',
            'error': str(e),
            'hasRealData': False,
            'isEnhancedAnalysis': False,
            'dataQuality': {
                'completeness_score': 0,
                'processing_error': str(e),
                'sources_used': [],
                'processing_completed': False
            },
            'processingMetadata': {
                'total_processing_time': processing_time,
                'timestamp': datetime.now().isoformat(),
                'version': 'comprehensive_v1.0_error',
                'error': str(e),
                'processor_type': 'error_fallback'
            }
        }
    finally:
        # Clean up resources
        if processor and hasattr(processor, 'close'):
            try:
                await processor.close()
            except Exception as e:
                logger.error(f"Error closing processor: {e}")

def main():
    """Main entry point called by Node.js backend"""
    try:
        # Parse command line arguments
        if len(sys.argv) < 2:
            logger.error("No analysis data provided")
            print(json.dumps({
                'error': 'No analysis data provided',
                'investmentScore': 0,
                'hasRealData': False,
                'address': 'No data provided',
                'dataQuality': {'completeness_score': 0}
            }))
            sys.exit(1)
        
        # Parse analysis data from command line
        analysis_data_str = sys.argv[1]
        try:
            analysis_data = json.loads(analysis_data_str)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON provided: {e}")
            print(json.dumps({
                'error': f'Invalid JSON: {e}',
                'investmentScore': 0,
                'hasRealData': False,
                'address': 'JSON parse error',
                'dataQuality': {'completeness_score': 0}
            }))
            sys.exit(1)
        
        # Run the comprehensive analysis
        loop = asyncio.get_event_loop()
        result = loop.run_until_complete(run_comprehensive_analysis(analysis_data))
        
        # Output result as JSON for Node.js backend
        print(json.dumps(result, default=str))
        
    except Exception as e:
        logger.error(f"Critical error in main: {e}")
        logger.error(traceback.format_exc())
        
        # Output error result
        error_result = {
            'error': str(e),
            'investmentScore': 0,
            'address': 'Critical processing error',
            'hasRealData': False,
            'dataQuality': {
                'completeness_score': 0,
                'processing_error': str(e)
            },
            'processingMetadata': {
                'timestamp': datetime.now().isoformat(),
                'processor_type': 'critical_error'
            }
        }
        print(json.dumps(error_result))
        sys.exit(1)

# Test function for development
async def test_comprehensive_analysis():
    """Test function for development and debugging"""
    test_data = {
        'propertyUrl': 'https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/',
        'address': '',
        'userPreferences': {},
        'enableVisualScraping': True,
        'enableScreenshots': True,
        'enableAIVision': True
    }
    
    logger.info("🧪 Running test comprehensive analysis")
    result = await run_comprehensive_analysis(test_data)
    
    print("\n" + "="*80)
    print("TEST RESULTS SUMMARY")
    print("="*80)
    print(f"Investment Score: {result.get('investmentScore', 'N/A')}")
    print(f"Address: {result.get('address', 'N/A')}")
    print(f"Price: {result.get('price', 'N/A')}")
    print(f"Has Real Data: {result.get('hasRealData', False)}")
    print(f"Data Completeness: {result.get('dataQuality', {}).get('completeness_score', 0)}%")
    print(f"Processing Time: {result.get('processingMetadata', {}).get('total_processing_time', 0):.2f}s")
    print(f"Processor Type: {result.get('processingMetadata', {}).get('processor_type', 'unknown')}")
    print(f"Sources Used: {', '.join(result.get('dataQuality', {}).get('sources_used', []))}")
    
    # Show capabilities used
    capabilities = result.get('processingMetadata', {}).get('capabilities_used', {})
    print(f"Visual Scraping: {'✅' if capabilities.get('visual_scraping') else '❌'}")
    print(f"AI Vision: {'✅' if capabilities.get('ai_vision_extraction') else '❌'}")
    print(f"Screenshot Analysis: {'✅' if capabilities.get('screenshot_analysis') else '❌'}")
    print(f"Traditional Scraping: {'✅' if capabilities.get('traditional_scraping') else '❌'}")
    
    if 'error' in result:
        print(f"❌ Error: {result['error']}")
    
    print("="*80)
    
    # Save detailed results for inspection
    with open('test_comprehensive_results.json', 'w') as f:
        json.dump(result, f, indent=2, default=str)
    
    print(f"📄 Detailed results saved to: test_comprehensive_results.json")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        # Run test mode
        asyncio.run(test_comprehensive_analysis())
    else:
        # Run normal mode (called by backend)
        main() 