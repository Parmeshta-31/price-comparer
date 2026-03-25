import express from "express";
import bodyParser from "body-parser";
import { scrapeBlinkit } from "./scraper.js";
import { calculateEstimates } from "./estimator.js";

const port = 3000;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.post("/", async (req, res) => {
    const searchTerm = req.body.search;
    const scrapedData = await scrapeBlinkit(searchTerm);
    if (scrapedData) {
        const estimatedPrices = calculateEstimates(scrapedData.price, scrapedData.name);
        const finalProduct = {
            name: scrapedData.name,
            blinkitPrice: scrapedData.price,
            zeptoPrice: estimatedPrices.zeptoPrice, 
            instamartPrice: estimatedPrices.instamartPrice
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