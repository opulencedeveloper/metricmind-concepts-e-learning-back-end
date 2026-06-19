"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const config_1 = __importStar(require("./config"));
const loggin_1 = __importDefault(require("./utils/loggin"));
const enum_1 = require("./utils/enum");
const general_1 = __importDefault(require("./middleware/general"));
const utils_1 = require("./utils");
const router_1 = require("./auth/router");
const router_2 = require("./student/router");
const router_3 = require("./admin/router");
const router_4 = require("./payment/router");
const app = (0, express_1.default)();
/**
 * Express Application Configuration
 * Decoupled from server listening logic for better testability and scalability.
 */
app.set("trust proxy", 1);
// Middleware
app.use((0, compression_1.default)());
app.use(general_1.default.Helmet);
app.use(general_1.default.RateLimiting);
app.use((0, cors_1.default)({
    origin: config_1.default.app.corsOrigins,
    credentials: true,
}));
app.use(express_1.default.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    },
}));
// Global middleware to catch malformed JSON
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
        loggin_1.default.error(`Malformed JSON request: ${err.message}`);
        return utils_1.utils.customResponse({
            status: 400,
            res,
            message: enum_1.MessageResponse.Error,
            description: "Malformed JSON: Please check your request formatting (e.g., missing quotes or commas)",
            data: null,
        });
    }
    next();
});
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Request Logging
app.use((req, res, next) => {
    const startTime = Date.now();
    loggin_1.default.info(`Incoming ==> Method : [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        loggin_1.default.info(`Outgoing ==> Method : [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - status: [${res.statusCode}] - duration: [${duration}ms]`);
    });
    next();
});
// Routes
app.use("/api/v1/auth", router_1.AuthRouter);
app.use("/api/v1/student", router_2.StudentRouter);
app.use("/api/v1/admin", router_3.AdminRouter);
app.use("/api/v1/payments", router_4.PaymentRouter);
app.get("/api/v1/healthcheck", (_req, res) => {
    res.status(200).json({ status: "UP 🔥🔧🎂" });
});
// 405 Handler (Method Not Allowed)
app.use(general_1.default.MethodNotAllowed);
// 404 Handler
app.use((_req, res) => {
    const _error = new Error("Url not found 😟");
    loggin_1.default.error(_error);
    return res.status(404).json({ message: _error.message });
});
/**
 * Global Error Handler
 * Never exposes internal stack traces to the client in production.
 */
app.use((err, _req, res, _next) => {
    loggin_1.default.error(`Error occurred: ${err.message}`);
    if (config_1.default.app.env !== config_1.AppEnvironment.PRODUCTION) {
        loggin_1.default.error(`Error stack: ${err.stack}`);
    }
    // Check for MongoDB duplicate key error (E11000)
    if (err.code === 11000) {
        return utils_1.utils.customResponse({
            status: 409,
            res,
            message: enum_1.MessageResponse.Error,
            description: "This entry already exists in the registry.",
            data: null,
        });
    }
    if (config_1.default.app.env === config_1.AppEnvironment.PRODUCTION) {
        loggin_1.default.error(`Request URL: ${_req.url}`);
        loggin_1.default.error(`Request Method: ${_req.method}`);
    }
    return utils_1.utils.customResponse({
        status: 500,
        res,
        message: enum_1.MessageResponse.Error,
        description: err.message || "Internal Server Error",
        data: null,
    });
});
exports.default = app;
