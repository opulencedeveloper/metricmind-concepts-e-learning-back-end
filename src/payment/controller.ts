import { Response } from "express";
import mongoose from "mongoose";
import { paymentService } from "./service";
import { courseService } from "../course/service";
import { studentService } from "../student/service";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { CustomRequest } from "../utils/interface";
import { IInitiatePaymentInput, IWebhookPayload } from "./interface";
import Logging from "../utils/loggin";

class PaymentController {
  public initiatePayment = async (req: CustomRequest, res: Response) => {
    const studentId = req.userId;
    const { courseId } = req.params;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    const student = await studentService.findStudentById(studentId);

    if (!student) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Student not found",
        data: null,
      });
    }

    const existingPayment = await paymentService.findPaymentByStudentAndCourse(studentId, courseId);

    if (existingPayment) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "You are already enrolled in this course",
        data: null,
      });
    }

    const paystackPayment = await paymentService.initiatePayment({
      studentId: new mongoose.Types.ObjectId(studentId.toString()),
      courseId: new mongoose.Types.ObjectId(courseId),
      amount: course.price,
      currency: course.currency,
      studentEmail: student.email,
      studentName: student.fullName,
    });

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Payment initiated",
      data: {
        authorizationUrl: paystackPayment.data.authorization_url,
        accessCode: paystackPayment.data.access_code,
        reference: paystackPayment.data.reference,
      },
    });
  };

  public verifyPayment = async (req: CustomRequest, res: Response) => {
    const { reference } = req.query;

    Logging.info(`[verifyPayment] Incoming request - reference: ${reference}`);

    if (!reference || typeof reference !== "string") {
      Logging.warn(`[verifyPayment] Invalid reference - reference: ${reference}`);
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Payment reference is required",
        data: null,
      });
    }

    try {
      const payment = await paymentService.verifyPayment({ reference });

      Logging.info(`[verifyPayment] Payment verification result - ${JSON.stringify({
        reference,
        paymentFound: !!payment,
        status: payment?.status,
        enrollmentCreated: payment?.enrollmentCreated,
      })}`);

      if (!payment) {
        Logging.warn(`[verifyPayment] Payment not found - reference: ${reference}`);
        return utils.customResponse({
          status: 400,
          res,
          message: MessageResponse.Error,
          description: "Payment verification failed",
          data: null,
        });
      }

      Logging.info(`[verifyPayment] Payment verified successfully - reference: ${reference}`);
      return utils.customResponse({
        status: 200,
        res,
        message: MessageResponse.Success,
        description: "Payment verified successfully",
        data: {
          status: payment.status,
          enrollmentCreated: payment.enrollmentCreated,
        },
      });
    } catch (error: any) {
      Logging.error(`[verifyPayment] Error verifying payment - reference: ${reference}, error: ${error.message}`);
      return utils.customResponse({
        status: 500,
        res,
        message: MessageResponse.Error,
        description: "Error verifying payment",
        data: null,
      });
    }
  };

  public handleWebhook = async (req: CustomRequest, res: Response) => {
    const signature = req.get("x-paystack-signature");
    const body = (req as any).rawBody;

    if (!signature || !body) {
      Logging.error("Webhook: Missing signature or body");
      return res.status(400).json({ error: "Invalid webhook" });
    }

    try {
      const hash = require("crypto")
        .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "")
        .update(body)
        .digest("hex");

      if (hash !== signature) {
        Logging.error("Webhook: Invalid signature");
        return res.status(401).json({ error: "Invalid signature" });
      }

      const payload: IWebhookPayload = JSON.parse(body);

      const payment = await paymentService.handleWebhook(payload);

      if (!payment) {
        Logging.warn(`Webhook: Payment not found for reference`);
        return res.status(200).json({ message: "Webhook processed" });
      }

      Logging.info(`Webhook: Payment verified - ${payment._id}`);

      return res.status(200).json({
        message: "Webhook processed successfully",
        paymentId: payment._id,
      });
    } catch (error: any) {
      Logging.error(`Webhook error: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public getPaymentHistory = async (req: CustomRequest, res: Response) => {
    const studentId = req.userId;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    const payments = await paymentService.findStudentPayments(studentId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Payment history retrieved",
      data: {
        payments,
        total: payments.length,
      },
    });
  };
}

export const paymentController = new PaymentController();
