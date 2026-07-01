const { Schema } = require("mongoose");

/**
 * HoldingSchema — represents a user's long-term holding in a stock.
 *
 * IMPORTANT: All queries MUST include { userId, name } to scope holdings
 * per user. Querying by { name } alone returns the first matching document
 * across ALL users, causing cross-user data corruption.
 */
const HoldingSchema = new Schema({
    // userId scopes every holding to its owner — required for correctness
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    name: { type: String, required: true },
    qty:  { type: Number, required: true, min: 0 },
    avg:  { type: Number, required: true, min: 0 }, // average buy price
    price: { type: Number, default: 0 },            // last known market price
    net:  { type: String, default: "+0.00%" },
    day:  { type: String, default: "+0.00%" },
});

// Compound index ensures fast per-user-per-symbol lookups and enforces uniqueness
HoldingSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = { HoldingSchema };