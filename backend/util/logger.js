/**
 * @module logger
 * @description Lightweight structured logger for StockFlow Pro backend.
 *
 * Wraps console methods with ISO timestamps and a consistent format.
 * In production, replace this with a proper logging library (winston, pino)
 * that writes structured JSON for log aggregation.
 *
 * Usage:
 *   const logger = require('../util/logger');
 *   logger.info('[OrderMatcher] Order executed', { orderId, symbol });
 *   logger.error('[Auth] Login failed', error);
 */

const formatMessage = (level, message, meta) => {
    const timestamp = new Date().toISOString();
    const metaStr = meta
        ? ` | ${meta instanceof Error ? meta.message : JSON.stringify(meta)}`
        : "";
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

const logger = {
    /**
     * Informational log — operational events, successful actions.
     * @param {string} message
     * @param {object|Error} [meta]
     */
    info: (message, meta) => {
        console.log(formatMessage("INFO ", message, meta));
    },

    /**
     * Warning log — recoverable errors, fallbacks, degraded operation.
     * @param {string} message
     * @param {object|Error} [meta]
     */
    warn: (message, meta) => {
        console.warn(formatMessage("WARN ", message, meta));
    },

    /**
     * Error log — unexpected failures requiring investigation.
     * Does NOT log the full stack trace to avoid leaking implementation details
     * in environments where stdout is forwarded to external systems.
     * @param {string} message
     * @param {object|Error} [meta]
     */
    error: (message, meta) => {
        const formatted = formatMessage("ERROR", message, meta);
        console.error(formatted);
        // In production: send to Sentry / Datadog / CloudWatch here
    },

    /**
     * Debug log — only active when NODE_ENV !== 'production'.
     * @param {string} message
     * @param {object|Error} [meta]
     */
    debug: (message, meta) => {
        if (process.env.NODE_ENV !== "production") {
            console.debug(formatMessage("DEBUG", message, meta));
        }
    },
};

module.exports = logger;
