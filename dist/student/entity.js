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
const enum_1 = require("../auth/enum");
const auth_1 = require("../utils/auth");
const studentSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    status: {
        type: String,
        enum: Object.values(enum_1.AccountStatus),
        default: enum_1.AccountStatus.PendingVerification,
        index: true,
    },
    emailVerificationOtp: {
        type: String,
        trim: true,
        default: undefined,
        select: false,
    },
    emailVerificationOtpExpiration: {
        type: Date,
        default: undefined,
        select: false,
    },
    passwordResetOtp: {
        type: String,
        trim: true,
        default: undefined,
        select: false,
    },
    passwordResetOtpExpiration: {
        type: Date,
        default: undefined,
        select: false,
    },
    lastOtpSentAt: {
        type: Date,
        default: undefined,
        select: false,
    },
}, { timestamps: true });
studentSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    try {
        const hashed = await auth_1.authUtil.hashPassword(this.password);
        this.password = hashed;
        next();
    }
    catch (error) {
        next(error);
    }
});
const Student = mongoose_1.default.model("Student", studentSchema);
exports.default = Student;
