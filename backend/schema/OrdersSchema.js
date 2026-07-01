const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true },
    qty: { type: Number, required: true },
    orderType: { type: String, enum: ['MARKET', 'LIMIT', 'SL', 'GTT'], required: true },
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    
    // Pricing fields
    limitPrice: { type: Number },
    triggerPrice: { type: Number },
    executedPrice: { type: Number },
    
    // Status lifecycle
    status: { 
        type: String,
        enum: ['PENDING', 'OPEN', 'TRIGGERED', 'EXECUTED', 'CANCELLED', 'REJECTED'],
        default: 'PENDING' 
    },
    
    // GTT specific
    gttCondition: { type: String, enum: ['ABOVE', 'BELOW'] },
    gttExpiry: { type: Date },
    
    // Razorpay (BUY only)
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paymentVerified: { type: Boolean, default: false },
    
    // Broker & Idempotency
    brokerOrderId: { type: String },
    idempotencyKey: { type: String, unique: true, sparse: true },
    fee: { type: Number, default: 0 }, // Store in INR

    // Metadata
    placedAt: { type: Date, default: Date.now },
    executedAt: { type: Date },
    cancelledAt: { type: Date },
    notes: { type: String }
});

// Indexes for querying efficiency
OrdersSchema.index({ userId: 1, status: 1 });
OrdersSchema.index({ symbol: 1, status: 1, orderType: 1 });
OrdersSchema.index({ gttExpiry: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = { OrdersSchema };