# 🚀 Project Atlas - Startup Guide

## Overview

Project Atlas is a comprehensive real estate analysis platform with multiple services that need to be coordinated. This guide explains how to start and manage all services efficiently.

## 📁 Service Architecture

```
Project Atlas
├── 🌐 Frontend (Next.js)          → Port 3000
├── 🔧 Backend API (Express)       → Port 5000  
├── 🔗 Express Proxy Server        → Port 5000 (proxy)
├── 🤖 AI Agent API (FastAPI)      → Port 8000
├── 🗄️ Database (PostgreSQL)       → Port 5432
└── 🚀 MCP Servers (Optional)      → Various ports
```

## 🎯 Startup Scripts

### 1. `startup.bat` - Complete Setup & Start
**Use this for first-time setup or when dependencies might be outdated**

```bash
startup.bat
```

**What it does:**
- ✅ Checks for required directories
- ✅ Validates environment variables (OpenAI API key)
- ✅ Installs/updates all dependencies
- ✅ Sets up database (Prisma migrations)
- ✅ Starts all services in separate windows
- ✅ Opens the application in your browser

**Duration:** 2-5 minutes (depending on internet speed)

### 2. `quick-start.bat` - Fast Development Start
**Use this for daily development when dependencies are already installed**

```bash
quick-start.bat
```

**What it does:**
- ⚡ Skips dependency installation
- ⚡ Starts all services immediately
- ⚡ Opens the application in your browser

**Duration:** 10-30 seconds

### 3. `stop-all.bat` - Stop All Services
**Use this to cleanly shut down all Atlas services**

```bash
stop-all.bat
```

**What it does:**
- 🛑 Kills processes on ports 3000, 5000, 8000
- 🛑 Terminates Node.js and Python processes
- 🛑 Closes Atlas terminal windows
- 📊 Verifies all ports are freed

## 🌐 Service Endpoints

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main user interface |
| **Backend API** | http://localhost:5000 | REST API for data |
| **Express Proxy** | http://localhost:5000/analyze | Real estate analysis proxy |
| **AI Agent API** | http://localhost:8000 | AI analysis endpoints |
| **API Documentation** | http://localhost:8000/docs | FastAPI auto-generated docs |

## 🔧 Supported Platforms

### Dutch Market
- **Funda.nl** - Primary Dutch real estate platform

### Spanish Market  
- **Idealista.com** - Major Spanish real estate platform
- **Fotocasa.es** - Popular Spanish property portal
- **Habitaclia.com** - Regional Spanish real estate site

## ⚙️ Environment Setup

### Required Environment Variables

**🔒 SECURITY NOTICE:** Never commit API keys to version control! See `SECURITY_GUIDE.md` for details.

All API keys should be stored in `ai_agent/.env`:

```bash
# Essential for AI analysis
OPENAI_API_KEY=your_openai_api_key_here

# Optional for enhanced web scraping
SCRAPPERBEE_API_KEY=your_scrapperbee_api_key_here

# Optional proxy settings
PROXY_SERVER=your_proxy_server
PROXY_USERNAME=your_proxy_username  
PROXY_PASSWORD=your_proxy_password
```

### Setting Environment Variables

**Option 1: Windows Environment Variables**
1. Right-click "This PC" → Properties
2. Advanced System Settings → Environment Variables
3. Add `OPENAI_API_KEY` with your key

**Option 2: .env Files (Recommended)**
The startup script will create a template `.env` file in `ai_agent/` directory:

```bash
# ai_agent/.env (created automatically by startup.bat)
OPENAI_API_KEY=your_openai_api_key_here
SCRAPPERBEE_API_KEY=your_scrapperbee_api_key_here
PROXY_SERVER=
PROXY_USERNAME=
PROXY_PASSWORD=
```

**🔒 Important:** Edit this file with your real API keys. It's already in `.gitignore` so it won't be committed.

## 🚨 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
Error: listen EADDRINUSE :::3000
```
**Solution:** Run `stop-all.bat` first, then restart

#### 2. OpenAI API Key Missing
```bash
Error: OpenAI API key not found
```
**Solution:** Set the `OPENAI_API_KEY` environment variable

#### 3. Dependencies Out of Date
```bash
Module not found errors
```
**Solution:** Use `startup.bat` instead of `quick-start.bat`

#### 4. Database Connection Issues
```bash
Prisma connection error
```
**Solution:** Check if PostgreSQL is running, run database setup

#### 5. Python/Playwright Issues
```bash
Playwright browser not found
```
**Solution:** Run `python -m playwright install`

### Manual Service Start

If automated scripts fail, start services manually:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Express Proxy  
cd express-server
npm start

# Terminal 3 - AI Agent
cd ai_agent
uvicorn atlasScript:app --reload --host 127.0.0.1 --port 8000

# Terminal 4 - Frontend
cd frontend
npm run dev
```

## 🔍 Service Health Check

### Quick Status Check
```bash
# Check if services are running
netstat -an | find ":3000"  # Frontend
netstat -an | find ":5000"  # Backend/Proxy
netstat -an | find ":8000"  # AI Agent
```

### Service URLs for Testing
- Frontend: http://localhost:3000
- Backend Health: http://localhost:5000/api/health
- AI Agent Health: http://localhost:8000/health
- API Docs: http://localhost:8000/docs

## 🚀 MCP Servers (Optional)

If you have MCP servers configured in `.cursor/settings.json`:

### Available MCP Servers
- **TalkToFigma** - Figma integration
- **Context7** - Documentation context

### MCP Configuration
Check `.cursor/settings.json` for MCP server settings.

## 📊 Performance Tips

### For Development
1. Use `quick-start.bat` for daily development
2. Keep services running between coding sessions
3. Only use `startup.bat` when updating dependencies

### For Production
1. Use environment-specific configurations
2. Set up proper database connections
3. Configure reverse proxy (nginx/Apache)
4. Set up SSL certificates

## 🔄 Update Workflow

### When pulling new code:
```bash
# 1. Stop all services
stop-all.bat

# 2. Pull latest changes
git pull

# 3. Full restart with dependency update
startup.bat
```

### When switching branches:
```bash
# 1. Stop services
stop-all.bat

# 2. Switch branch
git checkout feature-branch

# 3. Quick restart
quick-start.bat
```

## 📞 Support

### Getting Help
1. Check this guide first
2. Look at individual service logs in terminal windows
3. Check the main README.md for additional setup info
4. Verify all environment variables are set correctly

### Log Locations
- Frontend logs: Terminal window + browser console
- Backend logs: Terminal window + `backend/logs/`
- AI Agent logs: Terminal window
- Express Proxy logs: Terminal window

---

## 🎉 Quick Start Summary

**First time setup:**
```bash
startup.bat
```

**Daily development:**
```bash
quick-start.bat
```

**Stop everything:**
```bash
stop-all.bat
```

**That's it! Happy coding! 🚀** 