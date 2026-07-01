const mongoose = require('mongoose');
const OrdersModel = require('../model/OrdersModel');
const UserModel = require('../model/UserModel');
const HoldingsModel = require('../model/HoldingModel');
const PositionsModel = require('../model/PositionsModel');
const { priceEmitter } = require('../jobs/PricePoller');
const OrderEmitter = require('../events/OrderEmitter');
const { sendPaymentReceiptEmail, sendSellReceiptEmail } = require('../util/EmailService');

const matchOrders = async (priceData) => {
    for (const symbol in priceData) {
        const ltp = priceData[symbol].price;
        await checkLimitOrders(symbol, ltp);
        await checkStopLossOrders(symbol, ltp);
        await checkGTTOrders(symbol, ltp);
    }
};

const checkLimitOrders = async (symbol, ltp) => {
    const openOrders = await OrdersModel.find({ symbol, orderType: 'LIMIT', status: 'OPEN' });
    for (const order of openOrders) {
        if (order.side === 'BUY' && ltp <= order.limitPrice) {
            await executeOrder(order, ltp);
        } else if (order.side === 'SELL' && ltp >= order.limitPrice) {
            await executeOrder(order, ltp);
        }
    }
};

const checkStopLossOrders = async (symbol, ltp) => {
    const openOrders = await OrdersModel.find({ symbol, orderType: 'SL', status: 'OPEN' });
    for (const order of openOrders) {
        let triggered = false;
        if (order.side === 'SELL' && ltp <= order.triggerPrice) {
            triggered = true;
        } else if (order.side === 'BUY' && ltp >= order.triggerPrice) {
            triggered = true;
        }

        if (triggered) {
            order.status = 'TRIGGERED';
            await order.save();
            // In SL, trigger converts it to a market order immediately executed at ltp
            await executeOrder(order, ltp);
        }
    }
};

const checkGTTOrders = async (symbol, ltp) => {
    const openOrders = await OrdersModel.find({ 
        symbol, 
        orderType: 'GTT', 
        status: 'OPEN',
        gttExpiry: { $gt: new Date() } 
    });

    for (const order of openOrders) {
        let triggered = false;
        if (order.gttCondition === 'ABOVE' && ltp >= order.triggerPrice) {
            triggered = true;
        } else if (order.gttCondition === 'BELOW' && ltp <= order.triggerPrice) {
            triggered = true;
        }

        if (triggered) {
            order.status = 'TRIGGERED';
            await order.save();

            // Create a new LIMIT order
            const newLimitOrder = new OrdersModel({
                userId: order.userId,
                symbol: order.symbol,
                qty: order.qty,
                side: order.side,
                orderType: 'LIMIT',
                limitPrice: order.limitPrice,
                status: 'OPEN',
                notes: 'Created from GTT #' + order._id
            });
            await newLimitOrder.save();

            // Run checkLimitOrders again to try immediate fill
            await checkLimitOrders(symbol, ltp);
        }
    }
};

const executeOrder = async (order, executedPrice) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await UserModel.findById(order.userId).session(session);
        const totalValue = executedPrice * order.qty;

        if (order.side === 'BUY') {
            // Deduct funds if not already verified by Razorpay
            if (!order.paymentVerified) {
                if (user.walletBalance < totalValue) {
                    throw new Error("Insufficient wallet balance for execution");
                }
                user.walletBalance -= totalValue;
                await user.save({ session });
            }

            // Upsert Holdings — scoped by userId to prevent cross-user data corruption
            let holding = await HoldingsModel.findOne({ userId: order.userId, name: order.symbol }).session(session);
            if (holding) {
                const oldTotal = holding.qty * holding.avg;
                holding.qty += order.qty;
                holding.avg = (oldTotal + totalValue) / holding.qty;
                holding.price = executedPrice;
                await holding.save({ session });
            } else {
                holding = new HoldingsModel({
                    userId: order.userId,
                    name: order.symbol,
                    qty: order.qty,
                    avg: executedPrice,
                    price: executedPrice,
                    net: "+0.00%",
                    day: "+0.00%",
                });
                await holding.save({ session });
            }

            // Insert into Positions
            const position = new PositionsModel({
                name: order.symbol,
                qty: order.qty,
                avg: executedPrice,
                price: executedPrice,
                net: "+0.00%",
                day: "+0.00%",
                isLoss: false
            });
            await position.save({ session });

            // Try sending BUY receipt email
            try {
                await sendPaymentReceiptEmail(user.email, order.symbol, order.qty, executedPrice);
            } catch (err) {
                console.error("Failed to send buy receipt email:", err.message);
            }

        } else if (order.side === 'SELL') {
            // Holdings are already deducted at placement in placeOrder, so we only credit funds here
            user.walletBalance = Math.round((user.walletBalance + totalValue) * 100) / 100;
            await user.save({ session });

            // Try sending SELL receipt email
            try {
                await sendSellReceiptEmail(user.email, order.symbol, order.qty, executedPrice);
            } catch (err) {
                console.error("Failed to send sell receipt email:", err.message);
            }
        }

        order.status = 'EXECUTED';
        order.executedPrice = executedPrice;
        order.executedAt = new Date();
        await order.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Emit for websocket
        OrderEmitter.emit('order:executed', order);
        console.log(`[Matcher] Executed ${order.side} order ${order._id} for ${order.symbol} at ${executedPrice}`);

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        
        order.status = 'REJECTED';
        order.notes = err.message || "Execution failed";
        order.cancelledAt = new Date();
        await order.save();
        
        console.error(`[Matcher] Order ${order._id} rejected: ${err.message}`);
    }
};

// Initialize listener
priceEmitter.on('price:update', async (priceData) => {
    try {
        await matchOrders(priceData);
    } catch (err) {
        console.error("[Matcher] Error matching orders:", err);
    }
});

module.exports = {
    executeOrder, // exporting for direct market order execution
    matchOrders
};
