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
const quizSubmissionSchema = new mongoose_1.Schema({
    studentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        index: true,
    },
    quizId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true,
        index: true,
    },
    sectionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Section",
        required: true,
        index: true,
    },
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
        index: true,
    },
    answers: [
        {
            questionIndex: Number,
            selectedAnswer: mongoose_1.Schema.Types.Mixed,
        },
    ],
    score: {
        type: Number,
        required: true,
        min: 0,
    },
    maxScore: {
        type: Number,
        required: true,
        min: 0,
    },
    percentageScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    passed: {
        type: Boolean,
        required: true,
        index: true,
    },
    timeTaken: {
        type: Number,
        default: undefined,
    },
    attemptNumber: {
        type: Number,
        required: true,
        min: 1,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
// Compound index for finding submissions by student and quiz
quizSubmissionSchema.index({ studentId: 1, quizId: 1 });
const QuizSubmission = mongoose_1.default.model("QuizSubmission", quizSubmissionSchema);
exports.default = QuizSubmission;
