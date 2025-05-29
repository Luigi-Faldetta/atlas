from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from funda_scraper_requests import FundaScraperRequests  # Import the requests-based FundaScraper class
from idealista_scraper import IdealistaScraper  # Import the IdealistaScraper class
from fotocasa_scraper_requests import FotocasaScraperRequests  # NEW: Import the requests-based FotocasaScraper class
from habitaclia_scraper_requests import HabitacliaScraperRequests  # NEW: Import the requests-based HabitacliaScraper class
import logging
import re
import os
import json
from dotenv import load_dotenv
from urllib.parse import urlparse  # Import urlparse

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://atlasnew.vercel.app", "https://www.project-atlas.xyz"],  # Allow requests from your frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Initialize the LangChain Chat LLM
llm = ChatOpenAI(
    temperature=0.7,
    model_name="gpt-4o",  # Using GPT-4o - the latest and most capable model
    openai_api_key=api_key,  # Replace with your OpenAI API key
)

# NEW: Market-specific prompts
MARKET_PROMPTS = {
    "dutch": """
    You are a real estate investment analysis AI specializing in the Dutch market. Your job is to analyze the provided property data and generate a detailed investment analysis.
    
    Consider Dutch market factors such as:
    - High demand for housing in major cities (Amsterdam, Rotterdam, Utrecht, The Hague)
    - Strict rental regulations and social housing requirements
    - Energy efficiency requirements (energy labels)
    - Property tax (WOZ) implications
    - Dutch rental point system for rent calculations
    
    The response must strictly follow the format below to ensure it can be parsed correctly by regex patterns.

    1. **Property Details**:
       - Address, price, living area, number of bedrooms, number of bathrooms, and year built.

    Based on the provided data, generate:
    - An **Investment Score** (0-100) that reflects the overall investment potential. Consider all provided details including bathrooms and year built.
    - A detailed explanation of the score, highlighting the strengths and weaknesses of the property.
    - An estimated **ROI (Return on Investment)** percentage for 5 years and 10 years based on reasonable assumptions about rental income and expenses.
    - The **Yearly Yield** percentage, calculated as (Gross Annual Income / Purchase Price) * 100.
    - The **Monthly Rental Income** (best estimate based on the property details and Dutch rental point system).
    - The **Expected Monthly Income** after potential improvements and market adjustments (should be 5-15% higher than current rental income).
    - The **Yearly Appreciation** percentage and its corresponding value in euros.
    
    Additional metrics to estimate:
    - **DSCR** (Debt Service Coverage Ratio): typical for this property type
    - **Cash on Cash Return**: percentage return on cash invested
    - **GRM** (Gross Rent Multiplier): property price divided by gross annual rent
    - **IRR** (Internal Rate of Return): expected 10-year IRR percentage
    - **Equity Buildup**: estimated annual equity gain through mortgage paydown
    - **Days on Market**: typical for this area and property type
    - **Property Tax Rate**: typical percentage for this location
    - **Community Fees**: estimated monthly HOA/maintenance fees
    - **Vacancy Rate**: typical percentage for this area
    - **Energy Label**: estimate based on year built and Dutch standards (A-G)
    - **Flood Risk**: percentage risk based on Netherlands location
    - **Crime Rate**: per 1000 residents typical for this area
    - **Noise Level**: 0-100 scale (lower is better)
    - **Air Quality**: 0-100 scale (higher is better)

    The response must strictly follow this format:

    **Investment Score**: <score>/100

    **Address**: <address>

    **Score Explanation**:
    <explanation>

    **Strengths**:
     <strength 1>
     <strength 2>
     <strength 3>

    **Weaknesses**:
     <weakness 1>
     <weakness 2>
     <weakness 3>

    **Estimated ROI**:
    ROI (5 years): <value>%
    ROI (10 years): <value>%

    **Yearly Yield**:
    approximately <value>%

    **Monthly Rental Income**:
    approximately €<value>

    **Expected Monthly Income**:
    approximately €<value>

    **Yearly Appreciation**:
    approximately <value>% (€<value>)
    
    **Additional Financial Metrics**:
    DSCR: <value>
    Cash on Cash Return: <value>%
    GRM: <value>
    IRR: <value>%
    Equity Buildup: €<value> per year
    
    **Market Metrics**:
    Days on Market: <value> days
    Property Tax Rate: <value>%
    Community Fees: €<value> monthly
    Vacancy Rate: <value>%
    
    **Property Specifications**:
    Energy Label: <letter>
    Building Type: <type>
    
    **Environmental & Safety**:
    Flood Risk: <value>%
    Crime Rate: <value> per 1000
    Noise Level: <value>/100
    Air Quality: <value>/100

    Ensure the response strictly adheres to this format, including the exact headings, spacing, and structure. Do not include any additional text or explanations outside this format.
    """,
    
    "spanish": """
    You are a real estate investment analysis AI specializing in the Spanish market. Your job is to analyze the provided property data and generate a detailed investment analysis.
    
    Consider Spanish market factors such as:
    - Tourism potential (coastal areas, major cities like Madrid, Barcelona, Valencia)
    - Golden Visa eligibility (properties over €500,000)
    - Regional tax differences between autonomous communities
    - Seasonal rental potential (Airbnb, vacation rentals)
    - Energy efficiency requirements and certificates
    - Spanish property market trends and appreciation rates
    
    The response must strictly follow the format below to ensure it can be parsed correctly by regex patterns.

    1. **Property Details**:
       - Address, price, living area, number of bedrooms, number of bathrooms, and year built.

    Based on the provided data, generate:
    - An **Investment Score** (0-100) that reflects the overall investment potential. Consider all provided details including bathrooms and year built.
    - A detailed explanation of the score, highlighting the strengths and weaknesses of the property.
    - An estimated **ROI (Return on Investment)** percentage for 5 years and 10 years based on reasonable assumptions about rental income and expenses.
    - The **Yearly Yield** percentage, calculated as (Gross Annual Income / Purchase Price) * 100.
    - The **Monthly Rental Income** (best estimate for long-term rental based on the property details).
    - The **Expected Monthly Income** after potential improvements and market adjustments (should be 5-15% higher than current rental income).
    - The **Yearly Appreciation** percentage and its corresponding value in euros.
    
    Additional metrics to estimate:
    - **DSCR** (Debt Service Coverage Ratio): typical for this property type
    - **Cash on Cash Return**: percentage return on cash invested  
    - **GRM** (Gross Rent Multiplier): property price divided by gross annual rent
    - **IRR** (Internal Rate of Return): expected 10-year IRR percentage
    - **Equity Buildup**: estimated annual equity gain through mortgage paydown
    - **Days on Market**: typical for this area and property type
    - **Property Tax Rate**: IBI tax typical percentage for this location
    - **Community Fees**: estimated monthly community fees
    - **Vacancy Rate**: typical percentage for this area
    - **Energy Label**: estimate based on year built and Spanish CEE standards (A-G)
    - **Flood Risk**: percentage risk based on Mediterranean location
    - **Crime Rate**: per 1000 residents typical for this area
    - **Noise Level**: 0-100 scale (lower is better)
    - **Air Quality**: 0-100 scale (higher is better)
    - **Tourist Activity**: High/Medium/Low for short-term rental potential

    The response must strictly follow this format:

    **Investment Score**: <score>/100

    **Address**: <address>

    **Score Explanation**:
    <explanation>

    **Strengths**:
     <strength 1>
     <strength 2>
     <strength 3>

    **Weaknesses**:
     <weakness 1>
     <weakness 2>
     <weakness 3>

    **Estimated ROI**:
    ROI (5 years): <value>%
    ROI (10 years): <value>%

    **Yearly Yield**:
    approximately <value>%

    **Monthly Rental Income**:
    approximately €<value>

    **Expected Monthly Income**:
    approximately €<value>

    **Yearly Appreciation**:
    approximately <value>% (€<value>)
    
    **Additional Financial Metrics**:
    DSCR: <value>
    Cash on Cash Return: <value>%
    GRM: <value>
    IRR: <value>%
    Equity Buildup: €<value> per year
    
    **Market Metrics**:
    Days on Market: <value> days
    Property Tax Rate: <value>%
    Community Fees: €<value> monthly
    Vacancy Rate: <value>%
    Tourist Activity: <High/Medium/Low>
    
    **Property Specifications**:
    Energy Label: <letter>
    Building Type: <type>
    
    **Environmental & Safety**:
    Flood Risk: <value>%
    Crime Rate: <value> per 1000
    Noise Level: <value>/100
    Air Quality: <value>/100

    Ensure the response strictly adheres to this format, including the exact headings, spacing, and structure. Do not include any additional text or explanations outside this format.
    """
}

