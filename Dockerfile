# AI Agent Service Dockerfile
# This containerizes the Python FastAPI application that handles web scraping and AI processing

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for Playwright and web scraping
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Required for Playwright browsers
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libatspi2.0-0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libxkbcommon0 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    # Additional utilities
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY ai_agent/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN python -m playwright install chromium

# Copy AI agent source code
COPY ai_agent/ .

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Environment variables
ENV HOST=0.0.0.0
ENV PORT=8000
ENV PYTHONUNBUFFERED=1

# Run the application
CMD ["uvicorn", "atlasScript:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]