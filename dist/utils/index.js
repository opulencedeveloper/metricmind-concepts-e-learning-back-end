"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.utils = void 0;
const crypto_1 = __importDefault(require("crypto"));
const enum_1 = require("./enum");
class Utils {
    constructor() {
        /**
         * Generate OTP with configurable length
         * Uber/Bolt philosophy: 4-digit for quick operations (PIN), 6-digit for security-critical (password reset)
         */
        this.generateOtp = (digits = 4) => {
            return Array.from({ length: digits }, () => crypto_1.default.randomInt(0, 10)).join("");
        };
        /**
         * Generate URL-friendly slug from text (SEO-optimized)
         * Example: "UI/UX Design Fundamentals" → "uiux-design-fundamentals"
         */
        this.generateSlug = (text) => {
            return text
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
        };
    }
    // Middleware function to wrap controllers with try-catch
    wrapAsync(fn) {
        return (req, res, next) => {
            fn(req, res, next).catch(next);
        };
    }
    customResponse({ res, status, message, description, data, }) {
        return res.status(status).json({
            message,
            description,
            data,
        });
    }
    /**
     * Get OTP with expiration
     * @param digits OTP length (default 4 for withdrawal PIN, 6 for password reset)
     */
    getOtpAndExpiration(digits = 4) {
        return {
            otp: this.generateOtp(digits),
            expiration: new Date(Date.now() + 10 * 60 * 1000),
        };
    }
    async tryCatchWrapper(fn, res, successMessage, successStatus = 200) {
        try {
            const data = await fn();
            return this.customResponse({
                status: successStatus,
                res,
                message: enum_1.MessageResponse.Success,
                description: successMessage,
                data,
            });
        }
        catch (error) {
            console.log(error);
            return this.customResponse({
                status: 400,
                res,
                message: enum_1.MessageResponse.Error,
                description: error.message || "An unexpected error occurred",
                data: null,
            });
        }
    }
    getSupportedMethods(app, targetUrl) {
        const methods = new Set();
        const cleanTargetUrl = targetUrl.split("?")[0].replace(/\/+$/, "") || "/";
        const scan = (stack, prefix = "") => {
            if (!stack)
                return;
            stack.forEach((layer) => {
                if (layer.route) {
                    // Direct route definition (e.g., router.post('/login'))
                    const routePath = layer.route.path === "/" ? "" : layer.route.path;
                    const fullPath = (prefix + routePath).replace(/\/+/g, "/") || "/";
                    if (this.matchRoutePath(fullPath, cleanTargetUrl)) {
                        Object.keys(layer.route.methods).forEach((method) => {
                            if (method !== "_all")
                                methods.add(method.toUpperCase());
                        });
                    }
                }
                else if (layer.name === "router" || (layer.handle && layer.handle.stack)) {
                    // Nested router (e.g., app.use('/api/v1/auth', AuthRouter))
                    let routerPath = "";
                    if (layer.regexp) {
                        // Extract the static prefix from the layer's regexp
                        routerPath = layer.regexp.source
                            .replace("^\\", "")
                            .replace("\\/?(?=\\/|$)", "")
                            .replace(/\\\//g, "/")
                            .replace(/\^/g, "")
                            .replace(/\$/g, "");
                    }
                    scan(layer.handle.stack, (prefix + routerPath).replace(/\/+/g, "/"));
                }
            });
        };
        scan(app._router.stack);
        return Array.from(methods);
    }
    /**
     * Robust path matching that handles Express-style route parameters (:id, etc.)
     */
    matchRoutePath(registeredPath, targetPath) {
        const regParts = registeredPath.split("/").filter(Boolean);
        const targetParts = targetPath.split("/").filter(Boolean);
        if (regParts.length !== targetParts.length)
            return false;
        return regParts.every((part, i) => {
            return part.startsWith(":") || part === targetParts[i];
        });
    }
}
exports.utils = new Utils();
