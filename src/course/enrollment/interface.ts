import { Document, Types } from "mongoose";
import { EnrollmentStatus } from "../enum";

export interface IEnrollment extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  status: EnrollmentStatus;
  enrollmentDate: Date;
  completionDate?: Date;
  progress: number;
  watchedItems: Types.ObjectId[];
  lastAccessedDate?: Date;
  certificateIssued: boolean;
  certificateUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEnrollmentInput {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
}

export interface IUpdateProgressInput {
  progress: number;
  lastAccessedDate?: Date;
}

export interface IMarkItemWatchedInput {
  curriculumItemId: Types.ObjectId;
}
