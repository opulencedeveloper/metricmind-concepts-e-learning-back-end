import mongoose from "mongoose";
import Course from "../course/entity";
import { CourseStatus } from "../course/enum";
import Logging from "../utils/loggin";
import config from "../config";

/**
 * Seeder to mark top courses as featured for landing page display
 * Run with: npx ts-node src/seeders/featured-courses.seeder.ts
 */
async function seedFeaturedCourses() {
  try {
    await mongoose.connect(config.db.uri);
    Logging.info("Connected to MongoDB");

    // Get top 3 published courses by rating or enrollment
    const topCourses = await Course.find(
      { status: CourseStatus.Published }
    )
      .sort({ rating: -1, studentsEnrolled: -1 })
      .limit(3);

    if (topCourses.length === 0) {
      Logging.warn("No published courses found to mark as featured");
      return;
    }

    // Mark courses as featured
    const courseIds = topCourses.map((course) => course._id);
    await Course.updateMany(
      { _id: { $in: courseIds } },
      { featured: true }
    );

    // Unmark other courses as not featured
    await Course.updateMany(
      { _id: { $nin: courseIds } },
      { featured: false }
    );

    Logging.info(
      `Successfully marked ${topCourses.length} courses as featured:`
    );
    topCourses.forEach((course) => {
      Logging.info(
        `  - ${course.title} (Rating: ${course.rating}, Enrolled: ${course.studentsEnrolled})`
      );
    });

    await mongoose.disconnect();
    Logging.info("Database connection closed");
  } catch (error: any) {
    Logging.error(`Seeder error: ${error.message}`);
    process.exit(1);
  }
}

seedFeaturedCourses();
