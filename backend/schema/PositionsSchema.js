const {Schema} = require("mongoose");

const PositionsSchema = new Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    product: String,
    name: String,
    qty: Number,
    avg: Number,
    price: Number,
    net: String,
    day: String,
    isLoss: Boolean,
});

PositionsSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = { PositionsSchema };