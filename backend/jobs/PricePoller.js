const EventEmitter = require("events");
const HoldingsModel = require("../model/HoldingModel");
const PriceService = require("../services/PriceService");
const CacheService = require("../services/CacheService");

class PriceEmitter extends EventEmitter {}
const priceEmitter = new PriceEmitter();

let activeSymbols = new Set();
let intervalId = null;

const fetchAndBroadcast = async () => {
    if (activeSymbols.size === 0) return;

    try {
        const symbolsArray = Array.from(activeSymbols);
        const results = await PriceService.fetchPrices(symbolsArray);
        
        const updatePayload = {};
        for (const data of results) {
            await CacheService.setPrice(data.symbol, data);
            updatePayload[data.symbol] = data;
        }

        if (Object.keys(updatePayload).length > 0) {
            priceEmitter.emit("price:update", updatePayload);
            console.log(`[Poller] Updated ${Object.keys(updatePayload).length} symbols at ${new Date().toISOString()}`);
        }
    } catch (err) {
        // A mid-tick failure must NOT silently freeze the feed. Keep the socket
        // alive by re-broadcasting the last-known cached prices, flagged as stale
        // so the frontend can indicate the data is no longer live. Emitted on a
        // dedicated "price:stale" channel that the order matcher does NOT listen
        // to, so execution never runs on stale prices.
        console.error("[Poller] Error fetching prices, serving last-known prices as stale:", err.message);
        try {
            const stalePayload = {};
            for (const symbol of activeSymbols) {
                const cached = await CacheService.getPrice(symbol);
                if (cached) {
                    stalePayload[symbol] = { ...cached, isStale: true };
                }
            }
            if (Object.keys(stalePayload).length > 0) {
                priceEmitter.emit("price:stale", stalePayload);
            }
        } catch (broadcastErr) {
            console.error("[Poller] Failed to broadcast stale prices:", broadcastErr.message);
        }
    }
};

module.exports.startPoller = async () => {
    if (intervalId) return;

    // Load initial symbols from DB
    try {
        const dbSymbols = await HoldingsModel.distinct("name");
        dbSymbols.forEach(s => activeSymbols.add(s));
        console.log(`[Poller] Loaded ${dbSymbols.length} symbols from Holdings.`);
    } catch (err) {
        console.error("[Poller] Error loading initial symbols:", err.message);
    }

    fetchAndBroadcast(); // immediate first fetch
    intervalId = setInterval(fetchAndBroadcast, 15000);
    console.log("[Poller] Price poller started (15s interval)");
};

module.exports.stopPoller = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        console.log("[Poller] Price poller stopped.");
    }
};

module.exports.addSymbol = (symbol) => {
    activeSymbols.add(symbol);
};

module.exports.removeSymbol = (symbol) => {
    activeSymbols.delete(symbol);
};

module.exports.priceEmitter = priceEmitter;
