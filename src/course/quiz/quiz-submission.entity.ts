import mongoose, { Schema } from "mongoose";
import { IQuizSubmission } from "./interface";

const quizSubmissionSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    answers: [
      {
        questionIndex: Number,
        selectedAnswer: Schema.Types.Mixed,
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
  },
  { timestamps: true }
);

// Compound index for finding submissions by student and quiz
quizSubmissionSchema.index({ studentId: 1, quizId: 1 });

const QuizSubmission = mongoose.model<IQuizSubmission>("QuizSubmission", quizSubmissionSchema);

export default QuizSubmission;
