const User = require("../model/UserModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ status: false, message: "No token provided" });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.json({ status: false, message: "Token verification failed" });
    } else {
      const user = await User.findById(data.id);
      if (user) {
        req.user = user;
        next();
      } else {
        return res.json({ status: false, message: "User not found" });
      }
    }
  });
};

// Simple status check for initial dashboard load
module.exports.checkUserStatus = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json({ status: false });
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) return res.json({ status: false });
    const user = await User.findById(data.id);
    if (user) return res.json({ status: true, user: user.username });
    return res.json({ status: false });
  });
};

