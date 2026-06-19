import mongoose, { Schema } from "mongoose";
import { IEnrollment } from "./interface";
import { EnrollmentStatus } from "../enum";

const enrollmentSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    // Unique index to prevent duplicate enrollments
    status: {
      type: String,
      enum: Object.values(EnrollmentStatus),
      default: EnrollmentStatus.Active,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
      default: undefined,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    watchedItems: {
      type: [Schema.Types.ObjectId],
      ref: "CurriculumItem",
      default: [],
    },
    lastAccessedDate: {
      type: Date,
      default: undefined,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
      default: undefined,
    },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate enrollments for the same student-course pair
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
