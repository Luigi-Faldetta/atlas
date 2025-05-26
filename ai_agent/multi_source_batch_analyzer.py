"""
Multi-source batch analyzer for real estate properties.
Supports Funda (Dutch), Fotocasa (Spanish), and Habitaclia (Spanish) scrapers.
Includes market-specific AI analysis for investment potential.
"""

import asyncio
import logging
import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional, Type
import pandas as pd
from dotenv import load_dotenv
from openai import AsyncOpenAI, APIError

# Import scrapers
from new_funda_scraper import FundaScraper
from fotocasa_scraper import FotocasaScraper
from habitaclia_scraper import HabitacliaScraper
from idealista_scraper import IdealistaScraper
from base_scraper import BaseScraper

# Configuration
load_dotenv()
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("MultiSourceBatchAnalyzer")

# OpenAI Client
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY:
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
else:
    client = None
    logger.warning("OpenAI API key not found. AI analysis will be skipped.")

# Proxy Configuration
PROXY_CONFIG = None
proxy_server = os.getenv("PROXY_SERVER")
proxy_username = os.getenv("PROXY_USERNAME")
proxy_password = os.getenv("PROXY_PASSWORD")

if proxy_server:
    PROXY_CONFIG = {
        "server": proxy_server,
        "username": proxy_username,
        "password": proxy_password
    }
    logger.info(f"Using proxy configuration: {PROXY_CONFIG['server']}")

# Market-specific prompts
MARKET_PROMPTS = {
    "dutch": """
    Analyze the following property data for investment potential in the Dutch market.
    Consider local factors such as:
    - High demand for housing in major cities (Amsterdam, Rotterdam, Utrecht, The Hague)
    - Strict rental regulations and social housing requirements
    - Energy efficiency requirements (energy labels)
    - Property tax (WOZ) implications
    
    Property Data:
    {property_data}
    
    Provide an investment analysis with:
    - Estimated monthly rent (considering Dutch rental point system)
    - Yearly yield (%) 
    - Yearly appreciation (%)
    - 5-year ROI (%)
    - 10-year ROI (%)
    - Investment score (0-100)
    - List of strengths
    - List of weaknesses
    - Brief explanation considering Dutch market specifics
    
    Return ONLY a JSON object with keys: "investment_score", "estimated_rent", "yearly_yield", 
    "yearly_appreciation_percentage", "yearly_appreciation_value", "roi_5_years", "roi_10_years", 
    "strengths", "weaknesses", "analysis_explanation", "market_notes".
    """,
    
    "spanish": """
    Analyze the following property data for investment potential in the Spanish market.
    Consider local factors such as:
    - Tourism potential (coastal areas, major cities)
    - Golden Visa eligibility (properties over 500,000€)
    - Regional tax differences
    - Seasonal rental potential
    - Energy efficiency requirements
    
    Property Data:
    {property_data}
    
    Provide an investment analysis with:
    - Estimated monthly rent (long-term)
    - Estimated seasonal/tourist rental potential
    - Yearly yield (%)
    - Yearly appreciation (%)
    - 5-year ROI (%)
    - 10-year ROI (%)
    - Investment score (0-100)
    - List of strengths
    - List of weaknesses
    - Brief explanation considering Spanish market specifics
    
    Return ONLY a JSON object with keys: "investment_score", "estimated_rent", "seasonal_rent_potential",
    "yearly_yield", "yearly_appreciation_percentage", "yearly_appreciation_value", "roi_5_years", 
    "roi_10_years", "strengths", "weaknesses", "analysis_explanation", "market_notes".
    """
}

# Scraper configurations
SCRAPER_CONFIGS = {
    'funda': {
        'scraper_class': FundaScraper,
        'market': 'dutch',
        'urls': [
            "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/",
            "https://www.funda.nl/detail/koop/amsterdam/appartement-max-planckstraat-10-2/43960857/",
        ]
    },
    'fotocasa': {
        'scraper_class': FotocasaScraper,
        'market': 'spanish',
        'urls': [
            "https://www.fotocasa.es/es/comprar/vivienda/madrid-capital/aire-acondicionado-calefaccion-terraza-trastero-ascensor-piscina-jardin/162447099/d",
            "https://www.fotocasa.es/es/comprar/vivienda/barcelona-barcelona/calefaccion-terraza-ascensor/161234567/d",
        ]
    },
    'habitaclia': {
        'scraper_class': HabitacliaScraper,
        'market': 'spanish',
        'urls': [
            "https://www.habitaclia.com/comprar-piso-en-barcelona.htm",
            "https://www.habitaclia.com/comprar-casa-en-madrid.htm",
        ]
    },
    'idealista': {
        'scraper_class': IdealistaScraper,
        'market': 'spanish',
        'urls': [
            "https://www.idealista.com/inmueble/103456789/",
            "https://www.idealista.com/en/inmueble/105090633/",
        ]
    }
}


