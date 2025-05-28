#!/usr/bin/env python3
"""
Enhanced Analysis Bridge Script
Bridges Node.js backend with Python enhanced agent
Following rapid-prototyping-beer-test-001.mdc: Quick integration for immediate user value
"""

import sys
import json
import asyncio
import os
from pathlib import Path

# Add current directory to path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

async def run_enhanced_analysis():
    """Run enhanced analysis and return results"""
    
    try:
        # Get input data from command line argument
        if len(sys.argv) < 2:
            raise ValueError("No analysis data provided")
        
        input_data = json.loads(sys.argv[1])
        property_url = input_data.get('propertyUrl')
        address = input_data.get('address')
        user_preferences = input_data.get('userPreferences', {})
        
        # Check if we have OpenAI API key
        if not os.getenv('OPENAI_API_KEY'):
            # Return fallback analysis for rapid prototyping
            return create_fallback_analysis(property_url, address)
        
        # Try to import and use enhanced agent
        try:
            from enhanced_atlas_integration import analyze_property_enhanced
            
            # Run enhanced analysis
            result = await analyze_property_enhanced(
                url=property_url,
                user_preferences=user_preferences
            )
            
            return result
            
        except ImportError as e:
            # Fallback if enhanced agent not available
            return create_fallback_analysis(property_url, address, str(e))
            
    except Exception as e:
        # Return error analysis
        return create_error_analysis(str(e))

def create_fallback_analysis(property_url, address, error_msg=None):
    """Create fallback analysis for rapid prototyping"""
    
    # Determine market type from URL or address
    market_type = 'general'
    if property_url:
        if 'funda.nl' in property_url.lower():
            market_type = 'dutch'
        elif any(domain in property_url.lower() for domain in ['idealista.com', 'fotocasa.es', 'habitaclia.com']):
            market_type = 'spanish'
    elif address:
        address_lower = address.lower()
        if any(term in address_lower for term in ['netherlands', 'amsterdam', 'rotterdam', 'utrecht']):
            market_type = 'dutch'
        elif any(term in address_lower for term in ['spain', 'madrid', 'barcelona', 'valencia']):
            market_type = 'spanish'
    
    # Create market-specific fallback analysis
    if market_type == 'dutch':
        return create_dutch_fallback_analysis(address or property_url)
    elif market_type == 'spanish':
        return create_spanish_fallback_analysis(address or property_url)
    else:
        return create_general_fallback_analysis(address or property_url)

def create_dutch_fallback_analysis(location):
    """Create Dutch market fallback analysis"""
    
    return {
        'investment_score': 72,
        'investment_score_confidence': 65,
        'address': location or 'Dutch Property',
        
        'financial_metrics': {
            'roi_5_year': 9.2,
            'roi_5_year_confidence': 70,
            'roi_10_year': 14.8,
            'roi_10_year_confidence': 65,
            'yearly_yield': 4.8,
            'yearly_yield_confidence': 75,
            'monthly_rental': 1650,
            'monthly_rental_confidence': 70,
            'dscr': 1.25,
            'dscr_confidence': 65
        },
        
        'strengths': [
            'Stable Dutch rental market with strong tenant protections',
            'Energy efficiency requirements drive property improvements',
            'Good public transportation connectivity',
            'Strong mortgage interest deduction benefits for owner-occupiers'
        ],
        
        'weaknesses': [
            'High transfer tax (10.4%) increases acquisition costs',
            'Rental point system may limit rental income potential',
            'WOZ tax adds to annual property costs',
            'Limited data available for detailed analysis'
        ],
        
        'recommendations': [
            'Verify energy label and potential improvement costs',
            'Research local WOZ values and tax implications',
            'Check rental point system applicability',
            'Consider transfer tax impact on total investment'
        ],
        
        'reasoning_process': 'FALLBACK ANALYSIS: Using Dutch market averages and typical investment patterns. Property assessed based on general market conditions and regulatory framework.',
        
        'analysis_context': {
            'market_type': 'dutch',
            'data_quality_score': 45,
            'complexity_level': 'simplified',
            'confidence_threshold': 60
        },
        
        'validation': {
            'quality_score': 60,
            'validation_notes': ['Fallback analysis - limited data available'],
            'confidence_calibration': 65
        },
        
        'metadata': {
            'analysis_type': 'fallback',
            'market_specialization': 'dutch',
            'timestamp': '2024-12-01T12:00:00Z',
            'agentic_patterns': ['basic_reasoning', 'market_adaptation']
        }
    }

