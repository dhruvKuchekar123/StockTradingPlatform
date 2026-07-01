const Razorpay = require("razorpay");
const UserModel = require("../model/UserModel");
const WalletTransaction = require("../model/WalletTransactionModel");
const mongoose = require("mongoose");

module.exports.handleWebhook = async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || "webhook_secret").trim();

    // Verify signature using Razorpay SDK
    try {
        const isValid = Razorpay.validateWebhookSignature(req.rawBody, signature, webhookSecret);
        if (!isValid) {
            console.warn("[Webhook] Invalid signature received.");
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (err) {
        console.error("[Webhook] Signature verification error:", err);
        return res.status(400).json({ success: false, message: "Signature verification failed" });
    }

    const event = req.body.event;
    console.log(`[Webhook] Received Razorpay event: ${event}`);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (event === "payment.captured") {
            const paymentEntity = req.body.payload.payment.entity;
            const orderId = paymentEntity.order_id;
            const paymentId = paymentEntity.id;
            const amountINR = paymentEntity.amount / 100; // in INR
            const userId = paymentEntity.notes.userId;

            if (!userId) {
                console.warn("[Webhook] Missing userId in notes. Ignoring.");
                await session.commitTransaction();
                session.endSession();
                return res.status(200).json({ status: "ignored", reason: "missing userId in notes" });
            }

            // Check if payment already processed (Idempotency)
            const existingTx = await WalletTransaction.findOne({ razorpayPaymentId: paymentId }).session(session);
            if (existingTx && existingTx.status === "SUCCESS") {
                console.log(`[Webhook] Payment ${paymentId} already credited. Skipping.`);
                await session.commitTransaction();
                session.endSession();
                return res.status(200).json({ status: "success", message: "Already processed" });
            }

            // Update or create transaction log
            const pendingTx = await WalletTransaction.findOne({ razorpayOrderId: orderId, status: "PENDING" }).session(session);
            if (pendingTx) {
                pendingTx.razorpayPaymentId = paymentId;
                pendingTx.status = "SUCCESS";
                pendingTx.amount = amountINR;
                await pendingTx.save({ session });
            } else {
                await WalletTransaction.create([{
                    userId,
                    razorpayOrderId: orderId,
                    razorpayPaymentId: paymentId,
                    amount: amountINR,
                    status: "SUCCESS"
                }], { session });
            }

            // Credit the user's wallet
            const user = await UserModel.findById(userId).session(session);
            if (user) {
                user.walletBalance = Math.round((user.walletBalance + amountINR) * 100) / 100;
                await user.save({ session });
                console.log(`[Webhook] Wallet credited for user ${userId} with ₹${amountINR}`);
            } else {
                console.warn(`[Webhook] User ${userId} not found.`);
            }

        } else if (event === "payment.failed") {
            const paymentEntity = req.body.payload.payment.entity;
            const orderId = paymentEntity.order_id;
            const paymentId = paymentEntity.id;
            const amountINR = paymentEntity.amount / 100;
            const userId = paymentEntity.notes.userId;

            if (userId) {
                const pendingTx = await WalletTransaction.findOne({ razorpayOrderId: orderId, status: "PENDING" }).session(session);
                if (pendingTx) {
                    pendingTx.razorpayPaymentId = paymentId;
                    pendingTx.status = "FAILED";
                    await pendingTx.save({ session });
                } else {
                    await WalletTransaction.create([{
                        userId,
                        razorpayOrderId: orderId,
                        razorpayPaymentId: paymentId,
                        amount: amountINR,
                        status: "FAILED"
                    }], { session });
                }
                console.log(`[Webhook] Logged failed payment ${paymentId} for user ${userId}`);
            }
        }

        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({ status: "success" });

    } catch (error) {
        console.error("[Webhook] Processing Error:", error);
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        return res.status(500).json({ status: "error", message: error.message });
    }
};
