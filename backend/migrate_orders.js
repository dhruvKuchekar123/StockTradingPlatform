require('dotenv').config();
const mongoose = require('mongoose');
const OrdersModel = require('./model/OrdersModel');
const UserModel = require('./model/UserModel');

async function migrateOrders() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected.");

        // Find a fallback user in case we need one for old orders
        const fallbackUser = await UserModel.findOne();
        if (!fallbackUser) {
            console.error("No users found in database! Please create a user before migrating.");
            process.exit(1);
        }

        const fallbackUserId = fallbackUser._id;

        // Use find().lean() to get raw documents bypassing schema validation
        const oldOrders = await OrdersModel.collection.find({}).toArray();
        console.log(`Found ${oldOrders.length} existing orders to migrate.`);

        let migratedCount = 0;

        for (const order of oldOrders) {
            // Skip if already migrated (has symbol instead of name)
            if (order.symbol && order.orderType) {
                continue;
            }

            const updateDoc = {
                $set: {
                    symbol: order.name,
                    side: order.mode ? order.mode.toUpperCase() : 'BUY',
                    orderType: 'MARKET',
                    status: 'EXECUTED',
                    executedPrice: order.price,
                    executedAt: order.date || order._id.getTimestamp() || new Date(),
                    placedAt: order.date || order._id.getTimestamp() || new Date(),
                    paymentVerified: true, // Old orders are assumed to be paid
                    userId: order.userId || fallbackUserId // Old orders didn't have user, assign fallback
                },
                $unset: {
                    name: "",
                    price: "",
                    mode: "",
                    date: ""
                }
            };

            await OrdersModel.collection.updateOne({ _id: order._id }, updateDoc);
            migratedCount++;
        }

        console.log(`Migrated ${migratedCount} orders successfully.`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrateOrders();
