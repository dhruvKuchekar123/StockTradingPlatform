const OrdersModel = require("../model/OrdersModel");

module.exports.startGTTExpiryJob = () => {
    // Run every hour
    setInterval(async () => {
        try {
            const expiredOrders = await OrdersModel.find({
                orderType: 'GTT',
                status: 'OPEN',
                gttExpiry: { $lte: new Date() }
            });

            if (expiredOrders.length > 0) {
                const orderIds = expiredOrders.map(o => o._id);
                await OrdersModel.updateMany(
                    { _id: { $in: orderIds } },
                    { 
                        $set: { 
                            status: 'CANCELLED', 
                            notes: 'GTT expired automatically',
                            cancelledAt: new Date()
                        } 
                    }
                );
                console.log(`[Job] Expired ${expiredOrders.length} GTT orders`);
            }
        } catch (error) {
            console.error("[Job] Error in GTTExpiryJob:", error);
        }
    }, 60 * 60 * 1000); // 1 hour

    console.log("[Job] GTT Expiry Job started (runs every hour)");
};
