@echo off
title Project Atlas - Quick Start (Dev Mode)
color 0B

echo ========================================
echo    PROJECT ATLAS - QUICK START
echo ========================================
echo.
echo Starting all services (skipping dependency installation)...
echo.

REM Check for .env file
if not exist "ai_agent\.env" (
    echo ⚠️  WARNING: ai_agent\.env file not found!
    echo AI analysis features will not work without API keys.
    echo Run startup.bat first to create the .env template.
    echo.
) else (
    echo ✅ Found ai_agent\.env file
)

echo ========================================
echo    STARTING ALL SERVICES
echo ========================================

echo Starting services in separate windows...
echo.

REM Start Backend Server (Port 5000)
echo [1/4] 🚀 Starting Backend Server...
start "Atlas Backend" cmd /k "cd backend && npm run dev"
timeout /t 1 /nobreak >nul

REM Start Express Proxy Server (Port 5000)
echo [2/4] 🔗 Starting Express Proxy...
start "Atlas Proxy" cmd /k "cd express-server && npm start"
timeout /t 1 /nobreak >nul

REM Start AI Agent API (Port 8000)
echo [3/4] 🤖 Starting AI Agent...
start "Atlas AI" cmd /k "cd ai_agent && uvicorn atlasScript:app --reload --host 127.0.0.1 --port 8000"
timeout /t 1 /nobreak >nul

REM Start Frontend (Port 3000)
echo [4/4] 🌐 Starting Frontend...
start "Atlas Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ All services starting...
echo.
echo 📍 ENDPOINTS:
echo • Frontend:    http://localhost:3000
echo • Backend:     http://localhost:5000  
echo • AI Agent:    http://localhost:8000
echo • API Docs:    http://localhost:8000/docs
echo.
echo ⏱️  Please wait 30-60 seconds for all services to be ready.
echo.

timeout /t 5 /nobreak >nul
start http://localhost:3000

echo 🎉 Project Atlas is starting up!
echo Close this window or press Ctrl+C to stop monitoring.
pause >nul 