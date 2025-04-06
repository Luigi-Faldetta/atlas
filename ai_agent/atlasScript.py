from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from new_funda_scraper import FundaScraper  # Import the FundaScraper class
import logging
import re

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

# Initialize the LangChain Chat LLM
llm = ChatOpenAI(
    temperature=0.7,
    model_name="gpt-4",  # Replace with your OpenAI model
    openai_api_key="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",  # Replace with your OpenAI API key
)

# Define the chat prompt template
prompt = ChatPromptTemplate.from_messages(
    [
        {
            "role": "system",
            "content": """
            You are a real estate investment analysis AI. Your job is to analyze the provided property data and generate a detailed investment analysis. 
            Consider the following criteria in your analysis:
            
            1. **Property Details**:
               - Address, price, living area, plot size, and number of bedrooms.

            Based on the provided data, generate:
            - An **Investment Score** (0-100) that reflects the overall investment potential.
            - A detailed explanation of the score, highlighting the strengths and weaknesses of the property.
            - An estimated **ROI (Return on Investment)** percentage based on reasonable assumptions about rental income and expenses.
            """
        },
        {
            "role": "user",
            "content": """
            Here is the property data for analysis:
            Address: {address}
            Price: {price}
            Living Area: {living_area}
            Plot Size: {plot_size}
            Bedrooms: {bedrooms}
            """
        },
    ]
)

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

        # Extract investment score, strengths, and weaknesses from the content
        investment_score_match = re.search(r"\*\*Investment Score\*\*:\s*(\d+)\s*/\s*100", content, re.IGNORECASE)
        investment_score = int(investment_score_match.group(1)) if investment_score_match else None

        strengths_match = re.search(r"Strengths:\n\n(.*?)\n\nWeaknesses:", content, re.S)
        strengths = [s.strip() for s in strengths_match.group(1).split("\n") if s.strip()] if strengths_match else []

        weaknesses_match = re.search(r"Weaknesses:\n\n(.*?)\n\n\*\*Estimated ROI:", content, re.S)
        weaknesses = [w.strip() for w in weaknesses_match.group(1).split("\n") if w.strip()] if weaknesses_match else []

        roi_match = re.search(r"ROI.*?=\s*([\d.]+)%", content, re.IGNORECASE)
        roi = float(roi_match.group(1)) if roi_match else None

        logging.debug("Extracted analysis: investment_score=%s, roi=%s, strengths=%s, weaknesses=%s",
                      investment_score, roi, strengths, weaknesses)

        # Return both the scraped data and the agent's analysis
        return {
            "success": True,
            "scraped_data": simplified_data,
            "agent_analysis": {
                "investment_score": investment_score,
                "roi": roi,
                "strengths": strengths,
                "weaknesses": weaknesses,
            },
        }
    except Exception as e:
        logging.error("Error analyzing property: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))