import puppeteer from 'puppeteer';

export async function scrapeBlinkit(searchQuery) {
    let browser;
    try {
        //Puppeteer in headless mode, headless: false for seeing new window and debugging
        browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        //Deprecated but fallback for safety
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const url = `https://blinkit.com/s/?q=${encodeURIComponent(searchQuery)}`;
        await page.goto(url, { waitUntil: 'networkidle2' });
        //waitUntil for letting all frameworks load

        await page.waitForSelector('.tw-font-semibold', { timeout: 5000 });

        // Extract the first product's name and price
        const productData = await page.evaluate(() => {
            // These CSS selectors will need to be tweaked based on Blinkit's live HTML
            const nameEl = document.querySelector('tw-text-300.tw-font-semibold.tw-line-clamp-2');
            const priceEl = document.querySelector('tw-text-200 tw-font-semibold');

            if (!nameEl || !priceEl) return null;

            return {
                name: nameEl.innerText.trim(),
                // Strip out the '₹' symbol and convert to a clean number
                price: parseFloat(priceEl.innerText.replace(/[^0-9.]/g, '')) 
            };
        });

        return productData;

    } catch (error) {
        console.error("Scraping failed:", error.message);
        return null; // Return null if it fails so the server doesn't crash
    } finally {
        if (browser) await browser.close();
    }
}