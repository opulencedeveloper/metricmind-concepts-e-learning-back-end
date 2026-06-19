import mongoose, { Schema } from "mongoose";
import { ISectionProgress } from "./interface";

const sectionProgressSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
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
    // Student must pass section quiz before accessing next section
    quizPassed: {
      type: Boolean,
      default: false,
      index: true,
    },
    quizPassedAt: {
      type: Date,
      default: undefined,
    },
    bestScore: {
      type: Number,
      default: undefined,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Unique index: one progress record per student-section pair
sectionProgressSchema.index({ studentId: 1, sectionId: 1 }, { unique: true });

const SectionProgress = mongoose.model<ISectionProgress>("SectionProgress", sectionProgressSchema);

export default SectionProgress;
