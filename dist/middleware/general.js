"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const createRateLimitHandler = (retryAfter) => (req, res) => {
    res.status(429).json({
        status: 429,
        message: enum_1.MessageResponse.Error,
        description: "Too many requests. Please slow down and try again shortly.",
        error: "rate_limited",
        retry_after: retryAfter,
        data: null
    });
};
class GeneralMiddleware {
}
GeneralMiddleware.Helmet = (0, helmet_1.default)({
    crossOriginResourcePolicy: false,
});
GeneralMiddleware.RateLimiting = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 500,
    handler: createRateLimitHandler(30),
    standardHeaders: true,
    legacyHeaders: false,
});
// Payment endpoint rate limiters (stricter than global)
GeneralMiddleware.PaymentInitiateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    keyGenerator: (req) => `${req.userId || req.ip}:payment:initiate`,
    handler: createRateLimitHandler(3600),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !req.userId,
});
GeneralMiddleware.PaymentVerifyLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    keyGenerator: (req) => `${req.userId || req.ip}:payment:verify`,
    handler: createRateLimitHandler(3600),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => !req.userId,
});
GeneralMiddleware.PaymentWebhookLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    keyGenerator: (req) => `${req.ip}:payment:webhook`,
    handler: createRateLimitHandler(60),
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Global 405 Method Not Allowed Handler
 * Scans the router stack to identify valid methods for the requested path.
 */
GeneralMiddleware.MethodNotAllowed = (req, res, next) => {
    const supportedMethods = utils_1.utils.getSupportedMethods(req.app, req.path);
    if (supportedMethods.length > 0) {
        res.set("Allow", supportedMethods.join(", "));
        return utils_1.utils.customResponse({
            status: 405,
            res,
            message: enum_1.MessageResponse.MethodNotAllowed,
            description: `The ${req.method} method is not supported for this resource. Supported methods: ${supportedMethods.join(", ")}`,
            data: null,
        });
    }
    next();
};
exports.default = GeneralMiddleware;
