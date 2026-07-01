require('dotenv').config();
const PriceService = require('./services/PriceService');

(async () => {
    try {
        const data = await PriceService.fetchPrice("ICICIBANK");
        console.log("Result:", data);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
