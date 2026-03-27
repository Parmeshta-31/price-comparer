import express from "express";
import bodyParser from "body-parser";
import { scrapeBlinkit } from "./scraper.js";
import { calculateEstimates } from "./estimator.js";
import { pool, initDB } from "./db.js";

initDB();

const port = 3000;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.get("/recent", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM product_cache ORDER BY last_updated DESC LIMIT 5");

        // Send the data to a new page called recent.ejs
        res.render("recent.ejs", { searches: result.rows });
    } catch (error) {
        console.error("Error fetching recent searches:", error);
        res.status(500).send("Database Error");
    }
});

app.post("/", async (req, res) => {
    const searchTerm = (req.body.search || "").toLowerCase().trim();

    //query the table with the search term
    const cacheResult = await pool.query("SELECT * FROM product_cache WHERE search_term = $1", [searchTerm]);

    //trying cache hit
    if (cacheResult.rows.length > 0) {
        const cachedData = cacheResult.rows[0];
        const cachedTime = new Date(cachedData.last_updated);
        const currentTime = new Date();
        const diffInMinutes = (currentTime - cachedTime) / (1000 * 60);
    
        if(diffInMinutes < 30) {
            return res.render("index.ejs", {product: {
                name: cachedData.name,
                blinkitPrice: cachedData.blinkit_price,
                zeptoPrice: cachedData.zepto_price, 
                instamartPrice: cachedData.instamart_price,
                imageUrl: cachedData.image_url,
                blinkitLink: cachedData.blinkit_link,
                zeptoLink: "https://zeptonow.com",
                instamartLink: "https://instamart.swiggy.com"
            }})
        }
    }

    //otherwise scrape new data
    const scrapedData = await scrapeBlinkit(searchTerm);
    if (scrapedData) {
        //calculate the estimates
        const estimatedPrices = calculateEstimates(scrapedData.price, scrapedData.name);

        //create the query to insert the new data into the cache
        const insertQuery = `INSERT INTO product_cache(search_term, name, blinkit_price, zepto_price, instamart_price, image_url, blinkit_link, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (search_term)
        DO UPDATE SET 
        name = EXCLUDED.name, 
        blinkit_price = EXCLUDED.blinkit_price,
        zepto_price = EXCLUDED.zepto_price,
        instamart_price = EXCLUDED.instamart_price,
        image_url = EXCLUDED.image_url,
        blinkit_link = EXCLUDED.blinkit_link,
        last_updated = $8;`;

        //execute the query
        await pool.query(insertQuery, [searchTerm, scrapedData.name, scrapedData.price, estimatedPrices.zeptoPrice, estimatedPrices.instamartPrice, scrapedData.imageUrl, scrapedData.productLink, new Date()]);

        //set the final product and pass it back to the page
        const finalProduct = {
            name: scrapedData.name,
            blinkitPrice: scrapedData.price,
            zeptoPrice: estimatedPrices.zeptoPrice, 
            instamartPrice: estimatedPrices.instamartPrice,
            imageUrl: scrapedData.imageUrl,
            blinkitLink: scrapedData.productLink,
            zeptoLink: "https://zeptonow.com",
            instamartLink: "https://instamart.swiggy.com"
        };
        res.render("index.ejs", { product: finalProduct });
    } 
    else {
        console.log("Item not found or scraper blocked.");
        res.render("index.ejs");
    }
});

app.listen(port, ()=>{
    console.log("Server running on port 3000");
})