"""
Market-Specific Prompts Module
Following atlas.mdc: Specialized prompts for different real estate markets
"""

from typing import Dict, Any


class MarketSpecificPrompts:
    """
    Market-specific prompt templates for enhanced analysis
    Following atlas.mdc: Domain expertise integration
    """
    
    @staticmethod
    def get_dutch_market_prompt_additions() -> str:
        """Dutch market-specific prompt additions"""
        return """
DUTCH MARKET SPECIFIC CONSIDERATIONS:
- WOZ Tax: Calculate annual property tax based on WOZ value
- Energy Label: Mandatory energy efficiency rating (A++ to G)
- Rental Point System: For properties under €763/month (2024)
- Social Housing Regulations: Maximum income limits and waiting lists
- Typical Yield Range: 3.5% - 6.5% for rental properties
- Appreciation Rate: Historical average ~4.2% annually
- Mortgage Interest Deduction: Tax benefits for homeowners
- Transfer Tax: 2% for buyers under 35, 10.4% for others (2024)

DUTCH ANALYSIS REQUIREMENTS:
- Include WOZ tax implications in financial calculations
- Assess energy label impact on rental potential
- Consider rental point system for affordable housing
- Evaluate mortgage interest deduction benefits
- Factor in transfer tax costs for different buyer segments
"""
    
    @staticmethod
    def get_spanish_market_prompt_additions() -> str:
        """Spanish market-specific prompt additions"""
        return """
SPANISH MARKET SPECIFIC CONSIDERATIONS:
- Golden Visa Eligibility: €500,000+ investment for residency
- Tourism Potential: Short-term rental opportunities (Airbnb, etc.)
- Regional Tax Variations: Different rates across autonomous communities
- Seasonal Rental Market: High demand in coastal and tourist areas
- Typical Yield Range: 4.0% - 7.5% for rental properties
- Appreciation Rate: Historical average ~3.8% annually
- Property Transfer Tax: 6-10% depending on region
- Tourist License Requirements: Regulations for short-term rentals

SPANISH ANALYSIS REQUIREMENTS:
- Assess Golden Visa eligibility and benefits
- Evaluate tourism potential for short-term rentals
- Consider seasonal demand fluctuations
- Factor in regional tax differences
- Analyze tourist license requirements and restrictions
- Include transfer tax variations by autonomous community
"""
    
    @staticmethod
    def get_market_specific_metrics(market_type: str) -> Dict[str, Any]:
        """Get market-specific metrics and ranges"""
        
        if market_type == 'dutch':
            return {
                'typical_yield_range': (3.5, 6.5),
                'appreciation_rate': 4.2,
                'transfer_tax_rate': 10.4,  # Standard rate
                'property_tax_rate': 0.1,   # Approximate WOZ tax
                'energy_labels': ['A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
                'rental_point_threshold': 763,  # 2024 threshold
                'mortgage_deduction': True
            }
        
        elif market_type == 'spanish':
            return {
                'typical_yield_range': (4.0, 7.5),
                'appreciation_rate': 3.8,
                'transfer_tax_range': (6, 10),  # Varies by region
                'golden_visa_threshold': 500000,
                'tourist_areas': [
                    'costa del sol', 'costa brava', 'mallorca', 'ibiza',
                    'canarias', 'tenerife', 'barcelona', 'madrid', 'valencia'
                ],
                'seasonal_demand': True,
                'tourist_license_required': True
            }
        
        else:
            return {
                'typical_yield_range': (4.0, 8.0),
                'appreciation_rate': 3.0,
                'transfer_tax_rate': 5.0,  # Generic estimate
                'property_tax_rate': 1.0   # Generic estimate
            }
    
    @staticmethod
    def build_market_specific_analysis_section(market_type: str, property_data: Dict[str, Any]) -> str:
        """Build market-specific analysis section"""
        
        if market_type == 'dutch':
            return MarketSpecificPrompts._build_dutch_analysis_section(property_data)
        elif market_type == 'spanish':
            return MarketSpecificPrompts._build_spanish_analysis_section(property_data)
        else:
            return MarketSpecificPrompts._build_general_analysis_section(property_data)
    
    @staticmethod
    def _build_dutch_analysis_section(property_data: Dict[str, Any]) -> str:
        """Build Dutch market-specific analysis section"""
        
        price = property_data.get('price', 0)
        energy_label = property_data.get('energy_label', 'Unknown')
        
        return f"""
DUTCH MARKET ANALYSIS:

1. WOZ Tax Assessment:
   - Property value: €{price:,}
   - Estimated WOZ value: €{int(price * 0.85):,} (typically 85% of market value)
   - Annual WOZ tax: €{int(price * 0.85 * 0.001):,} (approximate)

2. Energy Label Impact:
   - Current label: {energy_label}
   - Rental market impact: {'Positive' if energy_label in ['A++', 'A+', 'A', 'B'] else 'Neutral' if energy_label == 'C' else 'Negative'}
   - Improvement potential: {'Low' if energy_label in ['A++', 'A+', 'A'] else 'Medium' if energy_label in ['B', 'C'] else 'High'}

3. Rental Regulations:
   - Social housing threshold: €763/month (2024)
   - Rental point system applicable: {'Yes' if price < 400000 else 'Unlikely'}
   - Market segment: {'Social' if price < 400000 else 'Mid-market' if price < 800000 else 'Premium'}

4. Tax Benefits:
   - Mortgage interest deduction: Available for owner-occupiers
   - Transfer tax: 2% (under 35) or 10.4% (standard)
   - Investment property considerations: No mortgage interest deduction
"""
    
    @staticmethod
    def _build_spanish_analysis_section(property_data: Dict[str, Any]) -> str:
        """Build Spanish market-specific analysis section"""
        
        price = property_data.get('price', 0)
        address = property_data.get('address', '').lower()
        
        # Assess tourism potential
        tourist_areas = ['costa', 'playa', 'barcelona', 'madrid', 'valencia', 'sevilla', 'mallorca', 'ibiza']
        tourism_potential = 'High' if any(area in address for area in tourist_areas) else 'Medium' if 'spain' in address else 'Low'
        
        return f"""
SPANISH MARKET ANALYSIS:

1. Golden Visa Assessment:
   - Property value: €{price:,}
   - Golden Visa eligible: {'Yes' if price >= 500000 else 'No'}
   - Investment threshold: €500,000 minimum
   - Residency benefits: {'Available' if price >= 500000 else 'Not applicable'}

2. Tourism Potential:
   - Location assessment: {tourism_potential}
   - Short-term rental viability: {'High' if tourism_potential == 'High' else 'Medium' if tourism_potential == 'Medium' else 'Low'}
   - Seasonal demand: {'Strong' if tourism_potential == 'High' else 'Moderate' if tourism_potential == 'Medium' else 'Limited'}
   - Tourist license: {'Required' if tourism_potential in ['High', 'Medium'] else 'Check local regulations'}

3. Regional Considerations:
   - Transfer tax: 6-10% (varies by autonomous community)
   - Property tax (IBI): 0.4-1.1% annually (municipal variation)
   - Rental income tax: 19-47% depending on residency status

4. Market Dynamics:
   - Typical yield range: 4.0-7.5%
   - Appreciation potential: ~3.8% annually (historical)
   - Rental demand: {'High' if tourism_potential == 'High' else 'Moderate'}
"""
    
    @staticmethod
    def _build_general_analysis_section(property_data: Dict[str, Any]) -> str:
        """Build general market analysis section"""
        
        price = property_data.get('price', 0)
        
        return f"""
GENERAL MARKET ANALYSIS:

1. Property Assessment:
   - Property value: €{price:,}
   - Market segment: {'Premium' if price > 800000 else 'Mid-market' if price > 300000 else 'Entry-level'}

2. Investment Considerations:
   - Typical yield range: 4.0-8.0%
   - Appreciation potential: ~3.0% annually (general estimate)
   - Market liquidity: Assess local market conditions

3. Tax Considerations:
   - Transfer tax: ~5% (estimate - verify local rates)
   - Property tax: ~1% annually (estimate - verify local rates)
   - Rental income tax: Varies by jurisdiction

4. Risk Factors:
   - Market-specific regulations: Research local requirements
   - Currency risk: Consider if investing from abroad
   - Legal framework: Verify property rights and regulations
""" 