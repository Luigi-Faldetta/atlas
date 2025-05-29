# 🔐 Environment Variables Setup Guide

## Security First!
**Never commit real API keys, passwords, or secrets to git!** This guide shows you how to set up your environment variables securely.

## Local Development Setup

### 1. Copy the Example File
```bash
cp docker.env.example .env
```

### 2. Fill in Your Real Values
Edit `.env` with your actual API keys and secrets:

```env
# API Keys (Replace with your actual keys)
SCRAPINGBEE_API_KEY=your_actual_scrapingbee_key
OPENAI_API_KEY=sk-proj-your_actual_openai_key

# Proxy Configuration
PROXY_SERVER=http://brd.superproxy.io:33335
PROXY_USERNAME=your_actual_proxy_username
PROXY_PASSWORD=your_actual_proxy_password

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001

# Database Configuration
POSTGRES_PASSWORD=your_secure_password_here

# Environment
NODE_ENV=development
```

### 3. Frontend Environment Variables
Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_MCP_API_URL=http://localhost:3001/api/v1
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Production Deployment

### Railway Environment Variables
When deploying to Railway, set these in the Railway dashboard:

```env
# Production API Keys
OPENAI_API_KEY=your_production_openai_key
SCRAPINGBEE_API_KEY=your_production_scrapingbee_key

# Proxy Configuration
PROXY_SERVER=http://brd.superproxy.io:33335
PROXY_USERNAME=your_proxy_username
PROXY_PASSWORD=your_proxy_password

# Database (Railway will provide this)
DATABASE_URL=postgresql://user:pass@host:port/db

# Internal Service URLs (Railway will provide these)
AI_AGENT_URL=https://your-ai-agent.railway.app
EXPRESS_PROXY_URL=https://your-express-proxy.railway.app
```

### Vercel Environment Variables
Set these in your Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://your-express-proxy.railway.app
NEXT_PUBLIC_MCP_API_URL=https://your-mcp-server.railway.app/api/v1
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## 🚫 Files That Should NEVER Contain Real Secrets

- `docker.env.example` ✅ (placeholders only)
- `frontend/.env.local.example` ✅ (placeholders only)
- Any file ending in `.example` ✅ (placeholders only)

## ✅ Files That Can Contain Real Secrets (But Are Gitignored)

- `.env` ✅ (gitignored)
- `frontend/.env.local` ✅ (gitignored)
- `docker.env` ✅ (gitignored)

## Quick Security Check
Before committing, run:
```bash
# Check for potential secrets
git diff --cached | grep -i "sk-\|key\|secret\|password"

# If any real secrets appear, remove them!
```

## Getting Your API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and paste into your `.env` file

### ScrapingBee API Key
1. Go to https://app.scrapingbee.com/
2. Find your API key in the dashboard
3. Copy and paste into your `.env` file

### Bright Data Proxy
1. Go to your Bright Data dashboard
2. Find your proxy credentials
3. Update the proxy configuration

## Need Help?
If you see any git errors about secrets:
1. Remove the real secrets from the files
2. Use placeholder values in example files
3. Put real values only in gitignored files 