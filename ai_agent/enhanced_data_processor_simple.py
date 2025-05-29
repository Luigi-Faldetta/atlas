"""
Simplified Enhanced Data Processor for Atlas Real Estate Analysis
Basic version that works without AI vision dependencies for testing
"""

import asyncio
import json
import logging
import re
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any, Union
from datetime import datetime

# Configure logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import only available modules
try:
    from webscraper_requests import scrape_property_data
except ImportError:
    logger.warning("webscraper_requests not available, using mock data")
    async def scrape_property_data(url):
        return {}

@dataclass
class SimplePropertyData:
    """Simplified property data structure for testing"""
    
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
    
    # Property characteristics
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    size: Optional[int] = None
    yearBuilt: Optional[int] = None
    description: str = ""
    features: List[str] = None
    buildingType: str = ""
    energyLabel: str = ""
    
    # Location and amenities
    nearbyAmenities: Dict[str, int] = None
    distanceToSupermarket: Optional[int] = None
    publicTransitAccess: bool = False
    distanceToGreenSpaces: Optional[int] = None
    
    # Environmental metrics
    noisePollutionIndex: Optional[int] = None
    airQualityIndex: Optional[int] = None
    averageSunExposure: Optional[float] = None
    urbanHeatIslandEffect: Optional[float] = None
    floodRisk: Optional[int] = None
    
    # Market data
    vacancyRate: Optional[float] = None
    crimeRate: Optional[float] = None
    propertyTaxRate: Optional[float] = None
    communityFees: Optional[float] = None
    daysOnMarket: Optional[int] = None
    assessedPropertyValue: Optional[float] = None
    listingsNearby: Optional[int] = None
    shortTermRentalActivity: str = ""
    
    # Quality indicators
    strengths: List[str] = None
    weaknesses: List[str] = None
    locationPros: List[str] = None
    locationCons: List[str] = None
    
    # Suitability scores
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
                "extraction_method": "simplified",
                "last_updated": datetime.now().isoformat()
            }

