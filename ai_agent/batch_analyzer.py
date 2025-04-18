import asyncio
import logging
import os
import json
import traceback
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv
from openai import AsyncOpenAI, APIError
import random # Import random for the delay
from typing import Dict, Any # Import Dict and Any

# Import your scraper class
from new_funda_scraper import FundaScraper
# Import Playwright errors directly
from playwright.async_api import TimeoutError as PlaywrightTimeoutError, Error as PlaywrightError

# --- Configuration ---
load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("BatchAnalyzer")

# --- List of URLs to Scrape ---
FUNDA_URLS = [
    "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/",
    "https://www.funda.nl/detail/koop/amsterdam/appartement-max-planckstraat-10-2/43960857/",
    "https://www.funda.nl/detail/koop/utrecht/appartement-vrederustlaan-11/43960730/",
    "https://www.funda.nl/detail/koop/rotterdam/appartement-schapendreef-399/43840842/",
    "https://www.funda.nl/detail/koop/rotterdam/huis-jh-van-den-broekstraat-20/43840578/",
    "https://www.funda.nl/detail/koop/den-haag/appartement-prinsegracht-278/89155813/",
    "https://www.funda.nl/detail/koop/delft/appartement-buitenwatersloot-121/43819785/",
    "https://www.funda.nl/detail/koop/leiden/huis-hogewoerd-123/89291438/",
    "https://www.funda.nl/detail/koop/utrecht/appartement-weerdsingel-wz-18-c/43843250/",
    "https://www.funda.nl/detail/koop/gouda/appartement-boelekade-44/89296505/",
]

# --- Output File ---
OUTPUT_EXCEL_FILE = f"funda_analysis_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

# --- OpenAI Client Initialization ---
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if OPENAI_API_KEY:
    client = AsyncOpenAI(api_key=OPENAI_API_KEY)
else:
    client = None
    logger.warning("OpenAI API key not found. AI analysis will be skipped.")

# --- Proxy Configuration (Copied from new_funda_scraper.py example) ---
PROXY_CONFIG = None
proxy_server = os.getenv("PROXY_SERVER") # Or your specific PROXY_URL env var
proxy_username = os.getenv("PROXY_USERNAME")
proxy_password = os.getenv("PROXY_PASSWORD")

if proxy_server: # Basic check if server URL exists
    PROXY_CONFIG = {"server": proxy_server}
    if proxy_username:
        PROXY_CONFIG["username"] = proxy_username
    if proxy_password:
        PROXY_CONFIG["password"] = proxy_password
    logger.info(f"Using proxy configuration: {PROXY_CONFIG['server']}")
else:
    logger.info("No proxy configuration found or used.")

# --- AI Invocation Logic (Adapted from atlasScript.py) ---
async def invoke_ai_agent(data: dict) -> Dict[str, Any]:
    """Sends scraped data to OpenAI for analysis using openai>=1.0.0."""
    if not client:
        logger.error("OpenAI client not initialized.")
        return {"error": "OpenAI client not initialized."}

    # Prepare a prompt for the AI (Use the JSON format prompt from recent atlasScript)
    prompt_text = f"""
    Analyze the following property data for investment potential in the Dutch market.
    Provide an estimated monthly rent, yearly yield (%), yearly appreciation (%), 5-year ROI (%), and 10-year ROI (%).
    Also provide an overall investment score (0-100), a list of strengths, a list of weaknesses, and a brief explanation.
    If data is missing or estimated (indicated by 'estimated' or 'Not available'), acknowledge the uncertainty in your analysis.

    Property Data:
    Address: {data.get('Address', 'Not available')}
    Price: {data.get('Price', 'Not available')}
    Living Area: {data.get('Living Area', 'Not available')}
    Plot Size: {data.get('Plot Size', 'Not available')}
    Bedrooms: {data.get('Bedrooms', 'Not available')}
    Description: {data.get('Description', 'Not available')}

    Return the analysis ONLY as a JSON object with the following keys:
    "investment_score", "estimated_rent", "yearly_yield", "yearly_appreciation_percentage", "yearly_appreciation_value", "roi_5_years", "roi_10_years", "strengths", "weaknesses", "analysis_explanation", "address".
    Ensure all numerical values are numbers (int or float), not strings. Use null for unknown values.
    """

    try:
        logger.info(f"Invoking AI agent for: {data.get('Address', 'Unknown Address')}")
        response = await client.chat.completions.create(
            model="gpt-4-turbo", # Or your preferred model
            messages=[
                {"role": "system", "content": "You are an expert real estate investment analyst specializing in the Dutch market. Provide analysis in JSON format."},
                {"role": "user", "content": prompt_text}
            ],
            response_format={"type": "json_object"},
            temperature=0.5,
        )
        analysis_json_str = response.choices[0].message.content
        logger.info(f"AI analysis received for: {data.get('Address', 'Unknown Address')}")
        logger.debug(f"Raw AI Response: {analysis_json_str}")

        try:
            analysis_data = json.loads(analysis_json_str)
            if not isinstance(analysis_data, dict):
                 logger.error(f"AI response was not a valid JSON object: {analysis_json_str}")
                 return {"error": "AI response was not a valid JSON object."}
            return analysis_data
        except json.JSONDecodeError as json_err:
            logger.error(f"Failed to decode AI response JSON: {json_err}")
            logger.error(f"Invalid JSON string: {analysis_json_str}")
            return {"error": f"Failed to decode AI response JSON: {json_err}", "raw_response": analysis_json_str}

    except APIError as e:
        logger.error(f"OpenAI API error: {e}")
        return {"error": f"OpenAI API error: {e}"}
    except Exception as e:
        logger.error(f"Unexpected error during AI invocation: {e}", exc_info=True)
        return {"error": f"Unexpected error during AI invocation: {e}"}

