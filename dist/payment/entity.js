"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const enum_1 = require("./enum");
const paymentSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true,
    },
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: Object.values(enum_1.PaymentStatus),
        default: enum_1.PaymentStatus.Pending,
        index: true,
    },
    type: {
        type: String,
        enum: Object.values(enum_1.PaymentType),
        default: enum_1.PaymentType.CourseEnrollment,
    },
    provider: {
        type: String,
        enum: Object.values(enum_1.PaymentProvider),
        default: enum_1.PaymentProvider.Paystack,
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
        enum: Object.values(enum_1.VerificationMethod),
        default: enum_1.VerificationMethod.Pending,
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
        type: mongoose_1.Schema.Types.Mixed,
        default: undefined,
    },
}, { timestamps: true });
// Compound index for finding payments by student and course
paymentSchema.index({ studentId: 1, courseId: 1 });
// Index for finding successful payments
paymentSchema.index({ status: 1, paidAt: 1 });
const Payment = mongoose_1.default.model("Payment", paymentSchema);
exports.default = Payment;
