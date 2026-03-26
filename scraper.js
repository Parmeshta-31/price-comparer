import puppeteer from 'puppeteer';

export async function scrapeBlinkit(searchQuery) {
    let browser;
    try {
        //Puppeteer in headless mode, headless: false for seeing new window and debugging
        browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        //Deprecated but helps for safety
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const url = `https://blinkit.com/s/?q=${encodeURIComponent(searchQuery)}`;
        await page.goto(url, { waitUntil: 'networkidle2' });
        //waitUntil for letting all frameworks load

        await page.waitForSelector('::-p-text(₹)', { timeout: 5000 });

        const productData = await page.evaluate((query) => {
            
            // get keyword for search (first word)
            const keyword = query.trim().split(' ')[0].toLowerCase();

            // all price elements with rupee symbol
            const allPriceElements = Array.from(document.querySelectorAll('.tw-text-200.tw-font-semibold'))
                                          .filter(el => el.innerText.includes('₹'))
                                          .slice(0,5);

            if (allPriceElements.length === 0) return null;

            let targetCard = null;
            let targetPriceEl = null;
            let fallbackCard = null;
            let fallbackPriceEl = null;

            // loop through price elements one by one to find their parents and a match if available
            for (let priceEl of allPriceElements) {
                
                // Climb up to find the product card (viz div tabindex, everything else is a child of it)
                let productCard = priceEl.parentElement;
                while (productCard && !productCard.querySelector('img[src*="product"]')) {
                    productCard = productCard.parentElement;
                }

                if (productCard) {
                    // save first card as fallback
                    if (!fallbackCard) {
                        fallbackCard = productCard;
                        fallbackPriceEl = priceEl;
                    }

                    //find the name of product (it has the class tw-line-clamp-2)
                    const titleEl = productCard.querySelector('.tw-line-clamp-2');
                    
                    // check if this title contains the keyword
                    if (titleEl && titleEl.innerText.toLowerCase().includes(keyword)) {
                        targetCard = productCard;
                        targetPriceEl = priceEl;
                        break; // if yes, stop loop
                }
            }
        }

            // if match was found, targetcard, else fallback
            const finalCard = targetCard || fallbackCard;
            const finalPriceEl = targetPriceEl || fallbackPriceEl;

            if (!finalCard || !finalPriceEl) return null;
            
            // set the final title and image
            const finalTitleEl = finalCard.querySelector('.tw-line-clamp-2');
            const imgEl = finalCard.querySelector('img[src*="product"]');
            

            return {
                name: finalTitleEl ? finalTitleEl.innerText.trim() : 'Unknown Item',
                price: parseFloat(finalPriceEl.innerText.replace(/[^0-9.]/g, '')),
                imageUrl: imgEl ? imgEl.src : '',
                productLink: window.location.href 
            };
            
        }, searchQuery); // passes query to puppeteer

        console.log(productData);
        return productData;

    } catch (error) {
        console.error("Scraping failed:", error.message);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}