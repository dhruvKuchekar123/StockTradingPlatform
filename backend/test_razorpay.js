require("dotenv").config();
const Razorpay = require("razorpay");

async function run() {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID.trim(),
            key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
        });
        
        console.log("Keys:", process.env.RAZORPAY_KEY_ID.trim(), process.env.RAZORPAY_KEY_SECRET.trim());

        const amountInINR = 150 * 83;
        const options = {
            amount: Math.round(amountInINR * 100), // paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        console.log("Creating order with options:", options);
        const order = await razorpay.orders.create(options);
        console.log("Order created:", order);
    } catch(err) {
        console.error("Error:", err);
    }
}
run();
