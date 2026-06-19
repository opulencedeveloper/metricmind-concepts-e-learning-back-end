"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const enum_2 = require("./enum");
const service_1 = require("./section/service");
const service_2 = require("./curriculum-item/service");
class CourseValidator {
    constructor() {
        this.validateCreateCourse = async (req, res, next) => {
            const schema = joi_1.default.object({
                title: joi_1.default.string()
                    .min(5)
                    .max(200)
                    .required()
                    .messages({
                    "string.min": "Course title must be at least 5 characters",
                    "string.max": "Course title cannot exceed 200 characters",
                    "any.required": "Course title is required",
                }),
                description: joi_1.default.string()
                    .min(20)
                    .max(2000)
                    .required()
                    .messages({
                    "string.min": "Course description must be at least 20 characters",
                    "string.max": "Course description cannot exceed 2000 characters",
                    "any.required": "Course description is required",
                }),
                instructor: joi_1.default.string()
                    .min(2)
                    .max(100)
                    .required()
                    .messages({
                    "string.min": "Instructor name must be at least 2 characters",
                    "any.required": "Instructor name is required",
                }),
                instructorBio: joi_1.default.string()
                    .max(500)
                    .messages({
                    "string.max": "Instructor bio cannot exceed 500 characters",
                }),
                instructorImage: joi_1.default.string()
                    .uri()
                    .messages({
                    "string.uri": "Instructor image must be a valid URL",
                }),
                category: joi_1.default.string()
                    .min(2)
                    .max(100)
                    .required()
                    .messages({
                    "string.min": "Category must be at least 2 characters",
                    "any.required": "Course category is required",
                }),
                subcategory: joi_1.default.string()
                    .max(100)
                    .messages({
                    "string.max": "Subcategory cannot exceed 100 characters",
                }),
                level: joi_1.default.string()
                    .valid(...Object.values(enum_2.CourseLevel))
                    .messages({
                    "any.only": "Invalid course level",
                }),
                language: joi_1.default.string()
                    .valid(...Object.values(enum_2.Language))
                    .messages({
                    "any.only": "Invalid language",
                }),
                price: joi_1.default.number()
                    .min(0)
                    .required()
                    .messages({
                    "number.min": "Price cannot be negative",
                    "any.required": "Price is required",
                }),
                currency: joi_1.default.string()
                    .valid(...Object.values(enum_2.Currency))
                    .messages({
                    "any.only": "Invalid currency",
                }),
                thumbnail: joi_1.default.string()
                    .uri()
                    .required()
                    .messages({
                    "string.uri": "Thumbnail must be a valid URL",
                    "any.required": "Thumbnail URL is required",
                }),
                previewVideoUrl: joi_1.default.string()
                    .uri()
                    .messages({
                    "string.uri": "Preview video URL must be valid",
                }),
                learningObjectives: joi_1.default.array()
                    .items(joi_1.default.string().min(5).max(200))
                    .max(10)
                    .messages({
                    "array.max": "Maximum 10 learning objectives allowed",
                }),
                requirements: joi_1.default.array()
                    .items(joi_1.default.string().min(5).max(200))
                    .max(10)
                    .messages({
                    "array.max": "Maximum 10 requirements allowed",
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
        this.validateUpdateCourse = async (req, res, next) => {
            const schema = joi_1.default.object({
                title: joi_1.default.string()
                    .min(5)
                    .max(200)
                    .messages({
                    "string.min": "Course title must be at least 5 characters",
                    "string.max": "Course title cannot exceed 200 characters",
                }),
                description: joi_1.default.string()
                    .min(20)
                    .max(2000)
                    .messages({
                    "string.min": "Course description must be at least 20 characters",
                    "string.max": "Course description cannot exceed 2000 characters",
                }),
                instructor: joi_1.default.string()
                    .min(2)
                    .max(100)
                    .messages({
                    "string.min": "Instructor name must be at least 2 characters",
                }),
                instructorBio: joi_1.default.string()
                    .max(500)
                    .messages({
                    "string.max": "Instructor bio cannot exceed 500 characters",
                }),
                instructorImage: joi_1.default.string()
                    .uri()
                    .messages({
                    "string.uri": "Instructor image must be a valid URL",
                }),
                category: joi_1.default.string()
                    .min(2)
                    .max(100)
                    .messages({
                    "string.min": "Category must be at least 2 characters",
                }),
                subcategory: joi_1.default.string()
                    .max(100)
                    .messages({
                    "string.max": "Subcategory cannot exceed 100 characters",
                }),
                level: joi_1.default.string()
                    .valid(...Object.values(enum_2.CourseLevel))
                    .messages({
                    "any.only": "Invalid course level",
                }),
                language: joi_1.default.string()
                    .valid(...Object.values(enum_2.Language))
                    .messages({
                    "any.only": "Invalid language",
                }),
                price: joi_1.default.number()
                    .min(0)
                    .messages({
                    "number.min": "Price cannot be negative",
                }),
                currency: joi_1.default.string()
                    .valid(...Object.values(enum_2.Currency))
                    .messages({
                    "any.only": "Invalid currency",
                }),
                thumbnail: joi_1.default.string()
                    .uri()
                    .messages({
                    "string.uri": "Thumbnail must be a valid URL",
                }),
                previewVideoUrl: joi_1.default.string()
                    .uri()
                    .messages({
                    "string.uri": "Preview video URL must be valid",
                }),
                learningObjectives: joi_1.default.array()
                    .items(joi_1.default.string().min(5).max(200))
                    .max(10)
                    .messages({
                    "array.max": "Maximum 10 learning objectives allowed",
                }),
                requirements: joi_1.default.array()
                    .items(joi_1.default.string().min(5).max(200))
                    .max(10)
                    .messages({
                    "array.max": "Maximum 10 requirements allowed",
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
        this.validateCreateSection = async (req, res, next) => {
            const schema = joi_1.default.object({
                courseId: joi_1.default.string()
                    .required()
                    .messages({
                    "any.required": "Course ID is required",
                }),
                title: joi_1.default.string()
                    .min(3)
                    .max(150)
                    .required()
                    .messages({
                    "string.min": "Section title must be at least 3 characters",
                    "string.max": "Section title cannot exceed 150 characters",
                    "any.required": "Section title is required",
                }),
                description: joi_1.default.string()
                    .max(500)
                    .messages({
                    "string.max": "Description cannot exceed 500 characters",
                }),
                order: joi_1.default.number()
                    .integer()
                    .min(1)
                    .required()
                    .messages({
                    "number.base": "Order must be a number",
                    "number.min": "Order must be at least 1",
                    "any.required": "Section order is required",
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
        this.validateCreateCurriculumItem = async (req, res, next) => {
            const schema = joi_1.default.object({
                sectionId: joi_1.default.string()
                    .required()
                    .messages({
                    "any.required": "Section ID is required",
                }),
                title: joi_1.default.string()
                    .min(3)
                    .max(200)
                    .required()
                    .messages({
                    "string.min": "Item title must be at least 3 characters",
                    "string.max": "Item title cannot exceed 200 characters",
                    "any.required": "Item title is required",
                }),
                description: joi_1.default.string()
                    .min(10)
                    .max(500)
                    .required()
                    .messages({
                    "string.min": "Description must be at least 10 characters",
                    "string.max": "Description cannot exceed 500 characters",
                    "any.required": "Description is required",
                }),
                type: joi_1.default.string()
                    .valid(...Object.values(enum_2.CurriculumItemType))
                    .required()
                    .messages({
                    "any.only": "Invalid curriculum item type",
                    "any.required": "Item type is required",
                }),
                order: joi_1.default.number()
                    .integer()
                    .min(1)
                    .required()
                    .messages({
                    "number.base": "Order must be a number",
                    "number.min": "Order must be at least 1",
                    "any.required": "Item order is required",
                }),
                videoUrl: joi_1.default.string()
                    .uri()
                    .when("type", {
                    is: enum_2.CurriculumItemType.Lecture,
                    then: joi_1.default.required(),
                    otherwise: joi_1.default.optional(),
                })
                    .messages({
                    "string.uri": "Video URL must be valid",
                    "any.required": "Video URL is required for lecture type",
                }),
                videoDuration: joi_1.default.number()
                    .integer()
                    .min(1)
                    .when("type", {
                    is: enum_2.CurriculumItemType.Lecture,
                    then: joi_1.default.required(),
                    otherwise: joi_1.default.optional(),
                })
                    .messages({
                    "number.base": "Video duration must be a number",
                    "number.min": "Video duration must be at least 1 second",
                    "any.required": "Video duration is required for lecture type",
                }),
                content: joi_1.default.string()
                    .max(5000)
                    .when("type", {
                    is: enum_2.CurriculumItemType.Article,
                    then: joi_1.default.required(),
                    otherwise: joi_1.default.optional(),
                })
                    .messages({
                    "string.max": "Content cannot exceed 5000 characters",
                    "any.required": "Content is required for article type",
                }),
                resources: joi_1.default.array()
                    .items(joi_1.default.object({
                    name: joi_1.default.string().max(100).required(),
                    url: joi_1.default.string().uri().required(),
                }))
                    .max(10)
                    .messages({
                    "array.max": "Maximum 10 resources allowed",
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
        // Validates that every section has at least one quiz before publishing
        this.validateSectionsHaveQuizzes = async (req, res, next) => {
            const { courseId } = req.params;
            const sections = await service_1.sectionService.findSectionsByCourse(courseId);
            if (sections.length === 0) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course must have at least one section",
                    data: null,
                });
            }
            for (const section of sections) {
                const items = await service_2.curriculumItemService.findCurriculumItemsBySection(section._id);
                const hasQuiz = items.some((item) => item.type === enum_2.CurriculumItemType.Quiz);
                if (!hasQuiz) {
                    return utils_1.utils.customResponse({
                        status: 400,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: `Section "${section.title}" must have at least one quiz before course can be published`,
                        data: null,
                    });
                }
            }
            next();
        };
    }
}
exports.courseValidator = new CourseValidator();
