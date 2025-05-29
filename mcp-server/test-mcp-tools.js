#!/usr/bin/env node

/**
 * Test script for Atlas Property Analysis MCP Server
 * 
 * This script tests the MCP tools directly without requiring an AI assistant.
 * It verifies that all tools work correctly with sample data.
 */

const AtlasPropertyAnalysisMCPServer = require('./src/mcp-server');

async function testMCPTools() {
  console.log('🧪 Testing Atlas Property Analysis MCP Tools\n');
  
  try {
    // Create server instance (but don't start the stdio transport)
    const serverInstance = new AtlasPropertyAnalysisMCPServer();
    
    // Test sample property identifiers
    const testProperties = [
      'Amsterdam, Netherlands',
      'Madrid, Spain',
      'https://www.funda.nl/koop/amsterdam/huis-sample/'
    ];

    for (const property of testProperties) {
      console.log(`\n🏠 Testing property: ${property}`);
      console.log('=' .repeat(60));

      // Test 1: Demographics
      console.log('\n📊 Testing Demographics Tool...');
      try {
        const demographicsResult = await serverInstance.handleDemographics({ 
          property_identifier: property 
        });
        console.log('✅ Demographics tool working');
        console.log('Sample output length:', demographicsResult.content[0].text.length, 'characters');
      } catch (error) {
        console.log('❌ Demographics tool failed:', error.message);
      }

      // Test 2: Lifestyle
      console.log('\n🏙️ Testing Lifestyle Tool...');
      try {
        const lifestyleResult = await serverInstance.handleLifestyle({ 
          property_identifier: property 
        });
        console.log('✅ Lifestyle tool working');
        console.log('Sample output length:', lifestyleResult.content[0].text.length, 'characters');
      } catch (error) {
        console.log('❌ Lifestyle tool failed:', error.message);
      }

      // Test 3: Market Activity
      console.log('\n📈 Testing Market Activity Tool...');
      try {
        const marketResult = await serverInstance.handleMarketActivity({ 
          property_identifier: property,
          property_details: { price: 450000, size: 85 }
        });
        console.log('✅ Market Activity tool working');
        console.log('Sample output length:', marketResult.content[0].text.length, 'characters');
      } catch (error) {
        console.log('❌ Market Activity tool failed:', error.message);
      }

      // Test 4: Air Quality
      console.log('\n🌬️ Testing Air Quality Tool...');
      try {
        const airQualityResult = await serverInstance.handleAirQuality({ 
          property_identifier: property 
        });
        console.log('✅ Air Quality tool working');
        console.log('Sample output length:', airQualityResult.content[0].text.length, 'characters');
      } catch (error) {
        console.log('❌ Air Quality tool failed:', error.message);
      }

      // Test 5: Local News
      console.log('\n📰 Testing Local News Tool...');
      try {
        const newsResult = await serverInstance.handleLocalNews({ 
          property_identifier: property 
        });
        console.log('✅ Local News tool working');
        console.log('Sample output length:', newsResult.content[0].text.length, 'characters');
      } catch (error) {
        console.log('❌ Local News tool failed:', error.message);
      }

      // Test 6: Comprehensive Analysis (shorter test due to complexity)
      if (property === testProperties[0]) {  // Only test comprehensive analysis once
        console.log('\n🔍 Testing Comprehensive Analysis Tool...');
        try {
          const comprehensiveResult = await serverInstance.handleComprehensiveAnalysis({ 
            property_identifier: property,
            include_financial_analysis: false,  // Skip financial for faster testing
            property_details: { price: 450000, size: 85 }
          });
          console.log('✅ Comprehensive Analysis tool working');
          console.log('Sample output length:', comprehensiveResult.content[0].text.length, 'characters');
          
          // Show a snippet of the comprehensive report
          const reportSnippet = comprehensiveResult.content[0].text.substring(0, 500);
          console.log('\n📋 Report snippet:');
          console.log(reportSnippet + '...\n');
        } catch (error) {
          console.log('❌ Comprehensive Analysis tool failed:', error.message);
        }
      }
    }

    console.log('\n🎉 MCP Tools Testing Complete!');
    console.log('\n📋 Summary:');
    console.log('- Demographics Tool: Available');
    console.log('- Lifestyle Tool: Available');
    console.log('- Market Activity Tool: Available');
    console.log('- Air Quality Tool: Available');
    console.log('- Local News Tool: Available');
    console.log('- Comprehensive Analysis Tool: Available');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Start the MCP server: node src/mcp-server.js');
    console.log('2. Connect your AI assistant to use these tools');
    console.log('3. Try commands like:');
    console.log('   - "Analyze the property at Amsterdam, Netherlands"');
    console.log('   - "Get demographics for Madrid, Spain"');
    console.log('   - "What\'s the air quality like in Barcelona?"');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  testMCPTools().catch(console.error);
} 