/**
 * Forces a Yahoo Finance failure (simulated HTTP 429 rate-limit) and runs the
 * REAL PriceService -> PricePoller -> PriceSocket pipeline with a REAL WebSocket
 * client connected, to prove:
 *   1. The mock fallback kicks in and the poller does NOT crash.
 *   2. The isMockData flag actually reaches the WebSocket payload.
 *
 * Only two things are faked: the yahoo-finance2 library (made to throw, like a
 * rate limit), and HoldingModel.distinct (to avoid needing MongoDB at startup).
 * Everything else — PriceService, PricePoller, PriceSocket — is the real code.
 */
const Module = require("module");
const http = require("http");

process.env.PRICE_PROVIDER = "yahoo";
process.env.TOKEN_KEY = "test-secret";

// ── Force Yahoo to fail exactly like a rate limit would ──────────────────────
const orig = Module._load;
Module._load = function (request) {
  if (request === "yahoo-finance2") {
    return {
      default: {
        quote: async () => {
          const e = new Error("Request failed with status code 429 (Too Many Requests)");
          e.response = { status: 429 };
          throw e;
        },
      },
    };
  }
  if (request.endsWith("model/HoldingModel")) {
    return { distinct: async () => [] }; // no DB needed
  }
  return orig.apply(this, arguments);
};

const jwt = require("jsonwebtoken");
const { WebSocket } = require("ws");
const PriceService = require("./services/PriceService");
const { initPriceSocket } = require("./websocket/PriceSocket");
const Poller = require("./jobs/PricePoller");

(async () => {
  // --- Part 1: direct proof the fallback returns mock data without throwing ---
  console.log("=== Part 1: PriceService with Yahoo forced to 429 ===");
  const direct = await PriceService.fetchPrices(["RELIANCE", "TCS"]);
  console.log("fetchPrices returned (did NOT throw):");
  console.log(JSON.stringify(direct, null, 2));

  // --- Part 2: end-to-end through the real WebSocket ---
  console.log("\n=== Part 2: real WebSocket client receiving a poller broadcast ===");
  const server = http.createServer();
  initPriceSocket(server);
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;

  const token = jwt.sign({ id: "test-user-1" }, process.env.TOKEN_KEY);
  const client = new WebSocket(`ws://127.0.0.1:${port}/ws/prices?token=${token}`);

  let pollerCrashed = false;
  const done = new Promise((resolve) => {
    client.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "INITIAL_PRICES") {
        console.log("[client] got INITIAL_PRICES, subscribing to RELIANCE...");
        client.send(JSON.stringify({ type: "SUBSCRIBE", symbols: ["RELIANCE"] }));
        // Kick the real poller AFTER the server has processed our SUBSCRIBE
        // (which adds RELIANCE to activeSymbols); otherwise the immediate tick
        // fires on an empty symbol set and returns early.
        setTimeout(() => {
          Poller.startPoller().catch((e) => { pollerCrashed = true; console.error("POLLER THREW:", e); });
        }, 600);
      } else if (msg.type === "PRICE_UPDATE") {
        console.log("[client] got PRICE_UPDATE payload:");
        console.log(JSON.stringify(msg, null, 2));
        resolve(msg);
      }
    });
  });

  const received = await Promise.race([
    done,
    new Promise((r) => setTimeout(() => r(null), 8000)),
  ]);

  console.log("\n=== Verdict ===");
  console.log("Poller crashed?              :", pollerCrashed);
  const rel = received && received.data && received.data.RELIANCE;
  console.log("WS payload contained RELIANCE:", !!rel);
  console.log("isMockData present & true?   :", rel ? rel.isMockData === true : "N/A");
  console.log(
    !pollerCrashed && rel && rel.isMockData === true
      ? "\n✅ PASS — fallback engaged, poller survived, isMockData=true reached the client."
      : "\n❌ FAIL"
  );

  Poller.stopPoller();
  client.close();
  server.close();
  process.exit(0);
})().catch((e) => { console.error("Harness error:", e); process.exit(1); });
