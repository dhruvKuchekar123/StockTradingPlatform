const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;
const { MOCK_BASE_PRICES } = require("../config/constants");

let lastYahooWarningTime = 0;
const WARNING_COOLDOWN = 300000; // 5 minutes

const PROVIDER = process.env.PRICE_PROVIDER || "yahoo";
const ALPHA_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const INDIAN_STOCKS = new Set([
    "RELIANCE", "TCS", "ICICIBANK", "INFY", "SBIN", "HDFCBANK", "TATAMOTORS", "ITC", "BHARTIARTL"
]);

// Normalize symbols for Yahoo Finance (Indian stocks need .NS suffix)
const normalizeSymbol = (symbol, provider) => {
    if (provider === "yahoo") {
        const upper = symbol.toUpperCase();
        if (INDIAN_STOCKS.has(upper) && !symbol.includes(".")) {
            return `${symbol}.NS`;
        }
    }
    return symbol;
};

const fetchMockPrice = (symbol) => {
    const basePrice = MOCK_BASE_PRICES[symbol] || 1000.00;
    const fluctuationPercent = (Math.sin(Date.now() / 15000 + symbol.charCodeAt(0)) * 1.2);
    const noise = (Math.random() - 0.5) * 0.15;
    const finalPercent = fluctuationPercent + noise;
    const price = parseFloat((basePrice * (1 + finalPercent / 100)).toFixed(2));
    const change = parseFloat((price - basePrice).toFixed(2));
    const changePercent = parseFloat(((change / basePrice) * 100).toFixed(2));
    
    return {
        symbol,
        price,
        change,
        changePercent,
        timestamp: Date.now(),
        isMockData: true // simulated/fallback price — never a real market quote
    };
};

const fetchAlphaVantagePrice = async (symbol) => {
    try {
        const res = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`);
        const quote = res.data["Global Quote"];
        if (quote && quote["05. price"]) {
            return {
                symbol,
                price: parseFloat(quote["05. price"]),
                change: parseFloat(quote["09. change"]),
                changePercent: parseFloat(quote["10. change percent"].replace("%", "")),
                timestamp: Date.now(),
                isMockData: false
            };
        }
        return fetchMockPrice(symbol);
    } catch (error) {
        console.error(`AlphaVantage Error for ${symbol}:`, error.message);
        return fetchMockPrice(symbol);
    }
};

const fetchYahooPrice = async (symbol) => {
    try {
        const querySymbol = normalizeSymbol(symbol, "yahoo");
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${querySymbol}`;
        const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        
        const result = res.data?.chart?.result?.[0];
        if (result && result.meta) {
            const meta = result.meta;
            const price = meta.regularMarketPrice;
            const prevClose = meta.previousClose || price;
            const change = parseFloat((price - prevClose).toFixed(2));
            const changePercent = parseFloat(((change / prevClose) * 100).toFixed(2));
            
            return {
                symbol,
                price,
                change,
                changePercent,
                timestamp: Date.now(),
                isMockData: false
            };
        }
        return fetchMockPrice(symbol);
    } catch (error) {
        const now = Date.now();
        if (now - lastYahooWarningTime > WARNING_COOLDOWN) {
            console.warn(`[Yahoo Finance v8] API error for ${symbol} (suppressing warnings for 5m). Error: ${error.message}`);
            lastYahooWarningTime = now;
        }
        return fetchMockPrice(symbol);
    }
};

module.exports.fetchPrice = async (symbol) => {
    if (PROVIDER === "alphavantage") {
        return await fetchAlphaVantagePrice(symbol);
    } else {
        return await fetchYahooPrice(symbol);
    }
};

module.exports.fetchPrices = async (symbols) => {
    const promises = symbols.map(sym => module.exports.fetchPrice(sym));
    const results = await Promise.allSettled(promises);
    
    return results
        .filter(r => r.status === "fulfilled" && r.value !== null)
        .map(r => r.value);
};
