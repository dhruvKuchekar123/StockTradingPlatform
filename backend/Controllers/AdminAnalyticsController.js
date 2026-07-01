const mongoose = require("mongoose");
const UserModel = require("../model/UserModel");
const OrdersModel = require("../model/OrdersModel");
const WalletTransaction = require("../model/WalletTransactionModel");
const FailedEmail = require("../model/FailedEmailModel");
const CacheService = require("../services/CacheService");
const { getGTTJobStatus } = require("../jobs/GTTExpiryJob");

// Clamp pagination so an admin can never "load all users at once".
const paginate = (req, defaultLimit = 20, maxLimit = 100) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || defaultLimit, 1), maxLimit);
    return { page, limit, skip: (page - 1) * limit };
};

const kycStatus = (u) => {
    const b = u.bankDetails || {};
    return b.accountNumber && b.ifscCode ? "COMPLETE" : "INCOMPLETE";
};
const accountStatus = (u) => {
    if (!u.isVerified) return "UNVERIFIED";
    if (!u.isApproved) return "PENDING_APPROVAL";
    return "ACTIVE";
};

// 1. Paginated users list
module.exports.getUsers = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req);
        const search = (req.query.search || "").trim();
        const query = {};
        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            query.email = { $regex: escaped, $options: "i" };
        }

        const [total, users] = await Promise.all([
            UserModel.countDocuments(query),
            UserModel.find(query)
                .select("email createdAt plan isVerified isApproved bankDetails lastLogin walletBalance role")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        return res.json({
            success: true,
            users: users.map((u) => ({
                id: u._id,
                email: u.email,
                signupDate: u.createdAt,
                plan: u.plan,
                accountStatus: accountStatus(u),
                kyc: kycStatus(u),
                lastLogin: u.lastLogin,
                walletBalance: u.walletBalance,
                role: u.role,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("[Admin] getUsers error:", error);
        return res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

// 2. Orders overview across ALL users, filterable by status group + order type
module.exports.getOrdersOverview = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req);
        const query = {};

        // Friendly status groups map to the underlying lifecycle states.
        const statusGroups = {
            open: ["OPEN", "PENDING", "TRIGGERED"],
            filled: ["EXECUTED"],
            cancelled: ["CANCELLED", "REJECTED"],
        };
        const statusParam = (req.query.status || "").toLowerCase();
        if (statusGroups[statusParam]) {
            query.status = { $in: statusGroups[statusParam] };
        } else if (req.query.status) {
            query.status = req.query.status.toUpperCase(); // allow a raw state too
        }

        if (req.query.orderType) {
            query.orderType = req.query.orderType.toUpperCase(); // MARKET | LIMIT | SL | GTT
        }

        const [total, orders] = await Promise.all([
            OrdersModel.countDocuments(query),
            OrdersModel.find(query)
                .populate("userId", "email")
                .sort({ placedAt: -1 })
                .skip(skip)
                .limit(limit),
        ]);

        return res.json({
            success: true,
            orders: orders.map((o) => ({
                id: o._id,
                user: o.userId ? o.userId.email : "(deleted)",
                symbol: o.symbol,
                side: o.side,
                qty: o.qty,
                orderType: o.orderType,
                status: o.status,
                price: o.executedPrice || o.limitPrice || o.triggerPrice || null,
                placedAt: o.placedAt,
                executedAt: o.executedAt,
            })),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            filters: { status: statusParam || "all", orderType: req.query.orderType || "all" },
        });
    } catch (error) {
        console.error("[Admin] getOrdersOverview error:", error);
        return res.status(500).json({ success: false, message: "Error fetching orders overview" });
    }
};

// 3. Wallet / transactions overview
module.exports.getWalletOverview = async (req, res) => {
    try {
        const { page, limit, skip } = paginate(req, 25);

        const balanceAgg = await UserModel.aggregate([
            { $group: { _id: null, total: { $sum: "$walletBalance" }, count: { $sum: 1 } } },
        ]);
        const totalPlatformBalance = balanceAgg.length ? Math.round(balanceAgg[0].total * 100) / 100 : 0;

        const [total, recent, pendingReconciliation] = await Promise.all([
            WalletTransaction.countDocuments({}),
            WalletTransaction.find({})
                .populate("userId", "email")
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit),
            // The daily-check list from Feature 2: payments confirmed but not yet credited.
            WalletTransaction.find({ status: "PENDING_RECONCILIATION" })
                .populate("userId", "email")
                .sort({ timestamp: -1 }),
        ]);

        const mapTx = (t) => ({
            id: t._id,
            user: t.userId ? t.userId.email : "(deleted)",
            type: "DEPOSIT", // only add-funds top-ups are recorded here; no withdrawal flow exists yet
            amount: t.amount,
            status: t.status,
            razorpayOrderId: t.razorpayOrderId,
            razorpayPaymentId: t.razorpayPaymentId,
            date: t.timestamp,
        });

        return res.json({
            success: true,
            totalPlatformBalance,
            recentTransactions: recent.map(mapTx),
            pendingReconciliation: pendingReconciliation.map(mapTx),
            pendingReconciliationCount: pendingReconciliation.length,
            withdrawalsSupported: false, // surfaced explicitly: withdrawals are not implemented
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error("[Admin] getWalletOverview error:", error);
        return res.status(500).json({ success: false, message: "Error fetching wallet overview" });
    }
};

// 4. System health panel
module.exports.getSystemHealth = async (req, res) => {
    try {
        // DB connection
        const dbStates = { 0: "DISCONNECTED", 1: "CONNECTED", 2: "CONNECTING", 3: "DISCONNECTING" };
        const dbStatus = dbStates[mongoose.connection.readyState] || "UNKNOWN";

        // Price feed: live vs mock, inferred from the isMockData flag on cached prices
        let priceFeed = { mode: "UNKNOWN", symbols: 0, mockSymbols: 0, note: "No cached prices (cache empty or Redis down)" };
        try {
            const cached = await CacheService.getAllCachedPrices();
            const vals = Object.values(cached || {});
            if (vals.length > 0) {
                const mockSymbols = vals.filter((v) => v.isMockData === true).length;
                const mode = mockSymbols === 0 ? "LIVE" : mockSymbols === vals.length ? "MOCK" : "DEGRADED";
                priceFeed = { mode, symbols: vals.length, mockSymbols, note: null };
            }
        } catch (e) {
            priceFeed.note = "Failed to read cache: " + e.message;
        }

        // Failed / queued emails (Feature 4)
        const [queuedEmails, sentAfterRetry] = await Promise.all([
            FailedEmail.countDocuments({ status: "PENDING" }),
            FailedEmail.countDocuments({ status: "SENT" }),
        ]);

        // GTT expiry job last-run
        const gtt = getGTTJobStatus();

        return res.json({
            success: true,
            health: {
                database: { status: dbStatus },
                priceFeed,
                emails: { queued: queuedEmails, sentAfterRetry },
                gttExpiryJob: { lastRun: gtt.lastRun, lastExpiredCount: gtt.lastExpiredCount },
                serverTime: new Date(),
            },
        });
    } catch (error) {
        console.error("[Admin] getSystemHealth error:", error);
        return res.status(500).json({ success: false, message: "Error fetching system health" });
    }
};
