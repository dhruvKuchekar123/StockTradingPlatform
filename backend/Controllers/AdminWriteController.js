const UserModel = require("../model/UserModel");
const OrdersModel = require("../model/OrdersModel");
const WalletTransaction = require("../model/WalletTransactionModel");
const AdminAction = require("../model/AdminActionModel");
const FailedEmail = require("../model/FailedEmailModel");
const { resendFailedEmail } = require("../util/EmailService");

// Single audit choke-point. Every write handler below calls this — there is no
// path that mutates state without producing an adminActions record.
const logAdminAction = ({ adminId, action, targetUserId = null, reason, before = null, after = null, metadata = null }) =>
    AdminAction.create({ adminId, action, targetUserId, reason, before, after, metadata });

const requireReason = (req, res) => {
    const reason = (req.body && req.body.reason ? String(req.body.reason) : "").trim();
    if (!reason) {
        res.status(400).json({ success: false, message: "A reason is required for this admin action (it is written to the audit log)." });
        return null;
    }
    return reason;
};

// 1. Suspend / reactivate a user (blocks login; deletes no data)
module.exports.setUserSuspension = async (req, res) => {
    try {
        const reason = requireReason(req, res);
        if (reason === null) return;
        const suspend = req.body.suspend === true || req.body.suspend === "true";

        const user = await UserModel.findById(req.params.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const before = { suspended: !!user.suspended };
        user.suspended = suspend;
        await user.save();
        const after = { suspended: user.suspended };

        await logAdminAction({
            adminId: req.user._id,
            action: suspend ? "SUSPEND_USER" : "REACTIVATE_USER",
            targetUserId: user._id,
            reason, before, after,
        });

        return res.json({ success: true, message: suspend ? "User suspended." : "User reactivated.", suspended: user.suspended });
    } catch (error) {
        console.error("[Admin] setUserSuspension error:", error);
        return res.status(500).json({ success: false, message: "Error updating suspension state" });
    }
};

// 2. Manually cancel a stuck OPEN order
module.exports.cancelStuckOrder = async (req, res) => {
    try {
        const reason = requireReason(req, res);
        if (reason === null) return;

        const order = await OrdersModel.findById(req.params.orderId);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        const cancellable = ["OPEN", "PENDING", "TRIGGERED"];
        if (!cancellable.includes(order.status)) {
            return res.status(400).json({ success: false, message: `Only open orders can be cancelled (current status: ${order.status}).` });
        }

        const before = { status: order.status };
        order.status = "CANCELLED";
        order.cancelledAt = new Date();
        order.notes = `Admin cancelled (stuck order): ${reason}`;
        await order.save();
        const after = { status: order.status };

        await logAdminAction({
            adminId: req.user._id,
            action: "ADMIN_CANCEL_ORDER",
            targetUserId: order.userId,
            reason, before, after,
            metadata: { orderId: order._id },
        });

        return res.json({ success: true, message: "Order cancelled.", orderId: order._id });
    } catch (error) {
        console.error("[Admin] cancelStuckOrder error:", error);
        return res.status(500).json({ success: false, message: "Error cancelling order" });
    }
};

// 3. Reconcile a pending_reconciliation wallet entry (the ONLY wallet-adjust path)
module.exports.reconcileWallet = async (req, res) => {
    try {
        const reason = requireReason(req, res);
        if (reason === null) return;

        const tx = await WalletTransaction.findById(req.params.transactionId);
        if (!tx) return res.status(404).json({ success: false, message: "Transaction not found" });
        if (tx.status !== "PENDING_RECONCILIATION") {
            return res.status(400).json({ success: false, message: `This action only reconciles PENDING_RECONCILIATION entries (current: ${tx.status}).` });
        }

        const user = await UserModel.findById(tx.userId);
        if (!user) return res.status(404).json({ success: false, message: "Target user not found" });

        const before = { walletBalance: user.walletBalance, txStatus: tx.status };

        // Atomic credit of exactly the stuck amount, then mark the tx settled.
        const updated = await UserModel.findByIdAndUpdate(
            tx.userId,
            { $inc: { walletBalance: tx.amount } },
            { new: true }
        );
        tx.status = "SUCCESS";
        await tx.save();

        const after = { walletBalance: updated.walletBalance, txStatus: tx.status };

        await logAdminAction({
            adminId: req.user._id,
            action: "RECONCILE_WALLET",
            targetUserId: tx.userId,
            reason, before, after,
            metadata: { transactionId: tx._id, amount: tx.amount },
        });

        return res.json({ success: true, message: `Reconciled ₹${tx.amount}.`, walletBalance: updated.walletBalance });
    } catch (error) {
        console.error("[Admin] reconcileWallet error:", error);
        return res.status(500).json({ success: false, message: "Error reconciling wallet" });
    }
};

// 4. Resend a failed OTP / receipt email from the queue
module.exports.resendQueuedEmail = async (req, res) => {
    try {
        const reason = requireReason(req, res);
        if (reason === null) return;

        const result = await resendFailedEmail(req.params.emailId);
        if (!result.found) return res.status(404).json({ success: false, message: "Queued email not found" });

        // Best-effort: attribute to the target user if the recipient matches an account.
        let targetUserId = null;
        try {
            const u = await UserModel.findOne({ email: result.to });
            if (u) targetUserId = u._id;
        } catch (_) {}

        await logAdminAction({
            adminId: req.user._id,
            action: "RESEND_EMAIL",
            targetUserId,
            reason,
            before: result.before,
            after: result.after,
            metadata: { emailId: req.params.emailId, type: result.type, sent: result.sent },
        });

        return res.json({ success: true, sent: result.sent, message: result.sent ? "Email resent." : "Resend attempted but failed again; see queue.", error: result.error });
    } catch (error) {
        console.error("[Admin] resendQueuedEmail error:", error);
        return res.status(500).json({ success: false, message: "Error resending email" });
    }
};

// 5. Override a user's plan/tier (comp/support), no payment flow
module.exports.overrideUserPlan = async (req, res) => {
    try {
        const reason = requireReason(req, res);
        if (reason === null) return;

        const plan = String(req.body.plan || "").toUpperCase();
        const allowed = ["BASIC", "PRO", "PREMIUM"];
        if (!allowed.includes(plan)) {
            return res.status(400).json({ success: false, message: `Invalid plan. Allowed: ${allowed.join(", ")}` });
        }

        const user = await UserModel.findById(req.params.userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const before = { plan: user.plan };
        user.plan = plan;
        await user.save();
        const after = { plan: user.plan };

        await logAdminAction({
            adminId: req.user._id,
            action: "OVERRIDE_PLAN",
            targetUserId: user._id,
            reason, before, after,
        });

        return res.json({ success: true, message: `Plan set to ${plan}.`, plan });
    } catch (error) {
        console.error("[Admin] overrideUserPlan error:", error);
        return res.status(500).json({ success: false, message: "Error overriding plan" });
    }
};

// Read-only: the audit log itself (so admins can review who did what)
module.exports.getAdminActions = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
        const [total, actions] = await Promise.all([
            AdminAction.countDocuments({}),
            AdminAction.find({})
                .populate("adminId", "email")
                .populate("targetUserId", "email")
                .sort({ timestamp: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
        ]);
        return res.json({
            success: true,
            actions: actions.map((a) => ({
                id: a._id,
                admin: a.adminId ? a.adminId.email : "(unknown)",
                action: a.action,
                targetUser: a.targetUserId ? a.targetUserId.email : null,
                reason: a.reason,
                before: a.before,
                after: a.after,
                metadata: a.metadata,
                timestamp: a.timestamp,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("[Admin] getAdminActions error:", error);
        return res.status(500).json({ success: false, message: "Error fetching admin actions" });
    }
};