def create_spanish_fallback_analysis(location):
    """Create Spanish market fallback analysis"""
    
    return {
        'investment_score': 68,
        'investment_score_confidence': 60,
        'address': location or 'Spanish Property',
        
        'financial_metrics': {
            'roi_5_year': 8.8,
            'roi_5_year_confidence': 65,
            'roi_10_year': 13.5,
            'roi_10_year_confidence': 60,
            'yearly_yield': 5.5,
            'yearly_yield_confidence': 70,
            'monthly_rental': 1200,
            'monthly_rental_confidence': 65,
            'dscr': 1.15,
            'dscr_confidence': 60
        },
        
        'strengths': [
            'Potential for Golden Visa eligibility (€500k+ properties)',
            'Strong tourism market supports short-term rental potential',
            'Regional diversity offers various investment strategies',
            'Growing international investor interest'
        ],
        
        'weaknesses': [
            'Regional tax variations create complexity',
            'Tourist license requirements for short-term rentals',
            'Seasonal demand fluctuations in tourist areas',
            'Limited data available for detailed analysis'
        ],
        
        'recommendations': [
            'Verify Golden Visa eligibility and benefits',
            'Research local tourist license requirements',
            'Assess seasonal rental demand patterns',
            'Consider regional tax implications'
        ],
        
        'reasoning_process': 'FALLBACK ANALYSIS: Using Spanish market averages and tourism potential assessment. Property evaluated based on general market trends and regulatory considerations.',
        
        'analysis_context': {
            'market_type': 'spanish',
            'data_quality_score': 40,
            'complexity_level': 'simplified',
            'confidence_threshold': 55
        },
        
        'validation': {
            'quality_score': 55,
            'validation_notes': ['Fallback analysis - limited data available'],
            'confidence_calibration': 60
        },
        
        'metadata': {
            'analysis_type': 'fallback',
            'market_specialization': 'spanish',
            'timestamp': '2024-12-01T12:00:00Z',
            'agentic_patterns': ['basic_reasoning', 'market_adaptation']
        }
    }

def create_general_fallback_analysis(location):
    """Create general market fallback analysis"""
    
    return {
        'investment_score': 65,
        'investment_score_confidence': 55,
        'address': location or 'Property Location',
        
        'financial_metrics': {
            'roi_5_year': 8.0,
            'roi_5_year_confidence': 60,
            'roi_10_year': 12.5,
            'roi_10_year_confidence': 55,
            'yearly_yield': 5.0,
            'yearly_yield_confidence': 65,
            'monthly_rental': 1400,
            'monthly_rental_confidence': 60,
            'dscr': 1.20,
            'dscr_confidence': 55
        },
        
        'strengths': [
            'General market conditions appear stable',
            'Reasonable rental yield potential',
            'Property investment fundamentals intact',
            'Market liquidity generally adequate'
        ],
        
        'weaknesses': [
            'Limited market-specific data available',
            'General analysis lacks local market insights',
            'Regulatory considerations not fully assessed',
            'Market timing factors uncertain'
        ],
        
        'recommendations': [
            'Conduct detailed local market research',
            'Verify local regulations and tax implications',
            'Assess property condition and improvement needs',
            'Consider professional market analysis'
        ],
        
        'reasoning_process': 'FALLBACK ANALYSIS: Using general market assumptions and basic investment principles. Detailed market analysis recommended.',
        
        'analysis_context': {
            'market_type': 'general',
            'data_quality_score': 35,
            'complexity_level': 'basic',
            'confidence_threshold': 50
        },
        
        'validation': {
            'quality_score': 50,
            'validation_notes': ['Fallback analysis - general market assumptions'],
            'confidence_calibration': 55
        },
        
        'metadata': {
            'analysis_type': 'fallback',
            'market_specialization': 'general',
            'timestamp': '2024-12-01T12:00:00Z',
            'agentic_patterns': ['basic_reasoning']
        }
    }

def create_error_analysis(error_msg):
    """Create error analysis response"""
    
    return {
        'investment_score': 0,
        'investment_score_confidence': 0,
        'address': 'Analysis Error',
        
        'financial_metrics': {},
        
        'strengths': [],
        'weaknesses': ['Analysis failed due to technical issues'],
        'recommendations': [
            'Please try again later',
            'Contact support if problem persists',
            'Verify property URL is accessible'
        ],
        
        'reasoning_process': f'ERROR: {error_msg}',
        
        'analysis_context': {
            'market_type': 'error',
            'data_quality_score': 0,
            'complexity_level': 'error',
            'confidence_threshold': 0
        },
        
        'validation': {
            'quality_score': 0,
            'validation_notes': [f'Analysis error: {error_msg}'],
            'confidence_calibration': 0
        },
        
        'metadata': {
            'analysis_type': 'error',
            'error_message': error_msg,
            'timestamp': '2024-12-01T12:00:00Z'
        }
    }

if __name__ == "__main__":
    try:
        # Run the analysis
        result = asyncio.run(run_enhanced_analysis())
        
        # Output JSON result
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        # Output error analysis
        error_result = create_error_analysis(str(e))
        print(json.dumps(error_result, indent=2))
        sys.exit(1) 