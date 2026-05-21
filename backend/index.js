require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

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

const app = express();

// FORCING NODEMON RESTART to reload .env keys
require("dotenv").config();

app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/", authRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/admin", adminRoute);
app.use("/api/market", marketRoute);

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

app.post("/newOrder", userVerification, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!user.isApproved && user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Your account is pending admin approval." });
    }

    const isOpen = await MarketService.isMarketOpen();
    if (!isOpen) {
      return res.status(400).json({ success: false, message: "Market is currently closed." });
    }

    const { name: symbol, qty, mode } = req.body; 

    // Fetch live price securely from backend
    const livePrice = await MarketService.getLivePrice(symbol);
    const totalCost = livePrice * qty;

    if (mode === "BUY") {
      if (user.walletBalance < totalCost) {
        return res.status(400).json({ success: false, message: "Insufficient wallet balance." });
      }
      user.walletBalance -= totalCost;
      await user.save();

      // Add to holdings
      let holding = await HoldingsModel.findOne({ name: symbol });
      if (holding) {
        const oldTotal = holding.qty * holding.avg;
        const newTotal = Number(qty) * Number(livePrice);
        holding.qty += Number(qty);
        holding.avg = (oldTotal + newTotal) / holding.qty;
        holding.price = Number(livePrice);
        await holding.save();
      } else {
        holding = new HoldingsModel({
          name: symbol,
          qty: Number(qty),
          avg: Number(livePrice),
          price: Number(livePrice),
          net: "+0.00%",
          day: "+0.00%",
        });
        await holding.save();
      }
    } else if (mode === "SELL") {
      // Deduct from holdings
      let holding = await HoldingsModel.findOne({ name: symbol });
      if (!holding || holding.qty < Number(qty)) {
        return res.status(400).json({ success: false, message: `You do not own enough shares of ${symbol} to sell.` });
      }

      holding.qty -= Number(qty);
      if (holding.qty <= 0) {
        await HoldingsModel.deleteOne({ _id: holding._id });
      } else {
        await holding.save();
      }

      user.walletBalance += totalCost;
      await user.save();

      // Send Sell Email Notification
      const { sendSellReceiptEmail } = require("./util/EmailService");
      try {
        await sendSellReceiptEmail(user.email, symbol, qty, livePrice);
      } catch (e) {
        console.error("Sell email failed:", e);
      }
    }

    let newOrder = new OrdersModel({
      name: symbol,
      qty: qty,
      price: livePrice,
      mode: mode,
    });

    await newOrder.save();

    res.json({ success: true, message: `Order executed successfully at $${livePrice.toFixed(2)}` });
  } catch(error) {
    console.error("Order Execution Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to execute order. Check symbol validity." });
  }
});


app.listen(PORT, () => {
  console.log("App started!");
  mongoose.connect(uri);
  console.log("DB started!");
});