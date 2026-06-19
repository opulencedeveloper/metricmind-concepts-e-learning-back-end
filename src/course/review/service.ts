import mongoose from "mongoose";
import Review from "./entity";
import { ICreateReviewInput, IUpdateReviewInput } from "./interface";

class ReviewService {
  public createReview = async (input: ICreateReviewInput) => {
    const review = new Review({
      courseId: input.courseId,
      studentId: input.studentId,
      studentName: input.studentName,
      rating: input.rating,
      comment: input.comment,
    });

    await review.save();
    return review;
  };

  public findReviewById = async (id: string | mongoose.Types.ObjectId) => {
    return await Review.findById(id);
  };

  public findStudentCourseReview = async (
    courseId: string | mongoose.Types.ObjectId,
    studentId: string | mongoose.Types.ObjectId
  ) => {
    return await Review.findOne({ courseId, studentId });
  };

  public getCourseReviews = async (courseId: string | mongoose.Types.ObjectId) => {
    return await Review.find({ courseId }).sort({ createdAt: -1 });
  };

  public updateReview = async (
    reviewId: string | mongoose.Types.ObjectId,
    input: IUpdateReviewInput
  ) => {
    return await Review.findByIdAndUpdate(reviewId, input, { new: true });
  };

  public deleteReview = async (id: string | mongoose.Types.ObjectId) => {
    return await Review.findByIdAndDelete(id);
  };

  public deleteStudentCourseReview = async (
    courseId: string | mongoose.Types.ObjectId,
    studentId: string | mongoose.Types.ObjectId
  ) => {
    return await Review.findOneAndDelete({ courseId, studentId });
  };

  public getAverageRating = async (courseId: string | mongoose.Types.ObjectId) => {
    const result = await Review.aggregate([
      { $match: { courseId: new mongoose.Types.ObjectId(courseId.toString()) } },
      {
        $group: {
          _id: "$courseId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    return result[0] || { averageRating: 0, totalReviews: 0 };
  };
}

export const reviewService = new ReviewService();
