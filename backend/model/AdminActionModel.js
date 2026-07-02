const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Immutable audit trail for every admin WRITE action. Nothing that mutates
 * platform state on behalf of an admin may skip a write to this collection.
 */
const AdminActionSchema = new Schema({
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g. SUSPEND_USER, RECONCILE_WALLET
    targetUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reason: { type: String, required: true },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    metadata: { type: Schema.Types.Mixed, default: null }, // e.g. orderId, transactionId, emailId
    timestamp: { type: Date, default: Date.now },
});

AdminActionSchema.index({ timestamp: -1 });
AdminActionSchema.index({ targetUserId: 1, timestamp: -1 });

module.exports = mongoose.model("AdminAction", AdminActionSchema);
