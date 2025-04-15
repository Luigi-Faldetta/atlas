# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed system dependencies for Playwright and then Python packages
# Use --no-cache-dir to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Add system dependencies required by Playwright's browsers if needed
    # The playwright install command below often handles this, but keep for reference
    # Example: libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libdbus-1-3 libatspi2.0-0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libxkbcommon0 libpango-1.0-0 libcairo2 libasound2
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir -r requirements.txt \
    # Install Playwright browsers and their dependencies *inside* the container
    && python -m playwright install --with-deps chromium

# Copy the rest of your application code into the container at /app
COPY . .

# Make port 8000 available to the world outside this container
# Render typically uses port 10000 by default, but we define 8000 here.
# Ensure your Render service settings match this or the CMD below.
EXPOSE 8000

# Define environment variable to listen on all interfaces
ENV HOST 0.0.0.0
ENV PORT 8000

# Run uvicorn when the container launches
# Ensure this matches the port you EXPOSE and configure in Render
CMD ["uvicorn", "atlasScript:app", "--host", "0.0.0.0", "--port", "8000"]