const UserModel = require("../model/UserModel");
const HoldingsModel = require("../model/HoldingModel");
const OrdersModel = require("../model/OrdersModel");
const MarketService = require("../util/MarketService");
const jwt = require("jsonwebtoken");

module.exports.getPortfolio = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check authorization: if not public, only the owner can view it
    if (!user.isPublic) {
      let isOwner = false;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(token, process.env.TOKEN_KEY);
          if (decoded.id === user._id.toString()) {
            isOwner = true;
          }
        } catch (err) {
          // invalid token, ignore
        }
      }

      if (!isOwner) {
        return res.status(403).json({ success: false, message: "This portfolio is private" });
      }
    }

    // Since Holdings and Orders don't have a userId, we fetch global for the prototype
    // In a real multi-tenant app, this would be `HoldingsModel.find({ userId: user._id })`
    const holdings = await HoldingsModel.find();
    const orders = await OrdersModel.find().sort({ _id: -1 }).limit(10); // get latest 10 orders

    let totalInvested = 0;
    let currentValue = 0;
    let topHoldings = [];
    let sectorBreakdownData = {
      labels: [],
      datasets: [
        {
          label: "Value",
          data: [],
          backgroundColor: [
            "#2962ff",
            "#00bfa5",
            "#ff6d00",
            "#d50000",
            "#aa00ff",
            "#ffd600",
            "#00b8d4",
          ],
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
        },
      ],
    };

    // Calculate metrics and format top holdings
    for (let h of holdings) {
      const invested = h.qty * h.avg;
      // Note: In real app, you might want to fetch live prices here using MarketService.
      // For speed and prototype simplicity, we use the `price` stored in the holding (which is LTP at last trade).
      const current = h.qty * h.price; 
      
      totalInvested += invested;
      currentValue += current;

      const pnl = current - invested;
      const pnlPercent = invested > 0 ? (pnl / invested) * 100 : 0;

      topHoldings.push({
        name: h.name,
        qty: h.qty,
        avg: h.avg,
        price: h.price,
        currentValue: current,
        pnl,
        pnlPercent,
      });

      sectorBreakdownData.labels.push(h.name);
      sectorBreakdownData.datasets[0].data.push(current);
    }

    // Sort top holdings descending by currentValue and take top 5
    topHoldings.sort((a, b) => b.currentValue - a.currentValue);
    topHoldings = topHoldings.slice(0, 5);

    const totalPnL = currentValue - totalInvested;
    const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    const portfolioData = {
      username: user.username,
      joinedDate: user.createdAt,
      isPublic: user.isPublic,
      totalInvested,
      currentValue,
      totalPnL,
      pnlPercent,
      topHoldings,
      sectorBreakdown: sectorBreakdownData,
      recentOrders: orders.map(o => ({
        name: o.name,
        qty: o.qty,
        price: o.price,
        mode: o.mode,
        date: o._id.getTimestamp() // Mongo _id encodes creation time
      }))
    };

    return res.status(200).json({ success: true, portfolio: portfolioData });

  } catch (error) {
    console.error("Portfolio Fetch Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching portfolio" });
  }
};

module.exports.toggleVisibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isPublic = !user.isPublic;
    await user.save();

    return res.status(200).json({ success: true, isPublic: user.isPublic });
  } catch (error) {
    console.error("Toggle Visibility Error:", error);
    res.status(500).json({ success: false, message: "Server error toggling visibility" });
  }
};
