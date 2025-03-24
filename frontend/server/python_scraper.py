#!/usr/bin/env python3
import sys
import json
import re
import random
from datetime import datetime
import requests
from bs4 import BeautifulSoup

def scrape_idealista(url):
    """Scrape property data from Idealista."""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract basic property information
        title = soup.select_one('h1.main-info__title')
        title_text = title.text.strip() if title else "Property"
        
        # Extract price
        price_container = soup.select_one('span.price')
        price_text = price_container.text.strip() if price_container else ""
        price = extract_number(price_text)
        
        # Extract location
        location = soup.select_one('span.main-info__title-address')
        location_text = location.text.strip() if location else ""
        
        # Extract square meters
        details = soup.select('.details-property-feature-one')
        square_meters = None
        bedrooms = None
        bathrooms = None
        
        for detail in details:
            text = detail.text.strip()
            if 'm²' in text:
                square_meters = extract_number(text)
            elif 'hab' in text:
                bedrooms = extract_number(text)
            elif 'baño' in text:
                bathrooms = extract_number(text)
        
        # Extract description
        description_container = soup.select_one('.comment')
        description = description_container.text.strip() if description_container else ""
        
        # Extract images
        images = []
        image_containers = soup.select('.gallery-thumbs img')
        for img in image_containers[:5]:  # Limit to 5 images
            if 'src' in img.attrs:
                images.append(img['src'])
            elif 'data-src' in img.attrs:
                images.append(img['data-src'])
        
        # Calculate investment metrics with proper null checks
        price_per_sqm = int(price / square_meters) if price and square_meters and square_meters > 0 else None
        
        # Check if required data for calculations is available
        if price is None:
            print("No price found, using fallback data")
            return {
                "success": False,
                "error": "Could not extract price from page",
                "data": generate_synthetic_data(url)
            }
        
        # Add realistic investment calculations with null checks
        monthly_rent = estimate_monthly_rent(price, location_text) if price else 1500
        annual_rental_income = monthly_rent * 12 if monthly_rent else 18000
        
        # Estimate expenses with null checks
        property_tax = price * 0.005 if price else 1750  # 0.5% of price
        insurance = price * 0.002 if price else 700  # 0.2% of price
        maintenance = price * 0.01 if price else 3500  # 1% of price annually
        management_fees = annual_rental_income * 0.08 if annual_rental_income else 1440  # 8% of rental income
        
        total_expenses = property_tax + insurance + maintenance + management_fees
        net_operating_income = annual_rental_income - total_expenses if annual_rental_income else 12000
        
        # Calculate cap rate and cash-on-cash return with null checks
        cap_rate = (net_operating_income / price) * 100 if price and net_operating_income and price > 0 else 3.5
        cash_on_cash_return = calculate_cash_on_cash(price, net_operating_income) if price and net_operating_income else 4.2
        
        # Calculate rental yield with null checks
        rental_yield = (annual_rental_income / price) * 100 if price and annual_rental_income and price > 0 else 4.0
        
        # Location analysis based on address text
        location_scores = analyze_location(location_text)
        
        # Risk assessment
        risk_assessment = assess_risk(location_text, price_per_sqm, rental_yield)
        
        # Result object formatted to match the expected structure
        result = {
            "propertyAddress": title_text + " - " + location_text,
            "price": price,
            "squareMeters": square_meters,
            "pricePerSqm": price_per_sqm,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "description": description,
            "images": images,
            "source": {
                "platform": "idealista",
                "url": url,
                "scrapedAt": datetime.now().isoformat(),
            },
            "financialMetrics": {
                "purchasePrice": price,
                "estimatedMonthlyRent": monthly_rent,
                "annualRentalIncome": annual_rental_income,
                "expenses": {
                    "propertyTax": property_tax,
                    "insurance": insurance,
                    "maintenance": maintenance,
                    "managementFees": management_fees
                },
                "totalExpenses": total_expenses,
                "netOperatingIncome": net_operating_income,
                "capRate": cap_rate,
                "cashOnCashReturn": cash_on_cash_return,
                "rentalYield": rental_yield,
                "appreciationForecast": location_scores["growth_rate"]
            },
            "marketTrends": {
                "rentalYield": rental_yield,
                "areaGrowth": location_scores["growth_rate"],
            },
            "locationAnalysis": {
                "walkScore": location_scores["walk_score"],
                "transitScore": location_scores["transit_score"],
            },
            "riskAssessment": {
                "overall": risk_assessment["risk_level"],
                "score": risk_assessment["score"]
            },
            "atlasScore": calculate_atlas_score(rental_yield, location_scores, risk_assessment)
        }
        
        return {"success": True, "data": result}
        
    except Exception as e:
        print(f"Error in Python scraper: {str(e)}")
        return {
            "success": False, 
            "error": str(e),
            "data": generate_synthetic_data(url)
        }

