# Project Atlas - Property Analyzer

This project includes a real AI-powered property analyzer that can extract and analyze property data from Spanish real estate websites.

## Features

- 🏙️ **Real-time property data extraction** from Spanish real estate websites (Idealista, Fotocasa, Habitaclia)
- 🧠 **AI-powered investment analysis** using advanced algorithms and OpenAI integration
- 📊 **Comprehensive investment metrics** including rental yield, cap rate, cash-on-cash return
- 📱 **Responsive UI** for all devices
- 🛡️ **Anti-detection measures** for ethical web scraping

## Architecture

The project consists of two main components:

1. **Next.js Frontend**: The user interface and application logic
2. **Node.js Scraper Service**: A dedicated service for property data extraction

### Technical Implementation

- **Frontend**: Next.js, React, Tailwind CSS
- **Scraper Service**: Node.js, Express, Puppeteer
- **AI Analysis**: OpenAI integration (optional)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Internet connection

### Installation

1. Clone the repository
2. Install dependencies:
```bash
cd frontend
npm install

cd server
npm install
```

3. Set up environment variables:
```bash
# For frontend
cp .env.local.example .env.local

# For scraper service
cd server
cp .env.example .env
```

4. Configure your environment variables (optional):
   - Add OpenAI API key for enhanced analysis
   - Configure scraper service settings

### Running the Application

The easiest way to run both the frontend and scraper service is to use:

```bash
npm run start:all
```

Or you can run them separately:

```bash
# Frontend
npm run dev

# Scraper service
cd server
npm run dev
```

## Using the Property Analyzer

1. Open the application in your browser (typically at http://localhost:3000)
2. Navigate to the AI Property Analyzer
3. Enter a property URL from Idealista, Fotocasa, or Habitaclia
4. Select the appropriate platform
5. Click "Analyze Property"

The application will:
1. Extract data from the property listing
2. Calculate investment metrics
3. Generate an AI-based investment score
4. Display a comprehensive analysis of the property

## Legal and Ethical Considerations

Web scraping may be subject to website terms of service and legal restrictions. This tool has been implemented with ethical considerations in mind, including:

- Rate limiting to prevent overwhelming target websites
- User-agent rotation to distribute requests
- Caching to reduce duplicate requests
- Stealth techniques to minimize impact

**Disclaimer**: This tool is intended for educational and research purposes only. Users are responsible for ensuring their use complies with applicable terms of service, laws, and regulations.

## Configuration Options

### Frontend (.env.local)
- `OPENAI_API_KEY`: API key for OpenAI (optional)
- `SCRAPER_SERVICE_URL`: URL of the scraper service
- `ENABLE_FALLBACK_MODE`: Enable mock data when scraper service is unavailable

### Scraper Service (.env)
- `PORT`: Server port
- `OPENAI_API_KEY`: API key for OpenAI (optional)
- `ENABLE_CACHE`: Enable/disable caching
- `CACHE_TTL`: Cache time-to-live in milliseconds
- `PUPPETEER_HEADLESS`: Run Puppeteer in headless mode
- `RATE_LIMIT_WINDOW_MS`: Rate limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window
- `PROXY_LIST`: Comma-separated list of proxies (optional)

## License

ISC 