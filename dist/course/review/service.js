"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const entity_1 = __importDefault(require("./entity"));
class ReviewService {
    constructor() {
        this.createReview = async (input) => {
            const review = new entity_1.default({
                courseId: input.courseId,
                studentId: input.studentId,
                studentName: input.studentName,
                rating: input.rating,
                comment: input.comment,
            });
            await review.save();
            return review;
        };
        this.findReviewById = async (id) => {
            return await entity_1.default.findById(id);
        };
        this.findStudentCourseReview = async (courseId, studentId) => {
            return await entity_1.default.findOne({ courseId, studentId });
        };
        this.getCourseReviews = async (courseId) => {
            return await entity_1.default.find({ courseId }).sort({ createdAt: -1 });
        };
        this.updateReview = async (reviewId, input) => {
            return await entity_1.default.findByIdAndUpdate(reviewId, input, { new: true });
        };
        this.deleteReview = async (id) => {
            return await entity_1.default.findByIdAndDelete(id);
        };
        this.deleteStudentCourseReview = async (courseId, studentId) => {
            return await entity_1.default.findOneAndDelete({ courseId, studentId });
        };
        this.getAverageRating = async (courseId) => {
            const result = await entity_1.default.aggregate([
                { $match: { courseId: new mongoose_1.default.Types.ObjectId(courseId.toString()) } },
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
}
exports.reviewService = new ReviewService();
