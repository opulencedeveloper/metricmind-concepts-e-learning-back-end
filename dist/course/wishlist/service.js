"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistService = void 0;
const entity_1 = __importDefault(require("./entity"));
class WishlistService {
    constructor() {
        this.addToWishlist = async (input) => {
            const wishlist = new entity_1.default({
                studentId: input.studentId,
                courseId: input.courseId,
            });
            await wishlist.save();
            return wishlist;
        };
        this.removeFromWishlist = async (studentId, courseId) => {
            return await entity_1.default.findOneAndDelete({ studentId, courseId });
        };
        this.isInWishlist = async (studentId, courseId) => {
            const wishlist = await entity_1.default.findOne({ studentId, courseId });
            return !!wishlist;
        };
        this.getStudentWishlist = async (studentId) => {
            return await entity_1.default.find({ studentId })
                .populate("courseId", "title description price category level slug thumbnail previewVideoUrl instructor currency rating reviewCount totalDuration")
                .sort({ createdAt: -1 });
        };
        this.deleteStudentWishlist = async (studentId) => {
            return await entity_1.default.deleteMany({ studentId });
        };
    }
}
exports.wishlistService = new WishlistService();