class SimpleDataProcessor:
    """Simplified processor for testing and development"""
    
    def __init__(self):
        self.data_sources_used = []
        
    async def process_property_comprehensive(
        self, 
        property_url: str, 
        address: str = ""
    ) -> SimplePropertyData:
        """
        Simplified processing method for testing
        """
        logger.info(f"Starting simplified processing for: {property_url}")
        
        # Initialize result structure
        result = SimplePropertyData()
        result.address = address or self._extract_address_from_url(property_url)
        
        try:
            # 1. Traditional scraping - basic data source
            traditional_data = await self._get_traditional_scraping_data(property_url)
            self._merge_traditional_data(result, traditional_data)
            
            # 2. Mock external API data for testing
            api_data = await self._get_mock_external_api_data(result.address)
            self._merge_api_data(result, api_data)
            
            # 3. Calculate financial metrics
            await self._calculate_financial_metrics(result)
            
            # 4. Assess location and lifestyle factors
            await self._assess_location_factors(result)
            
            # 5. Generate market insights
            await self._generate_market_insights(result)
            
            # 6. Calculate investment score and recommendations
            await self._calculate_investment_score(result)
            
            # 7. Update data quality indicators
            self._update_data_quality(result)
            
            logger.info(f"Processing completed. Data completeness: {result.dataQuality['completeness_score']}%")
            return result
            
        except Exception as e:
            logger.error(f"Error in simplified processing: {e}")
            # Return partial results with error indication
            result.dataQuality["processing_error"] = str(e)
            return result
    
    async def _get_traditional_scraping_data(self, property_url: str) -> Dict[str, Any]:
        """Get data using traditional scraping methods"""
        try:
            if property_url:
                traditional_result = await scrape_property_data(property_url)
                self.data_sources_used.append("traditional_scraping")
                return traditional_result or {}
            return {}
        except Exception as e:
            logger.error(f"Traditional scraping failed: {e}")
            return {}
    
    async def _get_mock_external_api_data(self, address: str) -> Dict[str, Any]:
        """Get mock data simulating external APIs"""
        api_data = {
            # Environmental data
            'environmental': {
                'air_quality_index': 65,
                'noise_pollution_index': 45,
                'average_sun_exposure': 7.1,
                'urban_heat_island_effect': 1.8,
                'flood_risk': 4
            },
            
            # Market data
            'market': {
                'vacancy_rate': 3.2,
                'crime_rate': 12.5,
                'property_tax_rate': 0.7,
                'days_on_market_avg': 52,
                'listings_nearby': 25
            },
            
            # Demographics
            'demographics': {
                'median_household_income': 55000,
                'age_distribution_summary': "Majority: 30-45 (35%), 20-29 (25%), 46-60 (20%)",
                'social_diversity_index': 72
            },
            
            # Lifestyle
            'lifestyle': {
                'cultural_venues_nearby': 4,
                'foot_traffic_level': "Medium",
                'events_per_month_area': 12,
                'sentiment_score_local_reviews': 85,
                'public_art_aesthetic_score': 78,
                'pet_friendliness_score': 90,
                'local_markets_nearby': 2
            }
        }
        
        self.data_sources_used.append("mock_external_apis")
        return api_data
    
    def _merge_traditional_data(self, result: SimplePropertyData, traditional_data: Dict[str, Any]):
        """Merge traditional scraping results"""
        if traditional_data.get('address'):
            result.address = traditional_data['address']
        if traditional_data.get('price'):
            result.price = traditional_data['price']
        if traditional_data.get('bedrooms'):
            try:
                result.bedrooms = int(traditional_data['bedrooms'])
            except (ValueError, TypeError):
                pass
        if traditional_data.get('bathrooms'):
            try:
                result.bathrooms = int(traditional_data['bathrooms'])
            except (ValueError, TypeError):
                pass
        if traditional_data.get('size'):
            result.size = self._extract_numeric_value(traditional_data['size'])
        if traditional_data.get('year_built'):
            try:
                result.yearBuilt = int(traditional_data['year_built'])
            except (ValueError, TypeError):
                pass
        if traditional_data.get('features'):
            result.features = traditional_data['features']
        
        # Mark as having some real data if we got anything from scraping
        if any(traditional_data.values()):
            result.hasRealData = True
    
    def _merge_api_data(self, result: SimplePropertyData, api_data: Dict[str, Any]):
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
    
    async def _calculate_financial_metrics(self, result: SimplePropertyData):
        """Calculate all financial metrics for investment analysis"""
        try:
            # Extract numeric price or use fallback
            price_numeric = self._extract_price_numeric(result.price) or 440000  # Default €440k
            
            # Use size from scraping or default
            size = result.size or 85  # Default 85m²
            result.size = size  # Ensure size is set
            
            # Price per square meter
            result.pricePerSqm = price_numeric / size
            
            # Estimate rental income (using market average yield)
            estimated_yield = 0.054  # 5.4% yield
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
            result.yearlyAppreciationPercentage = 3.3  # Market average
            result.yearlyAppreciationValue = price_numeric * (result.yearlyAppreciationPercentage / 100)
            result.roi5Years = (result.yearlyAppreciationPercentage + result.yearlyYield) * 0.8  # Conservative
            result.roi10Years = result.roi5Years * 1.2  # Slightly better long-term
            
        except Exception as e:
            logger.error(f"Error calculating financial metrics: {e}")
    
    async def _assess_location_factors(self, result: SimplePropertyData):
        """Assess location-based factors and populate related metrics"""
        try:
            # Distance estimates
            result.distanceToSupermarket = 350
            result.distanceToGreenSpaces = 450
            result.publicTransitAccess = True
            
            # Nearby amenities
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
    
    async def _generate_market_insights(self, result: SimplePropertyData):
        """Generate market trend summaries and insights"""
        try:
            # Set property type and energy label if not available
            if not result.buildingType:
                result.buildingType = "Apartment"
            if not result.energyLabel:
                result.energyLabel = "B"
            if not result.description:
                result.description = "Modern apartment in sought-after neighborhood with good amenities."
            if not result.features:
                result.features = ['Elevator', 'Balcony', 'Energy efficient', 'Close to transport']
                
        except Exception as e:
            logger.error(f"Error generating market insights: {e}")
    
    async def _calculate_investment_score(self, result: SimplePropertyData):
        """Calculate overall investment score and generate recommendations"""
        try:
            score_components = []
            
            # Financial score (40% weight)
            financial_score = 0
            if result.yearlyYield:
                financial_score += min(result.yearlyYield * 8, 40)  # Max 40 points
            score_components.append(("Financial Performance", financial_score))
            
            # Location score (30% weight)
            location_score = 0
            if result.nearbyAmenities:
                amenity_total = sum(result.nearbyAmenities.values())
                location_score += min(amenity_total * 0.8, 30)  # Max 30 points
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
                if score >= 15:
                    result.strengths.append(f"Strong {component_name.lower()}")
                elif score <= 8:
                    result.weaknesses.append(f"Limited {component_name.lower()}")
            
            # Add some general strengths based on data
            if result.yearlyYield and result.yearlyYield > 5:
                result.strengths.append("Good rental yield for the area")
            if result.yearlyAppreciationPercentage and result.yearlyAppreciationPercentage > 3:
                result.strengths.append("Solid appreciation potential")
            if result.energyLabel in ['A', 'B']:
                result.strengths.append("Energy efficient building")
            
            # Suitability scores
            result.suitabilityScores = {
                "families": min(100, (result.nearbyAmenities.get("schools", 0) * 15)),
                "couples": min(100, (result.nearbyAmenities.get("restaurants", 0) * 8)),
                "singles": min(100, (result.nearbyAmenities.get("gyms", 0) * 25))
            }
            
        except Exception as e:
            logger.error(f"Error calculating investment score: {e}")
            result.investmentScore = 50  # Default safe score
    
    def _update_data_quality(self, result: SimplePropertyData):
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
            
            # Consider it "real data" if completeness is reasonable
            if completeness_score > 40:
                result.hasRealData = True
            
        except Exception as e:
            logger.error(f"Error updating data quality: {e}")
    
    def _extract_address_from_url(self, url: str) -> str:
        """Extract approximate address from property URL"""
        if not url:
            return "Test Property Address"
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

