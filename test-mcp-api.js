const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testMcpApi() {
  try {
    // Test health endpoint
    console.log('Testing MCP server health...');
    const healthResponse = await axios.get(`${BASE_URL.replace('/api/v1', '')}/health`);
    console.log('Health check response:', healthResponse.data);
    
    // Test News API
    console.log('\nTesting News API...');
    const propertyId = encodeURIComponent('Amsterdam, Netherlands');
    const newsResponse = await axios.get(`${BASE_URL}/property-analysis/${propertyId}/local-news`);
    console.log('News API response status:', newsResponse.status);
    console.log('News API response data:', JSON.stringify(newsResponse.data, null, 2));
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing MCP API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error(`Status: ${error.response.status}`);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
  }
}

testMcpApi(); 