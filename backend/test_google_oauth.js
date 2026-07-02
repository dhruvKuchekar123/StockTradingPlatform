/**
 * Local test for the Google OAuth controller (POST /google-login).
 *
 * The route uses the ID-token flow (google-auth-library verifyIdToken), so we can
 * test it WITHOUT a real Google token by intercepting module loads:
 *   - google-auth-library -> a fake OAuth2Client we control (verify/throw at will)
 *   - ../model/UserModel   -> an in-memory fake user store
 *   - ../util/EmailService -> a no-op (not used by GoogleLogin, just avoids side effects)
 *
 * Run:  node test_google_oauth.js
 * No database, no network, no real Google credentials required.
 */

const Module = require("module");

// ── Env the controller/JWT util expect ─────────────────────────────────────────
process.env.GOOGLE_CLIENT_ID = "test-client-id.apps.googleusercontent.com";
process.env.TOKEN_KEY = "test-token-key-for-local-oauth-test";
process.env.NODE_ENV = "test";

// ── Test-controlled behavior for the fake Google verifier ───────────────────────
let googleBehavior = null; // set per-test: { payload } to resolve, or { throw: Error } to reject

// ── In-memory user store standing in for Mongoose UserModel ─────────────────────
const users = []; // each: { _id, email, username, role, walletBalance, isVerified, isApproved, save() }
function makeUser(doc) {
  return {
    _id: doc._id || "u_" + Math.random().toString(16).slice(2),
    role: "user",
    walletBalance: 0,
    ...doc,
    async save() { return this; },
  };
}
const FakeUserModel = {
  async findOne(query) {
    // Supports both exact { email } and the case-insensitive { email: { $regex, $options } }
    const q = query.email;
    if (q && typeof q === "object" && q.$regex) {
      const re = new RegExp(q.$regex, q.$options || "");
      return users.find((u) => re.test(u.email)) || null;
    }
    return users.find((u) => u.email === q) || null;
  },
  async create(doc) {
    const u = makeUser(doc);
    users.push(u);
    return u;
  },
};

// ── Fake google-auth-library ────────────────────────────────────────────────────
class FakeOAuth2Client {
  constructor() {}
  async verifyIdToken() {
    if (!googleBehavior) throw new Error("googleBehavior not set");
    if (googleBehavior.throw) throw googleBehavior.throw;
    return { getPayload: () => googleBehavior.payload };
  }
}

// ── Intercept require() for the three modules we want to fake ────────────────────
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "google-auth-library") return { OAuth2Client: FakeOAuth2Client };
  if (request.endsWith("model/UserModel")) return FakeUserModel;
  if (request.endsWith("util/EmailService")) return { sendEmail: async () => {}, sendOTPEmail: async () => {} };
  return originalLoad.apply(this, arguments);
};

// Load the real controller under test (with mocks in place)
const { GoogleLogin } = require("./Controllers/AuthController");
const jwt = require("jsonwebtoken");

// ── Minimal Express-like req/res doubles ────────────────────────────────────────
function mockRes() {
  return {
    statusCode: 200,
    body: null,
    cookies: {},
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
    cookie(name, value, opts) { this.cookies[name] = { value, opts }; return this; },
  };
}
async function callGoogleLogin(token) {
  const req = { body: { token } };
  const res = mockRes();
  await GoogleLogin(req, res, () => {});
  return res;
}

// ── Tiny assertion helpers ──────────────────────────────────────────────────────
let passed = 0, failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name}${detail ? "  — " + detail : ""}`); }
}

(async () => {
  console.log("\n=== Test 1: malformed / expired token → clean error, NOT a 500 crash ===");
  {
    // Simulate what google-auth-library throws for a bad/expired token
    googleBehavior = { throw: new Error("Wrong number of segments in token") };
    const res = await callGoogleLogin("this.is.not.a.real.jwt");
    check("returns a response (no unhandled crash)", res.body !== null);
    check("status is 400 (clean client error, not 500)", res.statusCode === 400, `got ${res.statusCode}`);
    check("success:false", res.body && res.body.success === false, JSON.stringify(res.body));
    check("does NOT set a JWT cookie", !res.cookies.token);
    console.log("   response:", JSON.stringify(res.body));

    // Expired-token variant surfaces the same clean path
    googleBehavior = { throw: new Error("Token used too late, expired") };
    const res2 = await callGoogleLogin("expired.token.here");
    check("expired token also → 400, no crash", res2.statusCode === 400 && res2.body.success === false, `got ${res2.statusCode}`);
  }

  console.log("\n=== Test 1b: network/timeout failure → 502 (upstream), not 500/crash ===");
  {
    const netErr = new Error("request to https://oauth2.googleapis.com failed, reason: connect ETIMEDOUT");
    netErr.code = "ETIMEDOUT";
    googleBehavior = { throw: netErr };
    const res = await callGoogleLogin("valid-looking-token");
    check("status is 502 (bad gateway)", res.statusCode === 502, `got ${res.statusCode}`);
    check("success:false with retry message", res.body && res.body.success === false);
    console.log("   response:", JSON.stringify(res.body));
  }

  console.log("\n=== Test 2: valid mock Google profile for an existing user → JWT cookie issued ===");
  {
    // Seed an existing (password-based) account. Different case to also prove case-insensitive linking.
    users.length = 0;
    users.push(makeUser({ _id: "existing123", email: "alice@example.com", username: "Alice", role: "user", walletBalance: 500, isVerified: false }));

    googleBehavior = { payload: { email: "Alice@Example.com", name: "Alice G", email_verified: true } };
    const res = await callGoogleLogin("valid-google-id-token");

    check("status 200", res.statusCode === 200, `got ${res.statusCode}`);
    check("success:true", res.body && res.body.success === true);
    check("no duplicate user created (still 1 user)", users.length === 1, `users=${users.length}`);
    check("logged into the EXISTING account", res.body && res.body.user && res.body.user.id === "existing123");
    check("JWT cookie 'token' is set", !!res.cookies.token, JSON.stringify(res.cookies));
    check("cookie is httpOnly", res.cookies.token && res.cookies.token.opts.httpOnly === true);

    // Verify the JWT is real and carries the right user id
    let decoded = null;
    try { decoded = jwt.verify(res.cookies.token.value, process.env.TOKEN_KEY); } catch (e) {}
    check("cookie JWT verifies with TOKEN_KEY and encodes user id", decoded && decoded.id === "existing123", JSON.stringify(decoded));
    check("existing account promoted to isVerified", users[0].isVerified === true);
    console.log("   response.user:", JSON.stringify(res.body.user));
  }

  console.log("\n=== Test 2b: unverified Google email → rejected (403), no cookie ===");
  {
    users.length = 0;
    googleBehavior = { payload: { email: "bob@example.com", name: "Bob", email_verified: false } };
    const res = await callGoogleLogin("token-with-unverified-email");
    check("status 403", res.statusCode === 403, `got ${res.statusCode}`);
    check("no user created", users.length === 0);
    check("no JWT cookie", !res.cookies.token);
    console.log("   response:", JSON.stringify(res.body));
  }

  console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed === 0 ? 0 : 1);
})();
