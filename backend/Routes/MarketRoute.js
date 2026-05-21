const { getLivePricesBatch } = require("../util/MarketService");
const router = require("express").Router();

router.post("/live-prices", async (req, res) => {
    try {
        const { symbols } = req.body;
        if (!symbols || !Array.isArray(symbols)) {
            return res.status(400).json({ success: false, message: "Invalid symbols array" });
        }
        const prices = await getLivePricesBatch(symbols);
        res.json({ success: true, prices });
    } catch (error) {
        console.error("MarketRoute Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch live prices" });
    }
});

module.exports = router;
