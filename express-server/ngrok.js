const ngrok = require('ngrok');

async function startNgrok() {
  try {
    const url = await ngrok.connect({
      addr: 5000,
      region: 'us',
      authtoken: '2vww2X5zBePwdpKY8ZOA6vGrgY3_4WVqBndu5ryCjom6hXdYR', // Your authtoken
      inspect: true, // Enable inspection
      cors_origin: ['http://localhost:3000'], // Allow your frontend origin
    });
    console.log('\n🚀 Ngrok tunnel created!');
    console.log('🌍 Public URL:', url);
    console.log('📡 Forwarding to:', 'http://localhost:5000');
    console.log('🔍 Inspect at:', url + '/inspect\n');
  } catch (error) {
    console.error('❌ Error creating ngrok tunnel:', error);
  }
}

startNgrok(); 