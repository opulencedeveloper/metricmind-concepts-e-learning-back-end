import { Document, Types } from "mongoose";
import { PaymentStatus, PaymentType, PaymentProvider, VerificationMethod } from "./enum";

export interface IPayment extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  provider: PaymentProvider;
  providerTransactionId?: string;
  providerReference?: string;
  verificationMethod: VerificationMethod;
  enrollmentCreated: boolean;
  paidAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInitiatePaymentInput {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  amount: number;
  currency: string;
  studentEmail: string;
  studentName: string;
}

export interface IVerifyPaymentInput {
  reference: string;
}

export interface IWebhookPayload {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer: {
      email: string;
    };
    authorization: {
      authorization_code: string;
    };
    [key: string]: any;
  };
}
