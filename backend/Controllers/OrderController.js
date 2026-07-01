const OrdersModel = require('../model/OrdersModel');
const HoldingsModel = require('../model/HoldingModel');
const UserModel = require('../model/UserModel');
const CacheService = require('../services/CacheService');
const BrokerService = require('../services/BrokerService');
const { executeOrder } = require('../engine/OrderMatcher');
const mongoose = require('mongoose');

module.exports.placeOrder = async (req, res) => {
    // 1. Idempotency Check
    const idempotencyKey = req.body.idempotencyKey || req.headers['x-idempotency-key'];
    if (idempotencyKey) {
        const existingOrder = await OrdersModel.findOne({ idempotencyKey });
        if (existingOrder) {
            console.log(`[Order Controller] Duplicate order detected for key: ${idempotencyKey}`);
            return res.json({ 
                success: true, 
                orderId: existingOrder._id, 
                status: existingOrder.status, 
                message: "Duplicate order placement prevented." 
            });
        }
    }

    try {
        const { symbol, qty, orderType, side, limitPrice, triggerPrice, gttCondition, gttExpiry } = req.body;
        const userId = req.user.id;

        // Validation
        if (!symbol || typeof symbol !== 'string') return res.status(400).json({ success: false, message: 'Invalid symbol' });
        if (!qty || qty <= 0 || !Number.isInteger(qty)) return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
        
        if (orderType === 'LIMIT' && (!limitPrice || limitPrice <= 0)) {
            return res.status(400).json({ success: false, message: 'Valid limit price required for LIMIT order' });
        }
        if (orderType === 'SL' && (!triggerPrice || triggerPrice <= 0)) {
            return res.status(400).json({ success: false, message: 'Valid trigger price required for SL order' });
        }
        if (orderType === 'GTT') {
            if (!limitPrice || limitPrice <= 0 || !triggerPrice || triggerPrice <= 0) {
                return res.status(400).json({ success: false, message: 'Both limit and trigger price required for GTT' });
            }
            if (!['ABOVE', 'BELOW'].includes(gttCondition)) {
                return res.status(400).json({ success: false, message: 'Valid GTT condition required' });
            }
            if (!gttExpiry || new Date(gttExpiry) <= new Date()) {
                return res.status(400).json({ success: false, message: 'GTT expiry must be a future date' });
            }
        }

        // Get current price from cache
        const priceData = await CacheService.getPrice(symbol);
        const ltp = priceData ? priceData.price : 100.0;

        let executionPrice = ltp;
        if (orderType === 'LIMIT' || orderType === 'GTT') {
            executionPrice = limitPrice;
        } else if (orderType === 'SL') {
            executionPrice = triggerPrice;
        }

        const fee = 20.00; // Flat ₹20 fee in INR
        const orderValue = executionPrice * qty;
        const totalCost = orderValue + fee;

        // Balance check for BUY
        if (side === 'BUY') {
            const user = await UserModel.findById(userId);
            if (!user) return res.status(404).json({ success: false, message: "User not found" });
            if (user.walletBalance < totalCost) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient wallet balance. Required: ₹${totalCost.toFixed(2)} (inc. ₹${fee} fee), Available: ₹${(user.walletBalance || 0).toFixed(2)}` 
                });
            }
        }

        // Sell validation — scoped by userId
        if (side === 'SELL') {
            const holding = await HoldingsModel.findOne({ userId, name: symbol });
            if (!holding || holding.qty < qty) {
                return res.status(400).json({ success: false, message: 'Insufficient holdings for SELL order.' });
            }
        }

        // --- Start MongoDB Session & Transaction ---
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // A. Debit wallet (BUY) or Deduct holdings (SELL)
            if (side === 'BUY') {
                // Atomic check-and-debit: the { walletBalance: >= cost } guard and the
                // decrement happen in ONE operation, so two rapid double-submits cannot
                // both pass the check and spend the same rupee twice. The second update
                // matches no document and throws.
                const debitCost = Math.round(totalCost * 100) / 100;
                const debitedUser = await UserModel.findOneAndUpdate(
                    { _id: userId, walletBalance: { $gte: debitCost } },
                    { $inc: { walletBalance: -debitCost } },
                    { new: true, session }
                );
                if (!debitedUser) {
                    throw new Error("Insufficient wallet balance at transaction start.");
                }
            } else if (side === 'SELL') {
                // Scope by userId — deduct from this user's holdings only
                const holding = await HoldingsModel.findOne({ userId, name: symbol }).session(session);
                if (!holding || holding.qty < qty) {
                    throw new Error("Insufficient holdings at transaction start.");
                }
                holding.qty -= qty;
                if (holding.qty === 0) {
                    await HoldingsModel.deleteOne({ _id: holding._id }).session(session);
                } else {
                    await holding.save({ session });
                }
            }

            // B. Call Broker API
            const brokerOrderId = await BrokerService.placeOrder({
                userId,
                symbol,
                qty,
                side,
                orderType,
                price: executionPrice
            });

            // C. Log the order in DB
            const newOrder = new OrdersModel({
                userId,
                symbol,
                qty,
                orderType,
                side,
                limitPrice,
                triggerPrice,
                gttCondition,
                gttExpiry,
                brokerOrderId,
                idempotencyKey,
                fee,
                paymentVerified: true, // Wallet balance is verified & debited
                status: orderType === 'MARKET' ? 'PENDING' : 'OPEN'
            });

            await newOrder.save({ session });

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            // D. If MARKET order, trigger immediate execution
            if (orderType === 'MARKET') {
                await executeOrder(newOrder, ltp);
                const updatedOrder = await OrdersModel.findById(newOrder._id);
                return res.json({ 
                    success: true, 
                    orderId: newOrder._id, 
                    status: updatedOrder.status, 
                    executedPrice: ltp,
                    brokerOrderId
                });
            }

            return res.json({ 
                success: true, 
                orderId: newOrder._id, 
                status: newOrder.status,
                brokerOrderId
            });

        } catch (txError) {
            console.error("[Order Controller] Transaction aborted, rolling back:", txError.message);
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({ success: false, message: "Order execution failed (rolled back): " + txError.message });
        }

    } catch (err) {
        console.error("Place Order Server Error:", err);
        res.status(500).json({ success: false, message: "Server error placing order" });
    }
};

module.exports.getOpenOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const openOrders = await OrdersModel.find({ userId, status: { $in: ['OPEN', 'PENDING', 'TRIGGERED'] } }).sort({ placedAt: -1 });
        res.json({ success: true, orders: openOrders });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching open orders" });
    }
};

module.exports.getOrderHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, symbol, side, type } = req.query;

        const query = { userId, status: { $in: ['EXECUTED', 'CANCELLED', 'REJECTED'] } };
        if (symbol) query.symbol = new RegExp(symbol, 'i');
        if (side && side !== 'ALL') query.side = side;
        if (type && type !== 'ALL') query.orderType = type;

        const orders = await OrdersModel.find(query)
            .sort({ placedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await OrdersModel.countDocuments(query);

        res.json({
            success: true,
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalRecords: count
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching order history" });
    }
};

module.exports.getOrderDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const order = await OrdersModel.findOne({ _id: req.params.orderId, userId });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching order detail" });
    }
};

module.exports.cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const order = await OrdersModel.findOne({ _id: req.params.orderId, userId });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (!['OPEN', 'PENDING', 'TRIGGERED'].includes(order.status)) {
            return res.status(400).json({ success: false, message: 'Order cannot be cancelled in current state' });
        }

        order.status = 'CANCELLED';
        order.cancelledAt = new Date();
        order.notes = "Cancelled by user";
        await order.save();

        // Restore holding if it was a SELL (scoped by userId)
        if (order.side === 'SELL') {
            let holding = await HoldingsModel.findOne({ userId, name: order.symbol });
            if (holding) {
                holding.qty += order.qty;
                await holding.save();
            } else {
                holding = new HoldingsModel({
                    userId,
                    name: order.symbol,
                    qty: order.qty,
                    avg: order.executedPrice || 0,
                    price: 0,
                    net: "+0.00%",
                    day: "+0.00%"
                });
                await holding.save();
            }
        }

        // Refund wallet balance if it was a BUY (and we debited it at placement)
        if (order.side === 'BUY') {
            const user = await UserModel.findById(userId);
            if (user) {
                const executionPrice = order.limitPrice || order.triggerPrice || 0;
                const refundAmount = (executionPrice * order.qty) + (order.fee || 0);
                user.walletBalance = Math.round((user.walletBalance + refundAmount) * 100) / 100;
                await user.save();
            }
        }

        res.json({ success: true, message: 'Order cancelled', orderId: order._id });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error cancelling order" });
    }
};
