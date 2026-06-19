import mongoose, { Schema } from "mongoose";
import { IPayment } from "./interface";
import { PaymentStatus, PaymentType, PaymentProvider, VerificationMethod } from "./enum";

const paymentSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "NGN",
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Pending,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(PaymentType),
      default: PaymentType.CourseEnrollment,
    },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      default: PaymentProvider.Paystack,
    },
    providerTransactionId: {
      type: String,
      default: undefined,
      index: true,
    },
    providerReference: {
      type: String,
      default: undefined,
      unique: true,
      sparse: true,
      index: true,
    },
    verificationMethod: {
      type: String,
      enum: Object.values(VerificationMethod),
      default: VerificationMethod.Pending,
    },
    enrollmentCreated: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
      default: undefined,
    },
    failureReason: {
      type: String,
      default: undefined,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  { timestamps: true }
);

// Compound index for finding payments by student and course
paymentSchema.index({ studentId: 1, courseId: 1 });

// Index for finding successful payments
paymentSchema.index({ status: 1, paidAt: 1 });

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;
