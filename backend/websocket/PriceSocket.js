const { WebSocketServer } = require("ws");
const jwt = require("jsonwebtoken");
const url = require("url");
const CacheService = require("../services/CacheService");
const { priceEmitter, addSymbol } = require("../jobs/PricePoller");
const OrderEmitter = require("../events/OrderEmitter");

const clients = new Map();

module.exports.initPriceSocket = (httpServer) => {
    const wss = new WebSocketServer({ server: httpServer, path: "/ws/prices" });

    wss.on("connection", async (ws, req) => {
        const query = url.parse(req.url, true).query;
        const token = query.token;

        if (!token) {
            ws.close(4001, "Unauthorized");
            return;
        }

        let userId;
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            userId = decoded.id;
        } catch (err) {
            ws.close(4001, "Unauthorized");
            return;
        }

        console.log(`[WS] Client connected: ${userId}`);
        clients.set(ws, { userId, subscribedSymbols: new Set() });

        // Send initial cached prices immediately
        const cached = await CacheService.getAllCachedPrices();
        ws.send(JSON.stringify({ type: "INITIAL_PRICES", data: cached }));

        ws.on("message", (message) => {
            try {
                const parsed = JSON.parse(message);
                const clientData = clients.get(ws);

                if (parsed.type === "SUBSCRIBE" && Array.isArray(parsed.symbols)) {
                    parsed.symbols.forEach(sym => {
                        clientData.subscribedSymbols.add(sym);
                        addSymbol(sym); // Tell poller to start tracking it
                    });
                } else if (parsed.type === "UNSUBSCRIBE" && Array.isArray(parsed.symbols)) {
                    parsed.symbols.forEach(sym => {
                        clientData.subscribedSymbols.delete(sym);
                    });
                }
            } catch (err) {
                console.error("[WS] Invalid message format:", err.message);
            }
        });

        ws.on("close", () => {
            clients.delete(ws);
            console.log(`[WS] Client disconnected: ${userId}`);
        });
    });

    // Broadcast updates from Poller
    priceEmitter.on("price:update", (updatedPrices) => {
        clients.forEach((clientData, ws) => {
            if (ws.readyState === ws.OPEN) {
                const filteredData = {};
                let hasUpdates = false;

                for (const symbol in updatedPrices) {
                    if (clientData.subscribedSymbols.has(symbol)) {
                        filteredData[symbol] = updatedPrices[symbol];
                        hasUpdates = true;
                    }
                }

                if (hasUpdates) {
                    ws.send(JSON.stringify({ type: "PRICE_UPDATE", data: filteredData }));
                }
            }
        });
    });

    // Send order execution notifications directly to the owner
    OrderEmitter.on('order:executed', (order) => {
        const orderUserIdStr = order.userId.toString();
        clients.forEach((clientData, ws) => {
            if (ws.readyState === ws.OPEN && clientData.userId === orderUserIdStr) {
                ws.send(JSON.stringify({ type: 'ORDER_EXECUTED', data: order }));
            }
        });
    });

    console.log("[WS] WebSocket Server initialized on /ws/prices");
};
