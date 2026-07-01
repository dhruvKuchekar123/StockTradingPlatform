const { createRazorpayOrder, verifyPayment, verifyPaymentAndExecuteBuy, getPaymentStatus } = require("../Controllers/PaymentController");
const { userVerification } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();

router.post("/create-order", userVerification, createRazorpayOrder);
router.post("/verify-payment", userVerification, verifyPayment); // Keep old funds verify generic
router.post("/verify", userVerification, verifyPaymentAndExecuteBuy);
router.post("/verify-and-buy", userVerification, verifyPaymentAndExecuteBuy);
router.get("/status/:id", userVerification, getPaymentStatus);

module.exports = router;
