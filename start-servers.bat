@echo off
echo Starting Atlas backend and MCP servers...

:: Start the main backend server in a new window
start cmd /k "cd backend && npm start"

:: Wait a moment for the first server to initialize
timeout /t 3 /nobreak > nul

:: Start the MCP server in a new window
start cmd /k "cd mcp-server && npm start"

echo.
echo Both servers are starting in separate windows.
echo - Backend server should be running on http://localhost:5000
echo - MCP server should be running on http://localhost:3001
echo.
echo Press any key to close this window...
pause > nul 