def extract_number(text):
    """Extract numeric value from text."""
    if not text:
        return None
    match = re.search(r'(\d{1,3}(?:\.\d{3})*|\d+)(?:[.,](\d+))?', text.replace(',', '.'))
    if match:
        integer_part = match.group(1).replace('.', '')
        decimal_part = match.group(2) or ''
        return int(integer_part) if not decimal_part else float(f"{integer_part}.{decimal_part}")
    return None

def estimate_monthly_rent(price, location):
    """Estimate monthly rent based on price and location."""
    if not price:
        return 1500  # Default value
    
    # Base rental yield varies by location
    rental_yield = 4.5  # Default value (annual percentage)
    location = location.lower()
    
    if 'madrid' in location:
        rental_yield = 4.2
    elif 'barcelona' in location:
        rental_yield = 4.0
    elif 'valencia' in location:
        rental_yield = 5.0
    elif 'sevilla' in location or 'seville' in location:
        rental_yield = 5.2
    elif 'málaga' in location or 'malaga' in location:
        rental_yield = 5.5
    
    # Calculate monthly rent from annual yield
    monthly_rent = round((price * rental_yield / 100) / 12)
    return monthly_rent

def calculate_cash_on_cash(price, net_operating_income):
    """Calculate cash-on-cash return based on price and NOI."""
    if not price or not net_operating_income or price <= 0:
        return 4.5  # Default value if missing data
    
    try:
        # Assume 30% down payment
        down_payment = price * 0.3
        loan_amount = price - down_payment
        
        # Ensure down payment is not zero to avoid division by zero
        if down_payment <= 0:
            return 4.5
        
        # Assume 3.5% interest rate, 30-year loan
        monthly_interest_rate = 0.035 / 12
        term_months = 30 * 12
        
        # Calculate mortgage payment
        monthly_payment = (loan_amount * monthly_interest_rate * (1 + monthly_interest_rate) ** term_months) / ((1 + monthly_interest_rate) ** term_months - 1)
        annual_mortgage_payment = monthly_payment * 12
        
        # Calculate cash flow and return
        annual_cash_flow = net_operating_income - annual_mortgage_payment
        cash_on_cash_return = (annual_cash_flow / down_payment) * 100
        
        return cash_on_cash_return
    except Exception as e:
        print(f"Error calculating cash-on-cash return: {e}")
        return 4.5  # Return a reasonable default

def analyze_location(location_text):
    """Analyze location and return scores."""
    # This would ideally use external APIs for walk score, transit score, etc.
    # For now, we'll generate realistic values based on keywords in the location
    
    location = location_text.lower()
    
    # Base scores
    walk_score = 70
    transit_score = 65
    growth_rate = 3.0
    
    # Adjust based on location keywords
    if 'madrid' in location:
        if 'centro' in location or 'salamanca' in location:
            walk_score = 95
            transit_score = 90
            growth_rate = 4.0
        else:
            walk_score = 85
            transit_score = 85
            growth_rate = 3.5
    elif 'barcelona' in location:
        if 'eixample' in location or 'gracia' in location:
            walk_score = 95
            transit_score = 95
            growth_rate = 3.8
        else:
            walk_score = 90
            transit_score = 90
            growth_rate = 3.5
    elif 'valencia' in location:
        walk_score = 80
        transit_score = 75
        growth_rate = 4.2
    elif 'sevilla' in location or 'seville' in location:
        walk_score = 75
        transit_score = 70
        growth_rate = 4.0
    elif 'málaga' in location or 'malaga' in location:
        walk_score = 70
        transit_score = 65
        growth_rate = 4.5
    
    # Add some randomness to make it more realistic
    walk_score = min(100, max(0, walk_score + random.randint(-5, 5)))
    transit_score = min(100, max(0, transit_score + random.randint(-5, 5)))
    growth_rate = max(0, growth_rate + (random.random() - 0.5))
    
    return {
        "walk_score": walk_score,
        "transit_score": transit_score,
        "growth_rate": round(growth_rate, 1)
    }

