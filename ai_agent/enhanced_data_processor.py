"""
Enhanced Data Processor for Atlas Real Estate Analysis
Combines visual scraping, traditional scraping, and external APIs to populate
all metrics needed by the InvestmentAnalysis.tsx component
"""

import asyncio
import json
import logging
import re
import os
import sys
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables including proxy settings
load_dotenv()

# Import visual scraper with proxy support
from visual_scraper import VisualPropertyScraper, VisualScrapingResult
from webscraper_requests import scrape_property_data
from investment_analyzer import InvestmentAnalyzer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class EnhancedPropertyData:
    """Complete property data structure matching InvestmentAnalysis.tsx props"""
    
    # Core required props
    investmentScore: int = 0
    address: str = ""
    price: str = ""
    
    # Financial data (calculated from various sources)
    roi5Years: Optional[float] = None
    roi10Years: Optional[float] = None
    yearlyYield: Optional[float] = None
    monthlyRentalIncome: Optional[float] = None
    expectedMonthlyIncome: Optional[float] = None
    yearlyAppreciationPercentage: Optional[float] = None
    yearlyAppreciationValue: Optional[float] = None
    pricePerSqm: Optional[float] = None
    
    # Property characteristics (from visual + traditional scraping)
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    size: Optional[int] = None
    yearBuilt: Optional[int] = None
    description: str = ""
    features: List[str] = None
    buildingType: str = ""
    energyLabel: str = ""
    lotSize: Optional[int] = None
    
    # Location and amenities (extracted + enhanced)
    nearbyAmenities: Dict[str, int] = None
    distanceToSupermarket: Optional[int] = None
    publicTransitAccess: bool = False
    distanceToGreenSpaces: Optional[int] = None
    
    # Environmental metrics (APIs + visual extraction)
    noisePollutionIndex: Optional[int] = None
    airQualityIndex: Optional[int] = None
    averageSunExposure: Optional[float] = None
    urbanHeatIslandEffect: Optional[float] = None
    floodRisk: Optional[int] = None
    
    # Market data (calculated + external sources)
    vacancyRate: Optional[float] = None
    crimeRate: Optional[float] = None
    propertyTaxRate: Optional[float] = None
    communityFees: Optional[float] = None
    daysOnMarket: Optional[int] = None
    assessedPropertyValue: Optional[float] = None
    listingsNearby: Optional[int] = None
    shortTermRentalActivity: str = ""
    
    # Advanced financial metrics (calculated)
    dscr: Optional[float] = None
    cashOnCashReturn: Optional[float] = None
    grm: Optional[float] = None
    irr: Optional[float] = None
    equityBuildup: Optional[float] = None
    annualRentalIncome: Optional[float] = None
    annualExpenses: Optional[float] = None
    netOperatingIncome: Optional[float] = None
    breakEvenPoint: Optional[float] = None
    fiveYearProjectedValue: Optional[float] = None
    estimatedUtilityCosts: Optional[float] = None
    
    # Socio-economic data (external APIs)
    medianHouseholdIncome: Optional[float] = None
    ageDistributionSummary: str = ""
    socialDiversityIndex: Optional[int] = None
    
    # Lifestyle metrics (visual + calculated)
    culturalVenuesNearby: Optional[int] = None
    footTrafficLevel: str = ""
    eventsPerMonthArea: Optional[int] = None
    sentimentScoreLocalReviews: Optional[int] = None
    publicArtAestheticScore: Optional[int] = None
    petFriendlinessScore: Optional[int] = None
    localMarketsNearby: Optional[int] = None
    parkingSpace: str = ""
    proximityToLargeCity: Optional[Dict[str, Union[str, int, float]]] = None
    
    # Market trends (calculated + historical data)
    priceHistorySummary: str = ""
    neighborhoodPriceTrendSummary: str = ""
    rentalDemandForecast: str = ""
    
    # Quality indicators
    strengths: List[str] = None
    weaknesses: List[str] = None
    locationPros: List[str] = None
    locationCons: List[str] = None
    
    # Suitability scores (calculated)
    suitabilityScores: Dict[str, int] = None
    
    # Data quality metadata
    dataQuality: Dict[str, Any] = None
    hasRealData: bool = False
    
    def __post_init__(self):
        """Initialize default values for list/dict fields"""
        if self.features is None:
            self.features = []
        if self.nearbyAmenities is None:
            self.nearbyAmenities = {"schools": 0, "groceryStores": 0, "gyms": 0, 
                                   "restaurants": 0, "hospitals": 0, "parks": 0}
        if self.strengths is None:
            self.strengths = []
        if self.weaknesses is None:
            self.weaknesses = []
        if self.locationPros is None:
            self.locationPros = []
        if self.locationCons is None:
            self.locationCons = []
        if self.suitabilityScores is None:
            self.suitabilityScores = {"families": 50, "couples": 50, "singles": 50}
        if self.dataQuality is None:
            self.dataQuality = {
                "completeness_score": 0,
                "accuracy_score": 0,
                "sources_used": [],
                "extraction_method": "hybrid",
                "last_updated": datetime.now().isoformat()
            }
        if self.proximityToLargeCity is None:
            self.proximityToLargeCity = {"name": "", "distanceKm": 0, "travelTimeMin": 0}

