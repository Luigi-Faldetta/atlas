# Property Analyzer Scraper Installation

This guide will help you set up the Property Analyzer with the real web scraping functionality.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Internet connection

## Installation Steps

1. **Clone the repository**

```bash
git clone <repository-url>
cd ProjectAtlasFixed2
```

2. **Install frontend dependencies**

```bash
cd frontend
npm install
```

3. **Install scraper service dependencies**

```bash
cd server
npm install
```

4. **Set up environment variables**

Create environment variables for both the frontend and the scraper service:

```bash
# For frontend
cd frontend
cp .env.local.example .env.local

# For scraper service
cd server
cp .env.example .env
```

Optionally, edit these files to configure your settings:

- Add an OpenAI API key for enhanced analysis
- Configure the scraper service URL if needed
- Adjust rate limiting settings

## Running the Application

You can start both the frontend and the scraper service simultaneously:

```bash
cd frontend
npm run start:all
```

Or run them separately:

```bash
# Frontend (in the frontend directory)
npm run dev

# Scraper service (in the server directory)
npm run dev
```

## Testing the Scraper

1. Open your browser and navigate to `http://localhost:3000`
2. Go to the Property Analyzer section
3. Enter a valid property URL from one of the supported platforms:
   - Idealista: https://www.idealista.com/...
   - Fotocasa: https://www.fotocasa.es/...
   - Habitaclia: https://www.habitaclia.com/...
4. Select the appropriate platform
5. Click "Analyze Property"

The application will attempt to scrape the property data and provide a comprehensive investment analysis.

## Troubleshooting

If you encounter issues:

1. **Scraper service not connecting**:
   - Check if the server is running on port 3001
   - Verify the `SCRAPER_SERVICE_URL` in `.env.local` is correct
   - The frontend will fall back to mock data if the service is unavailable

2. **Puppeteer installation issues**:
   - On some systems, you may need to install additional dependencies for Puppeteer
   - See: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

3. **Rate limiting or blocking**:
   - Real estate websites may block scraping attempts
   - Consider using a proxy (add to `PROXY_LIST` in server `.env`)
   - Reduce the request frequency by adjusting rate limits

## Legal Considerations

Remember that web scraping may be subject to legal restrictions and website terms of service. This implementation includes:

- Rate limiting to prevent overwhelming websites
- Respectful user-agent identification
- Caching to reduce repeat requests

**Note**: This tool is provided for educational purposes. Use responsibly and in accordance with applicable laws and terms of service.

## Advanced Configuration

For advanced users, you can customize the scraper behavior by:

1. Modifying the parser logic in `server/parsers.js`
2. Adjusting the Puppeteer settings in `server/propertyScraperService.js`
3. Customizing the AI analysis in `server/index.js`

## Support

If you encounter any issues, please:

1. Check the console logs for both the frontend and scraper service
2. Verify your internet connection and the availability of target websites
3. Ensure you have the latest version of all dependencies 