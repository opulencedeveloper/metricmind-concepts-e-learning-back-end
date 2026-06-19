"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentAuthController = void 0;
const service_1 = require("./service");
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const auth_1 = require("../utils/auth");
const email_1 = require("../utils/email");
const template_1 = require("../utils/template");
const enum_2 = require("../auth/enum");
const config_1 = __importDefault(require("../config"));
const loggin_1 = __importDefault(require("../utils/loggin"));
class StudentAuthController {
    constructor() {
        this.signup = async (req, res) => {
            const body = req.body;
            const { email, password, fullName } = body;
            const existingStudent = await service_1.studentService.findStudentByEmail(email);
            if (existingStudent) {
                if (existingStudent.status === enum_2.AccountStatus.PendingVerification) {
                    return utils_1.utils.customResponse({
                        status: 200,
                        res,
                        message: enum_1.MessageResponse.VerifyEmail,
                        description: "Account exists but email not verified. Resend OTP",
                        data: { email: existingStudent.email, status: existingStudent.status },
                    });
                }
                return utils_1.utils.customResponse({
                    status: 409,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Email already registered",
                    data: null,
                });
            }
            const { otp, expiration } = utils_1.utils.getOtpAndExpiration(6);
            const lastOtpSentAt = new Date();
            const createInput = {
                email,
                password,
                fullName,
                emailVerificationOtp: otp,
                emailVerificationOtpExpiration: expiration,
                lastOtpSentAt,
            };
            const student = await service_1.studentService.createStudent(createInput);
            this.sendVerificationEmail({ email, fullName, otp });
            return utils_1.utils.customResponse({
                status: 201,
                res,
                message: enum_1.MessageResponse.VerifyEmail,
                description: "Account created. Verification email sent",
                data: { email, status: student.status },
            });
        };
        this.verifyEmail = async (req, res) => {
            const body = req.body;
            const { email, otp } = body;
            const student = await service_1.studentService.findStudentByEmailWithOtp(email);
            if (!student) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Student not found",
                    data: null,
                });
            }
            if (student.status !== enum_2.AccountStatus.PendingVerification) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Email already verified",
                    data: null,
                });
            }
            if (student.emailVerificationOtp !== otp) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Invalid OTP",
                    data: null,
                });
            }
            if (!student.emailVerificationOtpExpiration || new Date() > student.emailVerificationOtpExpiration) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "OTP expired",
                    data: null,
                });
            }
            const verifiedStudent = await service_1.studentService.markEmailAsVerified(email);
            if (!verifiedStudent) {
                return utils_1.utils.customResponse({
                    status: 500,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Failed to verify email",
                    data: null,
                });
            }
            const token = auth_1.authUtil.generateAuthToken(verifiedStudent._id, enum_2.UserType.Student, config_1.default.jwt.expiresIn);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Email verified successfully",
                data: {
                    token,
                    student: {
                        id: verifiedStudent._id,
                        email: verifiedStudent.email,
                        fullName: verifiedStudent.fullName,
                        status: verifiedStudent.status,
                    },
                },
            });
        };
        this.resendVerificationEmail = async (req, res) => {
            const { email } = req.body;
            const student = await service_1.studentService.findStudentByEmail(email);
            if (!student) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Student not found",
                    data: null,
                });
            }
            if (student.status !== enum_2.AccountStatus.PendingVerification) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Email already verified",
                    data: null,
                });
            }
            const { otp, expiration } = utils_1.utils.getOtpAndExpiration(6);
            await service_1.studentService.updateEmailVerificationOtp({ email, otp, expiration });
            this.sendVerificationEmail({ email, fullName: student.fullName, otp });
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Verification email resent",
                data: null,
            });
        };
        this.forgotPassword = async (req, res) => {
            const body = req.body;
            const { email } = body;
            const student = await service_1.studentService.findStudentByEmail(email);
            if (!student) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Student not found",
                    data: null,
                });
            }
            const { otp, expiration } = utils_1.utils.getOtpAndExpiration(6);
            await service_1.studentService.setPasswordResetOtp(email, otp, expiration);
            this.sendPasswordResetEmail({ email, fullName: student.fullName, otp });
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Password reset OTP sent to email",
                data: null,
            });
        };
        this.resetPassword = async (req, res) => {
            const body = req.body;
            const { email, otp, newPassword } = body;
            const student = await service_1.studentService.findStudentByEmailWithOtp(email);
            if (!student) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Student not found",
                    data: null,
                });
            }
            if (student.passwordResetOtp !== otp) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Invalid OTP",
                    data: null,
                });
            }
            if (!student.passwordResetOtpExpiration || new Date() > student.passwordResetOtpExpiration) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "OTP expired",
                    data: null,
                });
            }
            const hashedPassword = await auth_1.authUtil.hashPassword(newPassword);
            await service_1.studentService.updatePassword(email, hashedPassword);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Password reset successfully",
                data: null,
            });
        };
        this.login = async (req, res) => {
            const body = req.body;
            const { email, password } = body;
            const student = await service_1.studentService.findStudentByEmailWithPassword(email);
            if (!student) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Invalid email or password",
                    data: null,
                });
            }
            const isPasswordMatch = await auth_1.authUtil.comparePassword(password, student.password);
            if (!isPasswordMatch) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Invalid email or password",
                    data: null,
                });
            }
            if (student.status !== enum_2.AccountStatus.Active) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: `Account is ${student.status}`,
                    data: null,
                });
            }
            const token = auth_1.authUtil.generateAuthToken(student._id, enum_2.UserType.Student, config_1.default.jwt.expiresIn);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Login successful",
                data: {
                    token,
                    student: {
                        id: student._id,
                        email: student.email,
                        fullName: student.fullName,
                        status: student.status,
                        createdAt: student.createdAt,
                    },
                },
            });
        };
        this.updateProfile = async (req, res) => {
            const studentId = req.userId;
            const { fullName } = req.body;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized",
                    data: null,
                });
            }
            if (!fullName || !fullName.trim()) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Full name is required",
                    data: null,
                });
            }
            try {
                const updated = await service_1.studentService.updateProfile(studentId, fullName.trim());
                if (!updated) {
                    return utils_1.utils.customResponse({
                        status: 404,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: "Student not found",
                        data: null,
                    });
                }
                return utils_1.utils.customResponse({
                    status: 200,
                    res,
                    message: enum_1.MessageResponse.Success,
                    description: "Profile updated successfully",
                    data: {
                        student: {
                            id: updated._id,
                            fullName: updated.fullName,
                            createdAt: updated.createdAt,
                        },
                    },
                });
            }
            catch (error) {
                console.error('Update profile error:', error);
                return utils_1.utils.customResponse({
                    status: 500,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Failed to update profile",
                    data: null,
                });
            }
        };
        this.changePassword = async (req, res) => {
            const studentId = req.userId;
            const { currentPassword, newPassword } = req.body;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized",
                    data: null,
                });
            }
            if (!currentPassword || !newPassword) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Current and new password are required",
                    data: null,
                });
            }
            try {
                const student = await service_1.studentService.findStudentById(studentId);
                if (!student) {
                    return utils_1.utils.customResponse({
                        status: 404,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: "Student not found",
                        data: null,
                    });
                }
                const withPassword = await service_1.studentService.findStudentByEmailWithPassword(student.email);
                const isMatch = await auth_1.authUtil.comparePassword(currentPassword, withPassword.password);
                if (!isMatch) {
                    return utils_1.utils.customResponse({
                        status: 401,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: "Current password is incorrect",
                        data: null,
                    });
                }
                await service_1.studentService.changePassword(studentId, newPassword);
                return utils_1.utils.customResponse({
                    status: 200,
                    res,
                    message: enum_1.MessageResponse.Success,
                    description: "Password changed successfully",
                    data: null,
                });
            }
            catch (error) {
                console.error('Change password error:', error);
                return utils_1.utils.customResponse({
                    status: 500,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Failed to change password",
                    data: null,
                });
            }
        };
        this.sendVerificationEmail = (input) => {
            setImmediate(async () => {
                try {
                    const emailTemplate = (0, template_1.verificationEmailTemplate)(input.fullName, input.otp);
                    await (0, email_1.sendEmail)({
                        receiverEmail: input.email,
                        subject: "Verify Your Email Address",
                        emailTemplate,
                    });
                    loggin_1.default.info(`Verification email sent to ${input.email}`);
                }
                catch (error) {
                    loggin_1.default.error(`Failed to send verification email to ${input.email}: ${error.message}`);
                }
            });
        };
        this.sendPasswordResetEmail = (input) => {
            setImmediate(async () => {
                try {
                    const emailTemplate = (0, template_1.passwordResetEmailTemplate)(input.fullName, input.otp);
                    await (0, email_1.sendEmail)({
                        receiverEmail: input.email,
                        subject: "Reset Your Password",
                        emailTemplate,
                    });
                    loggin_1.default.info(`Password reset email sent to ${input.email}`);
                }
                catch (error) {
                    loggin_1.default.error(`Failed to send password reset email to ${input.email}: ${error.message}`);
                }
            });
        };
    }
}
exports.studentAuthController = new StudentAuthController();
