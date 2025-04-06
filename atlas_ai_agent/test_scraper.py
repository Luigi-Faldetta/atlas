from scraper import scrape_property_data  # Import the scraper function

# Test the scraper with a sample URL
url = "https://www.funda.nl/detail/koop/purmerend/huis-rio-grandestraat-19/43966140/"  # Replace with a valid property URL
data = scrape_property_data(url)

# Print the scraped data
if data:
    print("Scraped Data:")
    print(data)
else:
    print("Failed to scrape property data.")