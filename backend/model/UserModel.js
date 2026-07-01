const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Your email address is required"],
    unique: true,
  },
  username: {
    type: String,
    required: [true, "Your username is required"],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, "Your password is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now, // Function reference, not a value — evaluated at document creation time
  },

  isVerified: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  plan: {
    type: String,
    enum: ["BASIC", "PRO", "PREMIUM"],
    default: "BASIC",
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  suspended: {
    type: Boolean,
    default: false, // blocks login; does NOT delete any data
  },
  bankDetails: {
    accountName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifscCode: { type: String, default: "" },
    bankName: { type: String, default: "" },
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  signupOTP: String,
  signupOTPExpires: Date,
  otpAttempts: { type: Number, default: 0 }, // Tracks failed OTP attempts for brute-force protection

});


userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

module.exports = mongoose.model("User", userSchema);