import mongoose, { Schema } from "mongoose";
import { ICourse } from "./interface";
import { CourseLevel, Currency, CourseStatus, Language, Category } from "./enum";

const courseSchema: Schema = new Schema(
  {
    adminId: {
      type: Schema.Types.ObjectId,
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
      enum: Object.values(Category),
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
      enum: Object.values(CourseLevel),
      required: true,
      default: CourseLevel.Beginner,
      index: true,
    },
    language: {
      type: String,
      enum: Object.values(Language),
      required: true,
      default: Language.English,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: Object.values(Currency),
      required: true,
      default: Currency.NGN,
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
        validator: function(v: any[]) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Course must have at least one learning objective'
      }
    },
    requirements: {
      type: [String],
      required: true,
      validate: {
        validator: function(v: any[]) {
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
      enum: Object.values(CourseStatus),
      default: CourseStatus.Draft,
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
  },
  { timestamps: true }
);

// Create text index for full-text search on title and description
courseSchema.index({ title: "text", description: "text", instructor: "text" });

const Course = mongoose.model<ICourse>("Course", courseSchema);

export default Course;
