const mongoose = require("mongoose");
const UserModel = require("../model/UserModel");
const HoldingsModel = require("../model/HoldingModel");
const OrdersModel = require("../model/OrdersModel");
const MarketService = require("../util/MarketService");
const PriceService = require("../services/PriceService");
const CacheService = require("../services/CacheService");
const { sendSellReceiptEmail } = require("../util/EmailService");

module.exports.executeSell = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;
        const { symbol, qty, price: clientPrice } = req.body;

        if (!symbol || !qty || Number(qty) <= 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Invalid symbol or quantity." });
        }

        const user = await UserModel.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // if (!user.isApproved && user.role !== "admin") { ... } // commented out for dev

        const isOpen = await MarketService.isMarketOpen();
        if (!isOpen) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Market is currently closed." });
        }

        // Fetch live price using PriceService (Yahoo Finance with mock fallback)
        let livePrice;
        try {
            const cached = await CacheService.getPrice(symbol);
            if (cached && cached.price) {
                livePrice = cached.price;
            } else {
                const priceData = await PriceService.fetchPrice(symbol);
                livePrice = priceData?.price;
            }
        } catch (err) {
            console.warn(`Failed to fetch live price for ${symbol}:`, err.message);
        }

        // Fallback to client-provided price if live fetch fails
        if (!livePrice || isNaN(livePrice) || livePrice <= 0) {
            if (clientPrice && !isNaN(clientPrice) && Number(clientPrice) > 0) {
                livePrice = Number(clientPrice);
                console.warn(`Using client-provided price for ${symbol}: ₹${livePrice}`);
            } else {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ success: false, message: "Could not determine price for " + symbol });
            }
        }

        const totalCredit = livePrice * Number(qty);

        // Deduct from holdings — scoped by userId to prevent cross-user contamination
        let holding = await HoldingsModel.findOne({ userId, name: symbol }).session(session);
        if (!holding || holding.qty < Number(qty)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: `You do not own enough shares of ${symbol} to sell.` });
        }

        holding.qty -= Number(qty);
        if (holding.qty <= 0) {
            await HoldingsModel.deleteOne({ _id: holding._id }).session(session);
        } else {
            await holding.save({ session });
        }

        // Credit funds to user wallet
        user.walletBalance += totalCredit;
        await user.save({ session });

        // Record the order with the correct schema fields
        let newOrder = new OrdersModel({
            userId,
            symbol,
            qty: Number(qty),
            orderType: 'MARKET',
            side: 'SELL',
            executedPrice: livePrice,
            status: 'EXECUTED',
            executedAt: new Date(),
            paymentVerified: true,
        });
        await newOrder.save({ session });

        // Commit transaction BEFORE sending email
        await session.commitTransaction();
        session.endSession();

        // Transaction successful, send email
        try {
            await sendSellReceiptEmail(user.email, symbol, qty, livePrice, totalCredit);
        } catch (emailError) {
            console.error("Sell email failed to send, but transaction was successful:", emailError);
            // We still return 200 since the sell executed properly
        }

        return res.status(200).json({ 
            success: true, 
            message: `Order executed successfully at $${livePrice.toFixed(2)}`,
            walletBalance: user.walletBalance
        });

    } catch (error) {
        console.error("Execute Sell Error:", error);
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();
        return res.status(500).json({ success: false, message: "Server Error completing sell transaction." });
    }
};
