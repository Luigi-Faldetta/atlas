@echo off
echo Installing MCP Server dependencies...
cd /d %~dp0
call npm install
echo.
echo Dependencies installed successfully!
echo.
echo To start the server, run: npm start
echo To start the server in development mode, run: npm run dev
echo.
pause 