const express = require("express");
const router = express.Router();
const WebhookController = require("../Controllers/WebhookController");

router.post("/razorpay", WebhookController.handleWebhook);

module.exports = router;
