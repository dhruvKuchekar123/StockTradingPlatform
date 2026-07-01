const yahooFinance = require("yahoo-finance2").default;
(async () => {
    try {
        const quote = await yahooFinance.quote("RELIANCE.NS");
        console.log(quote.regularMarketPrice);
        process.exit(0);
    } catch(e) {
        console.error(e.message || e);
        process.exit(1);
    }
})();
