const User = require("../model/UserModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = (req, res, next) => {
  let token = req.cookies.token;
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  if (!token) {
    return res.status(401).json({ status: false, message: "Authentication required" });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
      return res.status(401).json({ status: false, message: "Invalid or expired token" });
    }
    const user = await User.findById(data.id).select("-password -signupOTP -resetPasswordToken -verificationToken");
    if (user) {
      req.user = user;
      next();
    } else {
      return res.status(401).json({ status: false, message: "User not found" });
    }
  });
};


module.exports.adminVerification = (req, res, next) => {
  let token = req.cookies.token;
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  if (!token) return res.status(401).json({ status: false, message: "No token provided" });
  
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) return res.status(401).json({ status: false, message: "Token verification failed" });
    
    const user = await User.findById(data.id);
    if (user && user.role === "admin") {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ status: false, message: "Access denied. Admins only." });
    }
  });
};

module.exports.checkUserStatus = (req, res) => {
  let token = req.cookies.token;
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  if (!token) return res.json({ status: false });
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) return res.json({ status: false });
    const user = await User.findById(data.id);
    if (user) {
      if (!user.isVerified) {
        return res.json({ status: false, code: "NOT_VERIFIED", message: "Please verify your email first." });
      }
      if (!user.isApproved && user.role !== "admin") {
        return res.json({ status: false, code: "PENDING_APPROVAL", message: "Your account is pending admin approval." });
      }
      return res.json({ status: true, user: user.username, role: user.role });
    }
    return res.json({ status: false });
  });
};

