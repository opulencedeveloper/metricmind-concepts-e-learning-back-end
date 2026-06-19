"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentCourseValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
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
    }
}
exports.studentCourseValidator = new StudentCourseValidator();
