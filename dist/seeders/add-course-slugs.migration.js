"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCourseSlugs = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const entity_1 = __importDefault(require("../course/entity"));
const utils_1 = require("../utils");
const addCourseSlugs = async () => {
    try {
        console.log("🔄 Adding slugs to courses...");
        const courses = await entity_1.default.find({ slug: { $exists: false } });
        console.log(`Found ${courses.length} courses without slugs`);
        for (const course of courses) {
            const slug = utils_1.utils.generateSlug(course.title);
            // Check if slug already exists
            const existingCourse = await entity_1.default.findOne({ slug, _id: { $ne: course._id } });
            if (existingCourse) {
                console.log(`⚠️  Slug "${slug}" already exists for another course. Skipping ${course.title}`);
                continue;
            }
            // Use updateOne to avoid full validation on the entire document
            await entity_1.default.updateOne({ _id: course._id }, { slug }, { runValidators: false });
            console.log(`✅ Added slug to "${course.title}" → "${slug}"`);
        }
        console.log("✅ Slug migration complete!");
    }
    catch (error) {
        console.log("❌ Error adding slugs:", error);
        throw error;
    }
};
exports.addCourseSlugs = addCourseSlugs;
// Run if called directly
if (require.main === module) {
    mongoose_1.default
        .connect(process.env.DATABASE_URL || "mongodb://localhost:27017/metricmind")
        .then(() => (0, exports.addCourseSlugs)())
        .then(() => mongoose_1.default.connection.close())
        .catch((error) => {
        console.log(error);
        process.exit(1);
    });
}
