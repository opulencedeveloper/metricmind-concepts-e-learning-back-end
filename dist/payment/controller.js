"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const service_1 = require("./service");
const service_2 = require("../course/service");
const service_3 = require("../student/service");
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const loggin_1 = __importDefault(require("../utils/loggin"));
class PaymentController {
    constructor() {
        this.initiatePayment = async (req, res) => {
            const studentId = req.userId;
            const { courseId } = req.params;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            const course = await service_2.courseService.findCourseById(courseId);
            if (!course) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course not found",
                    data: null,
                });
            }
            const student = await service_3.studentService.findStudentById(studentId);
            if (!student) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Student not found",
                    data: null,
                });
            }
            const existingPayment = await service_1.paymentService.findPaymentByStudentAndCourse(studentId, courseId);
            if (existingPayment) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "You are already enrolled in this course",
                    data: null,
                });
            }
            const paystackPayment = await service_1.paymentService.initiatePayment({
                studentId: new mongoose_1.default.Types.ObjectId(studentId.toString()),
                courseId: new mongoose_1.default.Types.ObjectId(courseId),
                amount: course.price,
                currency: course.currency,
                studentEmail: student.email,
                studentName: student.fullName,
            });
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Payment initiated",
                data: {
                    authorizationUrl: paystackPayment.data.authorization_url,
                    accessCode: paystackPayment.data.access_code,
                    reference: paystackPayment.data.reference,
                },
            });
        };
        this.verifyPayment = async (req, res) => {
            const { reference } = req.query;
            loggin_1.default.info(`[verifyPayment] Incoming request - reference: ${reference}`);
            if (!reference || typeof reference !== "string") {
                loggin_1.default.warn(`[verifyPayment] Invalid reference - reference: ${reference}`);
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Payment reference is required",
                    data: null,
                });
            }
            try {
                const payment = await service_1.paymentService.verifyPayment({ reference });
                loggin_1.default.info(`[verifyPayment] Payment verification result - ${JSON.stringify({
                    reference,
                    paymentFound: !!payment,
                    status: payment?.status,
                    enrollmentCreated: payment?.enrollmentCreated,
                })}`);
                if (!payment) {
                    loggin_1.default.warn(`[verifyPayment] Payment not found - reference: ${reference}`);
                    return utils_1.utils.customResponse({
                        status: 400,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: "Payment verification failed",
                        data: null,
                    });
                }
                loggin_1.default.info(`[verifyPayment] Payment verified successfully - reference: ${reference}`);
                return utils_1.utils.customResponse({
                    status: 200,
                    res,
                    message: enum_1.MessageResponse.Success,
                    description: "Payment verified successfully",
                    data: {
                        status: payment.status,
                        enrollmentCreated: payment.enrollmentCreated,
                    },
                });
            }
            catch (error) {
                loggin_1.default.error(`[verifyPayment] Error verifying payment - reference: ${reference}, error: ${error.message}`);
                return utils_1.utils.customResponse({
                    status: 500,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Error verifying payment",
                    data: null,
                });
            }
        };
        this.handleWebhook = async (req, res) => {
            const signature = req.get("x-paystack-signature");
            const body = req.rawBody;
            if (!signature || !body) {
                loggin_1.default.error("Webhook: Missing signature or body");
                return res.status(400).json({ error: "Invalid webhook" });
            }
            try {
                const hash = require("crypto")
                    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
                    .update(body)
                    .digest("hex");
                if (hash !== signature) {
                    loggin_1.default.error("Webhook: Invalid signature");
                    return res.status(401).json({ error: "Invalid signature" });
                }
                const payload = JSON.parse(body);
                const payment = await service_1.paymentService.handleWebhook(payload);
                if (!payment) {
                    loggin_1.default.warn(`Webhook: Payment not found for reference`);
                    return res.status(200).json({ message: "Webhook processed" });
                }
                loggin_1.default.info(`Webhook: Payment verified - ${payment._id}`);
                return res.status(200).json({
                    message: "Webhook processed successfully",
                    paymentId: payment._id,
                });
            }
            catch (error) {
                loggin_1.default.error(`Webhook error: ${error.message}`);
                return res.status(500).json({ error: "Internal server error" });
            }
        };
        this.getPaymentHistory = async (req, res) => {
            const studentId = req.userId;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            const payments = await service_1.paymentService.findStudentPayments(studentId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Payment history retrieved",
                data: {
                    payments,
                    total: payments.length,
                },
            });
        };
    }
}
exports.paymentController = new PaymentController();
