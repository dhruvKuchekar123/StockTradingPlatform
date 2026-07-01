require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./model/UserModel");

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("DB connected");

        const result = await UserModel.updateMany({}, {
            $set: {
                isVerified: true,
                isApproved: true
            }
        });
        console.log("Updated users count:", result.modifiedCount);

        const users = await UserModel.find({});
        console.log("All users in DB:");
        users.forEach(u => console.log(`- ${u.email} (Verified: ${u.isVerified}, Approved: ${u.isApproved})`));
    } catch(err) {
        console.error("Error:", err);
    }
    process.exit();
}

run();
