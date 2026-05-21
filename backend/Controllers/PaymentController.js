const Razorpay = require("razorpay");
const crypto = require("crypto");
const UserModel = require("../model/UserModel");

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: (process.env.RAZORPAY_KEY_ID || "test").trim(),
        key_secret: (process.env.RAZORPAY_KEY_SECRET || "test").trim(),
    });
};

const MarketService = require("../util/MarketService");

module.exports.createTradeOrder = async (req, res) => {
    try {
        const { symbol, qty, price } = req.body;
        
        const isOpen = await MarketService.isMarketOpen();
        if (!isOpen) return res.status(400).json({ success: false, message: "Market is currently closed." });

        const user = await UserModel.findById(req.user.id);
        // if (!user.isApproved) return res.status(403).json({ success: false, message: "Your account is pending admin approval." });

        let livePrice;
        try {
            livePrice = await MarketService.getLivePrice(symbol);
        } catch (err) {
            console.log(`Falling back to frontend price for ${symbol} due to Finnhub error.`);
            livePrice = Number(price);
        }

        if (!livePrice || isNaN(livePrice) || livePrice <= 0) {
            return res.status(400).json({ success: false, message: "Invalid stock price for this symbol." });
        }

        const amount = livePrice * qty;
        
        // Force the checkout amount to 100 paise (1 INR) for Razorpay test mode to avoid max limit errors
        const options = {
            amount: 100, // paise
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create(options);
        
        if (!order) return res.status(500).json({ success: false, message: "Error creating Razorpay order" });

        res.json({ 
            success: true, 
            order, 
            livePrice, 
            razorpay_key: (process.env.RAZORPAY_KEY_ID || "test").trim() 
        });
    } catch (error) {
        console.error("Trade Order Error:", error);
        res.status(500).json({ success: false, message: "Server Error generating trade payment: " + error.message, stack: error.stack });
    }
};

module.exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
        const userId = req.user.id;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test")
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            // Payment verified
            const user = await UserModel.findById(userId);
            user.walletBalance += Number(amount); // amount in INR
            await user.save();

            return res.status(200).json({ success: true, message: "Payment verified successfully", walletBalance: user.walletBalance });
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature. Payment verification failed." });
        }
    } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ success: false, message: "Server Error verifying payment" });
    }
};

const { sendPaymentReceiptEmail } = require("../util/EmailService");
const OrdersModel = require("../model/OrdersModel");

module.exports.verifyAndBuy = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, symbol, qty, price } = req.body;
        const userId = req.user.id;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test")
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const user = await UserModel.findById(userId);
            
            let newOrder = new OrdersModel({
                name: symbol,
                qty: qty,
                price: price,
                mode: "BUY",
            });
            await newOrder.save();

            // Update holdings in database
            const HoldingsModel = require("../model/HoldingModel");
            let holding = await HoldingsModel.findOne({ name: symbol });
            if (holding) {
                const oldTotal = holding.qty * holding.avg;
                const newTotal = Number(qty) * Number(price);
                holding.qty += Number(qty);
                holding.avg = (oldTotal + newTotal) / holding.qty;
                holding.price = Number(price);
                await holding.save();
            } else {
                holding = new HoldingsModel({
                    name: symbol,
                    qty: Number(qty),
                    avg: Number(price),
                    price: Number(price),
                    net: "+0.00%",
                    day: "+0.00%",
                });
                await holding.save();
            }

            await sendPaymentReceiptEmail(user.email, symbol, qty, price);

            return res.status(200).json({ success: true, message: `Successfully purchased ${qty} shares of ${symbol}!` });
        } else {
            return res.status(400).json({ success: false, message: "Invalid signature. Payment verification failed." });
        }
    } catch (error) {
        console.error("verifyAndBuy Error:", error);
        res.status(500).json({ success: false, message: "Server Error completing trade" });
    }
};
