# Phase 2 Testing Validation Guide
**Enhanced Agentic AI Analysis Testing** 🚀

Following **atlas.mdc** agentic patterns and **rapid-prototyping-beer-test-001.mdc** for immediate user value.

## ✅ Frontend Validation Complete

**Status**: ✅ **PASSED** - Build successful with enhanced analysis integration
```bash
Frontend Build: ✓ Compiled successfully
TypeScript: ✓ No type errors  
Enhanced Features: ✓ Sample data includes agentic analysis
Tools Page: ✓ Enhanced analysis section integrated
```

## 🔧 Required Services for Full Testing

### **Core Services Architecture**
```
Atlas Services Stack:
├── 🌐 Frontend (Next.js)          → Port 3000
├── 🔧 Backend API (Express)       → Port 5000  
├── 🔗 Express Proxy Server        → Port 5000 (proxy)
├── 🤖 AI Agent API (FastAPI)      → Port 8000
├── 🗄️ Database (PostgreSQL)       → Port 5432 (if used)
└── 🚀 MCP Servers (Optional)      → Various ports
```

### **1. Frontend Service** ✅ **VALIDATED**
- **Directory**: `frontend/`
- **Port**: `3000`
- **Status**: ✅ Ready with enhanced analysis
- **Startup**: `npm run dev`
- **Dependencies**: ✅ Installed and validated

### **2. Backend API Service** 🔄 **NEEDS STARTUP**
- **Directory**: `backend/`
- **Port**: `5000`
- **Purpose**: User management, database operations
- **Startup**: `npm run dev`
- **Required**: For user authentication and property saving

### **3. Express Proxy Service** 🔄 **NEEDS STARTUP**
- **Directory**: `express-server/`
- **Port**: `5000` (proxy)
- **Purpose**: API proxy and request routing
- **Startup**: `npm start`
- **Required**: For `/analyze` endpoint routing

### **4. AI Agent API (FastAPI)** 🔄 **CRITICAL FOR ENHANCED ANALYSIS**
- **Directory**: `ai_agent/`
- **Port**: `8000`
- **Purpose**: Enhanced agentic analysis engine
- **Startup**: `uvicorn atlasScript:app --reload --host 127.0.0.1 --port 8000`
- **Required**: For real property analysis with enhanced features

### **5. MCP Server (Optional)** 🔄 **NEEDS STARTUP FOR FULL FEATURES**
- **Directory**: `mcp-server/`
- **Purpose**: Air quality data, local news, additional context
- **Startup**: `npm start`
- **Required**: For environmental data in InvestmentAnalysis component

## 🚀 Quick Service Startup (macOS/Linux)

### **Option 1: Manual Startup (Recommended for Testing)**
```bash
# Terminal 1: Backend API
cd backend && npm install && npm run dev

# Terminal 2: Express Proxy  
cd express-server && npm install && npm start

# Terminal 3: AI Agent (CRITICAL)
cd ai_agent && pip install -r requirements.txt && uvicorn atlasScript:app --reload --host 127.0.0.1 --port 8000

# Terminal 4: MCP Server (Optional)
cd mcp-server && npm install && npm start

# Terminal 5: Frontend (Already validated)
cd frontend && npm run dev
```

### **Option 2: Windows Batch Script**
```batch
startup.bat
```

## 🔑 Required Environment Variables

### **AI Agent (.env in ai_agent/)**
```bash
# CRITICAL: Required for enhanced analysis
OPENAI_API_KEY=your_openai_api_key_here

# Optional: For web scraping
SCRAPPERBEE_API_KEY=your_scrapperbee_api_key_here

# Optional: Proxy settings
PROXY_SERVER=
PROXY_USERNAME=
PROXY_PASSWORD=
```

### **Frontend (.env.local in frontend/)**
```bash
# Points to backend services
NEXT_PUBLIC_API_URL=http://localhost:5000

# Clerk authentication (if used)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### **MCP Server (.env in mcp-server/)**
```bash
# API keys for external data sources
AIR_QUALITY_API_KEY=your_api_key
NEWS_API_KEY=your_news_api_key
```

## 🧪 Validation Test Sequence

### **Phase 1: Service Health Check**
```bash
# 1. Check all services are running
curl http://localhost:3000      # Frontend
curl http://localhost:5000      # Backend  
curl http://localhost:8000      # AI Agent
curl http://localhost:8000/docs # AI Agent docs

