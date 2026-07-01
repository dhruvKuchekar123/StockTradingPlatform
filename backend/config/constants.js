/**
 * @module constants
 * @description Application-wide constants and configuration values.
 *
 * All magic numbers, hardcoded prices, and configurable values live here.
 * Import from this module — never duplicate these values across files.
 */

/**
 * Approximate NSE base prices used as mock/fallback when Yahoo Finance
 * is rate-limited or unavailable. Values are in INR.
 *
 * @type {Record<string, number>}
 */
const MOCK_BASE_PRICES = {
    RELIANCE:   2950.00,
    TCS:        3850.00,
    INFY:       1450.00,
    HDFCBANK:   1440.00,
    ICICIBANK:  1080.00,
    SBIN:        760.00,
    TATAMOTORS:  950.00,
    ITC:         420.00,
    BHARTIARTL: 1200.00,
    META:      55000.00,
    AAPL:      15000.00,
    TSLA:      20000.00,
};

/**
 * Flat brokerage fee per trade in INR.
 * Applied to both BUY and SELL orders placed via OrderController.
 */
const BROKERAGE_FEE_INR = 20.00;

/**
 * Wallet top-up limits in INR.
 */
const WALLET_MIN_TOPUP_INR = 100;
const WALLET_MAX_TOPUP_INR = 200000;

/**
 * OTP configuration
 */
const OTP_EXPIRY_MS     = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_ATTEMPTS  = 5;

module.exports = {
    MOCK_BASE_PRICES,
    BROKERAGE_FEE_INR,
    WALLET_MIN_TOPUP_INR,
    WALLET_MAX_TOPUP_INR,
    OTP_EXPIRY_MS,
    OTP_MAX_ATTEMPTS,
};
