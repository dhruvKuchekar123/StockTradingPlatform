const mongoose = require("mongoose");
const axios = require("axios");

const MONGO_URL = "mongodb://127.0.0.1:27018/stockflow?replicaSet=rs0";
const API_URL = "http://localhost:3002/api";

const UserModel = require("./model/UserModel");
const WalletTransaction = require("./model/WalletTransactionModel");
const HoldingsModel = require("./model/HoldingModel");
const PositionsModel = require("./model/PositionsModel");
const OrdersModel = require("./model/OrdersModel");
const AdminActionsModel = require("./model/AdminActionModel");

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    console.log("=== CONNECTING TO MONGO ===");
    await mongoose.connect(MONGO_URL);
    console.log("Connected to MongoDB replica set!");

    // Clean up past run
    const email = "e2etestuser@gmail.com";
    await UserModel.deleteOne({ email });
    await WalletTransaction.deleteMany({ userId: { $exists: true } });
    await HoldingsModel.deleteMany({ userId: { $exists: true } });
    await PositionsModel.deleteMany({ userId: { $exists: true } });
    await OrdersModel.deleteMany({ userId: { $exists: true } });
    await AdminActionsModel.deleteMany({});
    console.log("Cleaned up database collections.");

    let authToken = null;
    let userId = null;

    // 1. Signup Flow
    console.log("\n=== SCENARIO A: SIGNUP ===");
    const signupData = {
        email,
        password: "password123",
        username: "e2etestuser",
        bankDetails: {
            accountName: "Eee Test User",
            accountNumber: "9876543210",
            ifscCode: "HDFC0000240",
            bankName: "HDFCBank"
        }
    };
    
    const signupRes = await axios.post(`http://localhost:3002/signup`, signupData);
    console.log("Signup Response:", signupRes.data);
    if (!signupRes.data.success) {
        throw new Error("Signup failed!");
    }

    // Retrieve OTP from Database
    const userDoc = await UserModel.findOne({ email });
    const otp = userDoc.signupOTP;
    console.log(`Fetched OTP from database: ${otp}`);

    // Verify OTP
    const verifyRes = await axios.post(`http://localhost:3002/verify-otp`, { email, otp });
    console.log("Verify OTP Response:", verifyRes.data);
    if (!verifyRes.data.success) {
        throw new Error("OTP Verification failed!");
    }

    // Login
    const loginRes = await axios.post(`http://localhost:3002/login`, { email, password: "password123" });
    console.log("Login Response:", loginRes.data);
    if (!loginRes.data.success) {
        throw new Error("Login failed!");
    }
    authToken = loginRes.data.token;
    userId = userDoc._id.toString();
    console.log(`Authenticated. User ID: ${userId}, Token: ${authToken.substring(0, 15)}...`);

    const authHeaders = { headers: { Authorization: `Bearer ${authToken}` } };

    // 2. Add Funds & Concurrency double-submit protection
    console.log("\n=== SCENARIO B: ADD FUNDS & DOUBLE-SUBMIT IDEMPOTENCY ===");
    // Simulate a demo deposit by creating a PENDING transaction doc manually
    const orderId = "order_demo_" + Math.random().toString(36).slice(2, 15);
    await WalletTransaction.create({
        userId,
        razorpayOrderId: orderId,
        amount: 15000,
        status: "PENDING"
    });
    console.log("Deposit Order Created in DB:", orderId);

    // Trigger two verification requests in parallel (double-submit)
    console.log("Sending two concurrent verifyPayment requests...");
    const verifyPayload1 = {
        razorpay_order_id: orderId,
        razorpay_payment_id: "pay_demo_" + Math.random().toString(36).slice(2, 11),
        razorpay_signature: "sig_demo_1"
    };
    const verifyPayload2 = {
        razorpay_order_id: orderId,
        razorpay_payment_id: "pay_demo_" + Math.random().toString(36).slice(2, 11),
        razorpay_signature: "sig_demo_2"
    };

    const [v1, v2] = await Promise.allSettled([
        axios.post(`${API_URL}/wallet/verify-payment`, verifyPayload1, authHeaders),
        axios.post(`${API_URL}/wallet/verify-payment`, verifyPayload2, authHeaders)
    ]);

    console.log("Call 1 Response Status:", v1.status === "fulfilled" ? v1.value.status : "Rejected", v1.status === "fulfilled" ? JSON.stringify(v1.value.data) : v1.reason.message);
    console.log("Call 2 Response Status:", v2.status === "fulfilled" ? v2.value.status : "Rejected", v2.status === "fulfilled" ? JSON.stringify(v2.value.data) : v2.reason.message);

    // Verify wallet balance is exactly 15000 and only 1 SUCCESS transaction document exists
    const userBalanceCheck = await UserModel.findById(userId);
    console.log("Wallet Balance after double-submit:", userBalanceCheck.walletBalance);
    const txCount = await WalletTransaction.countDocuments({ razorpayOrderId: orderId, status: "SUCCESS" });
    console.log("SUCCESS transactions in DB for order:", txCount);
    
    if (userBalanceCheck.walletBalance !== 15000 || txCount !== 1) {
        throw new Error("Double-submit protection failed! Wallet balance credited multiple times or transaction missing.");
    }
    console.log("✅ Concurrency double-submit verification passed!");

    // 3. Buy MARKET Order
    console.log("\n=== SCENARIO C: BUY MARKET ORDER ===");
    // Place buy order
    const buyPayload = {
        symbol: "AAPL",
        qty: 10,
        orderType: "MARKET",
        side: "BUY"
    };
    const buyRes = await axios.post(`${API_URL}/orders/place`, buyPayload, authHeaders);
    console.log("Buy Order Placement Response:", buyRes.data);
    if (!buyRes.data.success) {
        throw new Error("Buy order placement failed!");
    }
    
    // Wait for matcher to process order
    await sleep(2000);

    // Verify holdings and positions
    const userBalanceAfterBuy = await UserModel.findById(userId);
    const holdings = await HoldingsModel.find({ userId });
    const positions = await PositionsModel.find({ userId });
    const orderDoc = await OrdersModel.findOne({ userId, symbol: "AAPL" });

    console.log("Wallet Balance after BUY:", userBalanceAfterBuy.walletBalance);
    console.log("Holdings in DB:", JSON.stringify(holdings));
    console.log("Positions in DB:", JSON.stringify(positions));
    console.log("Order Status in DB:", orderDoc.status, "Executed Price:", orderDoc.executedPrice);

    if (holdings.length === 0 || positions.length === 0 || orderDoc.status !== "EXECUTED") {
        throw new Error("Buy execution failed or holdings/positions not created scoped to userId!");
    }
    console.log("✅ MARKET BUY flow passed!");

    // 4. Sell MARKET Order
    console.log("\n=== SCENARIO D: SELL MARKET ORDER ===");
    const sellPayload = {
        symbol: "AAPL",
        qty: 10,
        price: orderDoc.executedPrice // fallback client price
    };
    const sellRes = await axios.post(`http://localhost:3002/api/sell/execute`, sellPayload, authHeaders);
    console.log("Sell Order Execution Response:", sellRes.data);
    if (!sellRes.data.success) {
        throw new Error("Sell execution failed!");
    }

    // Verify holdings and positions are cleared
    const userBalanceAfterSell = await UserModel.findById(userId);
    const holdingsAfterSell = await HoldingsModel.find({ userId });
    const positionsAfterSell = await PositionsModel.find({ userId });

    console.log("Wallet Balance after SELL:", userBalanceAfterSell.walletBalance);
    console.log("Holdings in DB after SELL:", JSON.stringify(holdingsAfterSell));
    console.log("Positions in DB after SELL:", JSON.stringify(positionsAfterSell));

    if (holdingsAfterSell.length !== 0 || positionsAfterSell.length !== 0) {
        throw new Error("Sell failed to clear holdings or positions!");
    }
    console.log("✅ MARKET SELL flow passed!");

    // 5. Admin Promotion & Suspension Flow
    console.log("\n=== SCENARIO E: ADMIN SUSPENSION FLOW ===");
    // Promote userDoc to admin role
    const testAdminEmail = "admin@gmail.com";
    const adminDoc = await UserModel.findOne({ email: testAdminEmail });
    if (!adminDoc) {
        throw new Error("Could not find seeded admin@gmail.com!");
    }
    adminDoc.role = "admin";
    await adminDoc.save();
    console.log("Promoted admin@gmail.com to admin role.");

    // Login as admin
    const adminLoginRes = await axios.post(`http://localhost:3002/login`, { email: testAdminEmail, password: "password123" });
    const adminToken = adminLoginRes.data.token;
    const adminHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

    // Suspend the e2e test user
    console.log(`Suspending user: ${userId} via admin...`);
    const suspendRes = await axios.post(`${API_URL}/admin/users/${userId}/suspension`, { suspend: true, reason: "E2E Testing user suspension" }, adminHeaders);
    console.log("Suspend Response:", suspendRes.data);

    // Verify user is suspended in DB
    const suspendedUserDoc = await UserModel.findById(userId);
    console.log("User suspended status in DB:", suspendedUserDoc.suspended);
    if (!suspendedUserDoc.suspended) {
        throw new Error("User suspension failed in database!");
    }

    // Verify adminActions contains audit row
    const auditRows = await AdminActionsModel.find({ adminId: adminDoc._id });
    console.log("Audit log rows for Admin:", JSON.stringify(auditRows));
    if (auditRows.length === 0) {
        throw new Error("Admin action audit log missing!");
    }

    // Verify suspended user cannot log in
    try {
        await axios.post(`http://localhost:3002/login`, { email, password: "password123" });
        throw new Error("Login succeeded for suspended user! Failure expected.");
    } catch (loginErr) {
        console.log("Suspended Login attempt response status:", loginErr.response ? loginErr.response.status : loginErr.message, "Response message:", loginErr.response ? JSON.stringify(loginErr.response.data) : "N/A");
        if (loginErr.response && loginErr.response.status === 403) {
            console.log("✅ Suspended user successfully blocked from logging in!");
        } else {
            throw new Error(`Suspended user was not blocked with 403: ${loginErr.message}`);
        }
    }

    console.log("\n=== ALL E2E VERIFICATION SCENARIOS PASSED ===");
}

run()
    .then(() => {
        mongoose.disconnect();
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ E2E VERIFICATION TEST FAILED:", err);
        mongoose.disconnect();
        process.exit(1);
    });