# --- Main Batch Processing Function ---
async def main():
    all_results = []
    scraper_instance = None # Initialize to None
    try:
        # Initialize scraper - REMOVED headless argument
        scraper_instance = FundaScraper(proxy=PROXY_CONFIG)
        await scraper_instance.start()
        logger.info("Scraper started successfully.")

        for i, url in enumerate(FUNDA_URLS):
            logger.info(f"--- Processing URL {i+1}/{len(FUNDA_URLS)}: {url} ---")
            scraped_data_result = None
            ai_analysis = None
            # Start with URL and default status
            combined_data = {"URL": url, "Scraped": False, "Message": None, "scrape_error": None, "ai_error": None}

            try:
                # Call the scraper method which returns dict on success, None on failure
                scraped_data_result = await scraper_instance.scrape_property(url)

                if scraped_data_result is not None:
                    # Scraping succeeded (returned a dictionary)
                    logger.info(f"Successfully scraped: {url}")
                    combined_data.update(scraped_data_result) # Add scraped data
                    combined_data["Scraped"] = True
                    combined_data["Message"] = "Successfully scraped primary data." # Set success message

                    # Invoke AI only if scraping was successful
                    ai_analysis = await invoke_ai_agent(scraped_data_result)
                    if ai_analysis and "error" not in ai_analysis:
                        combined_data.update(ai_analysis) # Add AI analysis data
                        logger.info(f"Successfully analyzed: {url}")
                    else:
                        logger.error(f"AI analysis failed for {url}: {ai_analysis.get('error', 'Unknown AI error')}")
                        combined_data["ai_error"] = ai_analysis.get('error', 'Unknown AI error')

                else:
                    # Scraping failed (returned None)
                    logger.warning(f"Primary scraping failed for {url}. Scraper returned None.")
                    combined_data["Scraped"] = False
                    combined_data["Message"] = "Primary scraping failed (scraper returned None)."
                    combined_data["ai_error"] = "Skipped AI analysis due to scraping failure."


            except PlaywrightTimeoutError as e:
                logger.error(f"Timeout error scraping {url}: {e}")
                combined_data["Scraped"] = False
                combined_data["scrape_error"] = f"Timeout: {e}"
                combined_data["Message"] = f"Timeout error during scraping."
            except PlaywrightError as e:
                logger.error(f"Playwright error scraping {url}: {e}")
                combined_data["Scraped"] = False
                combined_data["scrape_error"] = f"Playwright Error: {e}"
                combined_data["Message"] = f"Playwright error during scraping."
            except Exception as e:
                logger.error(f"Unexpected error processing {url}: {e}", exc_info=True)
                combined_data["Scraped"] = False
                combined_data["scrape_error"] = f"Unexpected Error: {e}"
                combined_data["Message"] = f"Unexpected error during processing."
            finally:
                all_results.append(combined_data)
                # Add a delay between requests to be polite
                delay = random.uniform(5, 15) # 5 to 15 seconds delay
                logger.info(f"Waiting for {delay:.1f} seconds before next request...")
                await asyncio.sleep(delay)

    finally:
        if scraper_instance: # Check if instance was created before trying to close
             await scraper_instance.close()
             logger.info("Scraper instance closed.")

    # --- Save results to Excel ---
    if not all_results:
        logger.warning("No results were collected. Excel file will not be created.")
        return

    logger.info(f"Converting {len(all_results)} results to DataFrame...")
    df = pd.DataFrame(all_results)

    # Define desired column order (adjust as needed based on actual keys)
    desired_columns = [
        "URL", "Address", "Price", "Living Area", "Bedrooms", # Scraped
        "investment_score", "estimated_rent", "yearly_yield", # AI
        "yearly_appreciation_percentage", "yearly_appreciation_value",
        "roi_5_years", "roi_10_years",
        "strengths", "weaknesses", "analysis_explanation",
        "Scraped", "Message", # Scraper status
        "scrape_error", "ai_error" # Error columns
    ]

    # Reorder columns, keeping only those that exist in the DataFrame
    existing_columns = [col for col in desired_columns if col in df.columns]
    # Add any columns present in df but not in desired_columns to the end
    extra_columns = [col for col in df.columns if col not in existing_columns]
    df = df[existing_columns + extra_columns]


    try:
        logger.info(f"Saving results to {OUTPUT_EXCEL_FILE}...")
        # Use index=False to avoid writing the DataFrame index as a column
        df.to_excel(OUTPUT_EXCEL_FILE, index=False, engine='openpyxl')
        logger.info("Successfully saved results to Excel.")
    except Exception as e:
        logger.error(f"Failed to save results to Excel: {e}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(main())