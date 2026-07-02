/**
 * Forces an SMTP failure (transporter throws, like wrong Gmail creds) and runs
 * the REAL OrderMatcher.executeOrder + REAL EmailService to confirm:
 *   1. The trade still completes and lands in Holdings + Order History.
 *   2. The notification bell event (OrderEmitter 'order:executed') still fires.
 *   3. The failed receipt email is queued in failedEmails, not silently dropped.
 *
 * A real mongod can't be downloaded here, so the Mongoose models are in-memory
 * doubles. The code under test — OrderMatcher, EmailService.deliver, the retry
 * queue write — is the real, unmodified code.
 */
const path = require("path");
const Module = require("module");
const BACKEND = __dirname;

process.env.EMAIL_USER = "test@stockflow.dev";

// ── In-memory stores ────────────────────────────────────────────────────────
const users = new Map();
const holdings = [];
const positions = [];
const orders = [];
const failedEmails = [];

const q = (resolver) => ({ session() { return this; }, then(f, r) { return Promise.resolve().then(resolver).then(f, r); } });

// UserModel double
const UserModel = {
  findById(id) { return q(() => users.get(String(id)) || null); },
  async findOneAndUpdate(filter, update, opts) {
    const u = users.get(String(filter._id));
    if (!u) return null;
    if (filter.walletBalance && filter.walletBalance.$gte !== undefined && u.walletBalance < filter.walletBalance.$gte) return null;
    if (update.$inc) u.walletBalance = Math.round((u.walletBalance + update.$inc.walletBalance) * 100) / 100;
    return u;
  },
  async findByIdAndUpdate(id, update, opts) {
    const u = users.get(String(id));
    if (!u) return null;
    if (update.$inc) u.walletBalance = Math.round((u.walletBalance + update.$inc.walletBalance) * 100) / 100;
    return u;
  },
};

// Generic constructable model double (Holdings/Positions)
function makeCtorModel(store) {
  function M(doc) { Object.assign(this, doc); }
  M.prototype.save = async function () { if (!store.includes(this)) store.push(this); return this; };
  M.findOne = (query) => q(() => store.find((d) => Object.keys(query).every((k) => d[k] === query[k])) || null);
  M.deleteOne = async () => ({});
  return M;
}
const HoldingsModel = makeCtorModel(holdings);
const PositionsModel = makeCtorModel(positions);
const OrdersModel = makeCtorModel(orders);
OrdersModel.findById = (id) => q(() => orders.find((o) => o._id === id) || null);

// FailedEmail double — this IS the visible queue we inspect
const FailedEmail = {
  async create(doc) { const d = { _id: "fe_" + (failedEmails.length + 1), status: "PENDING", attempts: 1, ...doc }; failedEmails.push(d); return d; },
  find() { return { sort() { return this; }, limit() { return Promise.resolve(failedEmails.filter((f) => f.status === "PENDING")); } }; },
};

// Real mongoose, but transactions are no-ops (no replica set here)
const realMongoose = require(path.join(BACKEND, "node_modules/mongoose"));
realMongoose.startSession = async () => {
  let inTx = false;
  return { startTransaction() { inTx = true; }, async commitTransaction() { inTx = false; }, async abortTransaction() { inTx = false; }, endSession() {}, inTransaction() { return inTx; } };
};

// ── Intercept requires: force SMTP to throw + inject model doubles ───────────
const orig = Module._load;
Module._load = function (request) {
  if (request === "nodemailer") {
    return { createTransport: () => ({ sendMail: async () => { const e = new Error("Invalid login: 535-5.7.8 Username and Password not accepted"); e.code = "EAUTH"; throw e; } }) };
  }
  if (request.endsWith("model/UserModel")) return UserModel;
  if (request.endsWith("model/HoldingModel")) return HoldingsModel;
  if (request.endsWith("model/PositionsModel")) return PositionsModel;
  if (request.endsWith("model/OrdersModel")) return OrdersModel;
  if (request.endsWith("model/FailedEmailModel")) return FailedEmail;
  return orig.apply(this, arguments);
};

const OrderEmitter = require(path.join(BACKEND, "events/OrderEmitter"));
const { executeOrder } = require(path.join(BACKEND, "engine/OrderMatcher"));

(async () => {
  // Seed a buyer with ₹100,000
  users.set("u1", { _id: "u1", email: "buyer@example.com", walletBalance: 100000 });

  // A market BUY order (not yet paid → executeOrder will debit + create holding)
  const order = { _id: "ord_1", userId: "u1", symbol: "RELIANCE", qty: 5, side: "BUY", orderType: "MARKET", paymentVerified: false, status: "PENDING", save: async function () { if (!orders.includes(this)) orders.push(this); return this; } };
  await order.save();

  // Listen for the bell event on the REAL emitter
  let bellFired = null;
  OrderEmitter.on("order:executed", (o) => { bellFired = o; console.log(`[BELL] order:executed received → ${o.side} ${o.qty} ${o.symbol} @ ${o.executedPrice} (status ${o.status})`); });

  console.log("Executing BUY of 5 RELIANCE @ ₹2900 with SMTP FORCED TO FAIL...\n");
  await executeOrder(order, 2900);

  // Give the fire-and-forget receipt email a tick to fail + enqueue
  await new Promise((r) => setTimeout(r, 150));

  console.log("\n=== 1. Trade completed? ===");
  console.log("Order status         :", order.status);
  const hist = orders.find((o) => o._id === "ord_1");
  console.log("In Order History     :", !!hist, "→", hist ? `${hist.side} ${hist.qty} ${hist.symbol} status=${hist.status} px=${hist.executedPrice}` : "N/A");
  const hold = holdings.find((h) => h.userId === "u1" && h.name === "RELIANCE");
  console.log("In Holdings          :", !!hold, "→", hold ? `${hold.name} qty=${hold.qty} avg=${hold.avg}` : "N/A");
  console.log("Wallet after debit   :", users.get("u1").walletBalance, "(was 100000, -14500)");

  console.log("\n=== 2. Bell fired? ===");
  console.log("Bell event received  :", !!bellFired, bellFired ? `(order ${bellFired._id})` : "");

  console.log("\n=== 3. Failed email queued (not dropped)? ===");
  console.log("failedEmails rows    :", failedEmails.length);
  if (failedEmails.length) console.log("queued record        :", JSON.stringify({ to: failedEmails[0].to, type: failedEmails[0].type, status: failedEmails[0].status, attempts: failedEmails[0].attempts, lastError: failedEmails[0].lastError }, null, 2));

  const pass = order.status === "EXECUTED" && !!hold && !!bellFired && failedEmails.length === 1 && failedEmails[0].type === "BUY_RECEIPT";
  console.log("\n" + (pass ? "✅ PASS — trade completed + bell fired + receipt safely queued despite SMTP failure." : "❌ FAIL"));
  process.exit(pass ? 0 : 1);
})().catch((e) => { console.error("Harness error:", e); process.exit(1); });
