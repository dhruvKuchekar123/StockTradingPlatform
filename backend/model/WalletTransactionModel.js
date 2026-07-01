const mongoose = require("mongoose");
const { Schema } = mongoose;

const WalletTransactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    razorpayOrderId: { type: String, required: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    amount: { type: Number, required: true }, // Store in INR (Rupees)
    status: { 
        type: String, 
        enum: ['PENDING', 'SUCCESS', 'FAILED'], 
        default: 'PENDING' 
    },
    timestamp: { type: Date, default: Date.now }
});

WalletTransactionSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("WalletTransaction", WalletTransactionSchema);
