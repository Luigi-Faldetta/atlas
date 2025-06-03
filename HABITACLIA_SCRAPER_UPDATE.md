# Habitaclia Scraper Update

## Overview
The Habitaclia scraper has been updated based on the actual HTML structure from a live property page. The changes focus on targeting specific HTML elements and patterns found in the real page content.

## Key Updates Made

### 1. Price Extraction Enhancement
- **Target Elements**: Updated to look for specific price patterns found in the HTML
- **New Selectors**:
  ```python
  'span[itemprop="price"]'           # Schema.org price markup
  'span.font-2[itemtype*="Offer"]'  # Offer type elements
  'span.price'                      # General price class
  '.price-down strong'              # Price discount elements
  'strong:contains("€")'            # Any strong tag with Euro symbol
  ```
- **Improvement**: Better regex pattern to extract price with thousands separators

### 2. Property Features Extraction
- **Target Elements**: Enhanced feature detection from list items
- **New Selectors**:
  ```python
  'li.feature'                      # Specific feature list items
  'ul.feature-list li'             # Feature list containers
  '.features li'                   # General features
  'ol.feature-container li'        # Ordered feature lists
  ```
- **Improvement**: More robust pattern matching for Spanish terms

### 3. Location & Address Detection
- **Target Elements**: Improved breadcrumb and location extraction
- **New Selectors**:
  ```python
  'nav.breadcrumb a'               # Breadcrumb navigation
  '[data-gtmtrace*="location"]'    # GTM tracking elements
  '.location'                      # Location containers
  ```
- **Logic**: Skips first breadcrumb (usually "Home") and joins remaining parts

### 4. Title & Heading Extraction
- **Target Elements**: Multiple selectors for page titles
- **New Selectors**:
  ```python
  'h1'                             # Main heading
  'h1.hidden'                      # Hidden headings (sometimes used)
  '.title'                         # Title classes
  '[data-gtmtrace="title"]'        # GTM tracked titles
  ```

### 5. Summary & Characteristics
- **Target Elements**: Enhanced detection of property summaries
- **New Selectors**:
  ```python
  '.summary-left'                  # Left summary sections
  '.summary'                       # General summary
  '.property-details'              # Property detail sections
  '.characteristics'               # Characteristics sections
  ```

### 6. Data Attribute Mining
- **Feature**: Added extraction from HTML data attributes
- **Target**: `main` elements and elements with `data-gtmtrace` attributes
- **Purpose**: Extract additional metadata that might contain property information

## Pattern Matching Improvements

### Area/Surface Detection
```python
# Enhanced regex to handle different decimal separators
r'(\d+(?:[.,]\d+)?)\s*m[²2]'
```

### Multilingual Support
- Added English terms alongside Spanish (`bedroom`, `bathroom`)
- Improved Spanish term detection (`hab`, `dormitori`, `baño`, `aseo`)

### Year Detection
```python
# Matches years from 1900-2099
r'(19|20)\d{2}'
```

## Error Handling & Validation

### Data Validation
- Ensures substantial content for descriptions (min 50 characters)
- Prevents duplicate extraction (checks if field already populated)
- Cleans price data with proper regex patterns

### Fallback Mechanisms
- Multiple selector patterns for each data type
- URL-based property type inference as fallback
- Graceful handling of missing elements

## Testing Framework

### New Test Script: `test_habitaclia_scraper.py`
- Comprehensive testing with real URLs
- Detailed logging and validation
- Success rate calculation
- Field-by-field validation reporting

### Key Features:
- Validates extraction of required fields
- Provides detailed success/failure reporting
- Includes timing delays to be respectful to the website
- Logs all activities for debugging

## Usage Instructions

### 1. Run the Test Script
```bash
python test_habitaclia_scraper.py
```

### 2. Add Test URLs
Edit the `test_urls` list in `test_habitaclia_scraper.py`:
```python
test_urls = [
    "https://www.habitaclia.com/vivienda-barcelona-12345.htm",
    "https://www.habitaclia.com/piso-madrid-67890.htm",
    # Add more URLs here
]
```

### 3. Monitor Results
- Check console output for real-time results
- Review `habitaclia_scraper_test.log` for detailed logs
- Validate extracted data quality

## Expected Improvements

### Before Update
- Generic selectors that might miss specific content
- Limited Spanish language support
- Basic price extraction patterns
- Minimal validation

### After Update
- Targeted selectors based on actual HTML structure
- Enhanced multilingual support
- Robust price and feature extraction
- Comprehensive validation and testing

## Next Steps

1. **Test with Real URLs**: Add actual Habitaclia property URLs to the test script
2. **Monitor Success Rate**: Aim for >80% successful extractions
3. **Refine Selectors**: Adjust based on test results if needed
4. **Add More Fields**: Extend extraction for additional property attributes

## Notes

- The scraper now targets the specific HTML patterns found in the provided page structure
- Enhanced error handling ensures better reliability
- Multiple fallback selectors increase extraction success rate
- Respectful scraping with delays between requests 