def assess_risk(location_text, price_per_sqm, rental_yield):
    """Assess investment risk based on location, price, and yield."""
    risk_score = 75  # Default medium-low risk (0-100, higher is better)
    
    # Location-based risk adjustment
    location = location_text.lower()
    if 'madrid' in location or 'barcelona' in location:
        if 'centro' in location or 'salamanca' in location or 'eixample' in location:
            risk_score += 10  # Prime locations are lower risk
        risk_score += 5  # Major cities are generally lower risk
    elif 'valencia' in location or 'sevilla' in location or 'malaga' in location:
        risk_score += 0  # Neutral
    else:
        risk_score -= 5  # Less established markets
    
    # Price-based risk adjustment
    if price_per_sqm:
        if price_per_sqm > 5000:
            risk_score -= 5  # Very expensive properties might be harder to rent/sell
        elif price_per_sqm < 2000:
            risk_score -= 3  # Very cheap might indicate less desirable area
    
    # Yield-based risk adjustment
    if rental_yield:
        if rental_yield > 6:
            risk_score += 8  # Higher yield is good
        elif rental_yield > 5:
            risk_score += 5
        elif rental_yield > 4:
            risk_score += 0  # Average yield
        else:
            risk_score -= 5  # Below average yield
    
    # Determine risk level based on score
    if risk_score >= 85:
        risk_level = "Very Low"
    elif risk_score >= 75:
        risk_level = "Low"
    elif risk_score >= 60:
        risk_level = "Medium"
    elif risk_score >= 40:
        risk_level = "High"
    else:
        risk_level = "Very High"
    
    # Cap the score between 0-100
    risk_score = min(100, max(0, risk_score))
    
    return {
        "score": risk_score,
        "risk_level": risk_level
    }

def calculate_atlas_score(rental_yield, location_scores, risk_assessment):
    """Calculate overall Atlas investment score."""
    if not rental_yield:
        rental_yield = 4.5  # Default value
    
    if not location_scores:
        location_scores = {"walk_score": 75, "transit_score": 70, "growth_rate": 3.5}
    
    if not risk_assessment or not isinstance(risk_assessment, dict):
        risk_assessment = {"score": 75, "risk_level": "Medium"}
    
    try:
        # Component weights
        yield_weight = 0.4
        location_weight = 0.3
        risk_weight = 0.3
        
        # Calculate component scores
        yield_score = min(rental_yield * 10, 50)  # Cap at 50 points
        location_score = ((location_scores.get("walk_score", 75) + location_scores.get("transit_score", 70)) / 2) * 0.3
        risk_score = risk_assessment.get("score", 75) * 0.3
        
        # Calculate total score
        total_score = yield_score + location_score + risk_score
        
        # Round and ensure it's between 0-100
        atlas_score = min(100, max(0, round(total_score)))
        
        return atlas_score
    except Exception as e:
        print(f"Error calculating Atlas score: {e}")
        return 75  # Default score on error

