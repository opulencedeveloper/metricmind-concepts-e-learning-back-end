import mongoose, { Schema } from "mongoose";
import { IQuiz } from "./interface";
import { QuestionType } from "./enum";

const quizQuestionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    questionType: {
      type: String,
      enum: Object.values(QuestionType),
      required: true,
    },
    options: {
      type: [String],
      required: true,
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
    points: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },
  },
  { _id: false }
);

const quizSchema: Schema = new Schema(
  {
    curriculumItemId: {
      type: Schema.Types.ObjectId,
      ref: "CurriculumItem",
      required: true,
      index: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: {
        validator: function(v: any[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Quiz must have at least one question'
      }
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeLimit: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Quiz = mongoose.model<IQuiz>("Quiz", quizSchema);

export default Quiz;
