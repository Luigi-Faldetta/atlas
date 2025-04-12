from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from ai_agent.new_funda_scraper import FundaScraper
import logging
import re
import os
from dotenv import load_dotenv

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
prompt = ChatPromptTemplate.from_messages([
    SystemMessagePromptTemplate.from_template(
        """
        You are a real estate investment analysis AI. Your job is to analyze the provided property data and generate a detailed investment analysis.

        The response must strictly follow the format below to ensure it can be parsed correctly by regex patterns.

        1. **Property Details**:
           - Address, price, living area, plot size, and number of bedrooms.

        Based on the provided data, generate:
        - An **Investment Score** (0-100) that reflects the overall investment potential.
        - A detailed explanation of the score, highlighting the strengths and weaknesses of the property.
        - An estimated **ROI (Return on Investment)** percentage for 5 years and 10 years based on reasonable assumptions about rental income and expenses.
        - The **Yearly Yield** percentage, calculated as (Net Annual Income / Purchase Price) * 100.
        - The **Monthly Rental Income** (best estimate based on the property details).
        - The **Yearly Appreciation** percentage and its corresponding value in euros.

        The response must strictly adhere to this format:

        **Investment Score**: <score>/100

        **Address**: <address>

        **Score Explanation**:
        <explanation>

        **Strengths**:
        - <strength 1>
        - <strength 2>
        - <strength 3>

        **Weaknesses**:
        - <weakness 1>
        - <weakness 2>
        - <weakness 3>

        **Estimated ROI**:
        ROI (5 years): <value>%
        ROI (10 years): <value>%

        **Yearly Yield**:
        approximately <value>%

        **Monthly Rental Income**:
        approximately €<value>

        **Yearly Appreciation**:
        approximately <value>% (€<value>)

        Ensure the response strictly adheres to this format, including the exact headings, spacing, and structure. Do not include any additional text or explanations outside this format.
        """
    ),
    HumanMessagePromptTemplate.from_template(
        """
        Here is the property data for analysis:
        Address: {address}
        Price: {price}
        Living Area: {living_area}
        Plot Size: {plot_size}
        Bedrooms: {bedrooms}
        """
    )
])

# Define the request model
class AnalyzeRequest(BaseModel):
    url: str

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    try:
        logging.debug("Received request to analyze property: %s", request.url)

        # Initialize the scraper
        scraper = FundaScraper()
        await scraper.start()
        scraped_data = await scraper.scrape_property(request.url)
        await scraper.close()

        if not scraped_data:
            logging.error("Failed to scrape property data.")
            raise HTTPException(status_code=400, detail="Failed to scrape property data.")

        logging.debug("Scraped data: %s", scraped_data)

        # Simplify the scraped data
        simplified_data = {
            "address": scraped_data.get("Address", "Not available"),
            "price": scraped_data.get("Price", "Not available"),
            "living_area": scraped_data.get("Living Area", "Not available"),
            "plot_size": scraped_data.get("Plot Size", "Not available"),
            "bedrooms": scraped_data.get("Bedrooms", "Not available"),
        }

        # Format the input for the prompt
        formatted_data = prompt.format_messages(
            address=simplified_data["address"],
            price=simplified_data["price"],
            living_area=simplified_data["living_area"],
            plot_size=simplified_data["plot_size"],
            bedrooms=simplified_data["bedrooms"],
        )

        logging.debug("Formatted data for agent: %s", formatted_data)

        # Invoke the LLM with the formatted data
        agent_response = llm.invoke(formatted_data)

        # Access the content of the AIMessage object
        content = agent_response.content
        logging.debug("Agent response content: %s", content)

        # Extract investment score
        investment_score_match = re.search(r"(?i)\*\*Investment Score\*\*:\s*(\d+)", content)
        investment_score = int(investment_score_match.group(1)) if investment_score_match else None

        # Extract address
        address_match = re.search(r"(?i)\*\*Address\*\*:\s*(.+)", content)
        address = address_match.group(1).strip() if address_match else "Not available"

        # Extract strengths
        strengths_match = re.search(r"(?i)\*\*Strengths\*\*:\s*(.*?)\s*\*\*Weaknesses\*\*", content, re.S)
        strengths = [s.strip() for s in strengths_match.group(1).split("\n") if s.strip()] if strengths_match else []

        # Extract weaknesses
        weaknesses_match = re.search(r"(?i)\*\*Weaknesses\*\*:\s*(.*?)\s*\*\*Estimated ROI\*\*", content, re.S)
        weaknesses = [w.strip() for w in weaknesses_match.group(1).split("\n") if w.strip()] if weaknesses_match else []

        # Extract ROI (5 years)
        roi_5_years_match = re.search(r"(?i)ROI \(5 years\):\s*(?:approximately\s*)?([\d.]+)%", content)
        roi_5_years = float(roi_5_years_match.group(1)) if roi_5_years_match else None

        # Extract ROI (10 years)
        roi_10_years_match = re.search(r"(?i)ROI \(10 years\):\s*(?:approximately\s*)?([\d.]+)%", content)
        roi_10_years = float(roi_10_years_match.group(1)) if roi_10_years_match else None

        # Extract Yearly Yield
        yearly_yield_match = re.search(r"(?i)\*\*Yearly Yield\*\*[\s\S]*?(?:approximately\s*)?([\d.]+)%", content)
        yearly_yield = float(yearly_yield_match.group(1)) if yearly_yield_match else None

        # Extract Monthly Rental Income
        monthly_rental_income_match = re.search(r"(?i)\*\*Monthly Rental Income\*\*[\s\S]*?(?:approximately\s*)?€([\d.,]+)", content)
        monthly_rental_income = float(monthly_rental_income_match.group(1).replace(",", "")) if monthly_rental_income_match else None

        # Extract Yearly Appreciation Percentage
        yearly_appreciation_percentage_match = re.search(r"(?i)\*\*Yearly Appreciation\*\*[\s\S]*?(?:approximately\s*)?([\d.]+)%", content)
        yearly_appreciation_percentage = float(yearly_appreciation_percentage_match.group(1)) if yearly_appreciation_percentage_match else None

        # Extract Yearly Appreciation Value (in euros)
        yearly_appreciation_value_match = re.search(r"(?i)\*\*Yearly Appreciation\*\*[\s\S]*?(?:approximately\s*)?.*?\(€([\d.,]+)\)", content)
        yearly_appreciation_value = float(yearly_appreciation_value_match.group(1).replace(",", "")) if yearly_appreciation_value_match else None

        logging.debug(
            "Extracted analysis: investment_score=%s, address=%s, roi_5_years=%s, roi_10_years=%s, yearly_yield=%s, monthly_rental_income=%s, yearly_appreciation_percentage=%s, yearly_appreciation_value=%s, strengths=%s, weaknesses=%s",
            investment_score, address, roi_5_years, roi_10_years, yearly_yield, monthly_rental_income, yearly_appreciation_percentage, yearly_appreciation_value, strengths, weaknesses
        )

        # Return both the scraped data and the agent's analysis
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
                "yearly_appreciation_percentage": yearly_appreciation_percentage,
                "yearly_appreciation_value": yearly_appreciation_value,
                "strengths": strengths,
                "weaknesses": weaknesses,
            },
        }
    except Exception as e:
        logging.error("Error analyzing property: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))