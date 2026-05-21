require("dotenv").config();
const axios = require("axios");
const crypto = require("crypto");

async function testVerifyBuyFlow() {
    console.log("=== STARTING PAYMENT VERIFY & BUY FLOW TEST ===");
    try {
        // 1. Log in as dummy user
        const loginRes = await axios.post("http://localhost:3002/login", {
            email: "dummyuser@gmail.com",
            password: "password123"
        });
        
        const cookie = loginRes.headers['set-cookie'][0];
        console.log("SUCCESS: Logged in as dummyuser@gmail.com");

        // 2. Create Order
        const orderRes = await axios.post("http://localhost:3002/api/payments/create-order", {
            symbol: "AAPL",
            qty: 2,
            price: 150.00
        }, {
            headers: { Cookie: cookie }
        });

        const { success, order, livePrice } = orderRes.data;
        if (!success) {
            throw new Error("Order creation failed: " + JSON.stringify(orderRes.data));
        }
        console.log(`SUCCESS: Created Razorpay order ${order.id} with live price ${livePrice}`);

        // 3. Generate correct signature
        const paymentId = "pay_TEST_" + Math.random().toString(36).slice(-8);
        const sign = order.id + "|" + paymentId;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test")
            .update(sign)
            .digest("hex");
        
        console.log(`Generated mock payment ID: ${paymentId}`);
        console.log(`Generated expected signature: ${expectedSign}`);

        // 4. Send verify-and-buy request
        const verifyRes = await axios.post("http://localhost:3002/api/payments/verify-and-buy", {
            razorpay_order_id: order.id,
            razorpay_payment_id: paymentId,
            razorpay_signature: expectedSign,
            symbol: "AAPL",
            qty: 2,
            price: livePrice
        }, {
            headers: { Cookie: cookie }
        });

        console.log("Response from verify-and-buy:", verifyRes.data);
        if (verifyRes.data.success) {
            console.log("=== TEST PASSED SUCCESSFULLY! ===");
        } else {
            console.error("=== TEST FAILED! ===");
        }
    } catch(err) {
        console.error("Verification Test Failed!");
        console.error("Error:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        }
    }
}

testVerifyBuyFlow();
