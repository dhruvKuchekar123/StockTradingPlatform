const { getPendingUsers, approveUser, rejectUser, retryFailedEmails } = require("../Controllers/AdminController");
const { getUsers, getOrdersOverview, getWalletOverview, getSystemHealth } = require("../Controllers/AdminAnalyticsController");
const { adminVerification, userVerification, isAdmin } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();

router.get("/pending-users", adminVerification, getPendingUsers);
router.post("/approve-user/:userId", adminVerification, approveUser);
router.delete("/reject-user/:userId", adminVerification, rejectUser);
router.post("/retry-failed-emails", adminVerification, retryFailedEmails);

// ─── Read-only admin dashboards (protected by userVerification + isAdmin) ───────
router.get("/users", userVerification, isAdmin, getUsers);
router.get("/orders", userVerification, isAdmin, getOrdersOverview);
router.get("/wallet", userVerification, isAdmin, getWalletOverview);
router.get("/health", userVerification, isAdmin, getSystemHealth);

module.exports = router;
