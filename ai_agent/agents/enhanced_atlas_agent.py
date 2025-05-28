"""
Enhanced Atlas Agent
Following atlas.mdc agentic patterns: Chain-of-thought reasoning and self-reflection
"""

import asyncio
import logging
from typing import Dict, Any, Optional, Tuple
from datetime import datetime
import json
import re

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

from .context_manager import ContextManager, AgentContext
from .quality_assessor import QualityAssessor
from ..prompts.enhanced_agent_prompts import EnhancedAgentPrompts


class EnhancedAtlasAgent:
    """
    Enhanced Atlas AI Agent with agentic patterns
    Following atlas.mdc: Chain-of-thought reasoning, self-reflection, and adaptive behavior
    """
    
    def __init__(self, openai_api_key: str, model_name: str = "gpt-4o"):
        """
        Initialize enhanced agent with agentic capabilities
        Following atlas.mdc: Comprehensive error handling and fallback mechanisms
        """
        self.llm = ChatOpenAI(
            temperature=0.7,
            model_name=model_name,
            openai_api_key=openai_api_key
        )
        
        self.context_manager = ContextManager()
        self.quality_assessor = QualityAssessor()
        self.prompts = EnhancedAgentPrompts()
        
        # Performance tracking
        self.analysis_count = 0
        self.success_count = 0
        self.fallback_count = 0
        
        # Configure logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
    async def analyze_property_enhanced(self, property_data: Dict[str, Any], 
                                      url: Optional[str] = None,
                                      user_preferences: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Enhanced property analysis with comprehensive error handling
        Following atlas.mdc: Chain-of-thought reasoning and self-reflection
        """
        start_time = datetime.now()
        self.analysis_count += 1
        
        try:
            # Step 1: Create adaptive context
            context = self.context_manager.create_agent_context(
                property_data, url, user_preferences
            )
            
            self.logger.info(f"Analysis {self.analysis_count}: Context created - "
                           f"Market: {context.market_type}, "
                           f"Quality: {context.data_quality_score}/100, "
                           f"Complexity: {context.complexity_level}")
            
            # Step 2: Check if fallback is required
            if context.fallback_required:
                return await self._execute_fallback_analysis(property_data, context)
            
            # Step 3: Execute main analysis with chain-of-thought
            result = await self._execute_enhanced_analysis(property_data, context)
            
            # Step 4: Validate and assess quality
            validated_result = await self._validate_and_assess_quality(result, property_data, context)
            
            # Step 5: Add metadata and performance metrics
            final_result = self._add_analysis_metadata(validated_result, context, start_time)
            
            self.success_count += 1
            self.logger.info(f"Analysis {self.analysis_count}: Completed successfully")
            
            return final_result
            
        except Exception as e:
            self.logger.error(f"Analysis {self.analysis_count} failed: {str(e)}")
            return await self._handle_analysis_error(e, property_data, context if 'context' in locals() else None)
    
    async def _execute_enhanced_analysis(self, property_data: Dict[str, Any], 
                                       context: AgentContext) -> Dict[str, Any]:
        """
        Execute main analysis with chain-of-thought reasoning
        Following atlas.mdc: Structured reasoning steps and self-reflection
        """
        
        # Build enhanced prompt with chain-of-thought structure
        prompt_text = self.prompts.build_analysis_prompt(property_data, context.__dict__)
        
        # Execute analysis with structured reasoning
        response = await self._execute_llm_call(prompt_text)
        
        # Parse structured response
        parsed_result = self._parse_enhanced_response(response)
        
        # Add context information
        parsed_result['analysis_context'] = {
            'market_type': context.market_type,
            'data_quality_score': context.data_quality_score,
            'complexity_level': context.complexity_level,
            'confidence_threshold': context.confidence_threshold
        }
        
        return parsed_result
    
    async def _validate_and_assess_quality(self, result: Dict[str, Any], 
                                         property_data: Dict[str, Any],
                                         context: AgentContext) -> Dict[str, Any]:
        """
        Validate analysis quality using self-reflection patterns
        Following atlas.mdc: Multi-layer verification
        """
        
        # Step 1: Self-reflection validation
        validation_prompt = self.prompts.build_validation_prompt(
            json.dumps(result, indent=2), property_data
        )
        
        validation_response = await self._execute_llm_call(validation_prompt)
        validation_result = self._parse_validation_response(validation_response)
        
        # Step 2: Quality assessment
        quality_score = self.quality_assessor.assess_analysis_quality(
            result, property_data, context
        )
        
        # Step 3: Apply corrections if needed
        if validation_result.get('quality_score', 100) < context.confidence_threshold:
            self.logger.warning(f"Analysis quality below threshold: {validation_result.get('quality_score')}")
            
            # Apply corrections or trigger fallback
            if validation_result.get('corrections'):
                result = self._apply_corrections(result, validation_result['corrections'])
            else:
                # Trigger simplified analysis
                return await self._execute_fallback_analysis(property_data, context)
        
        # Add validation metadata
        result['validation'] = {
            'quality_score': validation_result.get('quality_score', 0),
            'validation_notes': validation_result.get('notes', []),
            'confidence_calibration': quality_score
        }
        
        return result
    
    async def _execute_fallback_analysis(self, property_data: Dict[str, Any], 
                                       context: AgentContext) -> Dict[str, Any]:
        """
        Execute fallback analysis for low-quality data or errors
        Following atlas.mdc: Comprehensive fallback strategies
        """
        self.fallback_count += 1
        self.logger.info(f"Executing fallback analysis - Reason: {context.fallback_required}")
        
        # Build fallback prompt
        error_context = {
            'error_type': 'insufficient_data',
            'available_data': 'limited',
            'data_quality': context.data_quality_score
        }
        
        fallback_prompt = self.prompts.build_fallback_prompt(error_context)
        
        # Execute simplified analysis
        response = await self._execute_llm_call(fallback_prompt)
        
        # Parse fallback response
        result = self._parse_fallback_response(response)
        
        # Add fallback metadata
        result['analysis_type'] = 'fallback'
        result['fallback_reason'] = 'insufficient_data_quality'
        result['data_quality_score'] = context.data_quality_score
        
        return result
    
    async def _execute_llm_call(self, prompt_text: str) -> str:
        """Execute LLM call with error handling and retry logic"""
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Create prompt template
                prompt = ChatPromptTemplate.from_template(prompt_text)
                
                # Execute chain
                chain = prompt | self.llm
                response = await chain.ainvoke({})
                
                return response.content
                
            except Exception as e:
                self.logger.warning(f"LLM call attempt {attempt + 1} failed: {str(e)}")
                if attempt == max_retries - 1:
                    raise e
                await asyncio.sleep(1)  # Brief delay before retry
    
    def _parse_enhanced_response(self, response: str) -> Dict[str, Any]:
        """
        Parse enhanced analysis response with confidence scores
        Following atlas.mdc: Structured output parsing
        """
        
        result = {}
        
        try:
            # Extract investment score and confidence
            score_match = re.search(r'\*\*INVESTMENT SCORE\*\*:\s*(\d+)/100', response)
            confidence_match = re.search(r'\*\*CONFIDENCE\*\*:\s*(\d+)%', response)
            
            if score_match:
                result['investment_score'] = int(score_match.group(1))
            if confidence_match:
                result['investment_score_confidence'] = int(confidence_match.group(1))
            
            # Extract address
            address_match = re.search(r'\*\*ADDRESS\*\*:\s*(.+)', response)
            if address_match:
                result['address'] = address_match.group(1).strip()
            
            # Extract financial metrics with confidence scores
            result['financial_metrics'] = self._extract_financial_metrics(response)
            
            # Extract strengths and weaknesses
            result['strengths'] = self._extract_list_items(response, 'STRENGTHS')
            result['weaknesses'] = self._extract_list_items(response, 'WEAKNESSES')
            
            # Extract recommendations
            result['recommendations'] = self._extract_list_items(response, 'ACTIONABLE RECOMMENDATIONS')
            
            # Extract chain-of-thought reasoning
            reasoning_match = re.search(r'\*\*CHAIN-OF-THOUGHT REASONING\*\*:\s*(.+?)(?=\*\*|$)', response, re.DOTALL)
            if reasoning_match:
                result['reasoning_process'] = reasoning_match.group(1).strip()
            
            # Extract self-reflection summary
            reflection_match = re.search(r'\*\*SELF-REFLECTION SUMMARY\*\*:\s*(.+?)(?=\*\*|$)', response, re.DOTALL)
            if reflection_match:
                result['self_reflection'] = reflection_match.group(1).strip()
            
            # Store full response for debugging
            result['full_response'] = response
            
        except Exception as e:
            self.logger.error(f"Error parsing enhanced response: {str(e)}")
            result['parsing_error'] = str(e)
            result['full_response'] = response
        
        return result
    
    def _extract_financial_metrics(self, response: str) -> Dict[str, Any]:
        """Extract financial metrics with confidence scores"""
        
        metrics = {}
        
        # ROI metrics
        roi_5_match = re.search(r'ROI \(5 years\):\s*([0-9.]+)%.*?Confidence:\s*([0-9]+)%', response)
        if roi_5_match:
            metrics['roi_5_year'] = float(roi_5_match.group(1))
            metrics['roi_5_year_confidence'] = int(roi_5_match.group(2))
        
        roi_10_match = re.search(r'ROI \(10 years\):\s*([0-9.]+)%.*?Confidence:\s*([0-9]+)%', response)
        if roi_10_match:
            metrics['roi_10_year'] = float(roi_10_match.group(1))
            metrics['roi_10_year_confidence'] = int(roi_10_match.group(2))
        
        # Yield
        yield_match = re.search(r'Yearly Yield:\s*([0-9.]+)%.*?Confidence:\s*([0-9]+)%', response)
        if yield_match:
            metrics['yearly_yield'] = float(yield_match.group(1))
            metrics['yearly_yield_confidence'] = int(yield_match.group(2))
        
        # Rental income
        rental_match = re.search(r'Monthly Rental Income:\s*€([0-9,]+).*?Confidence:\s*([0-9]+)%', response)
        if rental_match:
            metrics['monthly_rental'] = float(rental_match.group(1).replace(',', ''))
            metrics['monthly_rental_confidence'] = int(rental_match.group(2))
        
        # Advanced metrics
        dscr_match = re.search(r'DSCR:\s*([0-9.]+).*?Confidence:\s*([0-9]+)%', response)
        if dscr_match:
            metrics['dscr'] = float(dscr_match.group(1))
            metrics['dscr_confidence'] = int(dscr_match.group(2))
        
        return metrics
    
    def _extract_list_items(self, response: str, section_name: str) -> list:
        """Extract list items from a section"""
        
        pattern = rf'\*\*{section_name}\*\*:\s*(.+?)(?=\*\*|$)'
        match = re.search(pattern, response, re.DOTALL)
        
        if match:
            content = match.group(1).strip()
            # Split by bullet points or numbered items
            items = re.split(r'[•\n]\s*', content)
            return [item.strip() for item in items if item.strip()]
        
        return []
    
    def _parse_validation_response(self, response: str) -> Dict[str, Any]:
        """Parse validation response for quality assessment"""
        
        result = {}
        
        # Extract quality score
        quality_match = re.search(r'Overall Quality Score.*?(\d+)/100', response)
        if quality_match:
            result['quality_score'] = int(quality_match.group(1))
        
        # Extract issues and corrections
        issues_match = re.search(r'Specific issues identified:\s*(.+?)(?=Recommended|$)', response, re.DOTALL)
        if issues_match:
            result['issues'] = issues_match.group(1).strip()
        
        corrections_match = re.search(r'Recommended corrections:\s*(.+?)(?=Confidence|$)', response, re.DOTALL)
        if corrections_match:
            result['corrections'] = corrections_match.group(1).strip()
        
        return result
    
    def _parse_fallback_response(self, response: str) -> Dict[str, Any]:
        """Parse fallback analysis response"""
        
        result = {
            'analysis_type': 'fallback',
            'investment_score': None,
            'confidence_level': 'low'
        }
        
        # Extract basic assessment
        assessment_match = re.search(r'\*\*BASIC ASSESSMENT\*\*:\s*(.+?)(?=\*\*|$)', response, re.DOTALL)
        if assessment_match:
            result['basic_assessment'] = assessment_match.group(1).strip()
        
        # Extract limitations
        limitations_match = re.search(r'\*\*DATA LIMITATIONS\*\*:\s*(.+?)(?=\*\*|$)', response, re.DOTALL)
        if limitations_match:
            result['data_limitations'] = limitations_match.group(1).strip()
        
        # Extract recommendations
        recommendations_match = re.search(r'\*\*RECOMMENDATIONS\*\*:\s*(.+?)(?=\*\*|$)', response, re.DOTALL)
        if recommendations_match:
            result['recommendations'] = recommendations_match.group(1).strip()
        
        result['full_response'] = response
        
        return result
    
    def _apply_corrections(self, result: Dict[str, Any], corrections: str) -> Dict[str, Any]:
        """Apply validation corrections to analysis result"""
        
        # This is a simplified implementation
        # In practice, you might want more sophisticated correction logic
        result['corrections_applied'] = corrections
        result['corrected'] = True
        
        return result
    
    def _add_analysis_metadata(self, result: Dict[str, Any], 
                             context: AgentContext, start_time: datetime) -> Dict[str, Any]:
        """Add analysis metadata and performance metrics"""
        
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        
        result['metadata'] = {
            'analysis_id': f"atlas_{self.analysis_count}_{int(start_time.timestamp())}",
            'timestamp': start_time.isoformat(),
            'processing_time_seconds': processing_time,
            'agent_version': '1.0.0-enhanced',
            'market_type': context.market_type,
            'data_quality_score': context.data_quality_score,
            'complexity_level': context.complexity_level,
            'agentic_patterns': ['chain_of_thought', 'self_reflection', 'confidence_scoring']
        }
        
        # Performance statistics
        result['performance_stats'] = {
            'total_analyses': self.analysis_count,
            'success_rate': (self.success_count / self.analysis_count) * 100,
            'fallback_rate': (self.fallback_count / self.analysis_count) * 100
        }
        
        return result
    
    async def _handle_analysis_error(self, error: Exception, 
                                   property_data: Dict[str, Any],
                                   context: Optional[AgentContext]) -> Dict[str, Any]:
        """
        Handle analysis errors with comprehensive fallback
        Following atlas.mdc: Error handling and recovery procedures
        """
        
        self.logger.error(f"Analysis error: {str(error)}")
        
        # Create minimal context if not available
        if context is None:
            context = self.context_manager.default_context
        
        # Return error response with fallback analysis
        return {
            'analysis_type': 'error_fallback',
            'error': str(error),
            'investment_score': None,
            'confidence_level': 'none',
            'message': 'Analysis failed due to technical issues. Please try again or contact support.',
            'recommendations': [
                'Verify property URL is accessible',
                'Check internet connection',
                'Try again in a few minutes',
                'Contact support if problem persists'
            ],
            'metadata': {
                'error_type': type(error).__name__,
                'timestamp': datetime.now().isoformat(),
                'fallback_triggered': True
            }
        }
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get agent performance metrics for monitoring"""
        
        return {
            'total_analyses': self.analysis_count,
            'successful_analyses': self.success_count,
            'fallback_analyses': self.fallback_count,
            'success_rate': (self.success_count / max(1, self.analysis_count)) * 100,
            'fallback_rate': (self.fallback_count / max(1, self.analysis_count)) * 100,
            'error_rate': ((self.analysis_count - self.success_count - self.fallback_count) / max(1, self.analysis_count)) * 100
        } 