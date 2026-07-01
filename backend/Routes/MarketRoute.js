const router = require("express").Router();
const CacheService = require("../services/CacheService");
const PriceService = require("../services/PriceService");
const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;
const { MOCK_BASE_PRICES } = require("../config/constants");


const generateMockCandles = (symbol, interval) => {
    const basePrice = MOCK_BASE_PRICES[symbol] || 1000.00;
    const now = new Date();
    const data = [];
    
    let count = 100;
    let stepSeconds = 300;
    
    if (interval === "1min") {
        count = 150;
        stepSeconds = 60;
    } else if (interval === "5min") {
        count = 150;
        stepSeconds = 300;
    } else if (interval === "15min") {
        count = 150;
        stepSeconds = 900;
    } else if (interval === "1D") {
        count = 100;
        stepSeconds = 86400;
    }
    
    let currentPrice = basePrice * 0.95;
    let currentTime = Math.floor(now.getTime() / 1000) - (count * stepSeconds);
    
    for (let i = 0; i < count; i++) {
        const changePercent = (Math.random() - 0.47) * 1.5;
        const open = parseFloat(currentPrice.toFixed(2));
        const close = parseFloat((open * (1 + changePercent / 100)).toFixed(2));
        
        const high = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.4 / 100)).toFixed(2));
        const low = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.4 / 100)).toFixed(2));
        const volume = Math.floor(Math.random() * 50000) + 10000;
        
        data.push({
            time: currentTime,
            open,
            high,
            low,
            close,
            volume
        });
        
        currentPrice = close;
        currentTime += stepSeconds;
    }
    
    return data;
};

router.get("/candles/:symbol", async (req, res) => {
    const symbol = req.params.symbol;
    const interval = req.query.interval || "5min";
    try {
        let querySymbol = symbol;
        const provider = process.env.PRICE_PROVIDER || "yahoo";
        
        if (provider === "yahoo") {
            if (!querySymbol.includes(".")) querySymbol += ".NS";
            
            const intervalMap = {
                "1min": "1m",
                "5min": "5m",
                "15min": "15m",
                "1D": "1d"
            };
            const yfInterval = intervalMap[interval] || "5m";
            
            const now = new Date();
            let period1 = new Date();
            if (yfInterval.endsWith("m")) {
                period1.setDate(now.getDate() - 5);
            } else {
                period1.setFullYear(now.getFullYear() - 1);
            }

            const result = await yahooFinance.chart(querySymbol, {
                period1: period1,
                interval: yfInterval
            });
            
            if (!result || !result.quotes || result.quotes.length === 0) {
                const mockData = generateMockCandles(symbol, interval);
                return res.json({ success: true, data: mockData });
            }

            const quotes = result.quotes;
            const ohlcv = quotes.map(q => ({
                time: Math.floor(new Date(q.date).getTime() / 1000),
                open: q.open,
                high: q.high,
                low: q.low,
                close: q.close,
                volume: q.volume
            })).filter(q => q.open !== null && q.close !== null);
            
            return res.json({ success: true, data: ohlcv });
        } else {
            const mockData = generateMockCandles(symbol, interval);
            return res.json({ success: true, data: mockData });
        }
        
    } catch (error) {
        console.warn(`MarketRoute GET /candles error for ${symbol}: ${error.message || error}. Falling back to mock candles.`);
        try {
            const mockData = generateMockCandles(symbol, interval);
            return res.json({ success: true, data: mockData });
        } catch (fallbackError) {
            console.error("Failed to generate mock candles:", fallbackError);
            res.status(500).json({ success: false, message: "Server error fetching candles" });
        }
    }
});

module.exports = router;
