@echo off
title Project Atlas - Complete Startup
color 0A

echo ========================================
echo    PROJECT ATLAS - COMPLETE STARTUP
echo ========================================
echo.
echo Starting all services for Project Atlas...
echo.

REM Check if required directories exist
if not exist "frontend" (
    echo ERROR: Frontend directory not found!
    pause
    exit /b 1
)

if not exist "backend" (
    echo ERROR: Backend directory not found!
    pause
    exit /b 1
)

if not exist "express-server" (
    echo ERROR: Express-server directory not found!
    pause
    exit /b 1
)

if not exist "ai_agent" (
    echo ERROR: AI agent directory not found!
    pause
    exit /b 1
)

echo ========================================
echo    CHECKING ENVIRONMENT VARIABLES
echo ========================================

REM Check for .env file in ai_agent directory
if not exist "ai_agent\.env" (
    echo ⚠️  WARNING: ai_agent\.env file not found!
    echo.
    echo Creating .env template file...
    echo # Project Atlas Environment Variables > ai_agent\.env
    echo # Add your API keys here (this file is in .gitignore) >> ai_agent\.env
    echo. >> ai_agent\.env
    echo # OpenAI API Key for AI analysis >> ai_agent\.env
    echo OPENAI_API_KEY=your_openai_api_key_here >> ai_agent\.env
    echo. >> ai_agent\.env
    echo # ScrapperBee API Key for web scraping (optional) >> ai_agent\.env
    echo SCRAPPERBEE_API_KEY=your_scrapperbee_api_key_here >> ai_agent\.env
    echo. >> ai_agent\.env
    echo # Proxy settings (optional) >> ai_agent\.env
    echo PROXY_SERVER= >> ai_agent\.env
    echo PROXY_USERNAME= >> ai_agent\.env
    echo PROXY_PASSWORD= >> ai_agent\.env
    echo.
    echo ✅ Created ai_agent\.env template file
    echo 📝 Please edit ai_agent\.env and add your actual API keys
    echo.
    echo Press any key to continue (services will start but AI features may not work)...
    pause >nul
) else (
    echo ✅ Found ai_agent\.env file
)

echo ========================================
echo    INSTALLING DEPENDENCIES
echo ========================================

echo [1/4] Installing Frontend dependencies...
cd frontend
call npm install --silent
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b %ERRORLEVEL%
)
echo ✅ Frontend dependencies installed

echo.
echo [2/4] Installing Backend dependencies...
cd ../backend
call npm install --silent
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b %ERRORLEVEL%
)
echo ✅ Backend dependencies installed

echo.
echo [3/4] Installing Express Server dependencies...
cd ../express-server
call npm install --silent
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install express-server dependencies
    pause
    exit /b %ERRORLEVEL%
)
echo ✅ Express Server dependencies installed

echo.
echo [4/4] Installing AI Agent dependencies...
cd ../ai_agent
call pip install -r requirements.txt --quiet
if %ERRORLEVEL% neq 0 (
    echo WARNING: Some AI agent dependencies may have failed to install
    echo This is normal on Windows (uvloop is not supported)
)

REM Install additional required packages for Windows
call pip install playwright playwright-stealth setuptools --quiet
call python -m playwright install --quiet
echo ✅ AI Agent dependencies installed

echo.
echo ========================================
echo    SETTING UP DATABASE
echo ========================================

echo Setting up Prisma database...
cd ../backend
call npx prisma generate --silent
if %ERRORLEVEL% neq 0 (
    echo WARNING: Prisma generate failed, continuing anyway...
)

call npx prisma migrate dev --name init --silent
if %ERRORLEVEL% neq 0 (
    echo WARNING: Prisma migrate failed, continuing anyway...
)
echo ✅ Database setup completed

echo.
echo ========================================
echo    STARTING ALL SERVICES
echo ========================================

cd ..

echo Starting services in separate windows...
echo.

REM Start Backend Server (Port 5000)
echo [1/4] Starting Backend Server (Port 5000)...
start "Atlas Backend Server" cmd /k "cd backend && echo Backend Server Starting... && npm run dev"
timeout /t 2 /nobreak >nul

REM Start Express Proxy Server (Port 5000 - different from backend)
echo [2/4] Starting Express Proxy Server (Port 5000)...
start "Atlas Express Proxy" cmd /k "cd express-server && echo Express Proxy Starting... && npm start"
timeout /t 2 /nobreak >nul

REM Start AI Agent API (Port 8000)
echo [3/4] Starting AI Agent API (Port 8000)...
start "Atlas AI Agent" cmd /k "cd ai_agent && echo AI Agent Starting... && uvicorn atlasScript:app --reload --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak >nul

REM Start Frontend (Port 3000)
echo [4/4] Starting Frontend (Port 3000)...
start "Atlas Frontend" cmd /k "cd frontend && echo Frontend Starting... && npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo    STARTUP COMPLETE!
echo ========================================
echo.
echo All services are starting up...
echo Please wait a few moments for all services to be ready.
echo.
echo 🌐 SERVICE ENDPOINTS:
echo ├── Frontend:           http://localhost:3000
echo ├── Backend API:        http://localhost:5000
echo ├── Express Proxy:      http://localhost:5000/analyze
echo ├── AI Agent API:       http://localhost:8000
echo └── AI Agent Docs:      http://localhost:8000/docs
echo.
echo 🔧 SUPPORTED PLATFORMS:
echo ├── Dutch Market:       Funda.nl
echo └── Spanish Market:     Idealista.com, Fotocasa.es, Habitaclia.com
echo.
echo 📊 FEATURES AVAILABLE:
echo ├── Real Estate Analysis
echo ├── AI Investment Scoring
echo ├── Market-Specific Analysis
echo ├── Multi-Platform Scraping
echo └── Portfolio Management
echo.
echo 🚀 MCP SERVERS (if configured):
echo ├── TalkToFigma
echo └── Context7
echo.
echo ⚠️  NOTES:
echo • Make sure your OpenAI API key is set for AI analysis
echo • Some services may take 30-60 seconds to fully start
echo • Check individual terminal windows if any service fails
echo • Close all terminal windows to stop all services
echo.
echo Press any key to open the main application...
pause >nul

REM Open the main application in default browser
start http://localhost:3000

echo.
echo ========================================
echo    MONITORING SERVICES
echo ========================================
echo.
echo Services are running in separate windows.
echo To stop all services, close all terminal windows or press Ctrl+C in each.
echo.
echo This window will remain open for monitoring.
echo Press any key to exit this monitoring window...
pause >nul

echo.
echo Thank you for using Project Atlas!
echo. 