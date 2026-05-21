require("dotenv").config();
const axios = require("axios");

async function testFrontendCreateOrder() {
    try {
        // We simulate the frontend's request to create-order
        // Need to simulate a logged in user with session, but we can just import the controller directly for testing
        const PaymentController = require("./Controllers/PaymentController");
        const MarketService = require("./util/MarketService");
        
        // Let's just run MarketService.getLivePrice directly to see what it returns for INFY
        console.log("Fetching live price for INFY...");
        const livePrice = await MarketService.getLivePrice("INFY");
        console.log("Live Price:", livePrice);
        
        const amount = livePrice * 1; // qty = 1
        console.log("Calculated amount:", amount);
        console.log("Paise amount:", Math.round(amount * 100));

        const Razorpay = require("razorpay");
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: `receipt_test`
        });
        
        console.log("Created Order:", order);
    } catch(e) {
        console.error("Test failed:", e);
    }
    process.exit();
}

testFrontendCreateOrder();
