#!/bin/sh
# Start Express server in background
node express-server.js &

# Start ngrok tunnel
node ngrok.js &

# Wait for any process to exit
wait -n 