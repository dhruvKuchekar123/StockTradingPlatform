const User = require("../model/UserModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const userCache = new Map();
const CACHE_TTL = 5000; // 5 seconds is perfect to deduplicate concurrent requests on page load

async function getCachedUser(id, includeSensitive = false) {
  const cacheKey = `${id}_${includeSensitive}`;
  const cached = userCache.get(cacheKey);
  const now = Date.now();
  if (cached && (now - cached.timestamp < CACHE_TTL)) {
    return cached.user;
  }
  
  let query = User.findById(id);
  if (!includeSensitive) {
    query = query.select("-password -signupOTP -resetPasswordToken -verificationToken");
  }
  const user = await query;
  if (user) {
    userCache.set(cacheKey, { user, timestamp: now });
  }
  return user;
}

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
    const user = await getCachedUser(data.id, false);
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
    
    const user = await getCachedUser(data.id, false);
    if (user && user.role === "admin") {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ status: false, message: "Access denied. Admins only." });
    }
  });
};

/**
 * Admin gate. Assumes userVerification has already run and populated req.user
 * (chain as: userVerification, isAdmin). This is a server-side check — it cannot
 * be bypassed by unhiding a frontend button or guessing a URL.
 */
module.exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: false, message: "Authentication required" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ status: false, message: "Access denied. Admins only." });
  }
  next();
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
    const user = await getCachedUser(data.id, false);
    if (user) {
      if (user.suspended) {
        return res.json({ status: false, code: "SUSPENDED", message: "Your account has been suspended. Please contact support." });
      }
      if (!user.isVerified) {
        return res.json({ status: false, code: "NOT_VERIFIED", message: "Please verify your email first." });
      }
      if (!user.isApproved && user.role !== "admin") {
        return res.json({ status: false, code: "PENDING_APPROVAL", message: "Your account is pending admin approval." });
      }
      return res.json({ status: true, user: user.username, role: "admin" });
    }
    return res.json({ status: false });
  });
};

