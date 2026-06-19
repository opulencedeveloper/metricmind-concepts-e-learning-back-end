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
const courseSchema = new mongoose_1.Schema({
    adminId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    instructor: {
        type: String,
        required: true,
        trim: true,
    },
    instructorBio: {
        type: String,
        required: true,
        trim: true,
    },
    instructorImage: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: Object.values(enum_1.Category),
        required: true,
        trim: true,
        index: true,
    },
    subcategory: {
        type: String,
        required: true,
        trim: true,
    },
    level: {
        type: String,
        enum: Object.values(enum_1.CourseLevel),
        required: true,
        default: enum_1.CourseLevel.Beginner,
        index: true,
    },
    language: {
        type: String,
        enum: Object.values(enum_1.Language),
        required: true,
        default: enum_1.Language.English,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        enum: Object.values(enum_1.Currency),
        required: true,
        default: enum_1.Currency.NGN,
    },
    thumbnail: {
        type: String,
        required: true,
    },
    previewVideoUrl: {
        type: String,
        required: true,
    },
    learningObjectives: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'Course must have at least one learning objective'
        }
    },
    requirements: {
        type: [String],
        required: true,
        validate: {
            validator: function (v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'Course must have at least one requirement'
        }
    },
    totalDuration: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: Object.values(enum_1.CourseStatus),
        default: enum_1.CourseStatus.Draft,
        index: true,
    },
    studentsEnrolled: {
        type: Number,
        default: 0,
        min: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviewCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    featured: {
        type: Boolean,
        default: false,
        index: true,
    },
}, { timestamps: true });
// Create text index for full-text search on title and description
courseSchema.index({ title: "text", description: "text", instructor: "text" });
const Course = mongoose_1.default.model("Course", courseSchema);
exports.default = Course;
