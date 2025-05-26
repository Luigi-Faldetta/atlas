# Multi-Source Real Estate AI Agent

A comprehensive real estate analysis system that scrapes property data from multiple sources and provides AI-powered investment analysis for both Dutch and Spanish markets.

## 🚀 Features

- **Multi-Source Scraping**: Supports four major real estate platforms:
  - **Funda** (Netherlands) - Dutch real estate market
  - **Fotocasa** (Spain) - Spanish real estate market
  - **Habitaclia** (Spain) - Spanish real estate market
  - **Idealista** (Spain) - Spanish real estate market (uses ScrapingBee API)

- **AI-Powered Analysis**: Market-specific investment analysis using OpenAI GPT-4
  - Dutch market considerations (rental regulations, energy labels, WOZ tax)
  - Spanish market factors (tourism potential, Golden Visa, seasonal rentals)

- **Robust Architecture**:
  - Abstract base scraper class for easy extension
  - Async/await for efficient concurrent processing
  - Comprehensive error handling and logging
  - Proxy support for reliability
  - Anti-detection measures (stealth mode, human-like behavior)

- **Rich Output**:
  - Excel reports with multiple sheets
  - Investment scores and financial projections
  - Market-specific insights
  - Error tracking and status reporting

## 📋 Requirements

- Python 3.8+
- OpenAI API key
- ScrapingBee API key (for Idealista scraper)
- Optional: Proxy credentials for enhanced reliability

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai_agent
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Install Playwright browsers:
```bash
playwright install chromium
```

5. Create a `.env` file with your credentials:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Proxy Configuration (Optional)
PROXY_SERVER=http://your-proxy-server:port
PROXY_USERNAME=your_proxy_username
PROXY_PASSWORD=your_proxy_password

# ScrapingBee API (Required for Idealista)
SCRAPINGBEE_API_KEY=your_scrapingbee_key
```

## 🚀 Usage

### Running the Multi-Source Analyzer

```bash
python multi_source_batch_analyzer.py
```

This will:
1. Scrape properties from all configured sources (Funda, Fotocasa, Habitaclia, Idealista)
2. Perform market-specific AI analysis
3. Generate a comprehensive Excel report

### Running Individual Scrapers

```bash
# Test Funda scraper
python new_funda_scraper.py

# Test Fotocasa scraper
python fotocasa_scraper.py

# Test Habitaclia scraper
python habitaclia_scraper.py

# Test Idealista scraper (requires SCRAPINGBEE_API_KEY)
python idealista_scraper.py
```

### Running the Original Batch Analyzer (Funda only)

```bash
python batch_analyzer.py
```

## 📁 Project Structure

```
ai_agent/
├── base_scraper.py              # Abstract base class for all scrapers
├── new_funda_scraper.py         # Funda (Dutch) scraper implementation
├── fotocasa_scraper.py          # Fotocasa (Spanish) scraper
├── habitaclia_scraper.py        # Habitaclia (Spanish) scraper
├── idealista_scraper.py         # Idealista (Spanish) scraper (uses ScrapingBee)
├── batch_analyzer.py            # Original Funda-only batch analyzer
├── multi_source_batch_analyzer.py # Enhanced multi-source analyzer
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables (create this)
└── README.md                    # This file
```

## 🔧 Configuration

### Adding New Property URLs

Edit `multi_source_batch_analyzer.py` and update the `SCRAPER_CONFIGS` dictionary:

```python
SCRAPER_CONFIGS = {
    'funda': {
        'scraper_class': FundaScraper,
        'market': 'dutch',
        'urls': [
            # Add your Funda URLs here
        ]
    },
    'fotocasa': {
        'scraper_class': FotocasaScraper,
        'market': 'spanish',
        'urls': [
            # Add your Fotocasa URLs here
        ]
    },
    'habitaclia': {
        'scraper_class': HabitacliaScraper,
        'market': 'spanish',
        'urls': [
            # Add your Habitaclia URLs here
        ]
    },
    'idealista': {
        'scraper_class': IdealistaScraper,
        'market': 'spanish',
        'urls': [
            # Add your Idealista URLs here
        ]
    }
}
```

### Customizing AI Analysis

Modify the market-specific prompts in `MARKET_PROMPTS` to adjust the analysis criteria.

## 📊 Output Format

The system generates an Excel file with multiple sheets:

1. **All Properties**: Complete data for all scraped properties
2. **Summary**: Market-level statistics and averages
3. **Site-specific sheets**: Filtered data for each platform

### Data Fields

- **Basic Information**: Address, Price, Living Area, Bedrooms, etc.
- **AI Analysis**: Investment score, ROI projections, rental estimates
- **Market Insights**: Strengths, weaknesses, market-specific notes
- **Metadata**: Timestamps, error tracking, scraping status

## 🐛 Troubleshooting

### Common Issues

1. **Timeout Errors**: Increase timeout values or check internet connection
2. **Scraping Failures**: Websites may have updated their structure
3. **Proxy Issues**: Verify proxy credentials and server status
4. **AI Analysis Errors**: Check OpenAI API key and quota
5. **Idealista Errors**: Verify ScrapingBee API key and credits

### Debug Mode

Set headless to `False` in scraper initialization for visual debugging:

```python
launch_options = {
    "headless": False,  # Set to False for debugging
    # ...
}
```

Note: Idealista scraper uses ScrapingBee API and doesn't support visual debugging.

## 🚦 Best Practices

1. **Rate Limiting**: The system includes delays between requests
2. **Error Handling**: All errors are logged and tracked
3. **Data Validation**: Missing fields are marked as "Not found"
4. **Ethical Scraping**: Respects robots.txt and uses human-like behavior

## 📈 Future Enhancements

- [ ] Add more real estate platforms
- [ ] Implement caching to avoid re-scraping
- [ ] Add data validation with Pydantic models
- [ ] Create a web interface for easy configuration
- [ ] Add support for rental properties
- [ ] Implement automated scheduling

## 📄 License

This project is for educational and research purposes. Please respect the terms of service of the websites being scraped.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📞 Support

For issues or questions, please create an issue in the repository. 