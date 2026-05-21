require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./model/UserModel");
const crypto = require("crypto");

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DB connected");

        // Clear previous users for clean demo
        await User.deleteMany({ email: { $in: ["admin@gmail.com", "dummyuser@gmail.com"] } });

        // 1. Create Admin
        await User.create({
            email: "admin@gmail.com",
            password: "password123",
            username: "AdminUser",
            isVerified: true,
            isApproved: true,
            role: "admin",
            bankDetails: { accountName: "Admin", accountNumber: "000", ifscCode: "000", bankName: "AdminBank" }
        });
        console.log("Created Admin: admin@gmail.com / password123");

        // 2. Create Dummy User
        await User.create({
            email: "dummyuser@gmail.com",
            password: "password123",
            username: "DummyTrader",
            isVerified: true, // Simulated email verification done!
            isApproved: false, // Needs Admin Approval!
            role: "user",
            walletBalance: 100000,
            bankDetails: { accountName: "Dummy", accountNumber: "123456", ifscCode: "HDFC001", bankName: "HDFC" }
        });
        console.log("Created Dummy User: dummyuser@gmail.com / password123");

    } catch(e) {
        console.log(e);
    }
    process.exit();
}
seed();
