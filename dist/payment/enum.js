"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationMethod = exports.PaymentProvider = exports.PaymentType = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["Pending"] = "pending";
    PaymentStatus["Success"] = "success";
    PaymentStatus["Failed"] = "failed";
    PaymentStatus["Cancelled"] = "cancelled";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentType;
(function (PaymentType) {
    PaymentType["CourseEnrollment"] = "course_enrollment";
})(PaymentType || (exports.PaymentType = PaymentType = {}));
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["Paystack"] = "paystack";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var VerificationMethod;
(function (VerificationMethod) {
    VerificationMethod["Webhook"] = "webhook";
    VerificationMethod["Manual"] = "manual";
    VerificationMethod["Pending"] = "pending";
})(VerificationMethod || (exports.VerificationMethod = VerificationMethod = {}));
