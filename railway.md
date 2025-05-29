# 🚀 Deploy Atlas to Railway

Railway is a modern deployment platform that's perfect for Docker applications like Atlas.

## Prerequisites
- Railway account (free tier available)
- GitHub repository with your Atlas code

## Step 1: Prepare for Deployment

### Update Environment Variables for Production
Create `railway.env` with production URLs:

```env
# Production Environment Variables for Railway
POSTGRES_PASSWORD=your_secure_production_password
OPENAI_API_KEY=your_openai_key
SCRAPINGBEE_API_KEY=your_scrapingbee_key

# Proxy Configuration  
PROXY_SERVER=http://brd.superproxy.io:33335
PROXY_USERNAME=your_proxy_username
PROXY_PASSWORD=your_proxy_password

# These will be Railway's internal URLs (Railway will provide these)
AI_AGENT_URL=https://atlas-ai-agent.railway.app
EXPRESS_PROXY_URL=https://atlas-express-proxy.railway.app
BACKEND_URL=https://atlas-backend.railway.app
MCP_SERVER_URL=https://atlas-mcp-server.railway.app
```

### Update Frontend Environment for Production
In `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://atlas-express-proxy.railway.app
NEXT_PUBLIC_MCP_API_URL=https://atlas-mcp-server.railway.app/api/v1
```

## Step 2: Deploy Services

### 1. PostgreSQL Database
```bash
# Railway provides PostgreSQL as a service
# Add PostgreSQL from Railway dashboard
```

### 2. AI Agent Service  
```bash
# Deploy ai_agent directory
# Railway will auto-detect Dockerfile
```

### 3. Express Proxy
```bash
# Deploy express-server directory  
# Update AI_AGENT_URL to Railway internal URL
```

### 4. Backend API
```bash
# Deploy backend directory
# Connect to Railway PostgreSQL
```

### 5. MCP Server
```bash
# Deploy mcp-server directory
```

## Step 3: Update Vercel

Update your Vercel environment variables:
```env
NEXT_PUBLIC_API_URL=https://atlas-express-proxy.railway.app
NEXT_PUBLIC_MCP_API_URL=https://atlas-mcp-server.railway.app/api/v1
```

## Benefits of Railway
- ✅ Easy Docker deployment
- ✅ Automatic HTTPS
- ✅ Built-in PostgreSQL
- ✅ Environment variable management
- ✅ Automatic deployments from GitHub
- ✅ Internal networking between services
- ✅ Free tier available

## Alternative: Quick Ngrok Setup

If you want to test with ngrok first:

```bash
# Expose Express Proxy
ngrok http 5001 

# Update Vercel environment to use ngrok URL
NEXT_PUBLIC_API_URL=https://abc123.ngrok.io
```

## Next Steps
1. Push your current Docker setup to GitHub
2. Create Railway account
3. Deploy services one by one
4. Update Vercel environment variables
5. Test end-to-end functionality 