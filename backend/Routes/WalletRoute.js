const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { userVerification } = require("../Middlewares/AuthMiddleware");
const WalletController = require("../Controllers/WalletController");

// Rate limiters for critical payment endpoints
const walletLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per window
    message: { success: false, message: "Too many requests, please try again after 15 minutes." }
});

router.post("/create-order", userVerification, walletLimiter, WalletController.createOrder);
router.post("/verify-payment", userVerification, walletLimiter, WalletController.verifyPayment);
router.get("/balance", userVerification, WalletController.getWalletBalance);
router.get("/transactions", userVerification, WalletController.getWalletTransactions);

module.exports = router;
