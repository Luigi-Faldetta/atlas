"""
Real Estate Language Translation and Data Standardization Module
Handles multilingual property data and ensures accuracy for Dutch and Spanish markets
"""

import os
import re
import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from openai import OpenAI
from dataclasses import dataclass
from enum import Enum

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Market(Enum):
    """Supported real estate markets"""
    DUTCH = "nl"
    SPANISH = "es"
    ENGLISH = "en"

@dataclass
class TranslationResult:
    """Result of translation operation"""
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    confidence: float
    field_type: str

@dataclass
class PropertyDataStandardized:
    """Standardized property data structure"""
    price: float
    currency: str
    currency_symbol: str
    description: str
    features: List[str]
    location: str
    property_type: str
    energy_rating: str
    size_sqm: float
    bedrooms: int
    bathrooms: int
    
class RealEstateTranslator:
    """Advanced translation system specifically designed for real estate data"""
    
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Real estate terminology mappings
        self.market_terminology = {
            Market.DUTCH: {
                "property_types": {
                    "woning": "house",
                    "appartement": "apartment", 
                    "studio": "studio",
                    "villa": "villa",
                    "herenhuis": "townhouse",
                    "penthouse": "penthouse",
                    "grachtenpand": "canal house"
                },
                "features": {
                    "badkamer": "bathroom",
                    "slaapkamer": "bedroom", 
                    "tuin": "garden",
                    "balkon": "balcony",
                    "parkeerplaats": "parking space",
                    "kelder": "basement",
                    "zolder": "attic",
                    "lift": "elevator",
                    "airconditioning": "air conditioning",
                    "vloerverwarming": "underfloor heating"
                },
                "energy_labels": {
                    "A+++": "A+++",
                    "A++": "A++", 
                    "A+": "A+",
                    "A": "A",
                    "B": "B",
                    "C": "C",
                    "D": "D",
                    "E": "E",
                    "F": "F",
                    "G": "G"
                },
                "currency": "EUR",
                "currency_symbol": "€"
            },
            Market.SPANISH: {
                "property_types": {
                    "piso": "apartment",
                    "casa": "house",
                    "chalet": "villa",
                    "estudio": "studio", 
                    "ático": "penthouse",
                    "duplex": "duplex",
                    "local": "commercial space"
                },
                "features": {
                    "baño": "bathroom",
                    "dormitorio": "bedroom",
                    "jardín": "garden", 
                    "balcón": "balcony",
                    "plaza de garaje": "parking space",
                    "trastero": "storage room",
                    "terraza": "terrace",
                    "ascensor": "elevator",
                    "aire acondicionado": "air conditioning",
                    "calefacción": "heating"
                },
                "energy_labels": {
                    "A": "A",
                    "B": "B",
                    "C": "C", 
                    "D": "D",
                    "E": "E",
                    "F": "F",
                    "G": "G"
                },
                "currency": "EUR",
                "currency_symbol": "€"
            }
        }
        
        # Regional patterns for data extraction
        self.regional_patterns = {
            Market.DUTCH: {
                "price_patterns": [
                    r"€\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)",
                    r"(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*euro",
                    r"(\d{1,3}(?:\.\d{3})*)\s*k\.k\.",
                ],
                "size_patterns": [
                    r"(\d+)\s*m²",
                    r"(\d+)\s*vierkante meter",
                ],
                "room_patterns": [
                    r"(\d+)\s*slaapkamers?",
                    r"(\d+)\s*kamers?",
                ]
            },
            Market.SPANISH: {
                "price_patterns": [
                    r"(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*€",
                    r"€\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)",
                    r"(\d{1,3}(?:\.\d{3})*)\s*euros?",
                ],
                "size_patterns": [
                    r"(\d+)\s*m²",
                    r"(\d+)\s*metros cuadrados",
                ],
                "room_patterns": [
                    r"(\d+)\s*habitaciones?",
                    r"(\d+)\s*dormitorios?",
                ]
            }
        }

    def detect_language(self, text: str) -> str:
        """Detect the language of property data"""
        dutch_indicators = ['woning', 'appartement', 'euro', 'slaapkamer', 'badkamer', 'tuin', 'balkon']
        spanish_indicators = ['piso', 'casa', 'dormitorio', 'baño', 'jardín', 'balcón', 'euros']
        
        text_lower = text.lower()
        
        dutch_score = sum(1 for word in dutch_indicators if word in text_lower)
        spanish_score = sum(1 for word in spanish_indicators if word in text_lower)
        
        if dutch_score > spanish_score:
            return Market.DUTCH.value
        elif spanish_score > dutch_score:
            return Market.SPANISH.value
        else:
            # Use AI for ambiguous cases
            return self._ai_language_detection(text)

    def _ai_language_detection(self, text: str) -> str:
        """Use AI to detect language when heuristics are insufficient"""
        try:
            prompt = f"""
            Detect the language of this real estate text. 
            Respond with only: 'nl' for Dutch, 'es' for Spanish, or 'en' for English.
            
            Text: {text[:500]}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=5,
                temperature=0
            )
            
            result = response.choices[0].message.content.strip().lower()
            return result if result in ['nl', 'es', 'en'] else 'en'
            
        except Exception as e:
            logger.error(f"AI language detection failed: {e}")
            return 'en'

    def standardize_price_format(self, price_str: str, source_market: Market) -> Tuple[float, str, str]:
        """Extract and standardize price from various formats"""
        patterns = self.regional_patterns[source_market]["price_patterns"]
        
        for pattern in patterns:
            match = re.search(pattern, price_str, re.IGNORECASE)
            if match:
                price_text = match.group(1)
                # Handle European number format (dots as thousands separator, comma as decimal)
                if ',' in price_text:
                    price_value = float(price_text.replace('.', '').replace(',', '.'))
                else:
                    price_value = float(price_text.replace('.', ''))
                
                # Handle k.k. (kosten koper) notation
                if 'k.k.' in price_str.lower():
                    price_value *= 1000
                
                currency_info = self.market_terminology[source_market]
                return price_value, currency_info["currency"], currency_info["currency_symbol"]
        
        return 0.0, "EUR", "€"

    def translate_property_features(self, features: List[str], source_market: Market) -> List[str]:
        """Translate property features using market-specific terminology"""
        if source_market not in self.market_terminology:
            return features
            
        feature_map = self.market_terminology[source_market]["features"]
        translated_features = []
        
        for feature in features:
            feature_lower = feature.lower().strip()
            
            # Direct translation lookup
            if feature_lower in feature_map:
                translated_features.append(feature_map[feature_lower])
            else:
                # Partial matching for compound features
                translated = feature
                for original, translation in feature_map.items():
                    if original in feature_lower:
                        translated = feature_lower.replace(original, translation)
                        break
                
                # If no match found, use AI translation
                if translated == feature:
                    translated = self._ai_translate_text(feature, source_market.value, "en", "property_feature")
                
                translated_features.append(translated.title())
        
        return translated_features

    def translate_property_description(self, description: str, source_language: str, 
                                     target_language: str = "en") -> TranslationResult:
        """Translate property description with real estate context"""
        if source_language == target_language:
            return TranslationResult(
                original_text=description,
                translated_text=description,
                source_language=source_language,
                target_language=target_language,
                confidence=1.0,
                field_type="description"
            )
        
        translated_text = self._ai_translate_text(description, source_language, target_language, "description")
        
        return TranslationResult(
            original_text=description,
            translated_text=translated_text,
            source_language=source_language,
            target_language=target_language,
            confidence=0.9,  # AI confidence estimation could be improved
            field_type="description"
        )

    def _ai_translate_text(self, text: str, source_lang: str, target_lang: str, field_type: str) -> str:
        """Use AI for context-aware translation"""
        try:
            context_prompts = {
                "description": "This is a real estate property description. Maintain the professional tone and include all important details about the property's features, location, and amenities.",
                "property_feature": "This is a real estate property feature. Translate to standard real estate terminology.",
                "location": "This is a property location or address. Translate street names and area descriptions appropriately."
            }
            
            context = context_prompts.get(field_type, "This is real estate related text.")
            
            prompt = f"""
            Translate the following real estate text from {source_lang} to {target_lang}.
            
            Context: {context}
            
            Text to translate: {text}
            
            Provide only the translation without any additional comments.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"AI translation failed: {e}")
            return text

    def standardize_property_data(self, raw_data: Dict[str, Any]) -> PropertyDataStandardized:
        """Standardize property data from different markets"""
        
        # Detect source market
        description = raw_data.get('description', '')
        price_str = raw_data.get('price', '')
        combined_text = f"{description} {price_str}"
        
        source_language = self.detect_language(combined_text)
        source_market = Market(source_language) if source_language in [m.value for m in Market] else Market.ENGLISH
        
        # Standardize price
        price_value, currency, currency_symbol = self.standardize_price_format(price_str, source_market)
        
        # Translate description
        description_result = self.translate_property_description(description, source_language, "en")
        
        # Translate features
        features = raw_data.get('features', [])
        if isinstance(features, str):
            features = [f.strip() for f in features.split(',')]
        
        translated_features = self.translate_property_features(features, source_market)
        
        # Translate location
        location = raw_data.get('location', raw_data.get('address', ''))
        translated_location = self._ai_translate_text(location, source_language, "en", "location")
        
        # Standardize property type
        property_type = raw_data.get('property_type', '')
        if source_market in self.market_terminology:
            type_map = self.market_terminology[source_market]["property_types"]
            property_type = type_map.get(property_type.lower(), property_type)
        
        return PropertyDataStandardized(
            price=price_value,
            currency=currency,
            currency_symbol=currency_symbol,
            description=description_result.translated_text,
            features=translated_features,
            location=translated_location,
            property_type=property_type.title(),
            energy_rating=raw_data.get('energy_rating', raw_data.get('energy_label', '')),
            size_sqm=float(raw_data.get('size', raw_data.get('size_sqm', 0))),
            bedrooms=int(raw_data.get('bedrooms', 0)),
            bathrooms=int(raw_data.get('bathrooms', 0))
        )

    def enhance_investment_metrics_translation(self, metrics: Dict[str, Any], source_market: Market) -> Dict[str, Any]:
        """Enhance investment metrics with proper translations and cultural adaptations"""
        
        enhanced_metrics = metrics.copy()
        
        # Cultural adaptations for different markets
        market_adaptations = {
            Market.DUTCH: {
                "tax_considerations": "Consider Dutch property transfer tax (overdrachtsbelasting) and municipal taxes (OZB)",
                "legal_notes": "Property purchases in Netherlands require notary involvement",
                "market_context": "Dutch real estate market with emphasis on energy efficiency ratings"
            },
            Market.SPANISH: {
                "tax_considerations": "Consider Spanish property transfer tax (ITP) and annual property tax (IBI)",
                "legal_notes": "Spanish property purchases may require NIE number for foreigners",
                "market_context": "Spanish real estate market with regional variations in pricing and regulations"
            }
        }
        
        if source_market in market_adaptations:
            enhanced_metrics.update(market_adaptations[source_market])
        
        # Translate analysis strengths and weaknesses
        if 'strengths' in enhanced_metrics:
            enhanced_metrics['strengths'] = [
                self._ai_translate_text(strength, source_market.value, "en", "property_feature")
                for strength in enhanced_metrics['strengths']
            ]
        
        if 'weaknesses' in enhanced_metrics:
            enhanced_metrics['weaknesses'] = [
                self._ai_translate_text(weakness, source_market.value, "en", "property_feature")
                for weakness in enhanced_metrics['weaknesses']
            ]
        
        return enhanced_metrics

