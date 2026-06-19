import mongoose from "mongoose";
import Course from "../course/entity";

const categoryMapping: { [key: string]: string } = {
  "Web Development": "web_development",
  "Mobile Development": "mobile_development",
  "Design": "design",
  "UI/UX": "ui_ux",
  "Data Science": "data_science",
  "Machine Learning": "machine_learning",
  "Cloud Computing": "cloud_computing",
  "AWS": "aws",
  "Full Stack": "full_stack",
};

export const updateCategoryEnum = async () => {
  try {
    console.log("🔄 Updating categories to use enums...");

    for (const oldValue in categoryMapping) {
      const newValue = categoryMapping[oldValue];
      const result = await Course.updateMany(
        { category: oldValue },
        { category: newValue }
      );

      if (result.modifiedCount > 0) {
        console.log(
          `✅ Updated ${result.modifiedCount} courses: "${oldValue}" → "${newValue}"`
        );
      }
    }

    console.log("✅ Category migration complete!");
  } catch (error) {
    console.log("❌ Error updating categories:", error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  mongoose
    .connect(process.env.DATABASE_URL || "mongodb://localhost:27017/metricmind")
    .then(() => updateCategoryEnum())
    .then(() => mongoose.connection.close())
    .catch((error) => {
      console.log(error);
      process.exit(1);
    });
}
