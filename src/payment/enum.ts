export enum PaymentStatus {
  Pending = "pending",
  Success = "success",
  Failed = "failed",
  Cancelled = "cancelled",
}

export enum PaymentType {
  CourseEnrollment = "course_enrollment",
}

export enum PaymentProvider {
  Paystack = "paystack",
}

export enum VerificationMethod {
  Webhook = "webhook",
  Manual = "manual",
  Pending = "pending",
}
