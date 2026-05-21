const { createTradeOrder, verifyPayment, verifyAndBuy } = require("../Controllers/PaymentController");
const { userVerification } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();

router.post("/create-order", userVerification, createTradeOrder);
router.post("/verify-payment", userVerification, verifyPayment);
router.post("/verify-and-buy", userVerification, verifyAndBuy);

module.exports = router;
