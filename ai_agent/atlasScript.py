from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from new_funda_scraper import FundaScraper  # Import the FundaScraper class
from idealista_scraper import IdealistaScraper  # Import the IdealistaScraper class
import logging
import re
import os
from dotenv import load_dotenv
from urllib.parse import urlparse  # Import urlparse

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://atlasnew-git-main-luigifaldettas-projects.vercel.app/"],  # Allow requests from your frontend
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
    model_name="gpt-4",  # Replace with your OpenAI model
    openai_api_key=api_key,  # Replace with your OpenAI API key
)

# Define the chat prompt template
prompt = ChatPromptTemplate.from_messages(
    [
        {
            "role": "system",
            "content": """
            You are a real estate investment analysis AI. Your job is to analyze the provided property data and generate a detailed investment analysis.
            The response must strictly follow the format below to ensure it can be parsed correctly by regex patterns.

            1. **Property Details**:
               - Address, price, living area, number of bedrooms, number of bathrooms, and year built.

            Based on the provided data, generate:
            - An **Investment Score** (0-100) that reflects the overall investment potential. Consider all provided details including bathrooms and year built.
            - A detailed explanation of the score, highlighting the strengths and weaknesses of the property.
            - An estimated **ROI (Return on Investment)** percentage for 5 years and 10 years based on reasonable assumptions about rental income and expenses.
            - The **Yearly Yield** percentage, calculated as (Net Annual Income / Purchase Price) * 100.
            - The **Monthly Rental Income** (best estimate based on the property details).
            - The **Expected Monthly Income** after potential improvements and market adjustments (should be 5-15% higher than current rental income).
            - The **Yearly Appreciation** percentage and its corresponding value in euros.

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

            Ensure the response strictly adheres to this format, including the exact headings, spacing, and structure. Do not include any additional text or explanations outside this format.
            """
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
    ]
)

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


        if "funda.nl" in domain:
            logging.info("Detected Funda URL. Using FundaScraper.")
            scraper = FundaScraper()
        elif "idealista.com" in domain:
            logging.info("Detected Idealista URL. Using IdealistaScraper.")
            scraper = IdealistaScraper(proxy=proxy_config)
        else:
            logging.error(f"Unsupported domain: {domain}")
            raise HTTPException(status_code=400, detail=f"Unsupported URL domain: {domain}. Only funda.nl and idealista.com are supported.")

        # --- Scrape data using the selected scraper ---
        await scraper.start()
        scraped_data = await scraper.scrape_property(request.url)
        await scraper.close()

        if not scraped_data:
            logging.error("Failed to scrape property data.")
            raise HTTPException(status_code=400, detail="Failed to scrape property data from the provided URL.")

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
        }
        logging.debug(f"Simplified data being sent to frontend (under 'scraped_data'): {simplified_data}")

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

        # If expected_monthly_income is not available, estimate it
        if expected_monthly_income is None and monthly_rental_income is not None:
            expected_monthly_income = monthly_rental_income * 1.1

        logging.debug(
            "Extracted analysis: investment_score=%s, address=%s, roi_5_years=%s, roi_10_years=%s, yearly_yield=%s, monthly_rental_income=%s, expected_monthly_income=%s, yearly_appreciation_percentage=%s, yearly_appreciation_value=%s, strengths=%s, weaknesses=%s",
            investment_score, address, roi_5_years, roi_10_years, yearly_yield, monthly_rental_income, expected_monthly_income, yearly_appreciation_percentage, yearly_appreciation_value, strengths, weaknesses
        )

        # --- Return response ---
        return {
            "success": True,
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
            },
        }
    except HTTPException as http_exc:
        # Re-raise HTTPExceptions directly
        raise http_exc
    except Exception as e:
        logging.error("Error analyzing property: %s", str(e), exc_info=True)
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")