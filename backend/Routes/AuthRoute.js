const { Signup, Login, GoogleLogin, VerifyOTP, ResendOTP, VerifyEmail, ForgotPassword, ResetPassword, GetProfile, UpdateProfile, Logout } = require("../Controllers/AuthController");
const { userVerification, checkUserStatus } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();
const rateLimit = require("express-rate-limit");

// ─── Rate Limiters ────────────────────────────────────────────────────────────

/**
 * Strict limiter for login — 10 attempts per 15 minutes per IP.
 * Prevents credential stuffing and brute-force attacks.
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again in 15 minutes." },
});

/**
 * Strict limiter for signup — 5 accounts per hour per IP.
 * Prevents automated mass account creation.
 */
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many signup attempts. Please try again in an hour." },
});

/**
 * OTP verification limiter — 10 attempts per 15 minutes per IP.
 * Works in tandem with the per-user attempt counter in VerifyOTP controller.
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many OTP attempts. Please try again in 15 minutes." },
});

/**
 * Forgot-password limiter — 5 requests per 15 minutes per IP.
 * Prevents email flooding of targets.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many password reset requests. Please try again later." },
});

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post("/signup", signupLimiter, Signup);
router.post("/login", loginLimiter, Login);
router.post("/google-login", loginLimiter, GoogleLogin);
router.post("/verify-otp", otpLimiter, VerifyOTP);
router.post("/resend-otp", otpLimiter, ResendOTP);
router.post("/verify-email/:token", VerifyEmail);
router.post("/forgot-password", forgotPasswordLimiter, ForgotPassword);
router.post("/reset-password/:token", ResetPassword);
router.get("/profile", userVerification, GetProfile);
router.put("/profile", userVerification, UpdateProfile);

router.post("/logout", Logout);
router.post("/", checkUserStatus);

module.exports = router;