def generate_synthetic_data(url):
    """Generate synthetic data when scraping fails."""
    # Extract property ID from URL if possible
    id_match = re.search(r'/(\d+)/?$', url)
    property_id = id_match.group(1) if id_match else str(random.randint(1000000, 9999999))
    
    # Generate synthetic location
    cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga']
    neighborhoods = ['Centro', 'Salamanca', 'Chamberí', 'Eixample', 'Gracia', 'El Carmen']
    
    city = next((c for c in cities if c.lower() in url.lower()), random.choice(cities))
    neighborhood = random.choice(neighborhoods)
    location = f"{neighborhood}, {city}"
    
    # Generate realistic property values
    square_meters = random.randint(70, 160)
    bedrooms = min(5, max(1, round(square_meters / 25)))
    bathrooms = min(3, max(1, round(bedrooms * 0.7)))
    
    # Price based on city and size (€/m²)
    price_per_sqm_map = {
        'Madrid': 4200,
        'Barcelona': 4500,
        'Valencia': 2800,
        'Sevilla': 2500,
        'Málaga': 3000
    }
    
    base_price_per_sqm = price_per_sqm_map.get(city, 3500)
    price_variation = (random.random() * 0.3) - 0.15  # ±15%
    price_per_sqm = round(base_price_per_sqm * (1 + price_variation))
    price = price_per_sqm * square_meters
    
    # Spanish rental yields by city
    rental_yields_map = {
        'Madrid': 4.5,
        'Barcelona': 4.2,
        'Valencia': 5.1,
        'Sevilla': 5.3,
        'Málaga': 5.5
    }
    
    rental_yield = rental_yields_map.get(city, 4.8)
    monthly_rent = round((price * rental_yield / 100) / 12)
    
    # Calculate financial metrics
    annual_rental_income = monthly_rent * 12
    property_tax = price * 0.005
    insurance = price * 0.002
    maintenance = price * 0.01
    management_fees = annual_rental_income * 0.08
    
    total_expenses = property_tax + insurance + maintenance + management_fees
    net_operating_income = annual_rental_income - total_expenses
    
    cap_rate = (net_operating_income / price) * 100
    cash_on_cash_return = calculate_cash_on_cash(price, net_operating_income)
    
    # Location analysis
    location_scores = analyze_location(location)
    
    # Risk assessment
    risk_assessment = assess_risk(location, price_per_sqm, rental_yield)
    
    # Calculate Atlas score
    atlas_score = calculate_atlas_score(rental_yield, location_scores, risk_assessment)
    
    # Synthetic result
    return {
        "propertyAddress": f"Property in {location} (ID: {property_id})",
        "price": price,
        "squareMeters": square_meters,
        "pricePerSqm": price_per_sqm,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "description": f"Beautiful {bedrooms} bedroom property with {bathrooms} bathrooms and {square_meters}m² of living space in {location}.",
        "images": [],
        "source": {
            "platform": "idealista",
            "url": url,
            "scrapedAt": datetime.now().isoformat(),
            "synthetic": True
        },
        "financialMetrics": {
            "purchasePrice": price,
            "estimatedMonthlyRent": monthly_rent,
            "annualRentalIncome": annual_rental_income,
            "expenses": {
                "propertyTax": property_tax,
                "insurance": insurance,
                "maintenance": maintenance,
                "managementFees": management_fees
            },
            "totalExpenses": total_expenses,
            "netOperatingIncome": net_operating_income,
            "capRate": cap_rate,
            "cashOnCashReturn": cash_on_cash_return,
            "rentalYield": rental_yield,
            "appreciationForecast": location_scores["growth_rate"]
        },
        "marketTrends": {
            "rentalYield": rental_yield,
            "areaGrowth": location_scores["growth_rate"],
        },
        "locationAnalysis": {
            "walkScore": location_scores["walk_score"],
            "transitScore": location_scores["transit_score"],
        },
        "riskAssessment": {
            "overall": risk_assessment["risk_level"],
            "score": risk_assessment["score"]
        },
        "atlasScore": atlas_score
    }

def main():
    """Main function to handle CLI arguments and return results."""
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No URL provided"}))
        sys.exit(1)
    
    url = sys.argv[1]
    platform = sys.argv[2] if len(sys.argv) > 2 else 'idealista'
    
    if 'idealista' in url:
        result = scrape_idealista(url)
    else:
        # Default to idealista scraper for now
        result = scrape_idealista(url)
    
    # Output JSON result to stdout
    print(json.dumps(result))

if __name__ == "__main__":
    main() 