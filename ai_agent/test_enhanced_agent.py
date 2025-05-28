#!/usr/bin/env python3
"""
Quick Test for Enhanced Atlas Agent
Verifies that the enhanced agent system is working correctly
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from enhanced_atlas_integration import get_enhanced_integration
    print("✅ Successfully imported enhanced integration")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

load_dotenv()

async def test_enhanced_agent():
    """Test the enhanced agent with sample data"""
    
    print("\n🧪 Testing Enhanced Atlas Agent...")
    
    # Sample property data for testing
    test_property_data = {
        'address': 'Test Property, Amsterdam, Netherlands',
        'price': 450000,
        'living_area': 85,
        'bedrooms': 2,
        'bathrooms': 1,
        'year_built': 1995,
        'energy_label': 'C',
        'scraper_source': 'test'
    }
    
    try:
        # Get integration instance
        integration = get_enhanced_integration()
        print("✅ Enhanced integration instance created")
        
        # Test enhanced agent directly
        enhanced_agent = integration.enhanced_agent
        
        print("\n📊 Testing enhanced analysis...")
        result = await enhanced_agent.analyze_property_enhanced(
            property_data=test_property_data,
            url="https://test.example.com/property",
            user_preferences={'expertise_level': 'professional'}
        )
        
        print("✅ Enhanced analysis completed!")
        
        # Display key results
        print(f"\n📈 Results Summary:")
        print(f"   Investment Score: {result.get('investment_score', 'N/A')}")
        print(f"   Analysis Type: {result.get('analysis_type', 'enhanced')}")
        print(f"   Market Type: {result.get('analysis_context', {}).get('market_type', 'N/A')}")
        print(f"   Data Quality: {result.get('analysis_context', {}).get('data_quality_score', 'N/A')}/100")
        
        # Check for agentic patterns
        agentic_features = []
        if result.get('reasoning_process'):
            agentic_features.append("Chain-of-Thought Reasoning")
        if result.get('self_reflection'):
            agentic_features.append("Self-Reflection")
        if result.get('financial_metrics', {}).get('roi_5_year_confidence'):
            agentic_features.append("Confidence Scoring")
        if result.get('validation'):
            agentic_features.append("Quality Validation")
        
        print(f"\n🤖 Agentic Features Detected:")
        for feature in agentic_features:
            print(f"   ✅ {feature}")
        
        # Performance metrics
        metrics = enhanced_agent.get_performance_metrics()
        print(f"\n📊 Performance Metrics:")
        print(f"   Total Analyses: {metrics.get('total_analyses', 0)}")
        print(f"   Success Rate: {metrics.get('success_rate', 0):.1f}%")
        print(f"   Fallback Rate: {metrics.get('fallback_rate', 0):.1f}%")
        
        print("\n🎉 Enhanced Agent Test PASSED!")
        return True
        
    except Exception as e:
        print(f"\n❌ Enhanced Agent Test FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def test_integration_layer():
    """Test the integration layer functionality"""
    
    print("\n🔗 Testing Integration Layer...")
    
    try:
        integration = get_enhanced_integration()
        
        # Test performance metrics
        metrics = integration.get_performance_metrics()
        print("✅ Performance metrics retrieved")
        print(f"   Scrapers Available: {metrics.get('integration', {}).get('scrapers_available', [])}")
        print(f"   Enhanced Features: {metrics.get('integration', {}).get('enhanced_features_active', False)}")
        print(f"   Backward Compatible: {metrics.get('integration', {}).get('backward_compatibility', False)}")
        
        print("\n🎉 Integration Layer Test PASSED!")
        return True
        
    except Exception as e:
        print(f"\n❌ Integration Layer Test FAILED: {str(e)}")
        return False

def test_imports():
    """Test that all components can be imported"""
    
    print("\n📦 Testing Component Imports...")
    
    try:
        from agents.enhanced_atlas_agent import EnhancedAtlasAgent
        print("✅ EnhancedAtlasAgent imported")
        
        from agents.context_manager import ContextManager, AgentContext
        print("✅ ContextManager imported")
        
        from agents.quality_assessor import QualityAssessor
        print("✅ QualityAssessor imported")
        
        from prompts.enhanced_agent_prompts import EnhancedAgentPrompts
        print("✅ EnhancedAgentPrompts imported")
        
        print("\n🎉 All Component Imports PASSED!")
        return True
        
    except ImportError as e:
        print(f"\n❌ Component Import FAILED: {str(e)}")
        return False

async def main():
    """Run all tests"""
    
    print("🚀 Enhanced Atlas Agent Test Suite")
    print("=" * 50)
    
    # Check API key
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  Warning: OPENAI_API_KEY not set. Some tests may fail.")
    
    # Run tests
    tests = [
        ("Component Imports", test_imports()),
        ("Integration Layer", await test_integration_layer()),
        ("Enhanced Agent", await test_enhanced_agent())
    ]
    
    # Results summary
    print("\n" + "=" * 50)
    print("📋 Test Results Summary:")
    
    passed = 0
    total = len(tests)
    
    for test_name, result in tests:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed ({(passed/total)*100:.1f}%)")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Enhanced Atlas Agent is ready for use.")
        return True
    else:
        print("\n⚠️  Some tests failed. Please check the implementation.")
        return False

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1) 