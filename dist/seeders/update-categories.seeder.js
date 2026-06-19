"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryEnum = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const entity_1 = __importDefault(require("../course/entity"));
const categoryMapping = {
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
const updateCategoryEnum = async () => {
    try {
        console.log("🔄 Updating categories to use enums...");
        for (const oldValue in categoryMapping) {
            const newValue = categoryMapping[oldValue];
            const result = await entity_1.default.updateMany({ category: oldValue }, { category: newValue });
            if (result.modifiedCount > 0) {
                console.log(`✅ Updated ${result.modifiedCount} courses: "${oldValue}" → "${newValue}"`);
            }
        }
        console.log("✅ Category migration complete!");
    }
    catch (error) {
        console.log("❌ Error updating categories:", error);
        throw error;
    }
};
exports.updateCategoryEnum = updateCategoryEnum;
// Run if called directly
if (require.main === module) {
    mongoose_1.default
        .connect(process.env.DATABASE_URL || "mongodb://localhost:27017/metricmind")
        .then(() => (0, exports.updateCategoryEnum)())
        .then(() => mongoose_1.default.connection.close())
        .catch((error) => {
        console.log(error);
        process.exit(1);
    });
}
