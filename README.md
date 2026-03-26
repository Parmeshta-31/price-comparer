# QuickCompare

Simple price comparison tool for comparing a single product price across three platforms.

Utilises Puppeteer to scrape live data from the Blinkit website. Built using Node.js, Express.js and Bootstrap.

Stores cache on Neon using PostgreSQL

**IMPORTANT**
CURRENTLY ONLY SCRAPES LIVE DATA FOR BLINKIT
Uses an estimation algorithm for Zepto and Instamart (estimator.js)

# Installation and Usage
Clone the repository and install the dependencies (npm install)
Create a .env file with your Neon Database URL (DATABASE_URL="your_url")
Run the server (node index.js)
Site runs on http://localhost:3000