class EnhancedDataProcessor:
    """Main processor that combines all data sources"""
    
    def __init__(self):
        self.visual_scraper = VisualPropertyScraper()
        self.investment_analyzer = InvestmentAnalyzer()
        self.data_sources_used = []
        
    async def process_property_comprehensive(
        self, 
        property_url: str, 
        address: str = ""
    ) -> EnhancedPropertyData:
        """
        Main processing method that combines:
        1. Visual scraping (screenshots + AI)
        2. Traditional scraping (selectors)
        3. External API data
        4. Financial calculations
        5. Market analysis
        """
        logger.info(f"Starting comprehensive processing for: {property_url}")
        
        # Initialize result structure
        result = EnhancedPropertyData()
        result.address = address or self._extract_address_from_url(property_url)
        
        try:
            # 1. Visual scraping - primary data source
            visual_data = await self._get_visual_data(property_url)
            self._merge_visual_data(result, visual_data)
            
            # 2. Traditional scraping - fill gaps
            traditional_data = await self._get_traditional_scraping_data(property_url)
            self._merge_traditional_data(result, traditional_data)
            
            # 3. External API data - environmental, market, demographics
            api_data = await self._get_external_api_data(result.address)
            self._merge_api_data(result, api_data)
            
            # 4. Calculate financial metrics
            await self._calculate_financial_metrics(result)
            
            # 5. Assess location and lifestyle factors
            await self._assess_location_factors(result)
            
            # 6. Generate market insights
            await self._generate_market_insights(result)
            
            # 7. Calculate investment score and recommendations
            await self._calculate_investment_score(result)
            
            # 8. Update data quality indicators
            self._update_data_quality(result)
            
            logger.info(f"Processing completed. Data completeness: {result.dataQuality['completeness_score']}%")
            return result
            
        except Exception as e:
            logger.error(f"Error in comprehensive processing: {e}")
            # Return partial results with error indication
            result.dataQuality["processing_error"] = str(e)
            return result
    
    async def _get_visual_data(self, property_url: str) -> VisualScrapingResult:
        """Get comprehensive data using visual scraping"""
        try:
            if not self.visual_scraper.browser:
                await self.visual_scraper.start()
            
            visual_result = await self.visual_scraper.scrape_property_comprehensive(property_url)
            self.data_sources_used.append("visual_scraping")
            return visual_result
        except Exception as e:
            logger.error(f"Visual scraping failed: {e}")
            return VisualScrapingResult()
    
    async def _get_traditional_scraping_data(self, property_url: str) -> Dict[str, Any]:
        """Get data using traditional scraping methods"""
        try:
            # Use existing webscraper_requests
            traditional_result = await scrape_property_data(property_url)
            self.data_sources_used.append("traditional_scraping")
            return traditional_result or {}
        except Exception as e:
            logger.error(f"Traditional scraping failed: {e}")
            return {}
    
    async def _get_external_api_data(self, address: str) -> Dict[str, Any]:
        """Get data from external APIs (environmental, demographic, market)"""
        api_data = {}
        
        try:
            # Mock external API calls - replace with real APIs
            
            # Environmental data
            api_data['environmental'] = {
                'air_quality_index': 65,
                'noise_pollution_index': 45,
                'average_sun_exposure': 7.1,
                'urban_heat_island_effect': 1.8,
                'flood_risk': 4
            }
            
            # Market data
            api_data['market'] = {
                'vacancy_rate': 3.2,
                'crime_rate': 12.5,
                'property_tax_rate': 0.7,
                'days_on_market_avg': 52,
                'listings_nearby': 25
            }
            
            # Demographics
            api_data['demographics'] = {
                'median_household_income': 55000,
                'age_distribution_summary': "Majority: 30-45 (35%), 20-29 (25%), 46-60 (20%)",
                'social_diversity_index': 72
            }
            
            # Lifestyle
            api_data['lifestyle'] = {
                'cultural_venues_nearby': 4,
                'foot_traffic_level': "Medium",
                'events_per_month_area': 12,
                'sentiment_score_local_reviews': 85,
                'public_art_aesthetic_score': 78,
                'pet_friendliness_score': 90,
                'local_markets_nearby': 2
            }
            
            self.data_sources_used.append("external_apis")
            
        except Exception as e:
            logger.error(f"External API data collection failed: {e}")
            
        return api_data
    
    def _merge_visual_data(self, result: EnhancedPropertyData, visual_data: VisualScrapingResult):
        """Merge visual scraping results into main result"""
        if visual_data.address:
            result.address = visual_data.address
        if visual_data.price:
            result.price = visual_data.price
        if visual_data.bedrooms:
            result.bedrooms = visual_data.bedrooms
        if visual_data.bathrooms:
            result.bathrooms = visual_data.bathrooms
        if visual_data.size:
            result.size = visual_data.size
        if visual_data.year_built:
            result.yearBuilt = visual_data.year_built
        if visual_data.description:
            result.description = visual_data.description
        if visual_data.features:
            result.features = visual_data.features
        if visual_data.energy_label:
            result.energyLabel = visual_data.energy_label
        if visual_data.property_type:
            result.buildingType = visual_data.property_type
        
        # Financial data from visual extraction
        if visual_data.price_per_sqm:
            result.pricePerSqm = visual_data.price_per_sqm
        if visual_data.monthly_costs:
            result.communityFees = visual_data.monthly_costs
        
        # Update data quality
        if visual_data.data_completeness_score > 0:
            result.hasRealData = True
            result.dataQuality["visual_extraction_score"] = visual_data.data_completeness_score
    
    def _merge_traditional_data(self, result: EnhancedPropertyData, traditional_data: Dict[str, Any]):
        """Merge traditional scraping results, filling gaps in visual data"""
        # Only override if visual data is missing
        if not result.address and traditional_data.get('address'):
            result.address = traditional_data['address']
        if not result.price and traditional_data.get('price'):
            result.price = traditional_data['price']
        if not result.bedrooms and traditional_data.get('bedrooms'):
            try:
                result.bedrooms = int(traditional_data['bedrooms'])
            except (ValueError, TypeError):
                pass
        if not result.bathrooms and traditional_data.get('bathrooms'):
            try:
                result.bathrooms = int(traditional_data['bathrooms'])
            except (ValueError, TypeError):
                pass
        if not result.size and traditional_data.get('size'):
            result.size = self._extract_numeric_value(traditional_data['size'])
        if not result.yearBuilt and traditional_data.get('year_built'):
            try:
                result.yearBuilt = int(traditional_data['year_built'])
            except (ValueError, TypeError):
                pass
        
        # Add features if not already captured
        if traditional_data.get('features') and not result.features:
            result.features = traditional_data['features']
    
    def _merge_api_data(self, result: EnhancedPropertyData, api_data: Dict[str, Any]):
        """Merge external API data"""
        # Environmental data
        env_data = api_data.get('environmental', {})
        result.airQualityIndex = env_data.get('air_quality_index')
        result.noisePollutionIndex = env_data.get('noise_pollution_index')
        result.averageSunExposure = env_data.get('average_sun_exposure')
        result.urbanHeatIslandEffect = env_data.get('urban_heat_island_effect')
        result.floodRisk = env_data.get('flood_risk')
        
        # Market data
        market_data = api_data.get('market', {})
        result.vacancyRate = market_data.get('vacancy_rate')
        result.crimeRate = market_data.get('crime_rate')
        result.propertyTaxRate = market_data.get('property_tax_rate')
        result.daysOnMarket = market_data.get('days_on_market_avg')
        result.listingsNearby = market_data.get('listings_nearby')
        
        # Demographics
        demo_data = api_data.get('demographics', {})
        result.medianHouseholdIncome = demo_data.get('median_household_income')
        result.ageDistributionSummary = demo_data.get('age_distribution_summary', "")
        result.socialDiversityIndex = demo_data.get('social_diversity_index')
        
        # Lifestyle
        lifestyle_data = api_data.get('lifestyle', {})
        result.culturalVenuesNearby = lifestyle_data.get('cultural_venues_nearby')
        result.footTrafficLevel = lifestyle_data.get('foot_traffic_level', "")
        result.eventsPerMonthArea = lifestyle_data.get('events_per_month_area')
        result.sentimentScoreLocalReviews = lifestyle_data.get('sentiment_score_local_reviews')
        result.publicArtAestheticScore = lifestyle_data.get('public_art_aesthetic_score')
        result.petFriendlinessScore = lifestyle_data.get('pet_friendliness_score')
        result.localMarketsNearby = lifestyle_data.get('local_markets_nearby')
    
    async def _calculate_financial_metrics(self, result: EnhancedPropertyData):
        """Calculate all financial metrics for investment analysis"""
        try:
            # Extract numeric price
            price_numeric = self._extract_price_numeric(result.price)
            
            if price_numeric and result.size:
                # Price per square meter
                result.pricePerSqm = price_numeric / result.size
                
                # Estimate rental income (using market average yield)
                estimated_yield = 0.05  # 5% default yield
                result.annualRentalIncome = price_numeric * estimated_yield
                result.monthlyRentalIncome = result.annualRentalIncome / 12
                result.expectedMonthlyIncome = result.monthlyRentalIncome
                result.yearlyYield = estimated_yield * 100
                
                # Calculate other financial metrics
                result.annualExpenses = result.annualRentalIncome * 0.3  # 30% expense ratio
                result.netOperatingIncome = result.annualRentalIncome - result.annualExpenses
                
                # Investment metrics
                if result.netOperatingIncome:
                    result.cashOnCashReturn = (result.netOperatingIncome / (price_numeric * 0.2)) * 100  # 20% down
                    result.grm = price_numeric / result.annualRentalIncome
                    result.dscr = result.netOperatingIncome / (price_numeric * 0.05)  # Estimated debt service
                
                # Appreciation and ROI
                result.yearlyAppreciationPercentage = 3.5  # Market average
                result.yearlyAppreciationValue = price_numeric * (result.yearlyAppreciationPercentage / 100)
                result.roi5Years = (result.yearlyAppreciationPercentage + result.yearlyYield) * 0.8  # Conservative
                result.roi10Years = result.roi5Years * 1.2  # Slightly better long-term
                result.irr = result.roi5Years
                
                # Future projections
                result.fiveYearProjectedValue = price_numeric * ((1 + result.yearlyAppreciationPercentage/100) ** 5)
                result.equityBuildup = (result.fiveYearProjectedValue - price_numeric) * 0.6  # After loan paydown
                
        except Exception as e:
            logger.error(f"Error calculating financial metrics: {e}")
    
    async def _assess_location_factors(self, result: EnhancedPropertyData):
        """Assess location-based factors and populate related metrics"""
        try:
            # Distance estimates (mock - replace with geocoding APIs)
            result.distanceToSupermarket = 350
            result.distanceToGreenSpaces = 450
            result.publicTransitAccess = True
            
            # Nearby amenities (mock - replace with places API)
            result.nearbyAmenities = {
                "schools": 7,
                "groceryStores": 5,
                "gyms": 3,
                "restaurants": 13,
                "hospitals": 2,
                "parks": 6
            }
            
            # Generate location pros/cons based on data
            result.locationPros = []
            result.locationCons = []
            
            if result.nearbyAmenities["schools"] >= 5:
                result.locationPros.append(f"{result.nearbyAmenities['schools']} educational institutions nearby")
            if result.nearbyAmenities["restaurants"] >= 10:
                result.locationPros.append(f"{result.nearbyAmenities['restaurants']} dining options in the area")
            if result.publicTransitAccess:
                result.locationPros.append("Good public transportation access")
            
            if result.noisePollutionIndex and result.noisePollutionIndex > 60:
                result.locationCons.append("Higher noise levels in the area")
            if result.vacancyRate and result.vacancyRate > 5:
                result.locationCons.append("Higher than average vacancy rate")
                
        except Exception as e:
            logger.error(f"Error assessing location factors: {e}")
    
    async def _generate_market_insights(self, result: EnhancedPropertyData):
        """Generate market trend summaries and insights"""
        try:
            # Price history (mock - replace with historical data API)
            result.priceHistorySummary = "Last sold for €310,000 (2019). Listed at €295,000 (2017)."
            
            # Neighborhood trends
            result.neighborhoodPriceTrendSummary = "Area prices +5.5% year-over-year."
            
            # Rental demand forecast
            if result.airQualityIndex and result.airQualityIndex > 70:
                result.rentalDemandForecast = "High"
            elif result.publicTransitAccess:
                result.rentalDemandForecast = "Medium"
            else:
                result.rentalDemandForecast = "Low"
            
            # Short-term rental activity assessment
            if result.culturalVenuesNearby and result.culturalVenuesNearby > 3:
                result.shortTermRentalActivity = "High"
            else:
                result.shortTermRentalActivity = "Medium"
                
        except Exception as e:
            logger.error(f"Error generating market insights: {e}")
    
    async def _calculate_investment_score(self, result: EnhancedPropertyData):
        """Calculate overall investment score and generate recommendations"""
        try:
            score_components = []
            
            # Financial score (40% weight)
            financial_score = 0
            if result.yearlyYield:
                financial_score += min(result.yearlyYield * 10, 40)  # Max 40 points
            score_components.append(("Financial Performance", financial_score))
            
            # Location score (30% weight)
            location_score = 0
            if result.nearbyAmenities:
                amenity_total = sum(result.nearbyAmenities.values())
                location_score += min(amenity_total, 30)  # Max 30 points
            score_components.append(("Location Quality", location_score))
            
            # Market conditions (20% weight)
            market_score = 0
            if result.vacancyRate and result.vacancyRate < 5:
                market_score += 10
            if result.yearlyAppreciationPercentage and result.yearlyAppreciationPercentage > 3:
                market_score += 10
            score_components.append(("Market Conditions", market_score))
            
            # Environmental/Quality (10% weight)
            env_score = 0
            if result.airQualityIndex and result.airQualityIndex > 60:
                env_score += 5
            if result.energyLabel and result.energyLabel in ['A', 'B']:
                env_score += 5
            score_components.append(("Environmental Quality", env_score))
            
            # Calculate total score
            result.investmentScore = int(sum(score for _, score in score_components))
            
            # Generate strengths and weaknesses
            result.strengths = []
            result.weaknesses = []
            
            for component_name, score in score_components:
                if score >= 20:
                    result.strengths.append(f"Strong {component_name.lower()}")
                elif score <= 10:
                    result.weaknesses.append(f"Limited {component_name.lower()}")
            
            # Suitability scores
            result.suitabilityScores = {
                "families": min(100, (result.nearbyAmenities.get("schools", 0) * 15)),
                "couples": min(100, (result.nearbyAmenities.get("restaurants", 0) * 8)),
                "singles": min(100, (result.nearbyAmenities.get("gyms", 0) * 25))
            }
            
        except Exception as e:
            logger.error(f"Error calculating investment score: {e}")
            result.investmentScore = 50  # Default safe score
    
    def _update_data_quality(self, result: EnhancedPropertyData):
        """Update data quality indicators"""
        try:
            # Calculate completeness score
            total_fields = len([field for field in asdict(result) if field != 'dataQuality'])
            populated_fields = len([field for field, value in asdict(result).items() 
                                  if value is not None and value != "" and field != 'dataQuality'])
            
            completeness_score = int((populated_fields / total_fields) * 100)
            
            result.dataQuality.update({
                "completeness_score": completeness_score,
                "sources_used": self.data_sources_used,
                "total_fields": total_fields,
                "populated_fields": populated_fields,
                "processing_completed": True,
                "last_updated": datetime.now().isoformat()
            })
            
            result.hasRealData = completeness_score > 30
            
        except Exception as e:
            logger.error(f"Error updating data quality: {e}")
    
    def _extract_address_from_url(self, url: str) -> str:
        """Extract approximate address from property URL"""
        # Simple extraction - improve with actual URL parsing
        return url.split('/')[-2].replace('-', ' ').title() if '/' in url else "Property Address"
    
    def _extract_price_numeric(self, price_str: str) -> Optional[float]:
        """Extract numeric value from price string"""
        if not price_str:
            return None
        
        # Remove currency symbols and spaces
        price_clean = re.sub(r'[€$£,\s]', '', price_str)
        
        # Handle 'k' suffix (thousands)
        if 'k' in price_clean.lower():
            price_clean = price_clean.lower().replace('k', '000')
        
        try:
            return float(price_clean)
        except (ValueError, TypeError):
            return None
    
    def _extract_numeric_value(self, value_str: str) -> Optional[int]:
        """Extract numeric value from string"""
        if not value_str:
            return None
        
        # Extract first number found
        match = re.search(r'\d+', str(value_str))
        if match:
            try:
                return int(match.group())
            except ValueError:
                pass
        return None
    
    async def close(self):
        """Clean up resources"""
        if self.visual_scraper:
            await self.visual_scraper.close()

# Main function for testing
async def main():
    processor = EnhancedDataProcessor()
    
    # Test URL
    test_url = "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/"
    
    # Process comprehensive data
    result = await processor.process_property_comprehensive(test_url)
    
    print("Enhanced Processing Results:")
    print(f"Investment Score: {result.investmentScore}")
    print(f"Address: {result.address}")
    print(f"Price: {result.price}")
    print(f"Data Completeness: {result.dataQuality['completeness_score']}%")
    print(f"Sources Used: {result.dataQuality['sources_used']}")
    print(f"Has Real Data: {result.hasRealData}")
    
    # Save full result to JSON for inspection
    result_dict = asdict(result)
    with open('enhanced_property_data.json', 'w') as f:
        json.dump(result_dict, f, indent=2, default=str)
    
    await processor.close()

if __name__ == "__main__":
    asyncio.run(main()) 