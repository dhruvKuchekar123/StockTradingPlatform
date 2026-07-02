const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * A durable dead-letter queue for outbound emails that failed to send.
 * We store the fully-rendered message (to/from/subject/html) so a retry is a
 * simple re-send with no need to re-render — works for any email type.
 */
const FailedEmailSchema = new Schema({
    to: { type: String, required: true },
    from: { type: String },
    subject: { type: String },
    html: { type: String },
    type: { type: String }, // OTP | BUY_RECEIPT | SELL_RECEIPT | GENERIC
    status: { type: String, enum: ["PENDING", "SENT"], default: "PENDING" },
    attempts: { type: Number, default: 1 },
    lastError: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastAttemptAt: { type: Date, default: Date.now },
});

FailedEmailSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model("FailedEmail", FailedEmailSchema);
