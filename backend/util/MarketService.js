const axios = require('axios');

const getFinnhubKey = () => process.env.FINNHUB_API_KEY;

let priceCache = {
    timestamp: 0,
    data: {}
};

module.exports.getLivePricesBatch = async (symbols) => {
    const now = Date.now();
    if (now - priceCache.timestamp < 60000 && Object.keys(priceCache.data).length > 0) {
        return priceCache.data;
    }

    try {
        const fetchPromises = symbols.map(symbol => 
            axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${getFinnhubKey()}`)
                 .then(res => ({ symbol, price: res.data.c, dp: res.data.dp }))
                 .catch(() => ({ symbol, price: null }))
        );

        const results = await Promise.all(fetchPromises);
        const newPrices = {};
        results.forEach(res => {
            if (res.price) newPrices[res.symbol] = { price: res.price, dp: res.dp };
        });

        priceCache = {
            timestamp: now,
            data: { ...priceCache.data, ...newPrices }
        };

        return priceCache.data;
    } catch(err) {
        console.error("Error fetching live prices batch", err.message);
        return priceCache.data;
    }
};

module.exports.getLivePrice = async (symbol) => {
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${getFinnhubKey()}`);
        if(response.data && response.data.c) {
            return response.data.c; 
        }
        throw new Error("Invalid response from Finnhub");
    } catch(err) {
        console.error(`Error fetching live price for ${symbol}`, err.message);
        throw err;
    }
}

module.exports.isMarketOpen = async () => {
    return true; // MOCKED FOR TESTING
}
