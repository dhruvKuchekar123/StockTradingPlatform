const mongoose = require('mongoose');

async function testConnection(url) {
    try {
        await mongoose.connect(url);
        console.log("Connected successfully to:", url.replace(/:[^:]*@/, ':****@'));
        process.exit(0);
    } catch (e) {
        console.error("Failed to connect to:", url.replace(/:[^:]*@/, ':****@'));
        console.error(e.message);
        process.exit(1);
    }
}

const url = "mongodb+srv://dhruvkuchekar0:ywaLz8Xmmd7fp5HX@stocktradingplatfromclu.ndm5ovg.mongodb.net/stockTradingPlatform?retryWrites=true&w=majority&appName=StockTradingPlatfromCluster";

testConnection(url);
