"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentCourseValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const mongoose_1 = __importDefault(require("mongoose"));
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const constants_1 = require("../utils/constants");
class StudentCourseValidator {
    constructor() {
        this.validateSearch = async (req, res, next) => {
            const schema = joi_1.default.object({
                query: joi_1.default.string()
                    .min(2)
                    .max(100)
                    .required()
                    .messages({
                    "string.min": "Search query must be at least 2 characters",
                    "string.max": "Search query cannot exceed 100 characters",
                    "any.required": "Search query is required",
                }),
                page: joi_1.default.number()
                    .integer()
                    .min(1)
                    .default(1)
                    .messages({
                    "number.base": "Page must be a number",
                    "number.min": "Page must be at least 1",
                }),
                limit: joi_1.default.number()
                    .integer()
                    .min(1)
                    .max(50)
                    .default(12)
                    .messages({
                    "number.base": "Limit must be a number",
                    "number.min": "Limit must be at least 1",
                    "number.max": "Limit cannot exceed 50",
                }),
                category: joi_1.default.string()
                    .max(100)
                    .optional()
                    .messages({
                    "string.max": "Category cannot exceed 100 characters",
                }),
            });
            const { error, value } = schema.validate(req.query);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            req.query = value;
            next();
        };
        this.validatePagination = async (req, res, next) => {
            const schema = joi_1.default.object({
                page: joi_1.default.number()
                    .integer()
                    .min(1)
                    .default(1)
                    .messages({
                    "number.base": "Page must be a number",
                    "number.min": "Page must be at least 1",
                }),
                limit: joi_1.default.number()
                    .integer()
                    .min(1)
                    .max(50)
                    .default(12)
                    .messages({
                    "number.base": "Limit must be a number",
                    "number.min": "Limit must be at least 1",
                    "number.max": "Limit cannot exceed 50",
                }),
                category: joi_1.default.string()
                    .max(100)
                    .messages({
                    "string.max": "Category cannot exceed 100 characters",
                }),
                level: joi_1.default.string()
                    .valid("beginner", "intermediate", "advanced")
                    .messages({
                    "any.only": "Invalid course level",
                }),
            });
            const { error, value } = schema.validate(req.query);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            req.query = value;
            next();
        };
        this.validateObjectId = (req, res, next) => {
            const { courseId, quizId, submissionId, enrollmentId, sectionId, reviewId, curriculumItemId } = req.params;
            const idsToValidate = [courseId, quizId, submissionId, enrollmentId, sectionId, reviewId, curriculumItemId].filter(Boolean);
            for (const id of idsToValidate) {
                if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                    return utils_1.utils.customResponse({
                        status: 400,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: "Invalid ID format",
                        data: null,
                    });
                }
            }
            next();
        };
        this.validateSlug = (req, res, next) => {
            const schema = joi_1.default.object({
                courseSlug: joi_1.default.string()
                    .lowercase()
                    .trim()
                    .min(3)
                    .max(255)
                    .required()
                    .regex(/^[a-z0-9-]+$/)
                    .messages({
                    "string.min": "Slug must be at least 3 characters",
                    "string.max": "Slug cannot exceed 255 characters",
                    "string.pattern.base": "Slug can only contain lowercase letters, numbers, and hyphens",
                    "any.required": "Slug is required",
                }),
            });
            const { error } = schema.validate(req.params);
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
        this.validateQuizSubmission = (req, res, next) => {
            const schema = joi_1.default.object({
                quizId: joi_1.default.string()
                    .required()
                    .custom((value, helpers) => {
                    if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
                        return helpers.error("any.invalid");
                    }
                    return value;
                })
                    .messages({
                    "any.required": "quizId is required",
                    "any.invalid": "quizId must be a valid MongoDB ID",
                }),
                answers: joi_1.default.object()
                    .pattern(joi_1.default.string().pattern(/^\d+$/), joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.number()))
                    .min(1)
                    .required()
                    .messages({
                    "object.min": "At least one answer is required",
                    "any.required": "answers object is required",
                }),
                timeTaken: joi_1.default.number()
                    .integer()
                    .min(0)
                    .optional()
                    .messages({
                    "number.base": "timeTaken must be a number",
                    "number.min": "timeTaken cannot be negative",
                }),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            req.body = value;
            next();
        };
        this.validateWishlist = (req, res, next) => {
            const schema = joi_1.default.object({
                courseId: joi_1.default.string()
                    .required()
                    .custom((value, helpers) => {
                    if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
                        return helpers.error("any.invalid");
                    }
                    return value;
                })
                    .messages({
                    "any.required": "courseId is required",
                    "any.invalid": "courseId must be a valid MongoDB ID",
                }),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            req.body = value;
            next();
        };
        this.validateReviewSubmit = (req, res, next) => {
            const schema = joi_1.default.object({
                rating: joi_1.default.number()
                    .integer()
                    .min(1)
                    .max(5)
                    .required()
                    .messages({
                    "number.base": "Rating must be a number",
                    "number.min": "Rating must be at least 1",
                    "number.max": "Rating cannot exceed 5",
                    "any.required": "Rating is required",
                }),
                comment: joi_1.default.string()
                    .trim()
                    .min(10)
                    .max(1000)
                    .required()
                    .messages({
                    "string.min": "Review must be at least 10 characters",
                    "string.max": "Review cannot exceed 1000 characters",
                    "any.required": "Review comment is required",
                }),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            req.body = value;
            next();
        };
        this.validateReviewUpdate = (req, res, next) => {
            const schema = joi_1.default.object({
                rating: joi_1.default.number()
                    .integer()
                    .min(1)
                    .max(5)
                    .optional()
                    .messages({
                    "number.base": "Rating must be a number",
                    "number.min": "Rating must be at least 1",
                    "number.max": "Rating cannot exceed 5",
                }),
                comment: joi_1.default.string()
                    .trim()
                    .min(10)
                    .max(1000)
                    .optional()
                    .messages({
                    "string.min": "Review must be at least 10 characters",
                    "string.max": "Review cannot exceed 1000 characters",
                }),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            req.body = value;
            next();
        };
        this.validateUpdateProfile = (req, res, next) => {
            const schema = joi_1.default.object({
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
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            req.body = value;
            next();
        };
        this.validateChangePassword = (req, res, next) => {
            const schema = joi_1.default.object({
                currentPassword: joi_1.default.string()
                    .required()
                    .messages({
                    "any.required": "Current password is required",
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
                    "any.only": "Passwords must match",
                    "any.required": "Confirm password is required",
                }),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.details[0].message,
                    data: null,
                });
            }
            req.body = value;
            next();
        };
    }
}
exports.studentCourseValidator = new StudentCourseValidator();
