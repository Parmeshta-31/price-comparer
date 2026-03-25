import express from "express";
import bodyParser from "body-parser";
import { scrapeBlinkit } from "./scraper.js";

const port = 3000;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.post("/search", async (req, res) => {
    const searchTerm = req.body.search;
    const scrapedData = await scrapeBlinkit(searchTerm);
    if (scrapedData) {
        const finalProduct = {
            name: scrapedData.name,
            blinkitPrice: scrapedData.price,
            zeptoPrice: Math.round(scrapedData.price * 0.95), 
            instamartPrice: Math.round(scrapedData.price * 1.05) 
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