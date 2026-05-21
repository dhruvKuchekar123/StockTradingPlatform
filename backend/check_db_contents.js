require("dotenv").config();
const mongoose = require("mongoose");
const HoldingModel = require("./model/HoldingModel");
const OrdersModel = require("./model/OrdersModel");
const UserModel = require("./model/UserModel");

async function checkDb() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DB connected");

        const holdings = await HoldingModel.find({});
        console.log("\n--- Holdings in DB ---");
        console.log(JSON.stringify(holdings, null, 2));

        const orders = await OrdersModel.find({}).sort({ _id: -1 }).limit(5);
        console.log("\n--- Latest 5 Orders in DB ---");
        console.log(JSON.stringify(orders, null, 2));

        const users = await UserModel.find({ email: "dummyuser@gmail.com" });
        console.log("\n--- Dummy User Info ---");
        console.log(JSON.stringify(users, null, 2));

    } catch(e) {
        console.error(e);
    }
    process.exit();
}

checkDb();
