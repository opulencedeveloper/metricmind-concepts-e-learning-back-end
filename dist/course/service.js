"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseService = void 0;
const entity_1 = __importDefault(require("./entity"));
const enum_1 = require("./enum");
class CourseService {
    constructor() {
        this.createCourse = async (input) => {
            const course = new entity_1.default({
                ...input,
                status: enum_1.CourseStatus.Draft,
            });
            await course.save();
            return course;
        };
        this.findCourseById = async (id) => {
            return await entity_1.default.findById(id);
        };
        this.findCourseBySlug = async (slug) => {
            return await entity_1.default.findOne({ slug: slug.toLowerCase(), status: enum_1.CourseStatus.Published });
        };
        this.slugExists = async (slug, excludeId) => {
            const query = { slug: slug.toLowerCase() };
            if (excludeId) {
                query._id = { $ne: excludeId };
            }
            return await entity_1.default.findOne(query);
        };
        this.findPublishedCourses = async (page = 1, limit = 12, category, level) => {
            const skip = (page - 1) * limit;
            const query = { status: enum_1.CourseStatus.Published };
            if (category) {
                query.category = category;
            }
            if (level) {
                query.level = level;
            }
            return await entity_1.default.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
        };
        this.searchCourses = async (query, page = 1, limit = 12, category) => {
            const skip = (page - 1) * limit;
            const pipeline = [
                // Stage 1: Text search filter (only published courses)
                {
                    $match: {
                        $text: { $search: query },
                        status: enum_1.CourseStatus.Published,
                    },
                },
                // Stage 2: Add text score
                {
                    $addFields: {
                        textScore: { $meta: "textScore" },
                    },
                },
                // Stage 3: Optional category filter
                ...(category ? [{ $match: { category } }] : []),
                // Stage 4: Calculate composite relevance score (at DB level)
                {
                    $addFields: {
                        relevanceScore: {
                            $add: [
                                // Text search relevance (weight: 1x)
                                { $multiply: ["$textScore", 10] },
                                // Popularity boost: rating score (weight: 1.5x)
                                { $multiply: [{ $ifNull: ["$rating", 0] }, 15] },
                                // Popularity boost: enrollment count (log scale to prevent domination)
                                {
                                    $multiply: [
                                        {
                                            $ln: [
                                                { $add: [{ $ifNull: ["$studentsEnrolled", 0] }, 1] },
                                            ],
                                        },
                                        5,
                                    ],
                                },
                                // Freshness bonus (newer courses boost)
                                {
                                    $max: [
                                        {
                                            $subtract: [
                                                10,
                                                {
                                                    $divide: [
                                                        {
                                                            $subtract: [
                                                                new Date(),
                                                                { $toDate: "$createdAt" },
                                                            ],
                                                        },
                                                        2592000000, // 30 days in milliseconds
                                                    ],
                                                },
                                            ],
                                        },
                                        0, // Ensure minimum 0
                                    ],
                                },
                            ],
                        },
                    },
                },
                // Stage 5: Sort by relevance (smart ranking)
                {
                    $sort: {
                        relevanceScore: -1,
                        rating: -1, // Tiebreaker: higher rating
                        studentsEnrolled: -1, // Tiebreaker: more enrolled
                    },
                },
                // Stage 6: Pagination
                { $skip: skip },
                { $limit: limit },
                // Stage 7: Project final response (remove internal scoring fields)
                {
                    $project: {
                        textScore: 0,
                        relevanceScore: 0,
                    },
                },
            ];
            return await entity_1.default.aggregate(pipeline);
        };
        this.findCoursesByAdmin = async (adminId) => {
            return await entity_1.default.find({ adminId }).sort({ createdAt: -1 });
        };
        this.updateCourse = async (id, input) => {
            return await entity_1.default.findByIdAndUpdate(id, input, { new: true });
        };
        this.publishCourse = async (id) => {
            return await entity_1.default.findByIdAndUpdate(id, { status: enum_1.CourseStatus.Published }, { new: true });
        };
        this.unpublishCourse = async (id) => {
            return await entity_1.default.findByIdAndUpdate(id, { status: enum_1.CourseStatus.Draft }, { new: true });
        };
        this.updateStudentCount = async (courseId, increment = 1) => {
            return await entity_1.default.findByIdAndUpdate(courseId, { $inc: { studentsEnrolled: increment } }, { new: true });
        };
        this.updateCourseRating = async (courseId, newRating) => {
            return await entity_1.default.findByIdAndUpdate(courseId, {
                $set: { rating: newRating },
                $inc: { reviewCount: 1 },
            }, { new: true });
        };
        this.deleteCourse = async (id) => {
            return await entity_1.default.findByIdAndDelete(id);
        };
    }
}
exports.courseService = new CourseService();
