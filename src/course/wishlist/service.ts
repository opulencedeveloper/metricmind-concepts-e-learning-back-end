import mongoose from "mongoose";
import Wishlist from "./entity";
import { IAddToWishlistInput } from "./interface";

class WishlistService {
  public addToWishlist = async (input: IAddToWishlistInput) => {
    const wishlist = new Wishlist({
      studentId: input.studentId,
      courseId: input.courseId,
    });

    await wishlist.save();
    return wishlist;
  };

  public removeFromWishlist = async (
    studentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId
  ) => {
    return await Wishlist.findOneAndDelete({ studentId, courseId });
  };

  public isInWishlist = async (
    studentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId
  ) => {
    const wishlist = await Wishlist.findOne({ studentId, courseId });
    return !!wishlist;
  };

  public getStudentWishlist = async (studentId: string | mongoose.Types.ObjectId) => {
    return await Wishlist.find({ studentId })
      .populate("courseId", "title description price category level slug thumbnail previewVideoUrl instructor currency rating reviewCount totalDuration")
      .sort({ createdAt: -1 });
  };

  public deleteStudentWishlist = async (studentId: string | mongoose.Types.ObjectId) => {
    return await Wishlist.deleteMany({ studentId });
  };
}

export const wishlistService = new WishlistService();