# 2. Verify AI Agent enhanced features
curl http://localhost:8000/enhanced-analysis/status
```

### **Phase 2: Frontend Enhanced Analysis Test**
1. **Navigate to**: `http://localhost:3000/tools`
2. **Click**: "Use sample data"
3. **Verify**: Purple enhanced analysis banner appears
4. **Check**: Enhanced AI section shows:
   - ✅ Chain-of-Thought status indicators
   - 📊 Confidence levels 
   - 🧠 AI reasoning process
   - 🔍 Self-reflection notes

### **Phase 3: Real Property Data Test**
1. **Navigate to**: `http://localhost:3000/tools`
2. **Enter URL**: Valid Funda/Idealista property URL
3. **Click**: "Analyze Property" 
4. **Verify**: Enhanced analysis works with real data
5. **Check**: All agentic features populate correctly

### **Phase 4: Enhanced vs Regular Analysis**
```bash
# Test enhanced analysis endpoint
curl -X POST http://localhost:8000/analyze-enhanced \
  -H "Content-Type: application/json" \
  -d '{"url": "https://funda.nl/test-property"}'

# Compare with regular analysis
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://funda.nl/test-property"}'
```

## 🎯 Success Criteria for Phase 2

### **✅ Enhanced Analysis Features Working**
- [ ] Purple enhanced AI banner appears
- [ ] Chain-of-thought reasoning displays
- [ ] Self-reflection notes populate
- [ ] Confidence scores show for all metrics  
- [ ] Quality validation displays
- [ ] Analysis context shows market type
- [ ] Metadata includes agentic patterns

### **✅ Service Integration Working**
- [ ] Frontend builds without errors
- [ ] All 4-5 services start successfully
- [ ] API endpoints respond correctly
- [ ] Property URL analysis completes
- [ ] Enhanced features work with real data
- [ ] MCP server provides additional context

### **✅ User Experience Validation**
- [ ] Sample data shows enhanced features
- [ ] Real property analysis works end-to-end
- [ ] Enhanced analysis is visually distinct
- [ ] Loading states work correctly
- [ ] Error handling works gracefully

## 🐛 Common Issues & Solutions

### **Issue 1: Enhanced Analysis Not Showing**
**Symptoms**: Sample data doesn't show purple banner
**Solution**: Check `isEnhancedAnalysis()` function detects the enhanced data

### **Issue 2: AI Agent Connection Failed**
**Symptoms**: Analysis fails, "Failed to analyze property"
**Solution**: 
1. Verify AI Agent service on port 8000
2. Check OPENAI_API_KEY in ai_agent/.env
3. Test endpoint: `curl http://localhost:8000/docs`

### **Issue 3: MCP Server Features Missing**
**Symptoms**: No air quality or news data
**Solution**:
1. Start MCP server: `cd mcp-server && npm start`
2. Check environment variables in mcp-server/.env

### **Issue 4: Backend Connection Issues**
**Symptoms**: "API endpoint not configured"
**Solution**:
1. Verify NEXT_PUBLIC_API_URL in frontend/.env.local
2. Check backend service on port 5000

## 📋 Testing Checklist

### **Pre-Testing Setup**
- [ ] All service directories exist
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Ports available (3000, 5000, 8000)

### **Service Startup**
- [ ] Backend API started (port 5000)
- [ ] Express Proxy started (port 5000)
- [ ] AI Agent started (port 8000) **CRITICAL**
- [ ] MCP Server started (optional)
- [ ] Frontend started (port 3000)

### **Enhanced Analysis Validation**
- [ ] Sample data test passed
- [ ] Real property URL test passed
- [ ] Enhanced features display correctly
- [ ] Confidence scores working
- [ ] Chain-of-thought reasoning shows

### **Production Readiness**
- [ ] Error handling works
- [ ] Fallback analysis works
- [ ] Performance acceptable (<30s)
- [ ] User experience polished

## 🚀 Ready for Phase 3: Beer Test

Once all Phase 2 validations pass:
1. **Enhanced analysis features working**: ✅
2. **Real property data analysis**: ✅  
3. **Service integration complete**: ✅
4. **User experience validated**: ✅

**Next Step**: Begin user testing with beta group using enhanced analysis features on `/tools` page.

---

**🔗 Related Documentation**:
- `STARTUP_GUIDE.md` - Service startup procedures
- `ENHANCED_AGENTIC_STATUS.md` - Implementation status
- `Phase-3-Beer-Test-Progress.mdc` - Testing progress tracking 