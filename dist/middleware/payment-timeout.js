"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentTimeoutConfigs = exports.paymentTimeout = void 0;
const utils_1 = require("../utils");
const enum_1 = require("../utils/enum");
const loggin_1 = __importDefault(require("../utils/loggin"));
/**
 * Payment Operation Timeout Middleware
 * Prevents hanging payment requests that can cause orphaned payments
 * when users close browser, navigate away, or lose connection
 */
const paymentTimeout = (timeoutMs = 30000) => {
    return (req, res, next) => {
        let timeoutId;
        let isTimedOut = false;
        // Set timeout
        timeoutId = setTimeout(() => {
            if (!res.headersSent) {
                isTimedOut = true;
                loggin_1.default.warn(`Payment request timeout after ${timeoutMs}ms: ${req.method} ${req.path}`);
                return utils_1.utils.customResponse({
                    status: 408,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Payment operation timed out. Please try again.",
                    data: null,
                });
            }
        }, timeoutMs);
        // Clear timeout if response is sent before timeout
        const originalSend = res.send;
        res.send = function (data) {
            clearTimeout(timeoutId);
            return originalSend.call(this, data);
        };
        // Handle response end
        res.on("finish", () => {
            clearTimeout(timeoutId);
        });
        res.on("close", () => {
            clearTimeout(timeoutId);
            if (!isTimedOut) {
                loggin_1.default.info(`Payment request connection closed: ${req.method} ${req.path}`);
            }
        });
        next();
    };
};
exports.paymentTimeout = paymentTimeout;
/**
 * Specific timeout configurations for payment endpoints
 */
exports.paymentTimeoutConfigs = {
    // Initiate payment: 30 seconds (includes Paystack API call)
    initiate: (0, exports.paymentTimeout)(30000),
    // Verify payment: 20 seconds (quick DB lookup + Paystack verification)
    verify: (0, exports.paymentTimeout)(20000),
    // Webhook: 10 seconds (should be fast)
    webhook: (0, exports.paymentTimeout)(10000),
    // Payment history: 15 seconds
    history: (0, exports.paymentTimeout)(15000),
};
