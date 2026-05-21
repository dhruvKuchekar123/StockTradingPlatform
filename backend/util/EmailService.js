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
