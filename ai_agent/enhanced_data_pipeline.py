#!/usr/bin/env python3
"""
Enhanced Data Pipeline for Real Estate Investment Analysis
Connects enhanced scraping system to the investment dashboard with real-world data
"""

import asyncio
import json
import logging
import redis
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import asdict
import httpx
from enhanced_scraping_strategy import EnhancedMultiPlatformScraper, EnhancedPropertyData
import pandas as pd
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

# Database Models
Base = declarative_base()

class PropertyScrapingResult(Base):
    __tablename__ = 'property_scraping_results'
    
    id = Column(Integer, primary_key=True)
    url = Column(String, unique=True, nullable=False)
    platform = Column(String, nullable=False)
    scraped_at = Column(DateTime, default=datetime.now)
    raw_data = Column(JSON)
    structured_data = Column(JSON)
    data_quality_score = Column(Float)
    investment_score = Column(Integer)
    price = Column(Float)
    living_area_sqm = Column(Float)
    location_city = Column(String)
    location_country = Column(String)
    is_valid = Column(Boolean, default=True)
    cache_expires_at = Column(DateTime)

class PropertyInvestmentMetrics(Base):
    __tablename__ = 'property_investment_metrics'
    
    id = Column(Integer, primary_key=True)
    property_url = Column(String, nullable=False)
    rental_yield = Column(Float)
    roi_5_year = Column(Float)
    roi_10_year = Column(Float)
    risk_score = Column(Integer)
    estimated_monthly_rent = Column(Float)
    price_per_sqm = Column(Float)
    calculated_at = Column(DateTime, default=datetime.now)
    ai_analysis_summary = Column(String)

# API Models for Frontend Integration
class PropertyAnalysisRequest(BaseModel):
    url: str
    force_refresh: bool = False
    include_comparables: bool = True
    include_neighborhood_analysis: bool = True

class PropertyAnalysisResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    cached: bool = False
    data_quality_score: float = 0.0
    scraping_time_seconds: float = 0.0
    analysis_time_seconds: float = 0.0

