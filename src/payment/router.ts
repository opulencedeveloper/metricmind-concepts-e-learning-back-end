import { Router } from "express";
import { paymentController } from "./controller";
import { studentAuth } from "../middleware/student-auth";
import GeneralMiddleware from "../middleware/general";
import { paymentTimeoutConfigs } from "../middleware/payment-timeout";
import { studentCourseValidator } from "../student/course.validator";
import { utils } from "../utils";

export const PaymentRouter = Router();

// Webhook endpoint (no auth required - Paystack calls this)
PaymentRouter.post("/webhook", GeneralMiddleware.PaymentWebhookLimiter, paymentTimeoutConfigs.webhook, utils.wrapAsync(paymentController.handleWebhook));

// Protected routes (auth required)
PaymentRouter.use(studentAuth);

PaymentRouter.post("/courses/:courseId/initiate", GeneralMiddleware.PaymentInitiateLimiter, paymentTimeoutConfigs.initiate, studentCourseValidator.validateObjectId, utils.wrapAsync(paymentController.initiatePayment));

PaymentRouter.get("/verify", GeneralMiddleware.PaymentVerifyLimiter, paymentTimeoutConfigs.verify, utils.wrapAsync(paymentController.verifyPayment));

PaymentRouter.get("/history", paymentTimeoutConfigs.history, utils.wrapAsync(paymentController.getPaymentHistory));
