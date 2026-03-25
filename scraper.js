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
            // find price, select the first one using .find which has rupee symbol
            const allPriceElements = Array.from(document.querySelectorAll('.tw-text-200.tw-font-semibold'));
            const priceEl = allPriceElements.find(el => el.innerText.includes('₹'));

            if (!priceEl) return null;

            // Climb up the HTML tree to find the main product card, while loop acts as an elevator to find the element with a nested img tag
            let productCard = priceEl.parentElement;
            while (productCard && !productCard.querySelector('img[src*="product"]')) {
                productCard = productCard.parentElement;
            }

            // 3. Extract everything from inside this specific card
            const titleEl = productCard.querySelector('.tw-line-clamp-2');
            const imgEl = productCard.querySelector('img');

            return {
                name: titleEl ? titleEl.innerText.trim() : 'Unknown Item',
                price: parseFloat(priceEl.innerText.replace(/[^0-9.]/g, '')),
                imageUrl: imgEl ? imgEl.src : '',
                productLink: window.location.href // Fallback link back to the current search page
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