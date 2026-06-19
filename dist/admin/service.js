"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = void 0;
const entity_1 = __importDefault(require("./entity"));
const enum_1 = require("../auth/enum");
class AdminService {
    constructor() {
        this.createAdmin = async (input) => {
            const admin = new entity_1.default({
                email: input.email,
                fullName: input.fullName,
                password: input.password,
                emailVerificationOtp: input.emailVerificationOtp,
                emailVerificationOtpExpiration: input.emailVerificationOtpExpiration,
                lastOtpSentAt: input.lastOtpSentAt,
                status: enum_1.AccountStatus.PendingVerification,
            });
            await admin.save();
            return admin;
        };
        this.findAdminById = async (id) => {
            return await entity_1.default.findById(id);
        };
        this.findAdminByEmail = async (email) => {
            return await entity_1.default.findOne({ email });
        };
        this.findAdminByEmailWithPassword = async (email) => {
            return await entity_1.default.findOne({ email }).select("+password");
        };
        this.markEmailAsVerified = async (email) => {
            return await entity_1.default.findOneAndUpdate({ email }, {
                $set: { status: enum_1.AccountStatus.Active },
                $unset: {
                    emailVerificationOtp: 1,
                    emailVerificationOtpExpiration: 1,
                },
            }, { new: true });
        };
        this.updateEmailVerificationOtp = async ({ email, otp, expiration }) => {
            return await entity_1.default.findOneAndUpdate({ email }, {
                emailVerificationOtp: otp,
                emailVerificationOtpExpiration: expiration,
                lastOtpSentAt: new Date(),
            }, { new: true });
        };
        this.setPasswordResetOtp = async (email, otp, expiration) => {
            return await entity_1.default.findOneAndUpdate({ email }, {
                passwordResetOtp: otp,
                passwordResetOtpExpiration: expiration,
                lastOtpSentAt: new Date(),
            }, { new: true });
        };
        this.updatePassword = async (email, newPassword) => {
            return await entity_1.default.findOneAndUpdate({ email }, {
                password: newPassword,
                $unset: {
                    passwordResetOtp: 1,
                    passwordResetOtpExpiration: 1,
                },
            }, { new: true });
        };
    }
}
exports.adminService = new AdminService();