# Utility functions for integration
def translate_scraped_property_data(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """Main function to translate and standardize scraped property data"""
    translator = RealEstateTranslator()
    
    try:
        # Standardize the core property data
        standardized = translator.standardize_property_data(property_data)
        
        # Detect source market for additional processing
        source_language = translator.detect_language(
            f"{property_data.get('description', '')} {property_data.get('price', '')}"
        )
        source_market = Market(source_language) if source_language in [m.value for m in Market] else Market.ENGLISH
        
        # Enhanced investment metrics if available
        if 'investment_analysis' in property_data:
            property_data['investment_analysis'] = translator.enhance_investment_metrics_translation(
                property_data['investment_analysis'], source_market
            )
        
        # Update property data with standardized values
        property_data.update({
            'price_standardized': standardized.price,
            'currency': standardized.currency,
            'currency_symbol': standardized.currency_symbol,
            'description_translated': standardized.description,
            'features_translated': standardized.features,
            'location_translated': standardized.location,
            'property_type_translated': standardized.property_type,
            'source_language': source_language,
            'translation_confidence': 0.9
        })
        
        logger.info(f"Successfully translated property data from {source_language} to English")
        return property_data
        
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        return property_data

if __name__ == "__main__":
    # Test the translator
    test_data = {
        "description": "Prachtig appartement in het centrum van Amsterdam met 2 slaapkamers, balkon en lift.",
        "price": "€ 450.000 k.k.",
        "features": ["badkamer", "slaapkamer", "balkon", "lift"],
        "location": "Centrum Amsterdam, Noord-Holland",
        "property_type": "appartement"
    }
    
    result = translate_scraped_property_data(test_data)
    print(json.dumps(result, indent=2)) 