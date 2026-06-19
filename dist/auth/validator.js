"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const constants_1 = require("../utils/constants");
class AuthValidator {
    constructor() {
        this.validateSignup = async (req, res, next) => {
            const schema = joi_1.default.object({
                email: joi_1.default.string()
                    .email()
                    .required()
                    .messages({
                    "string.email": "Please enter a valid email address",
                    "any.required": "Email is required",
                }),
                fullName: joi_1.default.string()
                    .trim()
                    .min(2)
                    .max(100)
                    .required()
                    .messages({
                    "string.min": "Full name must be at least 2 characters",
                    "string.max": "Full name cannot exceed 100 characters",
                    "any.required": "Full name is required",
                }),
                password: joi_1.default.string()
                    .min(8)
                    .pattern(constants_1.PASSWORD_REGEX)
                    .required()
                    .messages({
                    "any.required": "Password is required",
                    "string.min": "Password must be at least 8 characters",
                    "string.pattern.base": "Password must contain uppercase, lowercase, and numbers",
                }),
                confirmPassword: joi_1.default.string()
                    .valid(joi_1.default.ref("password"))
                    .required()
                    .messages({
                    "any.required": "Confirm password is required",
                    "any.only": "Passwords do not match",
                }),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            next();
        };
        this.validateEmailVerify = async (req, res, next) => {
            const schema = joi_1.default.object({
                email: joi_1.default.string()
                    .email()
                    .required()
                    .messages({
                    "string.email": "Invalid email",
                    "any.required": "Email is required",
                }),
                otp: joi_1.default.string()
                    .pattern(/^\d{6}$/)
                    .required()
                    .messages({
                    "string.pattern.base": "OTP must be 6 digits",
                    "any.required": "OTP is required",
                }),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            next();
        };
        this.validateResendVerification = async (req, res, next) => {
            const schema = joi_1.default.object({
                email: joi_1.default.string()
                    .email()
                    .required()
                    .messages({
                    "string.email": "Invalid email",
                    "any.required": "Email is required",
                }),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            next();
        };
        this.validateForgotPassword = async (req, res, next) => {
            const schema = joi_1.default.object({
                email: joi_1.default.string()
                    .email()
                    .required()
                    .messages({
                    "string.email": "Invalid email",
                    "any.required": "Email is required",
                }),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            next();
        };
        this.validateResetPassword = async (req, res, next) => {
            const schema = joi_1.default.object({
                email: joi_1.default.string()
                    .email()
                    .required()
                    .messages({
                    "string.email": "Invalid email",
                    "any.required": "Email is required",
                }),
                otp: joi_1.default.string()
                    .pattern(/^\d{6}$/)
                    .required()
                    .messages({
                    "string.pattern.base": "OTP must be 6 digits",
                    "any.required": "OTP is required",
                }),
                newPassword: joi_1.default.string()
                    .min(8)
                    .pattern(constants_1.PASSWORD_REGEX)
                    .required()
                    .messages({
                    "any.required": "New password is required",
                    "string.min": "Password must be at least 8 characters",
                    "string.pattern.base": "Password must contain uppercase, lowercase, and numbers",
                }),
                confirmPassword: joi_1.default.string()
                    .valid(joi_1.default.ref("newPassword"))
                    .required()
                    .messages({
                    "any.required": "Confirm password is required",
                    "any.only": "Passwords do not match",
                }),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            next();
        };
        this.validateLogin = async (req, res, next) => {
            const schema = joi_1.default.object({
                email: joi_1.default.string()
                    .email()
                    .required()
                    .messages({
                    "string.email": "Invalid email",
                    "any.required": "Email is required",
                }),
                password: joi_1.default.string()
                    .required()
                    .messages({
                    "any.required": "Password is required",
                }),
            });
            const { error } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            next();
        };
    }
}
exports.authValidator = new AuthValidator();
