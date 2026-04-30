const User = require("../model/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");
const { sendEmail } = require("../util/EmailService");

const client = new OAuth2Client("598164736092-urhrchs4c87n8o0fntb5j2ih0629ea6d.apps.googleusercontent.com");

module.exports.GoogleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "598164736092-urhrchs4c87n8o0fntb5j2ih0629ea6d.apps.googleusercontent.com",
    });
    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        username: name,
        password: Math.random().toString(36).slice(-8),
        isVerified: true, // Google accounts are pre-verified
      });
    }

    const secretToken = createSecretToken(user._id);
    res.cookie("token", secretToken, {
      withCredentials: true,
      httpOnly: false,
    });

    res.status(201).json({
      message: "User logged in with Google successfully",
      success: true,
      user,
    });
    next();
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(400).json({ message: "Google Login failed" });
  }
};


module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }

    const verificationToken = crypto.randomBytes(20).toString("hex");

    const user = await User.create({
      email,
      password,
      username,
      createdAt,
      verificationToken,
      isVerified: false,
    });

    // Send Verification Email
    const verifyUrl = `http://localhost:3001/verify-email/${verificationToken}`;
    const emailHtml = `
      <h1>Verify your Email</h1>
      <p>Please click the link below to verify your email for StockFlow:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `;
    await sendEmail(email, "Email Verification - StockFlow", emailHtml);

    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User signed in successfully. Please check your email for verification.", success: true, user });
    next();
  } catch (error) {
    console.error(error);
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

    const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;
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


module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: "Incorrect password or email" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      return res.json({ message: "Incorrect password or email" });
    }
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
    res
      .status(201)
      .json({ message: "User logged in successfully", success: true });
    next();
  } catch (error) {
    console.error(error);
  }
};
