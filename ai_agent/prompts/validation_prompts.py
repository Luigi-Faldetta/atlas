"""
Validation Prompts Module
Following atlas.mdc: Self-reflection and validation patterns
"""

from typing import Dict, Any, List


class ValidationPrompts:
    """
    Validation and self-reflection prompt templates
    Following atlas.mdc: Quality assurance and error detection
    """
    
    @staticmethod
    def build_self_reflection_prompt(analysis_result: str, context: Dict[str, Any]) -> str:
        """
        Build self-reflection prompt for analysis validation
        Following atlas.mdc: Self-critique and improvement patterns
        """
        
        return f"""
You are a quality assurance specialist reviewing a real estate investment analysis.
Your task is to perform comprehensive self-reflection and validation.

ANALYSIS TO REVIEW:
{analysis_result}

CONTEXT INFORMATION:
- Market Type: {context.get('market_type', 'Unknown')}
- Data Quality Score: {context.get('data_quality_score', 'Unknown')}/100
- Analysis Complexity: {context.get('complexity_level', 'Unknown')}

SELF-REFLECTION CHECKLIST:

1. NUMERICAL ACCURACY:
   - Are all calculations mathematically correct?
   - Do percentages align with absolute values?
   - Are confidence scores realistic and justified?
   - Do financial metrics fall within expected ranges?

2. LOGICAL CONSISTENCY:
   - Do strengths and weaknesses align with the investment score?
   - Are recommendations consistent with the analysis?
   - Does the reasoning flow logically from data to conclusions?
   - Are there any contradictions in the analysis?

3. DATA UTILIZATION:
   - Has all available property data been considered?
   - Are assumptions clearly stated and reasonable?
   - Are data limitations properly acknowledged?
   - Is the analysis depth appropriate for data quality?

4. MARKET APPROPRIATENESS:
   - Are market-specific factors properly incorporated?
   - Do metrics align with typical market ranges?
   - Are regulatory considerations addressed?
   - Is local market context reflected in the analysis?

5. CONFIDENCE CALIBRATION:
   - Are confidence scores appropriately conservative?
   - Do lower confidence areas have appropriate caveats?
   - Is overall confidence justified by data quality?
   - Are uncertainty ranges realistic?

SELF-REFLECTION OUTPUT:
Provide a structured self-reflection report addressing each checklist item.
Identify any issues, inconsistencies, or areas for improvement.
Rate the overall analysis quality on a scale of 0-100.

If significant issues are found, provide specific corrections or recommendations.
"""
    
    @staticmethod
    def build_error_detection_prompt(analysis_result: str, property_data: Dict[str, Any]) -> str:
        """
        Build error detection prompt for identifying analysis issues
        Following atlas.mdc: Comprehensive error identification
        """
        
        return f"""
You are an error detection system for real estate investment analysis.
Your task is to identify potential errors, inconsistencies, or issues.

ORIGINAL PROPERTY DATA:
{ValidationPrompts._format_property_data(property_data)}

ANALYSIS RESULT TO VALIDATE:
{analysis_result}

ERROR DETECTION CATEGORIES:

1. CALCULATION ERRORS:
   - Mathematical inconsistencies
   - Percentage calculation errors
   - Unit conversion mistakes
   - Formula application errors

2. LOGICAL ERRORS:
   - Contradictory statements
   - Inconsistent reasoning
   - Misaligned conclusions
   - Inappropriate comparisons

3. DATA INTERPRETATION ERRORS:
   - Misreading property characteristics
   - Incorrect market assumptions
   - Wrong location assessments
   - Inappropriate benchmarking

4. RANGE VALIDATION ERRORS:
   - Metrics outside realistic ranges
   - Extreme confidence scores
   - Unrealistic projections
   - Impossible combinations

5. MARKET-SPECIFIC ERRORS:
   - Wrong market regulations
   - Incorrect tax calculations
   - Inappropriate yield expectations
   - Missing market factors

ERROR DETECTION OUTPUT:
For each category, identify specific errors or issues found.
Provide severity ratings: CRITICAL, HIGH, MEDIUM, LOW.
Suggest specific corrections for each identified error.
Rate the overall error severity and analysis reliability.
"""
    
    @staticmethod
    def build_confidence_validation_prompt(analysis_result: str, data_quality: int) -> str:
        """
        Build confidence validation prompt for calibrating confidence scores
        Following atlas.mdc: Confidence calibration patterns
        """
        
        return f"""
You are a confidence calibration specialist for real estate analysis.
Your task is to validate and calibrate confidence scores.

ANALYSIS WITH CONFIDENCE SCORES:
{analysis_result}

DATA QUALITY CONTEXT: {data_quality}/100

CONFIDENCE VALIDATION CRITERIA:

1. DATA QUALITY ALIGNMENT:
   - High confidence (80-100%) requires high data quality (70+)
   - Medium confidence (50-79%) appropriate for medium data quality (40-69)
   - Low confidence (0-49%) for low data quality (0-39)

2. METRIC-SPECIFIC VALIDATION:
   - Investment scores: Should reflect analysis certainty
   - ROI projections: Inherently uncertain, confidence should be moderate
   - Rental yields: More predictable, can have higher confidence
   - Market trends: Highly uncertain, should have lower confidence

3. CONSISTENCY CHECKS:
   - Similar metrics should have similar confidence levels
   - More complex calculations should have lower confidence
   - Market-specific factors should adjust confidence appropriately

4. CONSERVATIVE CALIBRATION:
   - Err on the side of lower confidence when uncertain
   - Account for market volatility and unpredictability
   - Consider external factors beyond the analysis scope

CONFIDENCE VALIDATION OUTPUT:
Review each confidence score in the analysis.
Identify scores that appear too high or too low.
Provide calibrated confidence scores with justifications.
Explain the reasoning for any adjustments made.
"""
    
    @staticmethod
    def build_completeness_check_prompt(analysis_result: str, required_components: List[str]) -> str:
        """
        Build completeness check prompt for ensuring all required components
        Following atlas.mdc: Comprehensive analysis validation
        """
        
        required_list = "\n".join([f"- {component}" for component in required_components])
        
        return f"""
You are a completeness validation system for real estate analysis.
Your task is to ensure all required components are present and adequate.

ANALYSIS TO CHECK:
{analysis_result}

REQUIRED COMPONENTS:
{required_list}

COMPLETENESS VALIDATION:

1. COMPONENT PRESENCE:
   - Check if each required component is present
   - Verify components are not just mentioned but properly analyzed
   - Ensure adequate detail and depth for each component

2. QUALITY ASSESSMENT:
   - Rate the quality of each component (0-100)
   - Identify components that need more detail
   - Check for superficial or inadequate treatment

3. INTEGRATION CHECK:
   - Verify components work together coherently
   - Check for proper cross-referencing between components
   - Ensure consistent narrative throughout

4. DEPTH VALIDATION:
   - Assess if analysis depth matches complexity requirements
   - Check for appropriate level of detail
   - Verify reasoning is sufficiently explained

COMPLETENESS OUTPUT:
For each required component:
- Present: Yes/No
- Quality Score: 0-100
- Issues Identified: List any problems
- Improvement Suggestions: Specific recommendations

Overall Completeness Score: 0-100
Critical Missing Elements: List any essential missing components
"""
    
    @staticmethod
    def _format_property_data(property_data: Dict[str, Any]) -> str:
        """Format property data for prompt inclusion"""
        formatted_data = []
        for key, value in property_data.items():
            if value is not None and value != "":
                formatted_data.append(f"- {key.replace('_', ' ').title()}: {value}")
        return "\n".join(formatted_data)
    
    @staticmethod
    def build_final_validation_prompt(analysis_result: str, validation_results: Dict[str, Any]) -> str:
        """
        Build final validation prompt that synthesizes all validation results
        Following atlas.mdc: Comprehensive quality synthesis
        """
        
        return f"""
You are the final validation system for real estate investment analysis.
Your task is to synthesize all validation results and provide a final quality assessment.

ORIGINAL ANALYSIS:
{analysis_result}

VALIDATION RESULTS:
- Self-Reflection Score: {validation_results.get('self_reflection_score', 'N/A')}
- Error Detection Results: {validation_results.get('error_count', 'N/A')} issues found
- Confidence Calibration: {validation_results.get('confidence_adjustment', 'N/A')}
- Completeness Score: {validation_results.get('completeness_score', 'N/A')}/100

FINAL VALIDATION SYNTHESIS:

1. OVERALL QUALITY ASSESSMENT:
   - Synthesize all validation scores into final quality rating
   - Weight different validation aspects appropriately
   - Consider cumulative impact of identified issues

2. CRITICAL ISSUES SUMMARY:
   - Identify any critical issues that must be addressed
   - Prioritize issues by impact on analysis reliability
   - Determine if analysis is suitable for use or needs revision

3. IMPROVEMENT RECOMMENDATIONS:
   - Provide specific, actionable improvement suggestions
   - Prioritize recommendations by impact and feasibility
   - Consider user expertise level in recommendations

4. CONFIDENCE ADJUSTMENT:
   - Provide final confidence levels for key metrics
   - Adjust based on validation findings
   - Include uncertainty ranges where appropriate

FINAL VALIDATION OUTPUT:
- Final Quality Score: 0-100
- Analysis Status: APPROVED / NEEDS_REVISION / REJECTED
- Critical Issues: List any blocking issues
- Key Recommendations: Top 3 improvement suggestions
- Adjusted Confidence Levels: For major metrics
- User Guidance: How to interpret and use this analysis
""" 