import puppeteer from 'puppeteer';

export async function scrapeBlinkit(searchQuery) {
    let browser;
    try {
        //Puppeteer in headless mode, headless: false for seeing new window and debugging
        browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        //Deprecated but fallback for safety
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const url = `https://blinkit.com/s/?q=${encodeURIComponent(searchQuery)}`;
        await page.goto(url, { waitUntil: 'networkidle2' });
        //waitUntil for letting all frameworks load

        await page.waitForSelector('::-p-text(₹)', { timeout: 5000 });

        const productData = await page.evaluate(() => {
            // selector for product names
            const titleElements = document.querySelectorAll('.tw-line-clamp-2');
            const nameEl = titleElements[1];

            // selector for filtering the price
            const allPriceElements = Array.from(document.querySelectorAll('.tw-text-200.tw-font-semibold'));
            const priceEl = allPriceElements.find(el => el.innerText.includes('₹'));

            if (!nameEl || !priceEl) return null;

            return {
                name: nameEl.innerText.trim(),
                price: parseFloat(priceEl.innerText.replace(/[^0-9.]/g, '')) 
            };
        });
        console.log(productData);
        return productData;

    } catch (error) {
        console.error("Scraping failed:", error.message);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}