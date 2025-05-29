import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import asyncio
from .webscraper_requests import scrape_property_data
from .language_translator import translate_scraped_property_data, RealEstateTranslator
from .investment_analyzer import InvestmentAnalyzer, PropertyAnalysisV2

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def analyze_property_url(url: str) -> Dict[str, Any]:
    """Enhanced property analysis with translation and data accuracy improvements"""
    start_time = datetime.now()
    
    try:
        logger.info(f"Starting enhanced property analysis for: {url}")
        
        # Step 1: Scrape raw property data
        scraped_data = await scrape_property_data(url)
        if not scraped_data or 'error' in scraped_data:
            logger.error(f"Scraping failed for URL: {url}")
            return {"error": "Failed to scrape property data", "url": url}
        
        logger.info(f"Raw scraping completed. Found {len(scraped_data)} property details")
        
        # Step 2: ENHANCED - Translate and standardize the scraped data
        logger.info("Applying language translation and data standardization...")
        translated_data = translate_scraped_property_data(scraped_data)
        
        # Use translated/standardized values for better accuracy
        enhanced_scraped_data = scraped_data.copy()
        if 'description_translated' in translated_data:
            enhanced_scraped_data['description'] = translated_data['description_translated']
        if 'features_translated' in translated_data:
            enhanced_scraped_data['features'] = translated_data['features_translated']
        if 'location_translated' in translated_data:
            enhanced_scraped_data['address'] = translated_data['location_translated']
        if 'price_standardized' in translated_data:
            enhanced_scraped_data['price_numeric'] = translated_data['price_standardized']
            enhanced_scraped_data['currency'] = translated_data['currency']
            enhanced_scraped_data['currency_symbol'] = translated_data['currency_symbol']
        
        logger.info(f"Translation completed. Source language: {translated_data.get('source_language', 'unknown')}")
        
        # Step 3: Enhanced investment analysis with translated data
        analyzer = InvestmentAnalyzer()
        analysis_result = await analyzer.analyze_property_investment(enhanced_scraped_data)
        
        if 'error' in analysis_result:
            logger.error(f"Investment analysis failed: {analysis_result['error']}")
            return {
                "error": "Investment analysis failed", 
                "scraped_data": enhanced_scraped_data,
                "translation_data": {
                    "source_language": translated_data.get('source_language'),
                    "translation_confidence": translated_data.get('translation_confidence'),
                    "currency_info": {
                        "currency": translated_data.get('currency'),
                        "symbol": translated_data.get('currency_symbol')
                    }
                }
            }
        
        # Step 4: Enhanced result compilation with translation metadata
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Merge all data with enhanced translation information
        enhanced_result = {
            **analysis_result,
            "scraped_data": enhanced_scraped_data,
            "translation_metadata": {
                "source_language": translated_data.get('source_language', 'unknown'),
                "translation_confidence": translated_data.get('translation_confidence', 0.0),
                "currency_standardized": {
                    "currency": translated_data.get('currency', 'EUR'),
                    "symbol": translated_data.get('currency_symbol', '€'),
                    "original_price": scraped_data.get('price', ''),
                    "standardized_price": translated_data.get('price_standardized', 0)
                },
                "localization_applied": True,
                "market_context": _get_market_context(translated_data.get('source_language', 'en'))
            },
            "processing_metadata": {
                "total_processing_time": processing_time,
                "timestamp": datetime.now().isoformat(),
                "version": "2.1.0-enhanced-translation",
                "features_enabled": [
                    "multilingual_translation",
                    "currency_standardization", 
                    "cultural_adaptation",
                    "data_accuracy_enhancement"
                ]
            }
        }
        
        logger.info(f"Enhanced analysis completed successfully in {processing_time:.2f}s")
        logger.info(f"Language: {translated_data.get('source_language')} -> English")
        logger.info(f"Currency: {translated_data.get('currency_symbol', '€')}{translated_data.get('price_standardized', 0):,.0f}")
        
        return enhanced_result
        
    except Exception as e:
        logger.error(f"Enhanced analysis failed for {url}: {str(e)}")
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "error": f"Analysis failed: {str(e)}",
            "url": url,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }

def _get_market_context(source_language: str) -> Dict[str, str]:
    """Get market-specific context information"""
    market_contexts = {
        "nl": {
            "market_name": "Dutch Real Estate Market",
            "primary_currency": "EUR",
            "key_considerations": "Energy efficiency ratings, notary requirements, kosten koper",
            "typical_fees": "2-10% transfer tax + notary fees",
            "market_characteristics": "Highly regulated, energy-focused, competitive urban markets"
        },
        "es": {
            "market_name": "Spanish Real Estate Market", 
            "primary_currency": "EUR",
            "key_considerations": "Regional variations, NIE requirements for foreigners, ITP tax",
            "typical_fees": "6-11% transfer tax + registration fees",
            "market_characteristics": "Regional diversity, tourism influence, coastal premiums"
        },
        "en": {
            "market_name": "International Market",
            "primary_currency": "Various",
            "key_considerations": "Market-specific regulations apply",
            "typical_fees": "Varies by jurisdiction",
            "market_characteristics": "Diverse international markets"
        }
    }
    
    return market_contexts.get(source_language, market_contexts["en"]) 