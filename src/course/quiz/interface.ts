import { Document, Types } from "mongoose";
import { QuestionType } from "./enum";

export interface IQuizQuestion {
  question: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

export interface IQuiz extends Document {
  _id: Types.ObjectId;
  curriculumItemId: Types.ObjectId;
  sectionId: Types.ObjectId;
  title: string;
  description: string;
  questions: IQuizQuestion[];
  passingScore: number;
  timeLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizSubmission extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  quizId: Types.ObjectId;
  sectionId: Types.ObjectId;
  courseId: Types.ObjectId;
  answers: Array<{
    questionIndex: number;
    selectedAnswer: string | number;
  }>;
  score: number;
  maxScore: number;
  percentageScore: number;
  passed: boolean;
  timeTaken?: number;
  attemptNumber: number;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISectionProgress extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  sectionId: Types.ObjectId;
  courseId: Types.ObjectId;
  quizPassed: boolean;
  quizPassedAt?: Date;
  bestScore?: number;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateQuizInput {
  curriculumItemId: Types.ObjectId;
  sectionId: Types.ObjectId;
  title: string;
  description: string;
  questions: IQuizQuestion[];
  passingScore: number;
  timeLimit: number;
}

export interface IUpdateQuizInput {
  title?: string;
  description?: string;
  questions?: IQuizQuestion[];
  passingScore?: number;
  timeLimit?: number;
}

export interface ISubmitQuizInput {
  quizId: Types.ObjectId;
  answers: Record<string, string | number>; // { '0': 'Option A', '1': 'True', ... }
  timeTaken?: number;
}
