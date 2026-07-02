const mongoose = require("mongoose");
const { Schema } = mongoose;

const WalletTransactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    amount: { type: Number, required: true }, // Store in INR (Rupees)
    status: {
        type: String,
        // PENDING_RECONCILIATION = payment confirmed but the wallet credit failed;
        // the money is not lost — it is parked here (shown as "processing") for recovery.
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'PENDING_RECONCILIATION'],
        default: 'PENDING'
    },
    timestamp: { type: Date, default: Date.now }
});

WalletTransactionSchema.index({ userId: 1, timestamp: -1 });

// Hard idempotency guarantee at the DB level: at most ONE successful credit per
// payment order. A second confirmation for the same order (retry / demo double-click,
// even with a different payment id) fails on this partial unique index instead of
// double-crediting the wallet.
WalletTransactionSchema.index(
    { razorpayOrderId: 1 },
    { unique: true, partialFilterExpression: { status: "SUCCESS" } }
);

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
