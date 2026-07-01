const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail", // You can change this
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports.sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"StockFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to:", to);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

module.exports.sendPaymentReceiptEmail = async (to, stockName, qty, price) => {
  try {
    const total = (qty * price).toFixed(2);
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #0052fe;">Payment Receipt - StockFlow</h2>
        <p>Thank you for your purchase! Your payment has been successfully processed.</p>
        <table style="width: 100%; max-width: 400px; border-collapse: collapse; margin-top: 20px;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px 0;"><strong>Stock Symbol</strong></td>
            <td style="padding: 10px 0; text-align: right;">${stockName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px 0;"><strong>Quantity</strong></td>
            <td style="padding: 10px 0; text-align: right;">${qty}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px 0;"><strong>Execution Price</strong></td>
            <td style="padding: 10px 0; text-align: right;">$${price}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0;"><strong>Total Amount Paid</strong></td>
            <td style="padding: 10px 0; text-align: right;"><strong>$${total}</strong></td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #555;">Your shares have been credited to your holdings.</p>
      </div>
    `;
    
    const mailOptions = {
      from: `"StockFlow Payments" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Receipt: Purchase of ${qty} ${stockName} shares`,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Receipt Email sent successfully to:", to);
  } catch (error) {
    console.error("Receipt Email sending failed:", error);
  }
};

module.exports.sendSellReceiptEmail = async (to, stockName, qty, price) => {
  try {
    const total = (qty * price).toFixed(2);
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #ff4d4d;">Sale Receipt - StockFlow</h2>
        <p>Your sale has been successfully processed.</p>
        <table style="width: 100%; max-width: 400px; border-collapse: collapse; margin-top: 20px;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px 0;"><strong>Stock Symbol</strong></td>
            <td style="padding: 10px 0; text-align: right;">${stockName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px 0;"><strong>Quantity</strong></td>
            <td style="padding: 10px 0; text-align: right;">${qty}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 10px 0;"><strong>Execution Price</strong></td>
            <td style="padding: 10px 0; text-align: right;">$${price}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0;"><strong>Total Amount Received</strong></td>
            <td style="padding: 10px 0; text-align: right;"><strong>$${total}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-top: 1px solid #ddd;"><strong>Timestamp</strong></td>
            <td style="padding: 10px 0; text-align: right; border-top: 1px solid #ddd;">${new Date().toLocaleString()}</td>
          </tr>
        </table>
        <p style="margin-top: 20px; color: #555;">The funds have been credited to your wallet balance.</p>
      </div>
    `;
    
    const mailOptions = {
      from: `"StockFlow Payments" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Receipt: Sale of ${qty} ${stockName} shares`,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log("Sell Receipt Email sent successfully to:", to);
  } catch (error) {
    console.error("Sell Receipt Email sending failed:", error);
  }
};

module.exports.sendOTPEmail = async (to, otp) => {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2bd2f; border-radius: 12px; max-width: 500px; background-color: #06080c; color: #ffffff;">
        <h2 style="color: #e2bd2f; border-bottom: 1px solid rgba(226,189,47,0.3); padding-bottom: 10px;">StockFlow Pro - Verification Code</h2>
        <p style="color: #9aa3b5; font-size: 14px;">Welcome to StockFlow Pro! To complete your registration, please verify your account using the OTP below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 850; letter-spacing: 6px; color: #e2bd2f; background: rgba(226,189,47,0.1); padding: 12px 24px; border-radius: 8px; border: 1px solid rgba(226,189,47,0.3);">${otp}</span>
        </div>
        <p style="color: #7f8899; font-size: 12px;">This OTP is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
        <div style="border-top: 1px solid rgba(226,189,47,0.1); margin-top: 20px; padding-top: 10px; font-size: 11px; color: #6f7889; text-align: center;">
          © 2026 StockFlow Pro. All rights reserved.
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"StockFlow Pro" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Verification Code: ${otp}`,
      html,
    };

    console.log(`[OTP SERVICE] Generated OTP for ${to} is: ${otp}`);
    await transporter.sendMail(mailOptions);
    console.log("OTP Email sent successfully to:", to);
  } catch (error) {
    console.log(`[OTP SERVICE] Generated OTP for ${to} is: ${otp} (Failed sending: ${error.message})`);
  }
};
