from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
print("Selenium imported successfully!")

def scrape_property_data(url: str) -> str:
    """
    Scrapes property data from the given URL on funda.nl using Selenium to handle dynamic content.
    """
    # Set up Selenium WebDriver with headless mode
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")

    service = Service("chromedriver")  # Path to ChromeDriver
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        print(f"Scraping URL: {url}")
        driver.get(url)

        # Wait for the page to load and elements to appear
        wait = WebDriverWait(driver, 10)

        # Extract property details
        title = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "object-header__title"))).text.strip()
        address = driver.find_element(By.CLASS_NAME, "object-header__subtitle").text.strip()
        price = driver.find_element(By.CLASS_NAME, "object-header__price").text.strip()
        description = driver.find_element(By.CLASS_NAME, "object-description-body").text.strip()

        # Format the data
        formatted_data = f"""
        Property Details:
        - Title: {title}
        - Address: {address}
        - Price: {price}

        Description:
        {description}
        """

        print("Scraped Data Successfully!")
        return formatted_data

    except Exception as e:
        print(f"Error scraping property data: {e}")
        return None

    finally:
        driver.quit()