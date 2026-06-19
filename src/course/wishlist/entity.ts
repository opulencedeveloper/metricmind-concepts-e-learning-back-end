import mongoose, { Schema } from "mongoose";
import { IWishlist } from "./interface";

const wishlistSchema: Schema = new Schema(
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
  },
  { timestamps: true }
);

// Unique index to prevent duplicate wishlist entries
wishlistSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);

export default Wishlist;