class EnhancedDataPipeline:
    """
    Enhanced data pipeline that integrates advanced scraping with the investment dashboard
    """
    
    def __init__(self, 
                 openai_api_key: str, 
                 scrapingbee_api_key: str,
                 redis_url: str = "redis://localhost:6379",
                 database_url: str = None):
        
        self.scraper = EnhancedMultiPlatformScraper(openai_api_key, scrapingbee_api_key)
        self.logger = logging.getLogger(__name__)
        
        # Redis for caching
        try:
            self.redis_client = redis.from_url(redis_url)
            self.redis_client.ping()  # Test connection
        except Exception as e:
            self.logger.warning(f"Redis not available: {e}")
            self.redis_client = None
        
        # Database setup
        if database_url:
            self.engine = create_engine(database_url)
            Base.metadata.create_all(self.engine)
            Session = sessionmaker(bind=self.engine)
            self.db_session = Session()
        else:
            self.db_session = None
            
        # HTTP client for API calls
        self.http_client = None
    
    async def start(self):
        """Initialize all services"""
        await self.scraper.start()
        self.http_client = httpx.AsyncClient(timeout=30)
        self.logger.info("Enhanced data pipeline started")
    
    async def close(self):
        """Close all services"""
        await self.scraper.close()
        if self.http_client:
            await self.http_client.aclose()
        if self.db_session:
            self.db_session.close()
        self.logger.info("Enhanced data pipeline closed")
    
    async def analyze_property_for_dashboard(self, 
                                           request: PropertyAnalysisRequest) -> PropertyAnalysisResponse:
        """
        Main method to analyze property and format for investment dashboard
        """
        start_time = datetime.now()
        
        try:
            # Step 1: Check cache first
            if not request.force_refresh:
                cached_result = await self._get_cached_analysis(request.url)
                if cached_result:
                    return PropertyAnalysisResponse(
                        success=True,
                        data=cached_result,
                        cached=True,
                        data_quality_score=cached_result.get('data_quality_score', 0)
                    )
            
            # Step 2: Scrape fresh data
            scraping_start = datetime.now()
            property_data = await self.scraper.scrape_property_enhanced(request.url)
            scraping_time = (datetime.now() - scraping_start).total_seconds()
            
            if not property_data:
                return PropertyAnalysisResponse(
                    success=False,
                    error="Failed to scrape property data",
                    scraping_time_seconds=scraping_time
                )
            
            # Step 3: Enhance with neighborhood analysis
            analysis_start = datetime.now()
            if request.include_neighborhood_analysis:
                property_data = await self._enhance_with_neighborhood_data(property_data)
            
            # Step 4: Get comparable properties
            if request.include_comparables:
                comparable_data = await self._get_comparable_properties(property_data)
            else:
                comparable_data = []
            
            # Step 5: Format for investment dashboard
            dashboard_data = self._format_for_investment_dashboard(
                property_data, 
                comparable_data,
                include_charts=True
            )
            
            analysis_time = (datetime.now() - analysis_start).total_seconds()
            total_time = (datetime.now() - start_time).total_seconds()
            
            # Step 6: Cache the result
            await self._cache_analysis_result(request.url, dashboard_data, property_data)
            
            # Step 7: Store in database
            await self._store_analysis_result(property_data, dashboard_data)
            
            return PropertyAnalysisResponse(
                success=True,
                data=dashboard_data,
                cached=False,
                data_quality_score=property_data.data_quality_score,
                scraping_time_seconds=scraping_time,
                analysis_time_seconds=analysis_time
            )
            
        except Exception as e:
            self.logger.error(f"Error in property analysis pipeline: {e}", exc_info=True)
            return PropertyAnalysisResponse(
                success=False,
                error=str(e),
                scraping_time_seconds=(datetime.now() - start_time).total_seconds()
            )
    
    async def _get_cached_analysis(self, url: str) -> Optional[Dict[str, Any]]:
        """Get cached analysis result"""
        if not self.redis_client:
            return None
        
        try:
            cache_key = f"property_analysis:{url}"
            cached_data = self.redis_client.get(cache_key)
            
            if cached_data:
                result = json.loads(cached_data)
                self.logger.info(f"Cache hit for {url}")
                return result
                
        except Exception as e:
            self.logger.warning(f"Cache retrieval failed: {e}")
        
        return None
    
    async def _cache_analysis_result(self, 
                                   url: str, 
                                   dashboard_data: Dict[str, Any], 
                                   property_data: EnhancedPropertyData):
        """Cache the analysis result"""
        if not self.redis_client:
            return
        
        try:
            cache_key = f"property_analysis:{url}"
            cache_data = {
                **dashboard_data,
                'cached_at': datetime.now().isoformat(),
                'data_quality_score': property_data.data_quality_score
            }
            
            # Cache for 24 hours
            self.redis_client.setex(
                cache_key, 
                86400,  # 24 hours
                json.dumps(cache_data, default=str)
            )
            
            self.logger.info(f"Cached analysis for {url}")
            
        except Exception as e:
            self.logger.warning(f"Cache storage failed: {e}")
    
    async def _enhance_with_neighborhood_data(self, 
                                            property_data: EnhancedPropertyData) -> EnhancedPropertyData:
        """Enhance property data with neighborhood analysis"""
        try:
            # Get coordinates for the property
            if not property_data.location.latitude:
                coords = await self._geocode_address(property_data.location.full_address)
                if coords:
                    property_data.location.latitude = coords['lat']
                    property_data.location.longitude = coords['lng']
            
            # Get neighborhood data
            if property_data.location.latitude:
                neighborhood_data = await self._get_neighborhood_analysis(
                    property_data.location.latitude,
                    property_data.location.longitude
                )
                
                # Update location data
                property_data.location.walk_score = neighborhood_data.get('walk_score')
                property_data.location.transit_score = neighborhood_data.get('transit_score')
                property_data.location.neighborhood = neighborhood_data.get('neighborhood_name')
                
        except Exception as e:
            self.logger.warning(f"Neighborhood enhancement failed: {e}")
        
        return property_data
    
    async def _get_comparable_properties(self, 
                                       property_data: EnhancedPropertyData) -> List[Dict[str, Any]]:
        """Get comparable properties for market analysis"""
        try:
            # Search for similar properties in the same area
            search_params = {
                'city': property_data.location.city,
                'property_type': property_data.property_type,
                'bedrooms': property_data.bedrooms,
                'area_min': property_data.living_area_sqm * 0.8 if property_data.living_area_sqm else None,
                'area_max': property_data.living_area_sqm * 1.2 if property_data.living_area_sqm else None,
                'limit': 5
            }
            
            # This would integrate with property APIs or your database
            comparables = await self._search_comparable_properties(search_params)
            
            return comparables
            
        except Exception as e:
            self.logger.warning(f"Comparable properties search failed: {e}")
            return []
    
    def _format_for_investment_dashboard(self, 
                                       property_data: EnhancedPropertyData,
                                       comparable_data: List[Dict[str, Any]],
                                       include_charts: bool = True) -> Dict[str, Any]:
        """
        Format the enhanced property data for the investment dashboard frontend
        This matches the expected format for PropertyInvestmentDashboard component
        """
        
        # Calculate additional metrics
        monthly_costs = self._calculate_monthly_costs(property_data)
        market_analysis = self._analyze_market_position(property_data, comparable_data)
        
        # Format the main dashboard data
        dashboard_data = {
            # Property Overview
            'property': {
                'url': property_data.url,
                'platform': property_data.platform,
                'address': property_data.location.full_address,
                'price': property_data.price,
                'living_area_sqm': property_data.living_area_sqm,
                'bedrooms': property_data.bedrooms,
                'bathrooms': property_data.bathrooms,
                'year_built': property_data.year_built,
                'property_type': property_data.property_type,
                'images': [asdict(img) for img in property_data.images] if property_data.images else [],
                'description': property_data.description
            },
            
            # Investment Analysis
            'investment_analysis': {
                'investment_score': property_data.investment_score or 75,  # Default if not calculated
                'rental_yield': property_data.rental_yield or self._estimate_rental_yield(property_data),
                'roi_5_year': property_data.roi_5_year or self._estimate_roi(property_data, 5),
                'roi_10_year': property_data.roi_10_year or self._estimate_roi(property_data, 10),
                'risk_score': property_data.risk_score or 25,  # Default risk score
                'estimated_monthly_rent': property_data.financials.estimated_rental_income or self._estimate_monthly_rent(property_data),
                'price_per_sqm': property_data.financials.price_per_sqm,
                'cash_on_cash_return': self._calculate_cash_on_cash_return(property_data),
                'cap_rate': self._calculate_cap_rate(property_data)
            },
            
            # Financial Breakdown
            'financial_details': {
                'purchase_price': property_data.price,
                'monthly_costs': monthly_costs,
                'yearly_expenses': monthly_costs * 12 if monthly_costs else None,
                'net_monthly_income': self._calculate_net_monthly_income(property_data),
                'break_even_rent': self._calculate_break_even_rent(property_data),
                'down_payment_20_percent': property_data.price * 0.2 if property_data.price else None,
                'mortgage_payment': self._calculate_mortgage_payment(property_data),
                'property_tax': property_data.financials.property_tax or self._estimate_property_tax(property_data),
                'insurance': self._estimate_insurance(property_data),
                'maintenance_reserves': self._estimate_maintenance(property_data)
            },
            
            # Location Analysis
            'location_analysis': {
                'neighborhood': property_data.location.neighborhood,
                'walk_score': property_data.location.walk_score,
                'transit_score': property_data.location.transit_score,
                'city': property_data.location.city,
                'country': property_data.location.country,
                'coordinates': {
                    'lat': property_data.location.latitude,
                    'lng': property_data.location.longitude
                } if property_data.location.latitude else None
            },
            
            # Market Analysis
            'market_analysis': market_analysis,
            
            # Property Features
            'features': {
                'elevator': property_data.features.elevator,
                'parking': property_data.features.parking,
                'balcony': property_data.features.balcony,
                'terrace': property_data.features.terrace,
                'garden': property_data.features.garden,
                'pool': property_data.features.pool,
                'air_conditioning': property_data.features.air_conditioning,
                'heating_type': property_data.features.heating_type,
                'energy_certificate': property_data.features.energy_certificate,
                'furnished': property_data.features.furnished
            },
            
            # Data Quality & Metadata
            'metadata': {
                'scraped_at': property_data.scraped_at.isoformat(),
                'data_quality_score': property_data.data_quality_score,
                'missing_fields': property_data.missing_fields,
                'extraction_confidence': property_data.extraction_confidence,
                'platform_source': property_data.platform,
                'has_real_data': property_data.data_quality_score > 70
            },
            
            # Comparable Properties
            'comparables': comparable_data,
            
            # Charts Data (if requested)
            'charts': self._generate_chart_data(property_data, comparable_data) if include_charts else None
        }
        
        return dashboard_data
    
    def _calculate_monthly_costs(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Calculate estimated monthly costs"""
        if not property_data.price:
            return None
        
        # Basic cost estimation based on property price and type
        property_tax_monthly = (property_data.price * 0.01) / 12  # 1% annually
        insurance_monthly = (property_data.price * 0.003) / 12   # 0.3% annually
        maintenance_monthly = (property_data.price * 0.01) / 12  # 1% annually
        
        # Add community fees if available
        community_fees = property_data.financials.community_fees or (property_data.price * 0.002) / 12
        
        return property_tax_monthly + insurance_monthly + maintenance_monthly + community_fees
    
    def _analyze_market_position(self, 
                                property_data: EnhancedPropertyData,
                                comparable_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze property's position in the market"""
        if not comparable_data or not property_data.financials.price_per_sqm:
            return {
                'price_vs_market': 'average',
                'market_trend': 'stable',
                'comparable_count': 0,
                'price_percentile': 50
            }
        
        # Calculate market statistics
        comparable_prices_per_sqm = [
            comp.get('price_per_sqm', 0) for comp in comparable_data 
            if comp.get('price_per_sqm')
        ]
        
        if comparable_prices_per_sqm:
            market_median = sorted(comparable_prices_per_sqm)[len(comparable_prices_per_sqm) // 2]
            property_price_per_sqm = property_data.financials.price_per_sqm
            
            # Determine price position
            if property_price_per_sqm < market_median * 0.9:
                price_vs_market = 'below_market'
            elif property_price_per_sqm > market_median * 1.1:
                price_vs_market = 'above_market'
            else:
                price_vs_market = 'market_rate'
            
            # Calculate percentile
            below_property = sum(1 for price in comparable_prices_per_sqm if price < property_price_per_sqm)
            percentile = (below_property / len(comparable_prices_per_sqm)) * 100
            
            return {
                'price_vs_market': price_vs_market,
                'market_median_per_sqm': market_median,
                'property_premium_discount': ((property_price_per_sqm - market_median) / market_median) * 100,
                'comparable_count': len(comparable_data),
                'price_percentile': round(percentile),
                'market_trend': 'stable'  # This would need historical data
            }
        
        return {
            'price_vs_market': 'unknown',
            'comparable_count': len(comparable_data),
            'price_percentile': 50
        }
    
    def _generate_chart_data(self, 
                           property_data: EnhancedPropertyData,
                           comparable_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate chart data for the dashboard"""
        
        # ROI Projection Chart
        years = list(range(1, 11))
        roi_projections = []
        current_value = property_data.price or 0
        
        for year in years:
            # Simple appreciation model (3-5% annually)
            appreciation_rate = 0.04 if property_data.location.country == 'Netherlands' else 0.035
            projected_value = current_value * ((1 + appreciation_rate) ** year)
            roi = ((projected_value - current_value) / current_value) * 100 if current_value > 0 else 0
            roi_projections.append(roi)
        
        # Price Comparison Chart
        price_comparison = []
        if comparable_data and property_data.financials.price_per_sqm:
            for comp in comparable_data[:5]:  # Top 5 comparables
                price_comparison.append({
                    'property': comp.get('address', 'Comparable Property'),
                    'price_per_sqm': comp.get('price_per_sqm', 0),
                    'bedrooms': comp.get('bedrooms', 0)
                })
            
            # Add current property
            price_comparison.append({
                'property': 'Target Property',
                'price_per_sqm': property_data.financials.price_per_sqm,
                'bedrooms': property_data.bedrooms or 0,
                'highlight': True
            })
        
        return {
            'roi_projection': {
                'labels': [f'Year {y}' for y in years],
                'data': roi_projections,
                'title': '10-Year ROI Projection'
            },
            'price_comparison': {
                'data': price_comparison,
                'title': 'Price per m² Comparison'
            },
            'monthly_cashflow': {
                'income': property_data.financials.estimated_rental_income or 0,
                'expenses': self._calculate_monthly_costs(property_data) or 0,
                'net': (property_data.financials.estimated_rental_income or 0) - (self._calculate_monthly_costs(property_data) or 0)
            }
        }
    
    # Helper calculation methods
    def _estimate_rental_yield(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Estimate rental yield based on property characteristics"""
        if not property_data.price or not property_data.living_area_sqm:
            return None
        
        # Base rent estimation per sqm by country/city
        base_rent_per_sqm = {
            'Netherlands': {'Amsterdam': 25, 'Rotterdam': 18, 'Utrecht': 20, 'default': 15},
            'Spain': {'Madrid': 15, 'Barcelona': 18, 'Valencia': 12, 'default': 10}
        }
        
        country = property_data.location.country
        city = property_data.location.city
        
        if country in base_rent_per_sqm:
            city_rates = base_rent_per_sqm[country]
            rent_per_sqm = city_rates.get(city, city_rates['default'])
            
            estimated_monthly_rent = property_data.living_area_sqm * rent_per_sqm
            annual_rent = estimated_monthly_rent * 12
            
            return (annual_rent / property_data.price) * 100
        
        return None
    
    def _estimate_roi(self, property_data: EnhancedPropertyData, years: int) -> Optional[float]:
        """Estimate ROI for given time period"""
        if not property_data.price:
            return None
        
        # Simple appreciation + rental income model
        annual_appreciation = 0.04 if property_data.location.country == 'Netherlands' else 0.035
        rental_yield = self._estimate_rental_yield(property_data) or 4.0
        
        # Calculate compound return
        total_return = ((1 + annual_appreciation + rental_yield/100) ** years - 1) * 100
        
        return round(total_return, 2)
    
    def _estimate_monthly_rent(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Estimate monthly rental income"""
        rental_yield = self._estimate_rental_yield(property_data)
        if rental_yield and property_data.price:
            annual_rent = (rental_yield / 100) * property_data.price
            return annual_rent / 12
        return None
    
    def _calculate_cash_on_cash_return(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Calculate cash-on-cash return"""
        if not property_data.price:
            return None
        
        down_payment = property_data.price * 0.2  # 20% down
        monthly_rent = self._estimate_monthly_rent(property_data) or 0
        monthly_costs = self._calculate_monthly_costs(property_data) or 0
        monthly_mortgage = self._calculate_mortgage_payment(property_data) or 0
        
        net_monthly_income = monthly_rent - monthly_costs - monthly_mortgage
        annual_cash_flow = net_monthly_income * 12
        
        if down_payment > 0:
            return (annual_cash_flow / down_payment) * 100
        
        return None
    
    def _calculate_cap_rate(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Calculate capitalization rate"""
        if not property_data.price:
            return None
        
        monthly_rent = self._estimate_monthly_rent(property_data) or 0
        monthly_costs = self._calculate_monthly_costs(property_data) or 0
        
        net_operating_income = (monthly_rent - monthly_costs) * 12
        
        return (net_operating_income / property_data.price) * 100 if property_data.price > 0 else None
    
    def _calculate_net_monthly_income(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Calculate net monthly income"""
        monthly_rent = self._estimate_monthly_rent(property_data) or 0
        monthly_costs = self._calculate_monthly_costs(property_data) or 0
        
        return monthly_rent - monthly_costs
    
    def _calculate_break_even_rent(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Calculate break-even rental amount"""
        monthly_costs = self._calculate_monthly_costs(property_data) or 0
        monthly_mortgage = self._calculate_mortgage_payment(property_data) or 0
        
        return monthly_costs + monthly_mortgage
    
    def _calculate_mortgage_payment(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Calculate estimated monthly mortgage payment"""
        if not property_data.price:
            return None
        
        loan_amount = property_data.price * 0.8  # 80% LTV
        interest_rate = 0.035  # 3.5% annual
        loan_term_months = 30 * 12  # 30 years
        
        monthly_rate = interest_rate / 12
        
        # Standard mortgage calculation
        if monthly_rate > 0:
            payment = loan_amount * (monthly_rate * (1 + monthly_rate) ** loan_term_months) / \
                     ((1 + monthly_rate) ** loan_term_months - 1)
            return payment
        
        return None
    
    def _estimate_property_tax(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Estimate annual property tax"""
        if not property_data.price:
            return None
        
        # Rough estimates by country
        tax_rates = {
            'Netherlands': 0.01,  # 1% of property value
            'Spain': 0.008        # 0.8% of property value
        }
        
        rate = tax_rates.get(property_data.location.country, 0.01)
        return property_data.price * rate
    
    def _estimate_insurance(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Estimate annual insurance cost"""
        if not property_data.price:
            return None
        
        return property_data.price * 0.003  # 0.3% of property value
    
    def _estimate_maintenance(self, property_data: EnhancedPropertyData) -> Optional[float]:
        """Estimate annual maintenance reserves"""
        if not property_data.price:
            return None
        
        return property_data.price * 0.01  # 1% of property value
    
    # External API integration methods (stubs for now)
    async def _geocode_address(self, address: str) -> Optional[Dict[str, float]]:
        """Geocode address to get coordinates"""
        # This would integrate with a geocoding service
        # For now, return None to skip geocoding
        return None
    
    async def _get_neighborhood_analysis(self, lat: float, lng: float) -> Dict[str, Any]:
        """Get neighborhood analysis data"""
        # This would integrate with neighborhood analysis APIs
        return {
            'walk_score': 75,
            'transit_score': 65,
            'neighborhood_name': 'City Center'
        }
    
    async def _search_comparable_properties(self, search_params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Search for comparable properties"""
        # This would integrate with property databases or APIs
        # For now, return mock data
        return [
            {
                'address': 'Comparable Property 1',
                'price': 450000,
                'price_per_sqm': 4500,
                'bedrooms': search_params.get('bedrooms', 2),
                'area_sqm': 100
            },
            {
                'address': 'Comparable Property 2', 
                'price': 475000,
                'price_per_sqm': 4750,
                'bedrooms': search_params.get('bedrooms', 2),
                'area_sqm': 100
            }
        ]
    
    async def _store_analysis_result(self, 
                                   property_data: EnhancedPropertyData,
                                   dashboard_data: Dict[str, Any]):
        """Store analysis result in database"""
        if not self.db_session:
            return
        
        try:
            # Store main property result
            property_result = PropertyScrapingResult(
                url=property_data.url,
                platform=property_data.platform,
                scraped_at=property_data.scraped_at,
                raw_data=asdict(property_data),
                structured_data=dashboard_data,
                data_quality_score=property_data.data_quality_score,
                investment_score=property_data.investment_score,
                price=property_data.price,
                living_area_sqm=property_data.living_area_sqm,
                location_city=property_data.location.city,
                location_country=property_data.location.country,
                cache_expires_at=datetime.now() + timedelta(hours=24)
            )
            
            # Store investment metrics
            investment_metrics = PropertyInvestmentMetrics(
                property_url=property_data.url,
                rental_yield=property_data.rental_yield,
                roi_5_year=property_data.roi_5_year,
                roi_10_year=property_data.roi_10_year,
                risk_score=property_data.risk_score,
                estimated_monthly_rent=property_data.financials.estimated_rental_income,
                price_per_sqm=property_data.financials.price_per_sqm
            )
            
            self.db_session.merge(property_result)  # Use merge to handle duplicates
            self.db_session.add(investment_metrics)
            self.db_session.commit()
            
            self.logger.info(f"Stored analysis result for {property_data.url}")
            
        except Exception as e:
            self.logger.error(f"Database storage failed: {e}")
            self.db_session.rollback()

# Integration API for the backend
class PropertyAnalysisAPI:
    """
    FastAPI integration for the enhanced data pipeline
    """
    
    def __init__(self, pipeline: EnhancedDataPipeline):
        self.pipeline = pipeline
    
    async def analyze_property(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        API endpoint for property analysis
        Compatible with existing Atlas backend
        """
        try:
            request = PropertyAnalysisRequest(**request_data)
            response = await self.pipeline.analyze_property_for_dashboard(request)
            
            if response.success:
                # Format response for Atlas backend compatibility
                return {
                    'success': True,
                    'market': 'dutch' if 'funda.nl' in request.url else 'spanish',
                    'scraped_data': {
                        'address': response.data['property']['address'],
                        'price': f"€{response.data['property']['price']:,.0f}" if response.data['property']['price'] else 'Not found',
                        'living_area': f"{response.data['property']['living_area_sqm']} m²" if response.data['property']['living_area_sqm'] else 'Not found',
                        'bedrooms': str(response.data['property']['bedrooms']) if response.data['property']['bedrooms'] else 'Not found',
                        'bathrooms': str(response.data['property']['bathrooms']) if response.data['property']['bathrooms'] else 'Not found',
                        'year_built': str(response.data['property']['year_built']) if response.data['property']['year_built'] else 'Not found',
                        'price_per_sqm': response.data['investment_analysis']['price_per_sqm'],
                        'property_image': response.data['property']['images'][0]['url'] if response.data['property']['images'] else None
                    },
                    'agent_analysis': {
                        'investment_score': response.data['investment_analysis']['investment_score'],
                        'address': response.data['property']['address'],
                        'roi_5_years': response.data['investment_analysis']['roi_5_year'],
                        'roi_10_years': response.data['investment_analysis']['roi_10_year'],
                        'yearly_yield': response.data['investment_analysis']['rental_yield'],
                        'monthly_rental_income': response.data['investment_analysis']['estimated_monthly_rent'],
                        'expected_monthly_income': response.data['investment_analysis']['estimated_monthly_rent'] * 1.1 if response.data['investment_analysis']['estimated_monthly_rent'] else None,
                        'strengths': ['High-quality data extraction', 'Comprehensive market analysis'],
                        'weaknesses': response.data['metadata']['missing_fields']
                    },
                    'enhanced_data': response.data,  # Full enhanced data for advanced dashboard
                    'data_quality': {
                        'score': response.data_quality_score,
                        'has_real_data': response.data['metadata']['has_real_data'],
                        'cached': response.cached,
                        'processing_time': response.scraping_time_seconds + response.analysis_time_seconds
                    }
                }
            else:
                return {
                    'success': False,
                    'error': response.error
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }

# Example usage and testing
async def test_enhanced_pipeline():
    """Test the enhanced data pipeline"""
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    pipeline = EnhancedDataPipeline(
        openai_api_key=os.getenv('OPENAI_API_KEY'),
        scrapingbee_api_key=os.getenv('SCRAPINGBEE_API_KEY'),
        redis_url=os.getenv('REDIS_URL', 'redis://localhost:6379'),
        database_url=os.getenv('DATABASE_URL')
    )
    
    await pipeline.start()
    
    # Test with sample URLs
    test_urls = [
        "https://www.funda.nl/koop/amsterdam/appartement-43038135-keizersgracht-123/",
        "https://www.idealista.com/inmueble/98765432/"
    ]
    
    for url in test_urls:
        try:
            print(f"\n🏠 Testing enhanced pipeline: {url}")
            
            request = PropertyAnalysisRequest(
                url=url,
                force_refresh=True,
                include_comparables=True,
                include_neighborhood_analysis=True
            )
            
            response = await pipeline.analyze_property_for_dashboard(request)
            
            if response.success:
                print(f"✅ Success! Data quality: {response.data_quality_score:.1f}%")
                print(f"   Investment Score: {response.data['investment_analysis']['investment_score']}/100")
                print(f"   Rental Yield: {response.data['investment_analysis']['rental_yield']:.2f}%")
                print(f"   ROI (10Y): {response.data['investment_analysis']['roi_10_year']:.1f}%")
                print(f"   Cached: {response.cached}")
                print(f"   Processing time: {response.scraping_time_seconds + response.analysis_time_seconds:.2f}s")
            else:
                print(f"❌ Failed: {response.error}")
                
        except Exception as e:
            print(f"❌ Error: {e}")
    
    await pipeline.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(test_enhanced_pipeline())