async def invoke_ai_agent(data: dict, market: str) -> Dict[str, Any]:
    """
    Send scraped data to OpenAI for market-specific analysis.
    
    Args:
        data: Scraped property data
        market: Market type ('dutch' or 'spanish')
        
    Returns:
        Dictionary with AI analysis or error information
    """
    if not client:
        logger.error("OpenAI client not initialized.")
        return {"error": "OpenAI client not initialized."}
    
    # Format property data for prompt
    property_data_str = "\n".join([f"{k}: {v}" for k, v in data.items() 
        if k not in ['URL', 'Site', 'Scraped', 'Scraped At']])
    
    # Get market-specific prompt
    prompt_template = MARKET_PROMPTS.get(market, MARKET_PROMPTS['dutch'])
    prompt_text = prompt_template.format(property_data=property_data_str)
    
    try:
        logger.info(f"Invoking AI agent for {market} market: {data.get('Address', 'Unknown Address')}")
        
        system_message = f"You are an expert real estate investment analyst specializing in the {market.title()} market. Provide analysis in JSON format."
        
        response = await client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt_text}
            ],
            response_format={"type": "json_object"},
            temperature=0.5,
        )
        
        analysis_json_str = response.choices[0].message.content
        logger.info(f"AI analysis received for: {data.get('Address', 'Unknown Address')}")
        
        try:
            analysis_data = json.loads(analysis_json_str)
            if not isinstance(analysis_data, dict):
                logger.error(f"AI response was not a valid JSON object: {analysis_json_str}")
                return {"error": "AI response was not a valid JSON object."}
            return analysis_data
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode AI response JSON: {e}")
            return {"error": f"Failed to decode AI response JSON: {e}"}
            
    except APIError as e:
        logger.error(f"OpenAI API error: {e}")
        return {"error": f"OpenAI API error: {e}"}
    except Exception as e:
        logger.error(f"Unexpected error during AI invocation: {e}", exc_info=True)
        return {"error": f"Unexpected error during AI invocation: {e}"}


async def process_site(site_name: str, config: dict) -> List[Dict[str, Any]]:
    """
    Process all URLs for a specific site.
    
    Args:
        site_name: Name of the site (funda, fotocasa, habitaclia)
        config: Configuration dictionary for the site
        
    Returns:
        List of results with scraped data and AI analysis
    """
    logger.info(f"\n{'='*50}")
    logger.info(f"Processing {site_name.upper()} properties")
    logger.info(f"{'='*50}")
    
    scraper_class: Type[BaseScraper] = config['scraper_class']
    market = config['market']
    urls = config['urls']
    
    if not urls:
        logger.warning(f"No URLs configured for {site_name}")
        return []
    
    results = []
    scraper = None
    
    try:
        # Initialize scraper
        scraper = scraper_class(proxy=PROXY_CONFIG)
        await scraper.start()
        logger.info(f"{site_name} scraper initialized successfully")
        
        # Process each URL
        for i, url in enumerate(urls, 1):
            logger.info(f"\nProcessing {site_name} URL {i}/{len(urls)}: {url}")
            
            try:
                # Scrape property data
                scraped_data = await scraper.scrape_property(url)
                
                if scraped_data:
                    # Add metadata
                    scraped_data['Market'] = market
                    scraped_data['Timestamp'] = datetime.now().isoformat()
                    
                    # Perform AI analysis
                    if client:
                        ai_analysis = await invoke_ai_agent(scraped_data, market)
                        if 'error' not in ai_analysis:
                            scraped_data.update(ai_analysis)
                            logger.info(f"Successfully analyzed property: {scraped_data.get('Address', 'Unknown')}")
                        else:
                            scraped_data['ai_error'] = ai_analysis.get('error', 'Unknown AI error')
                            logger.error(f"AI analysis failed: {ai_analysis.get('error')}")
                    else:
                        scraped_data['ai_error'] = "AI analysis skipped - no API key"
                    
                    results.append(scraped_data)
                else:
                    # Scraping failed
                    results.append({
                        'URL': url,
                        'Site': site_name,
                        'Market': market,
                        'Scraped': False,
                        'Error': 'Scraping returned no data',
                        'Timestamp': datetime.now().isoformat()
                    })
                    
            except Exception as e:
                logger.error(f"Error processing {url}: {e}", exc_info=True)
                results.append({
                    'URL': url,
                    'Site': site_name,
                    'Market': market,
                    'Scraped': False,
                    'Error': str(e),
                    'Timestamp': datetime.now().isoformat()
                })
                
            # Delay between requests
            if i < len(urls):
                delay = 5
                logger.info(f"Waiting {delay} seconds before next request...")
                await asyncio.sleep(delay)
                
    finally:
        if scraper:
            await scraper.close()
            logger.info(f"{site_name} scraper closed")
            
    return results


