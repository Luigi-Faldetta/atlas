const ngrok = require('ngrok');

async function startNgrok() {
  try {
    const url = await ngrok.connect({
      addr: 5001,
      region: 'us',
      authtoken: '2vww2X5zBePwdpKY8ZOA6vGrgY3_4WVqBndu5ryCjom6hXdYR', // Your authtoken
      inspect: true, // Enable inspection
    });
    console.log('\n🚀 Ngrok tunnel created!');
    console.log('🌍 Public URL:', url);
    console.log('📡 Forwarding to:', 'http://localhost:5001');
    console.log('🔍 Inspect at:', url + '/inspect\n');
    
    // Log for easy access
    console.log('💡 For Vercel frontend, use this URL as NEXT_PUBLIC_API_URL:');
    console.log(url);
    
  } catch (error) {
    console.error('❌ Error creating ngrok tunnel:', error);
  }
}

startNgrok(); 