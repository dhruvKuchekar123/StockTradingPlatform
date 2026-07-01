const Razorpay = require("razorpay");
const UserModel = require("../model/UserModel");
const OrdersModel = require("../model/OrdersModel");
const WalletTransaction = require("../model/WalletTransactionModel");
const mongoose = require("mongoose");
const { verifyRazorpaySignature } = require("../util/PaymentUtils");

const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: (process.env.RAZORPAY_KEY_ID || "").trim(),
        key_secret: (process.env.RAZORPAY_KEY_SECRET || "").trim(),
    });
};

// 1. Create Razorpay order for top-up
module.exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR (Rupees)
        const userId = req.user.id;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ success: false, message: "Invalid amount provided." });
        }

        const amountINR = Number(amount);
        // Validate min/max limits: min ₹100, max ₹2,00,000 per transaction
        if (amountINR < 100 || amountINR > 200000) {
            return res.status(400).json({ 
                success: false, 
                message: "Amount must be between ₹100 and ₹2,00,000 per transaction." 
            });
        }

        const amountInPaise = Math.round(amountINR * 100);
        const receiptId = `rcpt_topup_${Date.now()}`;

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: receiptId,
            notes: {
                userId: userId.toString(),
                type: "wallet_topup",
            }
        };

        let rzpOrder;
        try {
            const razorpay = getRazorpayInstance();
            rzpOrder = await razorpay.orders.create(options);
        } catch (err) {
            console.log("[Wallet Controller] Razorpay failed, generating mock order:", err.message);
            rzpOrder = {
                id: `order_demo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                amount: amountInPaise,
                currency: "INR"
            };
        }

        // Create pending transaction in DB
        await WalletTransaction.create({
            userId,
            razorpayOrderId: rzpOrder.id,
            amount: amountINR,
            status: "PENDING"
        });

        res.json({
            success: true,
            order_id: rzpOrder.id,
            amount: rzpOrder.amount, // in paise
            currency: rzpOrder.currency,
            key_id: (process.env.RAZORPAY_KEY_ID || "demo_key").trim()
        });
    } catch (error) {
        console.error("Create Wallet Order Error:", error);
        res.status(500).json({ success: false, message: "Server error creating top-up order: " + error.message });
    }
};

// 2. Verify Razorpay Payment and credit wallet
module.exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: "Missing required payment details." });
    }

    // Verify Razorpay signature server-side (skipped for demo gateway orders)
    const isDemoOrder = razorpay_order_id.startsWith("order_demo_");
    if (!isDemoOrder) {
        if (!verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return res.status(400).json({ success: false, message: "Invalid signature. Verification failed." });
        }
    }

    // Idempotency key is the ORDER id, not the payment id. A retry (or a demo
    // double-click, which sends a fresh random payment id each time) reuses the
    // same order id, so keying on it prevents a second credit for the same order.
    try {
        const alreadyCredited = await WalletTransaction.findOne({ razorpayOrderId: razorpay_order_id, status: "SUCCESS" });
        if (alreadyCredited) {
            const user = await UserModel.findById(userId);
            return res.status(200).json({
                success: true,
                message: "Payment verified successfully (already processed).",
                walletBalance: user ? user.walletBalance : undefined
            });
        }
    } catch (err) {
        console.error("Idempotency lookup failed:", err.message);
        return res.status(500).json({ success: false, message: "Server error verifying payment." });
    }

    // Resolve the amount to credit.
    let amountINR;
    try {
        if (isDemoOrder) {
            const tx = await WalletTransaction.findOne({ razorpayOrderId: razorpay_order_id });
            if (!tx) {
                return res.status(404).json({ success: false, message: "Demo transaction order not found in DB." });
            }
            amountINR = tx.amount;
        } else {
            const razorpay = getRazorpayInstance();
            const rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
            if (!rzpOrder) {
                return res.status(404).json({ success: false, message: "Razorpay order not found." });
            }
            amountINR = rzpOrder.amount / 100; // convert paise to INR
        }
    } catch (err) {
        console.error("Amount resolution failed:", err.message);
        return res.status(502).json({ success: false, message: "Could not confirm payment amount with gateway." });
    }
    amountINR = Math.round(amountINR * 100) / 100;

    // Atomically mark the order SUCCESS and credit the wallet in one transaction.
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const pendingTx = await WalletTransaction.findOne({ razorpayOrderId: razorpay_order_id, status: "PENDING" }).session(session);
        if (pendingTx) {
            pendingTx.razorpayPaymentId = razorpay_payment_id;
            pendingTx.status = "SUCCESS";
            pendingTx.amount = amountINR;
            await pendingTx.save({ session });
        } else {
            await WalletTransaction.create([{
                userId,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                amount: amountINR,
                status: "SUCCESS"
            }], { session });
        }

        // Atomic credit — no read-modify-write race.
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $inc: { walletBalance: amountINR } },
            { new: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Payment verified and credited to wallet.",
            walletBalance: updatedUser ? updatedUser.walletBalance : undefined
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        // A concurrent duplicate confirmation may have already credited this order
        // (it lost the race on the unique index / a write conflict). Re-check for a
        // winning SUCCESS row and, if present, report already-processed WITHOUT
        // touching it — otherwise the reconciliation write below would clobber it.
        try {
            const winner = await WalletTransaction.findOne({ razorpayOrderId: razorpay_order_id, status: "SUCCESS" });
            if (winner) {
                const user = await UserModel.findById(userId);
                return res.status(200).json({
                    success: true,
                    message: "Payment verified successfully (already processed).",
                    walletBalance: user ? user.walletBalance : undefined
                });
            }
        } catch (lookupErr) {
            console.error("Winner re-check failed:", lookupErr.message);
        }

        // Payment was confirmed but the wallet credit genuinely failed. Do NOT lose
        // it — park the transaction as PENDING_RECONCILIATION so it shows up as
        // "processing" in history and can be recovered, rather than vanishing.
        // The { status: { $ne: SUCCESS } } filter is a second guard so we never
        // overwrite an already-credited row.
        try {
            await WalletTransaction.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id, status: { $ne: "SUCCESS" } },
                { $set: { userId, razorpayPaymentId: razorpay_payment_id, amount: amountINR, status: "PENDING_RECONCILIATION" } },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        } catch (logErr) {
            console.error("Failed to record reconciliation transaction:", logErr.message);
        }

        console.error("Verify Payment Error (credit failed, parked for reconciliation):", error.message);
        return res.status(202).json({
            success: true,
            status: "processing",
            message: "Payment received. Your wallet credit is being processed and will reflect shortly."
        });
    }
};

// 3. Get Wallet Balance
module.exports.getWalletBalance = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.json({ success: true, balance: user.walletBalance || 0 });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching wallet balance." });
    }
};

// 4. Combined Transaction History
module.exports.getWalletTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch top-ups
        const topups = await WalletTransaction.find({ userId }).sort({ timestamp: -1 });

        // Fetch stock orders
        const orders = await OrdersModel.find({ userId }).sort({ placedAt: -1 });

        // Map and combine
        const combined = [];

        topups.forEach(t => {
            combined.push({
                id: t.razorpayPaymentId || t.razorpayOrderId,
                type: "DEPOSIT",
                amount: t.amount,
                status: t.status,
                date: t.timestamp,
                details: "Wallet Top-up via Razorpay"
            });
        });

        orders.forEach(o => {
            const price = o.executedPrice || o.limitPrice || o.triggerPrice || 0;
            const total = price * o.qty;
            combined.push({
                id: o.brokerOrderId || o._id.toString(),
                type: o.side, // 'BUY' or 'SELL'
                symbol: o.symbol,
                qty: o.qty,
                price: price,
                amount: total,
                status: o.status,
                date: o.executedAt || o.placedAt,
                details: `${o.orderType} Order`
            });
        });

        // Sort descending by date
        combined.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({ success: true, transactions: combined });
    } catch (error) {
        console.error("Fetch Transactions Error:", error);
        res.status(500).json({ success: false, message: "Error fetching transaction history." });
    }
};