async def main():
    """Main function to orchestrate multi-source scraping and analysis."""
    all_results = []
    
    # Process each configured site
    for site_name, config in SCRAPER_CONFIGS.items():
        try:
            site_results = await process_site(site_name, config)
            all_results.extend(site_results)
        except Exception as e:
            logger.error(f"Failed to process {site_name}: {e}", exc_info=True)
    
    # Save results to Excel
    if not all_results:
        logger.warning("No results were collected.")
        return
    
    # Create DataFrame
    logger.info(f"\nCreating report with {len(all_results)} properties...")
    df = pd.DataFrame(all_results)
    
    # Define column order
    base_columns = ['Site', 'Market', 'URL', 'Address', 'Price', 'Living Area', 
                    'Bedrooms', 'Bathrooms', 'Year Built', 'Property Type']
    
    ai_columns = ['investment_score', 'estimated_rent', 'seasonal_rent_potential',
                  'yearly_yield', 'yearly_appreciation_percentage', 
                  'yearly_appreciation_value', 'roi_5_years', 'roi_10_years',
                  'strengths', 'weaknesses', 'analysis_explanation', 'market_notes']
    
    metadata_columns = ['Scraped', 'Timestamp', 'Error', 'ai_error']
    
    # Order columns
    desired_order = base_columns + ai_columns + metadata_columns
    existing_columns = [col for col in desired_order if col in df.columns]
    extra_columns = [col for col in df.columns if col not in existing_columns]
    df = df[existing_columns + extra_columns]
    
    # Save to Excel with timestamp
    output_file = f"multi_source_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    
    try:
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            # Main results sheet
            df.to_excel(writer, sheet_name='All Properties', index=False)
            
            # Summary sheet by market
            summary_data = []
            for market in df['Market'].unique():
                market_df = df[df['Market'] == market]
                summary_data.append({
                    'Market': market,
                    'Total Properties': len(market_df),
                    'Successfully Scraped': len(market_df[market_df.get('Scraped', True)]),
                    'AI Analyzed': len(market_df[~market_df.get('ai_error', '').astype(bool)]),
                    'Average Investment Score': market_df['investment_score'].mean() if 'investment_score' in market_df else 'N/A'
                })
            
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Site-specific sheets
            for site in df['Site'].unique():
                site_df = df[df['Site'] == site]
                site_df.to_excel(writer, sheet_name=site.title(), index=False)
                
        logger.info(f"Results saved to: {output_file}")
        
        # Print summary
        print(f"\n{'='*60}")
        print("SCRAPING SUMMARY")
        print(f"{'='*60}")
        print(f"Total properties processed: {len(df)}")
        print(f"Successfully scraped: {len(df[df.get('Scraped', True)])}")
        if 'investment_score' in df.columns:
            avg_score = df['investment_score'].mean()
            print(f"Average investment score: {avg_score:.1f}" if pd.notna(avg_score) else "No investment scores available")
        print(f"Output file: {output_file}")
        print(f"{'='*60}")
        
    except Exception as e:
        logger.error(f"Failed to save results to Excel: {e}", exc_info=True)


if __name__ == "__main__":
    asyncio.run(main()) 