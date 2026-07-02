const { getPendingUsers, approveUser, rejectUser, retryFailedEmails } = require("../Controllers/AdminController");
const { getUsers, getOrdersOverview, getWalletOverview, getSystemHealth, getFailedEmails } = require("../Controllers/AdminAnalyticsController");
const { setUserSuspension, cancelStuckOrder, reconcileWallet, resendQueuedEmail, overrideUserPlan, getAdminActions } = require("../Controllers/AdminWriteController");
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
router.get("/emails", userVerification, isAdmin, getFailedEmails);

// ─── Write actions — every one is behind userVerification + isAdmin AND writes
//     an adminActions audit entry inside the controller. ────────────────────────
router.post("/users/:userId/suspension", userVerification, isAdmin, setUserSuspension);
router.post("/orders/:orderId/cancel", userVerification, isAdmin, cancelStuckOrder);
router.post("/wallet/reconcile/:transactionId", userVerification, isAdmin, reconcileWallet);
router.post("/emails/:emailId/resend", userVerification, isAdmin, resendQueuedEmail);
router.post("/users/:userId/plan", userVerification, isAdmin, overrideUserPlan);
router.get("/actions", userVerification, isAdmin, getAdminActions);

module.exports = router;
