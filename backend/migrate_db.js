const mongoose = require("mongoose");
require("dotenv").config();
const HoldingsModel = require("./model/HoldingModel");
const PositionsModel = require("./model/PositionsModel");

const holdings = [
  { name: "AAPL", qty: 2, avg: 150.00, price: 170.00, net: "+13.33%", day: "+2.99%", isLoss: false },
  { name: "TSLA", qty: 1, avg: 200.00, price: 180.00, net: "-10.00%", day: "-1.60%", isLoss: true },
  { name: "MSFT", qty: 5, avg: 380.00, price: 410.00, net: "+7.89%", day: "+0.80%", isLoss: false },
  { name: "AMZN", qty: 2, avg: 185.00, price: 175.00, net: "-5.40%", day: "-0.01%", isLoss: true },
];

const positions = [
  { product: "CNC", name: "NVDA", qty: 1, avg: 860.00, price: 850.00, net: "-1.16%", day: "-1.24%", isLoss: true },
  { product: "CNC", name: "GOOGL", qty: 2, avg: 140.00, price: 155.00, net: "+10.71%", day: "+1.35%", isLoss: false },
];

async function migrate() {
    await mongoose.connect(process.env.MONGO_URL);
    await HoldingsModel.deleteMany({});
    await PositionsModel.deleteMany({});
    await HoldingsModel.insertMany(holdings);
    await PositionsModel.insertMany(positions);
    console.log("Migration complete");
    process.exit();
}
migrate();
