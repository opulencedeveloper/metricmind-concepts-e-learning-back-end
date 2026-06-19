"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const entity_1 = __importDefault(require("../course/entity"));
const enum_1 = require("../course/enum");
const loggin_1 = __importDefault(require("../utils/loggin"));
const config_1 = __importDefault(require("../config"));
/**
 * Seeder to mark top courses as featured for landing page display
 * Run with: npx ts-node src/seeders/featured-courses.seeder.ts
 */
async function seedFeaturedCourses() {
    try {
        await mongoose_1.default.connect(config_1.default.db.uri);
        loggin_1.default.info("Connected to MongoDB");
        // Get top 3 published courses by rating or enrollment
        const topCourses = await entity_1.default.find({ status: enum_1.CourseStatus.Published })
            .sort({ rating: -1, studentsEnrolled: -1 })
            .limit(3);
        if (topCourses.length === 0) {
            loggin_1.default.warn("No published courses found to mark as featured");
            return;
        }
        // Mark courses as featured
        const courseIds = topCourses.map((course) => course._id);
        await entity_1.default.updateMany({ _id: { $in: courseIds } }, { featured: true });
        // Unmark other courses as not featured
        await entity_1.default.updateMany({ _id: { $nin: courseIds } }, { featured: false });
        loggin_1.default.info(`Successfully marked ${topCourses.length} courses as featured:`);
        topCourses.forEach((course) => {
            loggin_1.default.info(`  - ${course.title} (Rating: ${course.rating}, Enrolled: ${course.studentsEnrolled})`);
        });
        await mongoose_1.default.disconnect();
        loggin_1.default.info("Database connection closed");
    }
    catch (error) {
        loggin_1.default.error(`Seeder error: ${error.message}`);
        process.exit(1);
    }
}
seedFeaturedCourses();
