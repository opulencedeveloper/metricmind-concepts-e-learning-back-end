"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const entity_1 = __importDefault(require("./entity"));
const service_1 = require("../course/enrollment/service");
const service_2 = require("../course/service");
const enum_1 = require("./enum");
const paystack_1 = require("../utils/paystack");
const loggin_1 = __importDefault(require("../utils/loggin"));
const config_1 = __importDefault(require("../config"));
class PaymentService {
    constructor() {
        this.initiatePayment = async (input) => {
            const payment = new entity_1.default({
                studentId: input.studentId,
                courseId: input.courseId,
                amount: input.amount,
                currency: input.currency,
                status: enum_1.PaymentStatus.Pending,
                type: enum_1.PaymentType.CourseEnrollment,
                verificationMethod: enum_1.VerificationMethod.Pending,
            });
            await payment.save();
            loggin_1.default.info(`[initiatePayment] Starting payment initialization for student: ${input.studentId}`);
            const paystackPayment = await paystack_1.paystackService.initializeTransaction({
                customerEmail: input.studentEmail,
                customerName: input.studentName,
                amount: input.amount * 100,
                paymentReference: payment._id.toString(),
                callbackUrl: `${config_1.default.frontend.baseUrl}/student-dashboard/payment-success`,
                metadata: {
                    paymentId: payment._id.toString(),
                    studentId: input.studentId.toString(),
                    courseId: input.courseId.toString(),
                },
            });
            loggin_1.default.info(`[initiatePayment] Paystack response received: ${JSON.stringify({
                status: paystackPayment.status,
                message: paystackPayment.message,
                dataKeys: paystackPayment.data ? Object.keys(paystackPayment.data) : null,
                reference: paystackPayment.data?.reference,
                authUrl: paystackPayment.data?.authorization_url?.substring(0, 50) + '...',
            })}`);
            const providerRef = paystackPayment.data?.reference;
            if (!providerRef) {
                loggin_1.default.error(`[initiatePayment] ERROR: No reference in Paystack response!`);
                throw new Error('Paystack did not return a payment reference');
            }
            loggin_1.default.info(`[initiatePayment] Saving payment with reference: ${providerRef}`);
            await entity_1.default.findByIdAndUpdate(payment._id, {
                providerReference: providerRef,
                metadata: paystackPayment.data,
            });
            loggin_1.default.info(`[initiatePayment] Payment saved successfully - reference: ${providerRef}`);
            return paystackPayment;
        };
        this.verifyPayment = async (input) => {
            loggin_1.default.info(`[verifyPayment] Verifying payment with reference: ${input.reference}`);
            const verification = await paystack_1.paystackService.verifyTransaction(input.reference);
            loggin_1.default.info(`[verifyPayment] Paystack verification result: ${JSON.stringify({
                status: verification?.status,
                message: verification?.message,
            })}`);
            if (!verification || !verification.status) {
                loggin_1.default.warn(`[verifyPayment] Payment not verified by Paystack - reference: ${input.reference}`);
                return null;
            }
            // Use MongoDB transaction to prevent race conditions
            const session = await mongoose_1.default.startSession();
            session.startTransaction();
            try {
                loggin_1.default.info(`[verifyPayment] Querying database for payment with providerReference: ${input.reference}`);
                const payment = await entity_1.default.findOne({
                    providerReference: input.reference,
                }).session(session);
                loggin_1.default.info(`[verifyPayment] Database query result: paymentFound=${!!payment}, paymentId=${payment?._id}`);
                if (!payment) {
                    loggin_1.default.error(`Payment not found for reference: ${input.reference}`);
                    await session.abortTransaction();
                    return null;
                }
                // If already verified, return (idempotent)
                if (payment.status === enum_1.PaymentStatus.Success) {
                    await session.abortTransaction();
                    return payment;
                }
                // Update payment status
                payment.status = enum_1.PaymentStatus.Success;
                payment.paidAt = new Date();
                payment.providerTransactionId = verification.id;
                payment.verificationMethod = enum_1.VerificationMethod.Manual;
                await payment.save({ session });
                // Create enrollment if not already created
                if (!payment.enrollmentCreated) {
                    await this.createEnrollmentFromPayment(payment, session);
                }
                await session.commitTransaction();
                return payment;
            }
            catch (error) {
                await session.abortTransaction();
                loggin_1.default.error(`verifyPayment transaction failed: ${error.message}`);
                throw error;
            }
            finally {
                await session.endSession();
            }
        };
        this.handleWebhook = async (payload) => {
            if (payload.event !== "charge.success") {
                loggin_1.default.info(`Ignoring non-success webhook event: ${payload.event}`);
                return null;
            }
            const session = await mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const reference = payload.data.reference;
                const payment = await entity_1.default.findOne({ providerReference: reference }).session(session);
                if (!payment) {
                    loggin_1.default.error(`Payment not found for webhook reference: ${reference}`);
                    await session.abortTransaction();
                    return null;
                }
                if (payment.status === enum_1.PaymentStatus.Success) {
                    loggin_1.default.info(`Payment already verified: ${reference}`);
                    await session.abortTransaction();
                    return payment;
                }
                payment.status = enum_1.PaymentStatus.Success;
                payment.paidAt = new Date();
                payment.providerTransactionId = payload.data.id;
                payment.verificationMethod = enum_1.VerificationMethod.Webhook;
                await payment.save({ session });
                if (!payment.enrollmentCreated) {
                    await this.createEnrollmentFromPayment(payment, session);
                }
                await session.commitTransaction();
                return payment;
            }
            catch (error) {
                await session.abortTransaction();
                loggin_1.default.error(`handleWebhook transaction failed: ${error.message}`);
                throw error;
            }
            finally {
                await session.endSession();
            }
        };
        this.createEnrollmentFromPayment = async (payment, session) => {
            try {
                await service_1.enrollmentService.enrollStudent({
                    studentId: payment.studentId,
                    courseId: payment.courseId,
                }, session);
                payment.enrollmentCreated = true;
                await payment.save({ session });
                await service_2.courseService.updateStudentCount(payment.courseId, 1);
                loggin_1.default.info(`Enrollment created for payment: ${payment._id}`);
            }
            catch (error) {
                loggin_1.default.error(`Failed to create enrollment for payment ${payment._id}: ${error.message}`);
                throw error;
            }
        };
        this.findPaymentById = async (id) => {
            return await entity_1.default.findById(id);
        };
        this.findStudentPayments = async (studentId) => {
            return await entity_1.default.find({ studentId }).sort({ createdAt: -1 });
        };
        this.findPaymentByReference = async (reference) => {
            return await entity_1.default.findOne({ providerReference: reference });
        };
        this.findPaymentByStudentAndCourse = async (studentId, courseId) => {
            return await entity_1.default.findOne({
                studentId,
                courseId,
                status: enum_1.PaymentStatus.Success,
            });
        };
    }
}
exports.paymentService = new PaymentService();
