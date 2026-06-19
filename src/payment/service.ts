import mongoose from "mongoose";
import Payment from "./entity";
import { enrollmentService } from "../course/enrollment/service";
import { courseService } from "../course/service";
import { IInitiatePaymentInput, IPayment, IVerifyPaymentInput, IWebhookPayload } from "./interface";
import { PaymentStatus, PaymentType, VerificationMethod } from "./enum";
import { paystackService } from "../utils/paystack";
import Logging from "../utils/loggin";
import appConfig from "../config";

class PaymentService {
  public initiatePayment = async (input: IInitiatePaymentInput): Promise<any> => {
    const payment = new Payment({
      studentId: input.studentId,
      courseId: input.courseId,
      amount: input.amount,
      currency: input.currency,
      status: PaymentStatus.Pending,
      type: PaymentType.CourseEnrollment,
      verificationMethod: VerificationMethod.Pending,
    });

    await payment.save();

    Logging.info(`[initiatePayment] Starting payment initialization for student: ${input.studentId}`);

    const paystackPayment = await paystackService.initializeTransaction({
      customerEmail: input.studentEmail,
      customerName: input.studentName,
      amount: input.amount * 100,
      paymentReference: payment._id.toString(),
      callbackUrl: `${appConfig.frontend.baseUrl}/student-dashboard/payment-success`,
      metadata: {
        paymentId: payment._id.toString(),
        studentId: input.studentId.toString(),
        courseId: input.courseId.toString(),
      },
    });

    Logging.info(`[initiatePayment] Paystack response received: ${JSON.stringify({
      status: paystackPayment.status,
      message: paystackPayment.message,
      dataKeys: paystackPayment.data ? Object.keys(paystackPayment.data) : null,
      reference: paystackPayment.data?.reference,
      authUrl: paystackPayment.data?.authorization_url?.substring(0, 50) + '...',
    })}`);

    const providerRef = paystackPayment.data?.reference;
    if (!providerRef) {
      Logging.error(`[initiatePayment] ERROR: No reference in Paystack response!`);
      throw new Error('Paystack did not return a payment reference');
    }

    Logging.info(`[initiatePayment] Saving payment with reference: ${providerRef}`);
    await Payment.findByIdAndUpdate(payment._id, {
      providerReference: providerRef,
      metadata: paystackPayment.data,
    });

    Logging.info(`[initiatePayment] Payment saved successfully - reference: ${providerRef}`);

    return paystackPayment;
  };

  public verifyPayment = async (input: IVerifyPaymentInput) => {
    Logging.info(`[verifyPayment] Verifying payment with reference: ${input.reference}`);

    const verification = await paystackService.verifyTransaction(input.reference);

    Logging.info(`[verifyPayment] Paystack verification result: ${JSON.stringify({
      status: verification?.status,
      message: verification?.message,
    })}`);

    if (!verification || !verification.status) {
      Logging.warn(`[verifyPayment] Payment not verified by Paystack - reference: ${input.reference}`);
      return null;
    }

    // Use MongoDB transaction to prevent race conditions
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      Logging.info(`[verifyPayment] Querying database for payment with providerReference: ${input.reference}`);
      const payment = await Payment.findOne({
        providerReference: input.reference,
      }).session(session);

      Logging.info(`[verifyPayment] Database query result: paymentFound=${!!payment}, paymentId=${payment?._id}`);

      if (!payment) {
        Logging.error(`Payment not found for reference: ${input.reference}`);
        await session.abortTransaction();
        return null;
      }

      // If already verified, return (idempotent)
      if (payment.status === PaymentStatus.Success) {
        await session.abortTransaction();
        return payment;
      }

      // Update payment status
      payment.status = PaymentStatus.Success;
      payment.paidAt = new Date();
      payment.providerTransactionId = verification.id;
      payment.verificationMethod = VerificationMethod.Manual;

      await payment.save({ session });

      // Create enrollment if not already created
      if (!payment.enrollmentCreated) {
        await this.createEnrollmentFromPayment(payment, session);
      }

      await session.commitTransaction();
      return payment;
    } catch (error: any) {
      await session.abortTransaction();
      Logging.error(`verifyPayment transaction failed: ${error.message}`);
      throw error;
    } finally {
      await session.endSession();
    }
  };

  public handleWebhook = async (payload: IWebhookPayload) => {
    if (payload.event !== "charge.success") {
      Logging.info(`Ignoring non-success webhook event: ${payload.event}`);
      return null;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const reference = payload.data.reference;
      const payment = await Payment.findOne({ providerReference: reference }).session(session);

      if (!payment) {
        Logging.error(`Payment not found for webhook reference: ${reference}`);
        await session.abortTransaction();
        return null;
      }

      if (payment.status === PaymentStatus.Success) {
        Logging.info(`Payment already verified: ${reference}`);
        await session.abortTransaction();
        return payment;
      }

      payment.status = PaymentStatus.Success;
      payment.paidAt = new Date();
      payment.providerTransactionId = payload.data.id;
      payment.verificationMethod = VerificationMethod.Webhook;

      await payment.save({ session });

      if (!payment.enrollmentCreated) {
        await this.createEnrollmentFromPayment(payment, session);
      }

      await session.commitTransaction();
      return payment;
    } catch (error: any) {
      await session.abortTransaction();
      Logging.error(`handleWebhook transaction failed: ${error.message}`);
      throw error;
    } finally {
      await session.endSession();
    }
  };

  private createEnrollmentFromPayment = async (payment: IPayment, session: any) => {
    try {
      await enrollmentService.enrollStudent(
        {
          studentId: payment.studentId,
          courseId: payment.courseId,
        },
        session
      );

      payment.enrollmentCreated = true;
      await payment.save({ session });

      await courseService.updateStudentCount(payment.courseId, 1);

      Logging.info(`Enrollment created for payment: ${payment._id}`);
    } catch (error: any) {
      Logging.error(`Failed to create enrollment for payment ${payment._id}: ${error.message}`);
      throw error;
    }
  };

  public findPaymentById = async (id: string | mongoose.Types.ObjectId) => {
    return await Payment.findById(id);
  };

  public findStudentPayments = async (studentId: string | mongoose.Types.ObjectId) => {
    return await Payment.find({ studentId }).sort({ createdAt: -1 });
  };

  public findPaymentByReference = async (reference: string) => {
    return await Payment.findOne({ providerReference: reference });
  };

  public findPaymentByStudentAndCourse = async (
    studentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId
  ) => {
    return await Payment.findOne({
      studentId,
      courseId,
      status: PaymentStatus.Success,
    });
  };
}

export const paymentService = new PaymentService();
