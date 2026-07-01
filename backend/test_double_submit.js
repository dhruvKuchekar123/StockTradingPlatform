/**
 * Double-submit test: fires the SAME wallet "confirm payment" request twice in
 * quick succession against the REAL WalletController.verifyPayment, backed by an
 * in-memory replica-set MongoDB (so Mongo transactions + the partial unique index
 * behave exactly as in production).
 *
 * Proves the wallet is credited only once.  Run: node test_double_submit.js
 */
const { MongoMemoryReplSet } = require("mongodb-memory-server");
const mongoose = require("mongoose");

process.env.TOKEN_KEY = "test";
process.env.RAZORPAY_KEY_ID = "test";
process.env.RAZORPAY_KEY_SECRET = "test";

const UserModel = require("./model/UserModel");
const WalletTransaction = require("./model/WalletTransactionModel");
const WalletController = require("./Controllers/WalletController");

// Minimal Express-like res double that records the outcome
function mockRes(label) {
  return {
    label,
    statusCode: 200,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(p) { this.body = p; return this; },
  };
}

(async () => {
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri(), { dbName: "test" });

  // Make sure the partial unique index (one SUCCESS per order) is actually built
  await WalletTransaction.syncIndexes();
  await UserModel.syncIndexes();

  // Seed: a user with ₹1000, and a PENDING demo top-up of ₹500 for one order
  const user = await UserModel.create({
    email: "race@example.com",
    username: "RaceTester",
    password: "x".repeat(20),
    walletBalance: 1000,
    isVerified: true,
    isApproved: true,
  });
  const ORDER_ID = "order_demo_racetest_123";
  await WalletTransaction.create({
    userId: user._id,
    razorpayOrderId: ORDER_ID,
    amount: 500,
    status: "PENDING",
  });

  const before = (await UserModel.findById(user._id)).walletBalance;
  console.log("Wallet balance BEFORE:", before);
  console.log("Top-up amount being confirmed (twice):", 500);

  // Two near-simultaneous confirm-payment calls for the SAME order.
  // Each sends a fresh random payment id, exactly like the demo simulator does.
  const makeReq = () => ({
    user: { id: user._id.toString() },
    body: {
      razorpay_order_id: ORDER_ID,
      razorpay_payment_id: "pay_demo_" + Math.random().toString(36).slice(2, 11),
      razorpay_signature: "mock_signature",
    },
  });

  const res1 = mockRes("call#1");
  const res2 = mockRes("call#2");
  await Promise.all([
    WalletController.verifyPayment(makeReq(), res1),
    WalletController.verifyPayment(makeReq(), res2),
  ]);

  const after = (await UserModel.findById(user._id)).walletBalance;

  console.log("\n--- Responses ---");
  console.log(res1.label, "→ HTTP", res1.statusCode, JSON.stringify(res1.body));
  console.log(res2.label, "→ HTTP", res2.statusCode, JSON.stringify(res2.body));

  const successRows = await WalletTransaction.countDocuments({ razorpayOrderId: ORDER_ID, status: "SUCCESS" });

  console.log("\n--- Result ---");
  console.log("Wallet balance AFTER :", after);
  console.log("Credited amount      :", after - before);
  console.log("SUCCESS tx rows for order:", successRows);
  console.log(
    (after - before) === 500 && successRows === 1
      ? "\n✅ PASS — credited exactly once despite two concurrent submits."
      : "\n❌ FAIL — double credit or inconsistent state."
  );

  await mongoose.disconnect();
  await replSet.stop();
  process.exit(0);
})().catch(async (e) => { console.error("Test error:", e); process.exit(1); });
