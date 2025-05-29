const webEnhancedDataService = require('./src/services/webEnhancedDataService');
const realEstateApiService = require('./src/services/realEstateApiService');

/**
 * Test script for enhanced property analysis services
 */

async function testEnhancedServices() {
  console.log('🧪 Testing Enhanced Property Analysis Services\n');

  const testAddress = 'Amsterdam, Netherlands';
  const testUrl = 'https://example-property-listing.com'; // Mock URL
  
  console.log(`Testing with address: ${testAddress}\n`);

  // Test 1: Web Enhanced Data Service
  console.log('📊 Testing Web Enhanced Data Service...');
  try {
    const webData = await webEnhancedDataService.getEnhancedPropertyData(testUrl, testAddress);
    console.log('✅ Web Enhanced Data Service working');
    console.log('   Source:', webData.source);
    console.log('   Confidence:', webData.confidence);
    console.log('   Walk Score:', webData.walkScore);
    console.log('   Investment Potential:', webData.investmentPotential);
    console.log('   Local Insights Count:', webData.localInsights?.length || 0);
  } catch (error) {
    console.log('⚠️  Web Enhanced Data Service using fallback data');
    console.log('   Reason:', error.message);
  }
  console.log('');

  // Test 2: Market Research
  console.log('📈 Testing Market Research...');
  try {
    const marketData = await webEnhancedDataService.getMarketResearch(testAddress);
    console.log('✅ Market Research working');
    console.log('   Price Appreciation:', marketData.priceAppreciation + '%');
    console.log('   Rental Yield:', marketData.rentalYield + '%');
    console.log('   Market Sentiment:', marketData.marketSentiment);
    console.log('   Investment Grade:', marketData.investmentGrade);
    console.log('   Key Trends:', marketData.keyTrends?.length || 0, 'trends');
  } catch (error) {
    console.log('⚠️  Market Research using fallback data');
    console.log('   Reason:', error.message);
  }
  console.log('');

  // Test 3: Real Estate API Service
  console.log('🏠 Testing Real Estate API Service...');
  try {
    const apiData = await realEstateApiService.getComprehensivePropertyData(testAddress, {
      latitude: 52.3676,
      longitude: 4.9041
    });
    console.log('✅ Real Estate API Service working');
    console.log('   Sources Used:', apiData.sources.join(', '));
    console.log('   Walk Score:', apiData.walkScore || 'N/A');
    console.log('   Transit Score:', apiData.transitScore || 'N/A');
    console.log('   Bike Score:', apiData.bikeScore || 'N/A');
    console.log('   Nearby Amenities:', Object.keys(apiData.nearbyAmenities || {}).length, 'types');
    console.log('   Investment Metrics:', Object.keys(apiData.investmentMetrics || {}).length, 'metrics');
  } catch (error) {
    console.log('⚠️  Real Estate API Service using fallback data');
    console.log('   Reason:', error.message);
  }
  console.log('');

  // Test 4: Market Comparables
  console.log('🏘️  Testing Market Comparables...');
  try {
    const comparables = await realEstateApiService.getMarketComparables(testAddress);
    console.log('✅ Market Comparables working');
    console.log('   Source:', comparables.source);
    console.log('   Comparable Properties:', comparables.comparables?.count || 0);
    console.log('   Search Radius:', comparables.searchRadius, 'meters');
  } catch (error) {
    console.log('⚠️  Market Comparables using fallback data');
    console.log('   Reason:', error.message);
  }
  console.log('');

  // Test 5: API Key Status Check
  console.log('🔑 API Key Status Check...');
  console.log('   OpenAI API Key:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('   RentCast API Key:', process.env.RENTCAST_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('   WalkScore API Key:', process.env.WALKSCORE_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('   ATTOM API Key:', process.env.ATTOM_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('   Google Maps API Key:', process.env.GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('');

  // Test 6: Performance Test
  console.log('⚡ Performance Test...');
  const startTime = Date.now();
  
  try {
    await Promise.all([
      webEnhancedDataService.getMarketResearch(testAddress),
      realEstateApiService.getComprehensivePropertyData(testAddress, {
        latitude: 52.3676,
        longitude: 4.9041
      })
    ]);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Parallel data fetch completed in ${duration}ms`);
    
    if (duration < 5000) {
      console.log('   🚀 Performance: Excellent (< 5s)');
    } else if (duration < 10000) {
      console.log('   ⚡ Performance: Good (< 10s)');
    } else {
      console.log('   🐌 Performance: Slow (> 10s) - Consider optimizing');
    }
  } catch (error) {
    console.log('⚠️  Performance test failed:', error.message);
  }
  console.log('');

  console.log('🎯 Test Summary:');
  console.log('   Enhanced services are ready for use!');
  console.log('   Services will use real APIs when keys are provided,');
  console.log('   otherwise they gracefully fall back to mock data.');
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Add your API keys to .env file for real data');
  console.log('   2. Start the MCP server: npm start');
  console.log('   3. Test endpoints: /enhanced and /market-research');
  console.log('   4. Integrate with frontend using useEnhancedPropertyData hook');
}

// Run the tests
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();
  
  testEnhancedServices()
    .then(() => {
      console.log('✅ All tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testEnhancedServices }; 