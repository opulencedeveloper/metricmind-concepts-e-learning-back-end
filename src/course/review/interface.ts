import { Document, Types } from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  studentId: Types.ObjectId;
  studentName: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateReviewInput {
  courseId: string | Types.ObjectId;
  studentId: string | Types.ObjectId;
  studentName: string;
  rating: number;
  comment: string;
}

export interface IUpdateReviewInput {
  rating?: number;
  comment?: string;
}