# NEW: Function to determine market based on domain
def get_market_from_domain(domain: str) -> str:
    """Determine the market type based on the domain"""
    if any(dutch_domain in domain for dutch_domain in ["funda.nl"]):
        return "dutch"
    elif any(spanish_domain in domain for spanish_domain in ["idealista.com", "fotocasa.es", "habitaclia.com"]):
        return "spanish"
    else:
        return "dutch"  # Default fallback

# NEW: Create market-specific prompt template
def create_market_prompt(market: str) -> ChatPromptTemplate:
    """Create a market-specific prompt template"""
    prompt_content = MARKET_PROMPTS.get(market, MARKET_PROMPTS["dutch"])
    
    return ChatPromptTemplate.from_messages([
        {
            "role": "system",
            "content": prompt_content
        },
        {
            "role": "user",
            "content": """
            Here is the property data for analysis:
            Address: {address}
            Price: {price}
            Living Area: {living_area}
            Bedrooms: {bedrooms}
            Bathrooms: {bathrooms}
            Year Built: {year_built}
            """
        },
    ])

# Define the request model
class AnalyzeRequest(BaseModel):
    url: str

def clean_and_convert(value_str: str, remove_chars: str = "€,. m²kk") -> float | None:
    """Cleans a string by removing specified characters and converts to float."""
    if not isinstance(value_str, str):
        logging.warning(f"clean_and_convert received non-string input: {value_str}")
        return None
    try:
        # Remove specified characters and whitespace
        cleaned_str = value_str
        # Handle specific cases like 'k.k.' or other non-numeric parts common in prices
        cleaned_str = re.sub(r'\s*k\.k\.$', '', cleaned_str)  # Remove ' k.k.' suffix
        for char in remove_chars:
            # Only remove chars if they are not the only thing left (avoid converting '.' to '')
            if cleaned_str != char:
                cleaned_str = cleaned_str.replace(char, '')
        cleaned_str = cleaned_str.strip()

        if not cleaned_str:
            logging.warning(f"clean_and_convert resulted in empty string from: {value_str}")
            return None
        logging.debug(f"Attempting to convert cleaned string '{cleaned_str}' from original '{value_str}'")
        # Handle potential European number format (e.g., 1.000.000 for a million)
        if '.' in cleaned_str and ',' in cleaned_str:
            # If both dot and comma exist, assume dot is thousand separator, comma is decimal
            cleaned_str = cleaned_str.replace('.', '').replace(',', '.')
        elif ',' in cleaned_str:
            # If only comma exists, assume it's the decimal separator
            cleaned_str = cleaned_str.replace(',', '.')
        # If only dot exists, assume it's a decimal (standard float conversion handles this)

        return float(cleaned_str)
    except (ValueError, TypeError) as e:
        logging.error(f"Failed to convert '{cleaned_str}' to float: {e}")
        return None

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        logging.debug("Received request to analyze property: %s", request.url)

        # --- Determine which scraper to use ---
        parsed_url = urlparse(request.url)
        domain = parsed_url.netloc.lower()
        scraper = None
        proxy_config = None # Initialize proxy_config

        # --- Load Proxy Configuration ---
        proxy_server = os.getenv("PROXY_SERVER")
        proxy_username = os.getenv("PROXY_USERNAME")
        proxy_password = os.getenv("PROXY_PASSWORD")

        if proxy_server and proxy_username and proxy_password:
             proxy_config = {
                 "server": proxy_server,
                 "username": proxy_username,
                 "password": proxy_password,
             }
             logging.info("Proxy configuration loaded from environment variables.")
        else:
             logging.warning("Proxy environment variables not fully set. Proceeding without proxy.")
        # --- End Proxy Configuration ---

        # NEW: Enhanced domain detection with Spanish scrapers
        if "funda.nl" in domain:
            logging.info("Detected Funda URL. Using FundaScraperRequests.")
            scraper = FundaScraperRequests()
        elif "idealista.com" in domain:
            logging.info("Detected Idealista URL. Using IdealistaScraper.")
            scraper = IdealistaScraper()
        elif "fotocasa.es" in domain:
            logging.info("Detected Fotocasa URL. Using FotocasaScraperRequests.")
            scraper = FotocasaScraperRequests()
        elif "habitaclia.com" in domain:
            logging.info("Detected Habitaclia URL. Using HabitacliaScraperRequests.")
            scraper = HabitacliaScraperRequests()
        else:
            logging.error(f"Unsupported domain: {domain}")
            raise HTTPException(status_code=400, detail=f"Unsupported URL domain: {domain}. Supported domains: funda.nl, idealista.com, fotocasa.es, habitaclia.com")

        # NEW: Determine market for AI analysis
        market = get_market_from_domain(domain)
        logging.info(f"Using {market} market analysis for domain: {domain}")

       # --- Scrape data using the selected scraper ---
        scraped_data = None
        
        # NEW: Enhanced scraper handling with async support for new scrapers
        if isinstance(scraper, FundaScraperRequests):
            await scraper.start() # Start the requests-based scraper
            try:
                # Scrape property using requests-based scraper
                scraped_data = await scraper.scrape_property(request.url)
            finally:
                await scraper.close() # Ensure close is called even if scrape fails
        elif isinstance(scraper, IdealistaScraper):
            # IdealistaScraper's scrape_property is async
            try:
                await scraper.start()
                scraped_data = await scraper.scrape_property(request.url)
            finally:
                await scraper.close()
        elif isinstance(scraper, (FotocasaScraperRequests, HabitacliaScraperRequests)):
            # NEW: Handle new Spanish scrapers with async support
            try:
                await scraper.start()
                scraped_data = await scraper.scrape_property(request.url)
            finally:
                await scraper.close()
        # --- End Scraper Execution ---

        if not scraped_data or scraped_data.get('error'):
            error_detail = scraped_data.get('error', 'Failed to scrape property data from the provided URL.') if scraped_data else 'Failed to scrape property data from the provided URL.'
            logging.error(f"Scraping failed: {error_detail}")
            raise HTTPException(status_code=400, detail=error_detail)

        logging.debug("Raw scraped data: %s", scraped_data)

        # --- Calculate Price per Square Meter ---
        price_str = scraped_data.get("Price")
        living_area_str = scraped_data.get("Living Area")
        logging.debug(f"Raw Price string: '{price_str}', Raw Living Area string: '{living_area_str}'")

        # Adjust cleaning characters based on scraper if needed (e.g., Idealista might use different currency symbols or formats)
        # For now, using the same cleaner function
        price_num = clean_and_convert(price_str)
        living_area_num = clean_and_convert(living_area_str)
        logging.debug(f"Converted Price number: {price_num}, Converted Living Area number: {living_area_num}")

        price_per_sqm = None
        if price_num is not None and living_area_num is not None and living_area_num > 0:
            price_per_sqm = round(price_num / living_area_num, 2)
            logging.info(f"Successfully calculated Price/Sqm: {price_per_sqm}")
        else:
            logging.warning(f"Could not calculate Price/Sqm. Price Num: {price_num}, Area Num: {living_area_num}")

        # --- Prepare data for AI and response ---
        simplified_data = {
            "address": scraped_data.get("Address", "Not available"),
            "price": scraped_data.get("Price", "Not available"),
            "living_area": scraped_data.get("Living Area", "Not available"),
            "bedrooms": scraped_data.get("Bedrooms", "Not available"),
            "bathrooms": scraped_data.get("Bathrooms", "Not available"),
            "year_built": scraped_data.get("Year Built", "Not available"),
            "price_per_sqm": price_per_sqm,
            "property_image": scraped_data.get("Property Image", None),
        }
        logging.debug(f"Simplified data being sent to frontend (under 'scraped_data'): {simplified_data}")

        # NEW: Use market-specific prompt
        prompt = create_market_prompt(market)
        
        # Format the input for the prompt
        formatted_data = prompt.format_messages(
            address=simplified_data["address"],
            price=simplified_data["price"],
            living_area=simplified_data["living_area"],
            bedrooms=simplified_data["bedrooms"],
            bathrooms=simplified_data["bathrooms"],
            year_built=simplified_data["year_built"],
        )

        logging.debug("Formatted data for agent: %s", formatted_data)

        # Invoke the LLM with the formatted data
        agent_response = llm.invoke(formatted_data)
        content = agent_response.content
        logging.debug("Agent response content: %s", content)

        # --- Regex Extraction ---
        investment_score_match = re.search(r"(?i)\*\*Investment Score\*\*:\s*(\d+)", content)
        investment_score = int(investment_score_match.group(1)) if investment_score_match else None

        address_match = re.search(r"(?i)\*\*Address\*\*:\s*(.+)", content)
        address = address_match.group(1).strip() if address_match else "Not available"

        strengths_match = re.search(r"(?i)\*\*Strengths\*\*:\s*(.*?)\s*\*\*Weaknesses\*\*", content, re.S)
        strengths = [s.strip() for s in strengths_match.group(1).split("\n") if s.strip()] if strengths_match else []

        weaknesses_match = re.search(r"(?i)\*\*Weaknesses\*\*:\s*(.*?)\s*\*\*Estimated ROI\*\*", content, re.S)
        weaknesses = [w.strip() for w in weaknesses_match.group(1).split("\n") if w.strip()] if weaknesses_match else []

        roi_5_years_match = re.search(r"(?i)ROI \(5 years\):\s*(?:approximately\s*)?([\d.]+)%", content)
        roi_5_years = float(roi_5_years_match.group(1)) if roi_5_years_match else None

        roi_10_years_match = re.search(r"(?i)ROI \(10 years\):\s*(?:approximately\s*)?([\d.]+)%", content)
        roi_10_years = float(roi_10_years_match.group(1)) if roi_10_years_match else None

        yearly_yield_match = re.search(r"(?i)\*\*Yearly Yield\*\*[\s\S]*?(?:approximately\s*)?([\d.]+)%", content)
        yearly_yield = float(yearly_yield_match.group(1)) if yearly_yield_match else None

        monthly_rental_income_match = re.search(r"(?i)\*\*Monthly Rental Income\*\*[\s\S]*?(?:approximately\s*)?€([\d.,]+)", content)
        monthly_rental_income = float(monthly_rental_income_match.group(1).replace(",", "")) if monthly_rental_income_match else None

        expected_monthly_income_match = re.search(r"(?i)\*\*Expected Monthly Income\*\*[\s\S]*?(?:approximately\s*)?€([\d.,]+)", content)
        expected_monthly_income = float(expected_monthly_income_match.group(1).replace(",", "")) if expected_monthly_income_match else None

        yearly_appreciation_percentage_match = re.search(r"(?i)\*\*Yearly Appreciation\*\*[\s\S]*?(?:approximately\s*)?([\d.]+)%", content)
        yearly_appreciation_percentage = float(yearly_appreciation_percentage_match.group(1)) if yearly_appreciation_percentage_match else None

        yearly_appreciation_value_match = re.search(r"(?i)\*\*Yearly Appreciation\*\*[\s\S]*?(?:approximately\s*)?.*?\(€([\d.,]+)\)", content)
        yearly_appreciation_value = float(yearly_appreciation_value_match.group(1).replace(",", "")) if yearly_appreciation_value_match else None

        # NEW: Extract additional financial metrics
        dscr_match = re.search(r"(?i)DSCR:\s*([\d.]+)", content)
        dscr = float(dscr_match.group(1)) if dscr_match else None

        cash_on_cash_match = re.search(r"(?i)Cash on Cash Return:\s*([\d.]+)%", content)
        cash_on_cash_return = float(cash_on_cash_match.group(1)) if cash_on_cash_match else None

        grm_match = re.search(r"(?i)GRM:\s*([\d.]+)", content)
        grm = float(grm_match.group(1)) if grm_match else None

        irr_match = re.search(r"(?i)IRR:\s*([\d.]+)%", content)
        irr = float(irr_match.group(1)) if irr_match else None

        equity_buildup_match = re.search(r"(?i)Equity Buildup:\s*€([\d.,]+)\s*per year", content)
        equity_buildup = float(equity_buildup_match.group(1).replace(",", "")) if equity_buildup_match else None

        # NEW: Extract market metrics
        days_on_market_match = re.search(r"(?i)Days on Market:\s*(\d+)\s*days", content)
        days_on_market = int(days_on_market_match.group(1)) if days_on_market_match else None

        property_tax_rate_match = re.search(r"(?i)Property Tax Rate:\s*([\d.]+)%", content)
        property_tax_rate = float(property_tax_rate_match.group(1)) if property_tax_rate_match else None

        community_fees_match = re.search(r"(?i)Community Fees:\s*€([\d.,]+)\s*monthly", content)
        community_fees = float(community_fees_match.group(1).replace(",", "")) if community_fees_match else None

        vacancy_rate_match = re.search(r"(?i)Vacancy Rate:\s*([\d.]+)%", content)
        vacancy_rate = float(vacancy_rate_match.group(1)) if vacancy_rate_match else None

        tourist_activity_match = re.search(r"(?i)Tourist Activity:\s*(\w+)", content)
        tourist_activity = tourist_activity_match.group(1) if tourist_activity_match else None

        # NEW: Extract property specifications
        energy_label_match = re.search(r"(?i)Energy Label:\s*([A-G])", content)
        energy_label = energy_label_match.group(1) if energy_label_match else None

        building_type_match = re.search(r"(?i)Building Type:\s*(.+?)(?=\n|\*\*|$)", content)
        building_type = building_type_match.group(1).strip() if building_type_match else None

        # NEW: Extract environmental & safety metrics
        flood_risk_match = re.search(r"(?i)Flood Risk:\s*([\d.]+)%", content)
        flood_risk = float(flood_risk_match.group(1)) if flood_risk_match else None

        crime_rate_match = re.search(r"(?i)Crime Rate:\s*([\d.]+)\s*per 1000", content)
        crime_rate = float(crime_rate_match.group(1)) if crime_rate_match else None

        noise_level_match = re.search(r"(?i)Noise Level:\s*(\d+)/100", content)
        noise_level = int(noise_level_match.group(1)) if noise_level_match else None

        air_quality_match = re.search(r"(?i)Air Quality:\s*(\d+)/100", content)
        air_quality = int(air_quality_match.group(1)) if air_quality_match else None

        # If expected_monthly_income is not available, estimate it
        if expected_monthly_income is None and monthly_rental_income is not None:
            expected_monthly_income = monthly_rental_income * 1.1

        logging.debug(
            "Extracted analysis: investment_score=%s, address=%s, roi_5_years=%s, roi_10_years=%s, yearly_yield=%s, monthly_rental_income=%s, expected_monthly_income=%s, yearly_appreciation_percentage=%s, yearly_appreciation_value=%s, strengths=%s, weaknesses=%s",
            investment_score, address, roi_5_years, roi_10_years, yearly_yield, monthly_rental_income, expected_monthly_income, yearly_appreciation_percentage, yearly_appreciation_value, strengths, weaknesses
        )

        # NEW: Add market information to response
        # --- Return response ---
        return {
            "success": True,
            "market": market,  # NEW: Include market information
            "scraped_data": simplified_data,
            "agent_analysis": {
                "investment_score": investment_score,
                "address": address,
                "roi_5_years": roi_5_years,
                "roi_10_years": roi_10_years,
                "yearly_yield": yearly_yield,
                "monthly_rental_income": monthly_rental_income,
                "expected_monthly_income": expected_monthly_income,
                "yearly_appreciation_percentage": yearly_appreciation_percentage,
                "yearly_appreciation_value": yearly_appreciation_value,
                "strengths": strengths,
                "weaknesses": weaknesses,
                # NEW: Additional financial metrics
                "dscr": dscr,
                "cash_on_cash_return": cash_on_cash_return,
                "grm": grm,
                "irr": irr,
                "equity_buildup": equity_buildup,
                # NEW: Market metrics
                "days_on_market": days_on_market,
                "property_tax_rate": property_tax_rate,
                "community_fees": community_fees,
                "vacancy_rate": vacancy_rate,
                "tourist_activity": tourist_activity,
                # NEW: Property specifications
                "energy_label": energy_label,
                "building_type": building_type,
                # NEW: Environmental & safety metrics
                "flood_risk": flood_risk,
                "crime_rate": crime_rate,
                "noise_level": noise_level,
                "air_quality": air_quality,
            },
        }
    except HTTPException as http_exc:
        # Re-raise HTTPExceptions directly
        raise http_exc
    except Exception as e:
        logging.error("Error analyzing property: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")


# Add health endpoint for Docker health checks
@app.get("/health")
async def health():
    """Health check endpoint for Docker containers"""
    return {"status": "healthy", "message": "AI Agent is running", "service": "atlas-ai-agent"}


@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "message": "Atlas AI Agent - Real Estate Analysis Service",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/analyze",
            "health": "/health",
            "docs": "/docs",
            "openapi": "/openapi.json"
        },
        "supported_markets": ["dutch", "spanish"],
        "platforms": ["funda.nl", "idealista.com", "fotocasa.es", "habitaclia.com"]
    }