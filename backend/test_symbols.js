require("dotenv").config();
const axios = require("axios");
const MarketService = require("./util/MarketService");

async function checkAllPrices() {
    const symbols = ["INFY", "ONGC", "TCS", "KPITTECH", "QUICKHEAL", "WIPRO", "M&M", "RELIANCE", "HUL"];
    for (let symbol of symbols) {
        try {
            const price = await MarketService.getLivePrice(symbol);
            console.log(`Symbol ${symbol}: Price ${price}`);
        } catch (e) {
            console.log(`Symbol ${symbol}: Error - ${e.message}`);
        }
    }
}
checkAllPrices();
