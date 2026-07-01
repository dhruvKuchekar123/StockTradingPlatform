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

            const creditAmount = Math.round(amountINR * 100) / 100;

            // Idempotency keyed on the ORDER id (stable across retries) — at most
            // one SUCCESS credit per order, backed by the partial unique index.
            const alreadyCredited = await WalletTransaction.findOne({ razorpayOrderId: orderId, status: "SUCCESS" }).session(session);
            if (alreadyCredited) {
                console.log(`[Webhook] Order ${orderId} already credited. Skipping.`);
                await session.commitTransaction();
                session.endSession();
                return res.status(200).json({ status: "success", message: "Already processed" });
            }

            // Update or create transaction log
            const pendingTx = await WalletTransaction.findOne({ razorpayOrderId: orderId, status: "PENDING" }).session(session);
            if (pendingTx) {
                pendingTx.razorpayPaymentId = paymentId;
                pendingTx.status = "SUCCESS";
                pendingTx.amount = creditAmount;
                await pendingTx.save({ session });
            } else {
                await WalletTransaction.create([{
                    userId,
                    razorpayOrderId: orderId,
                    razorpayPaymentId: paymentId,
                    amount: creditAmount,
                    status: "SUCCESS"
                }], { session });
            }

            // Credit the user's wallet atomically (no read-modify-write race)
            const updatedUser = await UserModel.findByIdAndUpdate(
                userId,
                { $inc: { walletBalance: creditAmount } },
                { new: true, session }
            );
            if (updatedUser) {
                console.log(`[Webhook] Wallet credited for user ${userId} with ₹${creditAmount}`);
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
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        // Concurrent duplicate lost the race on the one-SUCCESS-per-order index.
        // The credit is already done — acknowledge so Razorpay stops retrying.
        if (error && error.code === 11000) {
            console.log("[Webhook] Duplicate delivery collapsed by unique index; already credited.");
            return res.status(200).json({ status: "success", message: "Already processed" });
        }

        console.error("[Webhook] Processing Error:", error);
        return res.status(500).json({ status: "error", message: error.message });
    }
};
