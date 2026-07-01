const Razorpay = require("razorpay");
const UserModel = require("../model/UserModel");
const OrdersModel = require("../model/OrdersModel");
const HoldingsModel = require("../model/HoldingModel");
const MarketService = require("../util/MarketService");
const PriceService = require("../services/PriceService");
const { sendPaymentReceiptEmail } = require("../util/EmailService");
const { executeOrder } = require("../engine/OrderMatcher");
const { verifyRazorpaySignature } = require("../util/PaymentUtils");

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: (process.env.RAZORPAY_KEY_ID || "test").trim(),
        key_secret: (process.env.RAZORPAY_KEY_SECRET || "test").trim(),
    });
};

module.exports.createRazorpayOrder = async (req, res) => {
    try {
        const { symbol, qty, price: clientPrice } = req.body;
        
        const isOpen = await MarketService.isMarketOpen();
        if (!isOpen) return res.status(400).json({ success: false, message: "Market is currently closed." });

        const user = await UserModel.findById(req.user.id);
        // if (!user.isApproved) return res.status(403).json({ success: false, message: "Your account is pending admin approval." });

        let livePrice;
        try {
            // Add a 2-second timeout to prevent yahoo-finance retries from hanging
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000));
            const priceData = await Promise.race([PriceService.fetchPrice(symbol), timeoutPromise]);
            livePrice = priceData?.price;
        } catch (err) {
            console.warn("Could not fetch live price for " + symbol + " (Timeout/Error). Using client-provided price or fallback.");
        }

        // Use the live price, or fall back to the client-sent price, or a mock price
        if (!livePrice || isNaN(livePrice) || livePrice <= 0) {
            livePrice = (clientPrice && !isNaN(clientPrice) && clientPrice > 0) ? Number(clientPrice) : 1200.50;
        }

        const qtyNum = parseInt(qty, 10) || 1;
        // FIXED: amount in paise = price × qty × 100 (the actual trade value)
        const amountInPaise = Math.max(Math.round(livePrice * qtyNum * 100), 100);

        console.log(`[Payment] Creating order: ${symbol} × ${qtyNum} @ ₹${livePrice} = ₹${livePrice * qtyNum} (${amountInPaise} paise)`);

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${symbol}_${Date.now()}`,
            notes: {
                symbol,
                qty: qtyNum,
                pricePerShare: livePrice,
            }
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
        console.error("Create Trade Order Error:", error);
        res.status(500).json({ success: false, message: "Server Error generating trade payment: " + error.message });
    }
};

module.exports.verifyPaymentAndExecuteBuy = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, symbol, qty, price } = req.body;
        const userId = req.user.id;

        if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return res.status(400).json({ success: false, message: "Invalid signature. Payment verification failed. No changes made." });
        }

        // SIGNATURE VERIFIED - Safe to proceed with DB writes
        // Save Order
        const newOrder = new OrdersModel({
            userId,
            symbol,
            qty,
            orderType: 'MARKET',
            side: 'BUY',
            paymentVerified: true,
            status: 'PENDING',
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id
        });
        await newOrder.save();

        await executeOrder(newOrder, price);
        
        // Wait for executeOrder to finish and then we can send success or fail depending on status
        // But usually it should succeed since it's a MARKET BUY
        const updatedOrder = await OrdersModel.findById(newOrder._id);
        if (updatedOrder.status === 'REJECTED') {
            return res.status(500).json({ success: false, message: `Order execution failed: ${updatedOrder.notes}` });
        }

        // The buy receipt is sent (fire-and-forget, with retry-queue capture) by
        // executeOrder after commit. We no longer send it here — that would both
        // duplicate the receipt and block the HTTP response on SMTP latency.

        return res.status(200).json({ success: true, message: `Successfully purchased ${qty} shares of ${symbol}!` });
    } catch (error) {
        console.error("verifyAndBuy Error:", error);
        res.status(500).json({ success: false, message: "Server Error completing trade" });
    }
};

module.exports.getPaymentStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.fetch(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Fetch order Error:", error);
        res.status(500).json({ success: false, message: "Server Error fetching order status" });
    }
};

module.exports.verifyPayment = async (req, res) => {
    // Keeping this generic add-funds endpoint just in case it's used elsewhere
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
        const userId = req.user.id;

        if (verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
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
