"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const controller_1 = require("../student/controller");
const controller_2 = require("../admin/controller");
const validator_1 = require("./validator");
const utils_1 = require("../utils");
exports.AuthRouter = (0, express_1.Router)();
// Student Auth Routes
exports.AuthRouter.post("/student/signup", validator_1.authValidator.validateSignup, utils_1.utils.wrapAsync(controller_1.studentAuthController.signup));
exports.AuthRouter.post("/student/verify-email", validator_1.authValidator.validateEmailVerify, utils_1.utils.wrapAsync(controller_1.studentAuthController.verifyEmail));
exports.AuthRouter.post("/student/resend-verification", validator_1.authValidator.validateResendVerification, utils_1.utils.wrapAsync(controller_1.studentAuthController.resendVerificationEmail));
exports.AuthRouter.post("/student/forgot-password", validator_1.authValidator.validateForgotPassword, utils_1.utils.wrapAsync(controller_1.studentAuthController.forgotPassword));
exports.AuthRouter.post("/student/reset-password", validator_1.authValidator.validateResetPassword, utils_1.utils.wrapAsync(controller_1.studentAuthController.resetPassword));
exports.AuthRouter.post("/student/login", validator_1.authValidator.validateLogin, utils_1.utils.wrapAsync(controller_1.studentAuthController.login));
// Admin Auth Routes
exports.AuthRouter.post("/admin/login", validator_1.authValidator.validateLogin, utils_1.utils.wrapAsync(controller_2.adminAuthController.login));
