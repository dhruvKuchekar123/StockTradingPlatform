require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const { createServer } = require("http");
const { initPriceSocket } = require("./websocket/PriceSocket");
const { startPoller } = require("./jobs/PricePoller");

const HoldingsModel = require("./model/HoldingModel");
const PositionsModel = require("./model/PositionsModel");
const OrdersModel = require("./model/OrdersModel");


const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const cookieParser = require("cookie-parser");
const authRoute = require("./Routes/AuthRoute");
const paymentRoute = require("./Routes/PaymentRoute");
const adminRoute = require("./Routes/AdminRoute");
const marketRoute = require("./Routes/MarketRoute");
const sellRoute = require("./Routes/SellRoute");
const portfolioRoute = require("./Routes/PortfolioRoute");
const orderRoute = require("./Routes/OrderRoute");
const walletRoute = require("./Routes/WalletRoute");
const webhookRoute = require("./Routes/WebhookRoute");
const { startGTTExpiryJob } = require("./jobs/GTTExpiryJob");

const app = express();

// FORCING NODEMON RESTART to reload .env keys
require("dotenv").config();

app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      "http://localhost:3005",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
      "http://127.0.0.1:3005",
      process.env.FRONTEND_URL,
      process.env.DASHBOARD_URL
    ].filter(Boolean),
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use("/", authRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/admin", adminRoute);
app.use("/api/market", marketRoute);
app.use("/api/sell", sellRoute);
app.use("/api/portfolio", portfolioRoute);
app.use("/api/orders", orderRoute);
app.use("/api/wallet", walletRoute);
app.use("/api/webhooks", webhookRoute);

app.get("/allHoldings", async (req, res) => {
  let allHoldings = await HoldingsModel.find();
  res.json(allHoldings);
});

app.get("/allPositions", async (req, res) => {
  let allPositions = await PositionsModel.find();
  res.json(allPositions);
});

const { userVerification } = require("./Middlewares/AuthMiddleware");
const MarketService = require("./util/MarketService");
const UserModel = require("./model/UserModel");

app.get("/api/user/profile", userVerification, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false });
        res.json({ success: true, walletBalance: user.walletBalance, username: user.username });
    } catch(err) {
        res.status(500).json({ success: false });
    }
});

// The /newOrder route was removed and split into /api/payments/verify and /api/sell/execute

const httpServer = createServer(app);
initPriceSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log("App started on port " + PORT + "!");
  mongoose.connect(uri).then(() => {
    console.log("DB started!");
    startPoller();
    startGTTExpiryJob();
  }).catch(err => {
    console.error("DB Connection Error:", err);
  });
});