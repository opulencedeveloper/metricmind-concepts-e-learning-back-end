import mongoose, { Schema } from "mongoose";
import { IReview } from "./interface";

const reviewSchema: Schema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Unique index to allow only one review per student per course
reviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

// Index for finding reviews by course
reviewSchema.index({ courseId: 1, createdAt: -1 });

const Review = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
