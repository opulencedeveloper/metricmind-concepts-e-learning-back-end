"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRouter = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
const student_auth_1 = require("../middleware/student-auth");
const general_1 = __importDefault(require("../middleware/general"));
const payment_timeout_1 = require("../middleware/payment-timeout");
const course_validator_1 = require("../student/course.validator");
const utils_1 = require("../utils");
exports.PaymentRouter = (0, express_1.Router)();
// Webhook endpoint (no auth required - Paystack calls this)
exports.PaymentRouter.post("/webhook", general_1.default.PaymentWebhookLimiter, payment_timeout_1.paymentTimeoutConfigs.webhook, utils_1.utils.wrapAsync(controller_1.paymentController.handleWebhook));
// Protected routes (auth required)
exports.PaymentRouter.use(student_auth_1.studentAuth);
exports.PaymentRouter.post("/courses/:courseId/initiate", general_1.default.PaymentInitiateLimiter, payment_timeout_1.paymentTimeoutConfigs.initiate, course_validator_1.studentCourseValidator.validateObjectId, utils_1.utils.wrapAsync(controller_1.paymentController.initiatePayment));
exports.PaymentRouter.get("/verify", general_1.default.PaymentVerifyLimiter, payment_timeout_1.paymentTimeoutConfigs.verify, utils_1.utils.wrapAsync(controller_1.paymentController.verifyPayment));
exports.PaymentRouter.get("/history", payment_timeout_1.paymentTimeoutConfigs.history, utils_1.utils.wrapAsync(controller_1.paymentController.getPaymentHistory));
