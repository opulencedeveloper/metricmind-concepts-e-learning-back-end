import mongoose from "mongoose";
import Course from "../course/entity";
import { utils } from "../utils";

export const addCourseSlugs = async () => {
  try {
    console.log("🔄 Adding slugs to courses...");

    const courses = await Course.find({ slug: { $exists: false } });
    console.log(`Found ${courses.length} courses without slugs`);

    for (const course of courses) {
      const slug = utils.generateSlug(course.title);

      // Check if slug already exists
      const existingCourse = await Course.findOne({ slug, _id: { $ne: course._id } });
      if (existingCourse) {
        console.log(`⚠️  Slug "${slug}" already exists for another course. Skipping ${course.title}`);
        continue;
      }

      // Use updateOne to avoid full validation on the entire document
      await Course.updateOne(
        { _id: course._id },
        { slug },
        { runValidators: false }
      );
      console.log(`✅ Added slug to "${course.title}" → "${slug}"`);
    }

    console.log("✅ Slug migration complete!");
  } catch (error) {
    console.log("❌ Error adding slugs:", error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  mongoose
    .connect(process.env.DATABASE_URL || "mongodb://localhost:27017/metricmind")
    .then(() => addCourseSlugs())
    .then(() => mongoose.connection.close())
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
}
