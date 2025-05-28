"""
Enhanced Agent Prompts Module
Following atlas.mdc agentic patterns: Chain-of-thought reasoning and self-reflection
"""

from typing import Dict, Any, List
from dataclasses import dataclass


@dataclass
class PromptTemplate:
    """Structured prompt template with validation"""
    name: str
    template: str
    required_variables: List[str]
    validation_criteria: List[str]


class EnhancedAgentPrompts:
    """
    Enhanced prompt templates implementing atlas.mdc agentic patterns:
    - Chain-of-thought reasoning with explicit steps
    - Self-reflection and validation mechanisms
    - Confidence scoring for all components
    - Adaptive context handling
    """
    
    @staticmethod
    def build_analysis_prompt(property_data: Dict[str, Any], context: Dict[str, Any]) -> str:
        """
        Build comprehensive analysis prompt with chain-of-thought reasoning
        Following atlas.mdc: Structured reasoning steps and self-reflection
        """
        
        base_prompt = f"""
You are an enhanced Atlas AI real estate investment analyst with advanced agentic capabilities.
Your analysis must follow a structured chain-of-thought approach with self-reflection.

PROPERTY DATA:
{EnhancedAgentPrompts._format_property_data(property_data)}

ANALYSIS CONTEXT:
- Market Type: {context.get('market_type', 'Unknown')}
- Data Quality Score: {context.get('data_quality_score', 'Not assessed')}/100
- User Expertise Level: {context.get('user_expertise', 'Professional')}
- Analysis Complexity: {context.get('complexity_level', 'Standard')}

STEP 1: INITIAL ASSESSMENT
Analyze the provided property data and assess:
- Data completeness and reliability
- Market context and location factors
- Property type and characteristics
- Initial investment potential indicators

STEP 2: MARKET-SPECIFIC ANALYSIS
Apply market-specific knowledge for {context.get('market_type', 'general')} market:
- Local market conditions and trends
- Regulatory considerations and requirements
- Typical investment patterns and yields
- Comparable property analysis

STEP 3: FINANCIAL MODELING
Calculate comprehensive financial metrics:
- Investment score (0-100) with detailed justification
- ROI projections (5-year and 10-year)
- Rental yield calculations
- Advanced metrics (DSCR, Cash-on-Cash, GRM, IRR)
- Risk assessment and mitigation factors

STEP 4: SELF-CRITIQUE AND VALIDATION
SELF-CRITIQUE: Review your analysis for:
- Logical consistency in calculations
- Appropriate use of market assumptions
- Confidence levels for each metric
- Potential biases or oversights

VALIDATION PROCESS:
- Cross-check financial calculations
- Verify market assumptions against data quality
- Assess confidence levels for each component
- Identify areas requiring additional data

STEP 5: CONFIDENCE SCORING
Assign confidence scores (0-100) for each major component:
- Investment Score Confidence: [score]
- ROI Projections Confidence: [score]
- Rental Income Confidence: [score]
- Market Analysis Confidence: [score]
- Overall Analysis Confidence: [score]

REFINEMENT PROCESS:
Based on self-critique, refine any calculations or assumptions that show low confidence or logical inconsistencies.

OUTPUT FORMAT:
Provide your analysis in the structured format below, ensuring all confidence scores and reasoning steps are clearly documented.

{EnhancedAgentPrompts._get_output_format_template(context.get('market_type', 'general'))}

CRITICAL REQUIREMENTS:
1. Show your reasoning for each step
2. Include confidence scores for all major metrics
3. Highlight any data limitations or assumptions
4. Provide specific, actionable recommendations
5. Maintain consistency across all calculations
"""
        
        return base_prompt
    
    @staticmethod
    def _format_property_data(property_data: Dict[str, Any]) -> str:
        """Format property data for prompt inclusion"""
        formatted_data = []
        for key, value in property_data.items():
            if value is not None and value != "":
                formatted_data.append(f"- {key.replace('_', ' ').title()}: {value}")
        return "\n".join(formatted_data)
    
    @staticmethod
    def _get_output_format_template(market_type: str) -> str:
        """Get market-specific output format template"""
        
        base_format = """
**CHAIN-OF-THOUGHT REASONING**:
[Provide your step-by-step reasoning process]

**INVESTMENT SCORE**: [score]/100
**CONFIDENCE**: [confidence]%

**ADDRESS**: [property address]

**SCORE EXPLANATION**:
[Detailed explanation with reasoning steps]

**STRENGTHS**:
• [strength 1 with confidence level]
• [strength 2 with confidence level]
• [strength 3 with confidence level]

**WEAKNESSES**:
• [weakness 1 with mitigation suggestions]
• [weakness 2 with mitigation suggestions]
• [weakness 3 with mitigation suggestions]

**FINANCIAL ANALYSIS**:
ROI (5 years): [value]% (Confidence: [confidence]%)
ROI (10 years): [value]% (Confidence: [confidence]%)
Yearly Yield: [value]% (Confidence: [confidence]%)
Monthly Rental Income: €[value] (Confidence: [confidence]%)
Expected Monthly Income: €[value] (Confidence: [confidence]%)

**ADVANCED METRICS**:
DSCR: [value] (Confidence: [confidence]%)
Cash on Cash Return: [value]% (Confidence: [confidence]%)
GRM: [value] (Confidence: [confidence]%)
IRR: [value]% (Confidence: [confidence]%)
Equity Buildup: €[value]/year (Confidence: [confidence]%)

**MARKET ANALYSIS**:
Days on Market: [value] days
Property Tax Rate: [value]%
Vacancy Rate: [value]%
Market Trend: [trend] (Confidence: [confidence]%)

**RISK ASSESSMENT**:
Overall Risk Level: [Low/Medium/High]
Key Risk Factors: [list with mitigation strategies]
Risk Mitigation Score: [score]/100

**SELF-REFLECTION SUMMARY**:
- Analysis Quality: [assessment]
- Data Limitations: [limitations identified]
- Assumption Validity: [assessment]
- Recommendation Confidence: [overall confidence]%

**ACTIONABLE RECOMMENDATIONS**:
1. [Specific recommendation with timeline]
2. [Specific recommendation with timeline]
3. [Specific recommendation with timeline]
"""
        
        return base_format
    
    @staticmethod
    def build_validation_prompt(analysis_result: str, property_data: Dict[str, Any]) -> str:
        """
        Build validation prompt for self-reflection and quality assessment
        Following atlas.mdc: Multi-layer verification patterns
        """
        
        return f"""
You are a quality assessment specialist for Atlas AI real estate analysis.
Your task is to validate the following analysis for accuracy, consistency, and completeness.

ORIGINAL PROPERTY DATA:
{EnhancedAgentPrompts._format_property_data(property_data)}

ANALYSIS TO VALIDATE:
{analysis_result}

VALIDATION CHECKLIST:

1. NUMERICAL CONSISTENCY:
   - Are all financial calculations mathematically correct?
   - Do percentages and absolute values align?
   - Are confidence scores realistic and justified?

2. LOGICAL COHERENCE:
   - Do the strengths and weaknesses align with the investment score?
   - Are the recommendations consistent with the risk assessment?
   - Does the market analysis support the financial projections?

3. DATA UTILIZATION:
   - Has all available property data been appropriately considered?
   - Are assumptions clearly stated and reasonable?
   - Are data limitations properly acknowledged?

4. MARKET APPROPRIATENESS:
   - Are market-specific factors properly incorporated?
   - Do the metrics align with typical market ranges?
   - Are regulatory considerations addressed?

5. CONFIDENCE CALIBRATION:
   - Are confidence scores appropriately conservative?
   - Do lower confidence areas have appropriate caveats?
   - Is overall confidence justified by data quality?

VALIDATION OUTPUT:
Provide a structured validation report with:
- Overall Quality Score (0-100)
- Specific issues identified (if any)
- Recommended corrections or improvements
- Confidence in the validation assessment

If significant issues are found, provide corrected values with explanations.
"""
    
    @staticmethod
    def build_fallback_prompt(error_context: Dict[str, Any]) -> str:
        """
        Build fallback prompt for error recovery scenarios
        Following atlas.mdc: Comprehensive fallback strategies
        """
        
        return f"""
You are Atlas AI's fallback analysis system. The primary analysis encountered an issue:

ERROR CONTEXT:
- Error Type: {error_context.get('error_type', 'Unknown')}
- Available Data: {error_context.get('available_data', 'Limited')}
- Data Quality: {error_context.get('data_quality', 'Unknown')}/100

Your task is to provide a simplified but accurate analysis based on available information.

FALLBACK ANALYSIS REQUIREMENTS:
1. Acknowledge data limitations clearly
2. Provide conservative estimates with wide confidence intervals
3. Focus on key metrics that can be reliably estimated
4. Include clear disclaimers about analysis limitations
5. Suggest specific data points needed for full analysis

SIMPLIFIED OUTPUT FORMAT:
**FALLBACK ANALYSIS NOTICE**: This is a simplified analysis due to [reason]

**BASIC ASSESSMENT**:
- Estimated Investment Score: [range] (Low confidence)
- Approximate Yield: [range]% (Low confidence)
- Key Considerations: [list]

**DATA LIMITATIONS**:
[Specific limitations and their impact]

**RECOMMENDATIONS**:
1. Obtain additional data: [specific requirements]
2. Consider professional consultation for: [areas]
3. Next steps: [actionable items]

**CONFIDENCE DISCLAIMER**:
This fallback analysis has limited confidence due to insufficient data.
Professional consultation recommended before investment decisions.
""" 