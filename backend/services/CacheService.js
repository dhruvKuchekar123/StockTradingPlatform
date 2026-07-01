const { createClient } = require("redis");
const PriceService = require("./PriceService");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
let client = null;
let isConnected = false;

const initCache = async () => {
    client = createClient({ url: REDIS_URL });

    client.on("error", (err) => {
        console.error("[Redis] Error:", err.message);
        isConnected = false;
    });

    client.on("connect", () => {
        console.log("[Redis] Connected successfully.");
        isConnected = true;
    });

    try {
        await client.connect();
    } catch (err) {
        console.error("[Redis] Initial connection failed:", err.message);
    }
};

initCache();

module.exports.setPrice = async (symbol, data) => {
    if (!isConnected) return;
    try {
        await client.setEx(`price:${symbol}`, 30, JSON.stringify(data));
    } catch (err) {
        console.error(`[Redis] Failed to set price for ${symbol}`, err.message);
    }
};

module.exports.getPrice = async (symbol) => {
    if (!isConnected) return null;
    try {
        const data = await client.get(`price:${symbol}`);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error(`[Redis] Failed to get price for ${symbol}`, err.message);
        return null;
    }
};

module.exports.getPriceOrFetch = async (symbol) => {
    let cached = await module.exports.getPrice(symbol);
    if (cached) return cached;

    // Cache miss or Redis down -> fetch directly
    const fetched = await PriceService.fetchPrice(symbol);
    if (fetched) {
        await module.exports.setPrice(symbol, fetched);
        return fetched;
    }
    return null;
};

module.exports.getAllCachedPrices = async () => {
    if (!isConnected) return {};
    try {
        const data = {};
        // SCAN is non-blocking unlike KEYS * which locks Redis until complete
        for await (const key of client.scanIterator({ MATCH: "price:*", COUNT: 100 })) {
            const val = await client.get(key);
            if (val) {
                const symbol = key.split(":")[1];
                data[symbol] = JSON.parse(val);
            }
        }
        return data;
    } catch (err) {
        console.error("[Redis] Failed to get all cached prices", err.message);
        return {};
    }
};

