@echo off
title Project Atlas - Stop All Services
color 0C

echo ========================================
echo    PROJECT ATLAS - STOP ALL SERVICES
echo ========================================
echo.
echo Stopping all Atlas services...
echo.

echo 🛑 Stopping services on common ports...

REM Kill processes on port 3000 (Frontend)
echo [1/4] Stopping Frontend (Port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Killing process %%a on port 3000
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill processes on port 5000 (Backend/Express)
echo [2/4] Stopping Backend/Express (Port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo Killing process %%a on port 5000
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill processes on port 8000 (AI Agent)
echo [3/4] Stopping AI Agent (Port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo Killing process %%a on port 8000
    taskkill /f /pid %%a >nul 2>&1
)

REM Kill Node.js processes
echo [4/4] Stopping remaining Node.js processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1

REM Close Atlas-related command windows
echo 🗂️  Closing Atlas terminal windows...
taskkill /f /fi "WindowTitle eq Atlas*" >nul 2>&1

echo.
echo ✅ All Atlas services have been stopped.
echo.
echo 📊 Port Status Check:
netstat -an | find ":3000" | find "LISTENING" >nul
if %ERRORLEVEL% equ 0 (
    echo ❌ Port 3000 still in use
) else (
    echo ✅ Port 3000 is free
)

netstat -an | find ":5000" | find "LISTENING" >nul
if %ERRORLEVEL% equ 0 (
    echo ❌ Port 5000 still in use
) else (
    echo ✅ Port 5000 is free
)

netstat -an | find ":8000" | find "LISTENING" >nul
if %ERRORLEVEL% equ 0 (
    echo ❌ Port 8000 still in use
) else (
    echo ✅ Port 8000 is free
)

echo.
echo 🎯 All Atlas services stopped successfully!
echo You can now restart using startup.bat or quick-start.bat
echo.
pause 