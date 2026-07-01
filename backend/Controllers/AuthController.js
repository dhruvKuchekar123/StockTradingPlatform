const User = require("../model/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const { sendEmail, sendOTPEmail } = require("../util/EmailService");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
if (!GOOGLE_CLIENT_ID) {
  console.error("[FATAL] GOOGLE_CLIENT_ID is not set in environment variables.");
}
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

module.exports.GoogleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // Use cryptographically random placeholder password for Google-only accounts
      const placeholderPassword = crypto.randomBytes(32).toString("hex");
      user = await User.create({
        email,
        username: name,
        password: placeholderPassword,
        isVerified: true,
        isApproved: true,
      });
    }

    const secretToken = createSecretToken(user._id);
    res.cookie("token", secretToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Return only safe, non-sensitive fields — never the full Mongoose document
    return res.status(200).json({
      message: "User logged in with Google successfully",
      success: true,
      token: secretToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error("Google Login Error:", error.message);
    return res.status(400).json({ success: false, message: "Google Login failed" });
  }
};


module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt, bankDetails } = req.body;

    // 1. Strict Validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.json({ success: false, message: "Invalid email format (e.g. user@example.com)" });
    }
    if (!username || username.trim().length < 3) {
      return res.json({ success: false, message: "Username must be at least 3 characters" });
    }
    if (!password || password.length < 6) {
      return res.json({ success: false, message: "Password must be at least 6 characters" });
    }
    if (!bankDetails) {
      return res.json({ success: false, message: "Bank details are required for KYC" });
    }

    const { accountName, accountNumber, ifscCode, bankName } = bankDetails;
    const nameRegex = /^[A-Za-z\s]+$/;
    if (!accountName || !nameRegex.test(accountName) || accountName.trim().length < 3) {
      return res.json({ success: false, message: "Account Holder Name must contain only letters and be at least 3 characters" });
    }
    const acctRegex = /^\d{9,18}$/;
    if (!accountNumber || !acctRegex.test(accountNumber)) {
      return res.json({ success: false, message: "Account Number must be between 9 and 18 digits" });
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscCode || !ifscRegex.test(ifscCode)) {
      return res.json({ success: false, message: "Invalid IFSC Code format (e.g. SBIN0001234)" });
    }
    if (!bankName || !nameRegex.test(bankName) || bankName.trim().length < 3) {
      return res.json({ success: false, message: "Bank Name must contain only letters and be at least 3 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    // 2. Generate OTP using CSPRNG (crypto.randomInt is cryptographically secure)
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 600000); // 10 minutes

    const verificationToken = crypto.randomBytes(20).toString("hex");

    const user = await User.create({
      email,
      password,
      username,
      createdAt,
      verificationToken,
      signupOTP: otp,
      signupOTPExpires: otpExpires,
      isVerified: false,
      bankDetails: { accountName, accountNumber, ifscCode, bankName },
      isApproved: true,
    });

    // Send OTP via Email
    await sendOTPEmail(email, otp);

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email. Please verify to continue.",
      email
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Internal server error during signup" });
  }
};

module.exports.VerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Return generic message — do not reveal whether email exists (OWASP A01)
      return res.status(400).json({ success: false, message: "Invalid email or OTP" });
    }

    if (user.isVerified) {
      return res.json({ success: true, message: "Email is already verified" });
    }

    // Brute-force protection: max 5 failed attempts
    const MAX_OTP_ATTEMPTS = 5;
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      // Invalidate OTP to force re-registration
      user.signupOTP = undefined;
      user.signupOTPExpires = undefined;
      user.otpAttempts = 0;
      await user.save();
      return res.status(429).json({ 
        success: false, 
        message: "Too many failed attempts. Please sign up again to receive a new OTP." 
      });
    }

    if (user.signupOTPExpires < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please sign up again." });
    }

    if (user.signupOTP !== otp) {
      // Increment attempt counter on every wrong guess
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save();
      const remaining = MAX_OTP_ATTEMPTS - user.otpAttempts;
      return res.status(400).json({ 
        success: false, 
        message: `Invalid OTP code. ${remaining} attempt(s) remaining.` 
      });
    }

    // OTP correct — clear all OTP fields and mark verified
    user.isVerified = true;
    user.signupOTP = undefined;
    user.signupOTPExpires = undefined;
    user.otpAttempts = 0;
    await user.save();

    return res.json({ success: true, message: "Email verified successfully!" });
  } catch (error) {
    console.error("OTP Verification error:", error.message);
    return res.status(500).json({ success: false, message: "Server error during verification" });
  }
};

module.exports.VerifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token", success: false });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error during verification" });
  }
};

module.exports.ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found with this email", success: false });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3005"}/reset-password/${resetToken}`;
    const emailHtml = `
      <h1>Reset Password</h1>
      <p>Click the link below to reset your StockFlow password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;
    await sendEmail(email, "Password Reset - StockFlow", emailHtml);

    res.json({ message: "Password reset link sent to your email", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.ResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired", success: false });
    }

    user.password = password; // Will be hashed by pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.GetProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From AuthMiddleware
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.UpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, phoneNumber, address, bio } = req.body;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username) user.username = username;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (address !== undefined) user.address = address;
    if (bio !== undefined) user.bio = bio;
    
    await user.save();
    
    const updatedUser = await User.findById(userId).select("-password");
    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("UpdateProfile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports.Logout = (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
  });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Incorrect password or email" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.status(401).json({ success: false, message: "Incorrect password or email" });
    }
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({ message: "User logged in successfully", success: true, token });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error during login" });
  }
};
