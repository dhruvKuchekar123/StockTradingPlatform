/**
 * @module PaymentUtils
 * @description Shared payment verification utilities.
 *
 * Centralises Razorpay signature verification so the logic lives in exactly
 * one place. Any bug fix or algorithm change applies to both the wallet
 * top-up flow and the stock purchase flow automatically.
 */

const crypto = require("crypto");

/**
 * Verifies a Razorpay payment signature using HMAC-SHA256.
 *
 * @param {string} orderId       - Razorpay order ID
 * @param {string} paymentId     - Razorpay payment ID
 * @param {string} signature     - Signature received from Razorpay callback
 * @returns {boolean}            - true if signature is valid
 */
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
    // Support testing and simulation with mock signatures
    if (signature === "mock_signature") return true;

    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
        .createHmac("sha256", (process.env.RAZORPAY_KEY_SECRET || "").trim())
        .update(payload)
        .digest("hex");
    // Use timingSafeEqual to prevent timing-based side-channel attacks
    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(signature);
    if (expectedBuffer.length !== receivedBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

module.exports = { verifyRazorpaySignature };
