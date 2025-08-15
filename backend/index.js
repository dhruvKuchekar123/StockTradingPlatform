require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// ===== Models =====
const { HoldingModel } = require("./model/HoldingModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

// ===== Routes =====
const authRoute = require("./Routes/AuthRoute");

// ===== Environment Variables =====
const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

// ===== Create Express App =====
const app = express();

// ===== Middleware =====
app.use(
  cors({
    origin: ["http://localhost:3000"], // Adjust if frontend is deployed elsewhere
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// ===== Authentication Routes =====
app.use("/", authRoute);

// ===== Trading API Routes =====

// Get all holdings
app.get("/allHoldings", async (req, res) => {
  try {
    const allHoldings = await HoldingModel.find({});
    res.status(200).json(allHoldings);
  } catch (error) {
    console.error("❌ Error fetching holdings:", error);
    res.status(500).json({ error: "Error fetching holdings" });
  }
});

// Get all positions
app.get("/allPositions", async (req, res) => {
  try {
    const allPositions = await PositionsModel.find({});
    res.status(200).json(allPositions);
  } catch (error) {
    console.error("❌ Error fetching positions:", error);
    res.status(500).json({ error: "Error fetching positions" });
  }
});

// Create a new order
app.post("/newOrder", async (req, res) => {
  try {
    const { name, qty, price, mode } = req.body;

    if (!name || !qty || !price || !mode) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newOrder = new OrdersModel({ name, qty, price, mode });
    await newOrder.save();

    res.status(201).json({ message: "✅ Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    res.status(500).json({ error: "Error creating order" });
  }
});

// Seed sample holdings data
app.get("/seedHoldings", async (req, res) => {
  try {
    const sampleData = [
      { name: "BHARTIARTL", qty: 2, avg: 538.05, price: 541.15, net: "+0.58%", day: "+2.99%" },
      { name: "HDFCBANK", qty: 2, avg: 1383.4, price: 1522.35, net: "+10.04%", day: "+0.11%" },
    ];
    await HoldingModel.insertMany(sampleData);
    res.send("✅ Sample holdings inserted!");
  } catch (error) {
    console.error("❌ Error seeding holdings:", error);
    res.status(500).send("Error seeding holdings");
  }
});

// ===== Connect to MongoDB & Start Server =====
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
