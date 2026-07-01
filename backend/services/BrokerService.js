class BrokerService {
    /**
     * Simulates placing an order with an external broker API.
     * @param {Object} orderData 
     * @returns {Promise<string>} Broker Order ID
     */
    static async placeOrder(orderData) {
        console.log(`[Broker Service] Placing order with broker:`, {
            symbol: orderData.symbol,
            qty: orderData.qty,
            side: orderData.side,
            orderType: orderData.orderType,
            price: orderData.price
        });

        // Simulate minor network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        // Allow testing failures and transaction rollbacks by using the symbol "FAIL"
        if (orderData.symbol === "FAIL") {
            console.error(`[Broker Service] Simulated broker API rejection for symbol: FAIL`);
            throw new Error("Broker API rejected the order placement. Simulated failure.");
        }

        const brokerOrderId = `brk_ord_${Math.random().toString(36).substr(2, 9)}`;
        console.log(`[Broker Service] Order placed successfully. Broker Order ID: ${brokerOrderId}`);
        return brokerOrderId;
    }
}

module.exports = BrokerService;
