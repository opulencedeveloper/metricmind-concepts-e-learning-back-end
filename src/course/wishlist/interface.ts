import { Document, Types } from "mongoose";

export interface IWishlist extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddToWishlistInput {
  studentId: string | Types.ObjectId;
  courseId: string | Types.ObjectId;
}
