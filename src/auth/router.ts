import { Router } from "express";
import { studentAuthController } from "../student/controller";
import { adminAuthController } from "../admin/controller";
import { authValidator } from "./validator";
import { utils } from "../utils";

export const AuthRouter = Router();

// Student Auth Routes
AuthRouter.post("/student/signup", authValidator.validateSignup, utils.wrapAsync(studentAuthController.signup));

AuthRouter.post("/student/verify-email", authValidator.validateEmailVerify, utils.wrapAsync(studentAuthController.verifyEmail));

AuthRouter.post("/student/resend-verification", authValidator.validateResendVerification, utils.wrapAsync(studentAuthController.resendVerificationEmail));

AuthRouter.post("/student/forgot-password", authValidator.validateForgotPassword, utils.wrapAsync(studentAuthController.forgotPassword));

AuthRouter.post("/student/reset-password", authValidator.validateResetPassword, utils.wrapAsync(studentAuthController.resetPassword));

AuthRouter.post("/student/login", authValidator.validateLogin, utils.wrapAsync(studentAuthController.login));

// Admin Auth Routes
AuthRouter.post("/admin/login", authValidator.validateLogin, utils.wrapAsync(adminAuthController.login));
