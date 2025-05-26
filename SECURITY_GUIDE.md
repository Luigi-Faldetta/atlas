# 🔒 Project Atlas - Security Guide

## 🚨 Critical Security Information

**NEVER commit API keys or sensitive credentials to version control!**

## 🔑 Environment Variables & API Keys

### Required API Keys

Project Atlas requires the following API keys for full functionality:

1. **OpenAI API Key** - Required for AI analysis features
2. **ScrapperBee API Key** - Optional, for enhanced web scraping
3. **Proxy Credentials** - Optional, for proxy-based scraping

### ✅ Secure Setup Process

#### 1. Environment File Location
All sensitive credentials should be stored in:
```
ai_agent/.env
```

#### 2. .env File Template
When you run `startup.bat` for the first time, it will create a template:

```bash
# Project Atlas Environment Variables
# Add your API keys here (this file is in .gitignore)

# OpenAI API Key for AI analysis
OPENAI_API_KEY=your_openai_api_key_here

# ScrapperBee API Key for web scraping (optional)
SCRAPPERBEE_API_KEY=your_scrapperbee_api_key_here

# Proxy settings (optional)
PROXY_SERVER=
PROXY_USERNAME=
PROXY_PASSWORD=
```

#### 3. Adding Your Real API Keys
1. Open `ai_agent/.env` in a text editor
2. Replace `your_openai_api_key_here` with your actual OpenAI API key
3. Add other keys as needed
4. Save the file

**Example:**
```bash
OPENAI_API_KEY=sk-proj-abc123def456...
SCRAPPERBEE_API_KEY=SCRAPPERBEE_abc123...
```

## 🛡️ Security Best Practices

### ✅ DO:
- ✅ Store API keys in `.env` files
- ✅ Keep `.env` files in `.gitignore`
- ✅ Use different API keys for development/production
- ✅ Rotate API keys regularly
- ✅ Use environment-specific configurations
- ✅ Limit API key permissions when possible

### ❌ DON'T:
- ❌ Put API keys directly in code files
- ❌ Commit `.env` files to version control
- ❌ Share API keys in chat/email
- ❌ Use production keys in development
- ❌ Store keys in startup scripts
- ❌ Push keys to public repositories

## 🔍 .gitignore Protection

The project `.gitignore` includes:
```gitignore
# Environment variables
.env
.env.local
.env.development
.env.production
```

This ensures environment files are never committed to Git.

## 🚨 If You Accidentally Commit API Keys

### Immediate Actions:
1. **Revoke the exposed API key immediately**
2. **Generate a new API key**
3. **Update your `.env` file with the new key**
4. **Remove the key from Git history:**

```bash
# Remove file from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch ai_agent/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to overwrite history
git push origin --force --all
```

### For GitHub:
1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add your API keys as repository secrets
4. Never put them in code again

## 🔧 Environment-Specific Setup

### Development Environment
```bash
# ai_agent/.env.development
OPENAI_API_KEY=sk-dev-...
SCRAPPERBEE_API_KEY=SCRAPPERBEE_dev_...
```

### Production Environment
```bash
# ai_agent/.env.production  
OPENAI_API_KEY=sk-prod-...
SCRAPPERBEE_API_KEY=SCRAPPERBEE_prod_...
```

## 🔄 API Key Management

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new secret key
3. Copy the key (you won't see it again!)
4. Add to your `.env` file

### ScrapperBee API Key
1. Sign up at https://www.scrapingbee.com/
2. Get your API key from the dashboard
3. Add to your `.env` file

## 🚀 Deployment Security

### For Production Deployment:

#### Option 1: Environment Variables (Recommended)
Set environment variables directly on your server:
```bash
export OPENAI_API_KEY="sk-prod-..."
export SCRAPPERBEE_API_KEY="SCRAPPERBEE_prod_..."
```

#### Option 2: Secure .env File
1. Create `.env` file on server only
2. Set proper file permissions:
```bash
chmod 600 ai_agent/.env  # Only owner can read/write
```

#### Option 3: Container Secrets
For Docker deployments:
```dockerfile
# Use build-time secrets
RUN --mount=type=secret,id=openai_key \
    OPENAI_API_KEY="$(cat /run/secrets/openai_key)"
```

## 🔍 Security Verification

### Check for Exposed Keys
Before committing, always run:
```bash
# Search for potential API keys in your code
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "OPENAI_API_KEY=" . --exclude-dir=node_modules --exclude-dir=.git
```

### Verify .gitignore
```bash
# Check if .env is ignored
git check-ignore ai_agent/.env
# Should return: ai_agent/.env
```

## 🚨 Emergency Response

### If API Keys Are Compromised:

1. **Immediate Actions:**
   - Revoke all exposed API keys
   - Generate new keys
   - Update all environments

2. **Investigation:**
   - Check API usage logs
   - Monitor for unauthorized usage
   - Review access patterns

3. **Prevention:**
   - Implement key rotation schedule
   - Add monitoring alerts
   - Review security practices

## 📞 Support & Resources

### Getting API Keys:
- **OpenAI:** https://platform.openai.com/api-keys
- **ScrapperBee:** https://www.scrapingbee.com/

### Security Resources:
- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OpenAI API Security](https://platform.openai.com/docs/guides/safety-best-practices)
- [Environment Variable Security](https://12factor.net/config)

---

## 🎯 Quick Security Checklist

Before pushing code to GitHub:

- [ ] API keys are in `.env` files only
- [ ] `.env` files are in `.gitignore`
- [ ] No hardcoded credentials in source code
- [ ] Used placeholder values in documentation
- [ ] Verified with `git status` that `.env` files aren't staged

**Remember: Security is everyone's responsibility! 🔒** 