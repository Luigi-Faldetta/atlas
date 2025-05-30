#!/usr/bin/env python3
"""
Enhanced Language Translator for Atlas Real Estate Analysis
Following Atlas Master Agent Rules for context-aware translation

Features:
- Chain-of-thought reasoning for translation quality
- Self-reflection mechanisms for accuracy validation
- Context preservation for technical real estate terms
- Market-specific adaptations for Dutch and Spanish properties
"""

import openai
import os
import asyncio
import time
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from dotenv import load_dotenv
import logging

load_dotenv()
logger = logging.getLogger(__name__)

@dataclass
class TranslationResult:
    """Enhanced translation result with quality metrics"""
    translated_text: str
    source_language: str
    target_language: str
    confidence_score: float
    technical_terms_preserved: List[str]
    market_context_applied: str
    processing_time: float
    quality_assessment: Dict[str, float]
    translation_notes: List[str]

class EnhancedLanguageTranslator:
    """
    Enhanced translator implementing Atlas Master Agent Rules
    
    Agentic Patterns:
    - Chain-of-thought reasoning for translation decisions
    - Self-reflection for quality validation
    - Context-aware adaptation for real estate terminology
    - Confidence scoring for translation accuracy
    """
    
    def __init__(self, openai_api_key: Optional[str] = None):
        self.openai_client = openai.OpenAI(
            api_key=openai_api_key or os.getenv('OPENAI_API_KEY')
        )
        
        # Real estate terminology dictionaries
        self.dutch_real_estate_terms = {
            'koopprijs': 'purchase_price',
            'vraagprijs': 'asking_price',
            'woonoppervlakte': 'living_area',
            'perceeloppervlakte': 'plot_area',
            'energielabel': 'energy_label',
            'WOZ-waarde': 'woz_value',
            'servicekosten': 'service_costs',
            'erfpacht': 'leasehold',
            'eigen_grond': 'freehold',
            'badkamers': 'bathrooms',
            'slaapkamers': 'bedrooms',
            'balkon': 'balcony',
            'tuin': 'garden',
            'garage': 'garage',
            'parkeerplaats': 'parking_space',
            'lift': 'elevator',
            'airco': 'air_conditioning'
        }
        
        self.spanish_real_estate_terms = {
            'precio': 'price',
            'superficie': 'surface_area',
            'habitaciones': 'bedrooms',
            'dormitorios': 'bedrooms',
            'baños': 'bathrooms',
            'metros_cuadrados': 'square_meters',
            'ascensor': 'elevator',
            'garaje': 'garage',
            'terraza': 'terrace',
            'balcón': 'balcony',
            'jardín': 'garden',
            'piscina': 'pool',
            'aire_acondicionado': 'air_conditioning',
            'calefacción': 'heating',
            'amueblado': 'furnished',
            'sin_amueblar': 'unfurnished',
            'gastos_comunidad': 'community_fees',
            'certificado_energético': 'energy_certificate'
        }
        
        logger.info("🌍 Enhanced Language Translator initialized")
    
    async def translate_with_context(
        self,
        text: str,
        source_language: str,
        target_language: str = 'en',
        market_context: str = '',
        preserve_technical_terms: bool = True
    ) -> TranslationResult:
        """
        Translate text with enhanced context preservation following agentic patterns
        
        Chain-of-thought reasoning:
        1. Analyze source text for technical terms and context
        2. Apply market-specific knowledge for accurate translation
        3. Execute translation with context preservation
        4. Validate translation quality through self-reflection
        5. Provide confidence scoring and improvement suggestions
        """
        start_time = time.time()
        
        try:
            # STEP 1: Analyze source text and identify technical terms
            technical_terms = await self._identify_technical_terms(text, source_language)
            
            # STEP 2: Create context-aware translation prompt
            translation_prompt = await self._create_translation_prompt(
                text, source_language, target_language, market_context, technical_terms
            )
            
            # STEP 3: Execute translation with OpenAI
            translation_response = await self._execute_translation(translation_prompt)
            
            # STEP 4: Validate and assess translation quality
            quality_assessment = await self._assess_translation_quality(
                text, translation_response, technical_terms
            )
            
            # STEP 5: Apply self-reflection for confidence scoring
            confidence_score, translation_notes = await self._apply_self_reflection(
                text, translation_response, quality_assessment
            )
            
            processing_time = time.time() - start_time
            
            result = TranslationResult(
                translated_text=translation_response,
                source_language=source_language,
                target_language=target_language,
                confidence_score=confidence_score,
                technical_terms_preserved=technical_terms,
                market_context_applied=market_context,
                processing_time=processing_time,
                quality_assessment=quality_assessment,
                translation_notes=translation_notes
            )
            
            logger.info(f"✅ Translation completed - Confidence: {confidence_score:.2%}")
            return result
            
        except Exception as e:
            logger.error(f"❌ Translation failed: {str(e)}")
            return TranslationResult(
                translated_text=f"Translation failed: {str(e)}",
                source_language=source_language,
                target_language=target_language,
                confidence_score=0.0,
                technical_terms_preserved=[],
                market_context_applied=market_context,
                processing_time=time.time() - start_time,
                quality_assessment={},
                translation_notes=[f"Translation error: {str(e)}"]
            )
    
    async def _identify_technical_terms(self, text: str, source_language: str) -> List[str]:
        """Identify technical real estate terms in source text"""
        identified_terms = []
        text_lower = text.lower()
        
        if source_language == 'nl':
            for dutch_term, english_term in self.dutch_real_estate_terms.items():
                if dutch_term in text_lower:
                    identified_terms.append(f"{dutch_term} -> {english_term}")
        elif source_language == 'es':
            for spanish_term, english_term in self.spanish_real_estate_terms.items():
                if spanish_term in text_lower:
                    identified_terms.append(f"{spanish_term} -> {english_term}")
        
        return identified_terms
    
    async def _create_translation_prompt(
        self,
        text: str,
        source_language: str,
        target_language: str,
        market_context: str,
        technical_terms: List[str]
    ) -> str:
        """Create context-aware translation prompt following agentic patterns"""
        
        market_specific_instructions = ""
        if source_language == 'nl' and market_context:
            market_specific_instructions = """
            Dutch Real Estate Context:
            - WOZ-waarde refers to the official tax assessment value
            - Servicekosten are monthly maintenance fees
            - Erfpacht means leasehold (land is leased, not owned)
            - VvE refers to homeowner's association
            - Energy labels range from A+++ (most efficient) to G (least efficient)
            """
        elif source_language == 'es' and market_context:
            market_specific_instructions = """
            Spanish Real Estate Context:
            - Gastos de comunidad are community fees/maintenance costs
            - IBI is the annual property tax
            - Certificado energético is the energy efficiency certificate
            - Registro de la propiedad refers to property registry
            - Habitaciones vs dormitorios: habitaciones include all rooms, dormitorios are bedrooms only
            """
        
        prompt = f"""
        You are an expert real estate translator specializing in {source_language} to {target_language} translation.
        
        TASK: Translate the following real estate property description with maximum accuracy and context preservation.
        
        SOURCE LANGUAGE: {source_language}
        TARGET LANGUAGE: {target_language}
        MARKET CONTEXT: {market_context}
        
        {market_specific_instructions}
        
        TECHNICAL TERMS IDENTIFIED:
        {chr(10).join(technical_terms) if technical_terms else 'None identified'}
        
        TRANSLATION REQUIREMENTS:
        1. Preserve all numerical values exactly (prices, measurements, counts)
        2. Maintain technical real estate terminology accuracy
        3. Adapt cultural references for target market understanding
        4. Preserve the original tone and selling style
        5. Ensure currency and measurement units are clearly indicated
        
        SOURCE TEXT TO TRANSLATE:
        {text}
        
        Please provide only the translated text without additional explanations.
        """
        
        return prompt
    
    async def _execute_translation(self, prompt: str) -> str:
        """Execute translation using OpenAI with optimized parameters"""
        try:
            response = await asyncio.create_task(
                asyncio.to_thread(
                    self.openai_client.chat.completions.create,
                    model="gpt-4o",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a professional real estate translator with expertise in preserving technical terminology and market context."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    temperature=0.1,  # Low temperature for consistent translation
                    max_tokens=2000,
                    top_p=0.9
                )
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"OpenAI translation error: {str(e)}")
            raise e
    
    async def _assess_translation_quality(
        self,
        original_text: str,
        translated_text: str,
        technical_terms: List[str]
    ) -> Dict[str, float]:
        """Assess translation quality using multiple metrics"""
        quality_metrics = {}
        
        # Length consistency (translations should be reasonably similar in length)
        original_length = len(original_text)
        translated_length = len(translated_text)
        length_ratio = min(translated_length / original_length, original_length / translated_length) if original_length > 0 else 0
        quality_metrics['length_consistency'] = length_ratio
        
        # Technical terms preservation
        if technical_terms:
            preserved_count = 0
            for term_mapping in technical_terms:
                source_term = term_mapping.split(' -> ')[0]
                english_term = term_mapping.split(' -> ')[1]
                # Check if English equivalent appears in translation
                if english_term.replace('_', ' ') in translated_text.lower():
                    preserved_count += 1
            quality_metrics['technical_terms_preservation'] = preserved_count / len(technical_terms)
        else:
            quality_metrics['technical_terms_preservation'] = 1.0
        
        # Content completeness (basic heuristic)
        # Check if key information types are preserved
        info_indicators = ['€', '$', 'm²', 'bedroom', 'bathroom', 'floor', 'year']
        original_indicators = sum(1 for indicator in info_indicators if indicator in original_text.lower())
        translated_indicators = sum(1 for indicator in info_indicators if indicator in translated_text.lower())
        
        if original_indicators > 0:
            quality_metrics['content_completeness'] = min(translated_indicators / original_indicators, 1.0)
        else:
            quality_metrics['content_completeness'] = 1.0
        
        return quality_metrics
    
    async def _apply_self_reflection(
        self,
        original_text: str,
        translated_text: str,
        quality_assessment: Dict[str, float]
    ) -> tuple[float, List[str]]:
        """Apply self-reflection for confidence scoring and improvement notes"""
        
        # Calculate overall confidence score
        weights = {
            'length_consistency': 0.3,
            'technical_terms_preservation': 0.4,
            'content_completeness': 0.3
        }
        
        confidence_score = 0.0
        for metric, weight in weights.items():
            confidence_score += quality_assessment.get(metric, 0.0) * weight
        
        # Generate reflection notes
        translation_notes = []
        
        if quality_assessment.get('length_consistency', 0) < 0.7:
            translation_notes.append("Translation length significantly differs from original - may indicate missing content")
        
        if quality_assessment.get('technical_terms_preservation', 0) < 0.8:
            translation_notes.append("Some technical real estate terms may not be accurately preserved")
        
        if quality_assessment.get('content_completeness', 0) < 0.9:
            translation_notes.append("Key property information indicators may be missing from translation")
        
        if confidence_score >= 0.9:
            translation_notes.append("High-quality translation with excellent context preservation")
        elif confidence_score >= 0.8:
            translation_notes.append("Good translation quality with minor areas for improvement")
        else:
            translation_notes.append("Translation quality concerns - manual review recommended")
        
        return confidence_score, translation_notes

# Test function for validation
async def test_translation():
    """Test the enhanced translator with sample real estate content"""
    translator = EnhancedLanguageTranslator()
    
    # Test Dutch property description
    dutch_text = """
    Prachtig 3-slaapkamer appartement in Amsterdam
    Vraagprijs: €450.000 k.k.
    Woonoppervlakte: 85 m²
    Energielabel: B
    Servicekosten: €120 per maand
    
    Dit lichte appartement beschikt over:
    - 3 slaapkamers
    - 1 badkamer
    - Balkon op het zuiden
    - Lift aanwezig
    - Airco in woonkamer
    """
    
    result = await translator.translate_with_context(
        text=dutch_text,
        source_language='nl',
        target_language='en',
        market_context='Netherlands',
        preserve_technical_terms=True
    )
    
    print(f"Translation Result:")
    print(f"Confidence: {result.confidence_score:.2%}")
    print(f"Translated: {result.translated_text}")
    print(f"Technical terms: {result.technical_terms_preserved}")
    print(f"Notes: {result.translation_notes}")

if __name__ == "__main__":
    asyncio.run(test_translation()) 