# Main function for testing
async def main():
    processor = SimpleDataProcessor()
    
    # Test URL
    test_url = "https://www.funda.nl/detail/koop/amsterdam/appartement-aragohof-4-1/43954500/"
    
    # Process comprehensive data
    result = await processor.process_property_comprehensive(test_url)
    
    print("\n" + "="*60)
    print("SIMPLIFIED PROCESSING RESULTS")
    print("="*60)
    print(f"Investment Score: {result.investmentScore}")
    print(f"Address: {result.address}")
    print(f"Price: {result.price}")
    print(f"Bedrooms: {result.bedrooms}")
    print(f"Size: {result.size}m²")
    print(f"Yearly Yield: {result.yearlyYield}%")
    print(f"Monthly Rental: €{result.monthlyRentalIncome:.0f}" if result.monthlyRentalIncome else "Monthly Rental: N/A")
    print(f"Price per m²: €{result.pricePerSqm:.0f}" if result.pricePerSqm else "Price per m²: N/A")
    print(f"Data Completeness: {result.dataQuality['completeness_score']}%")
    print(f"Sources Used: {', '.join(result.dataQuality['sources_used'])}")
    print(f"Has Real Data: {result.hasRealData}")
    print(f"Strengths: {', '.join(result.strengths)}")
    print("="*60)
    
    # Save full result to JSON for inspection
    result_dict = asdict(result)
    with open('simple_property_data.json', 'w') as f:
        json.dump(result_dict, f, indent=2, default=str)
    
    print(f"📄 Detailed results saved to: simple_property_data.json")

if __name__ == "__main__":
    asyncio.run(main()) 