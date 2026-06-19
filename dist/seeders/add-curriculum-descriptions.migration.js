"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCurriculumDescriptions = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const entity_1 = __importDefault(require("../course/curriculum-item/entity"));
const enum_1 = require("../course/enum");
const config_1 = __importDefault(require("../config"));
// Map descriptions based on item type and title patterns
const getDescriptionForItem = (item) => {
    const { title, type } = item;
    // Default descriptions based on type
    if (type === enum_1.CurriculumItemType.Lecture) {
        return `Learn about ${title.toLowerCase()}. This video lesson covers the key concepts and best practices you need to know.`;
    }
    if (type === enum_1.CurriculumItemType.Quiz) {
        return `Test your knowledge with this quiz on ${title.toLowerCase().replace(" quiz", "").replace(" test", "")}. Answer all questions to proceed.`;
    }
    if (type === enum_1.CurriculumItemType.Article) {
        return `Read this article to deepen your understanding of ${title.toLowerCase()}. Contains detailed explanations and examples.`;
    }
    return `Complete this lesson: ${title}`;
};
const addCurriculumDescriptions = async () => {
    try {
        console.log("🔄 Adding descriptions to curriculum items...");
        // Find all curriculum items without descriptions
        const itemsWithoutDescription = await entity_1.default.find({
            $or: [
                { description: null },
                { description: undefined },
                { description: "" },
            ],
        });
        console.log(`\n📊 Found ${itemsWithoutDescription.length} items without descriptions`);
        if (itemsWithoutDescription.length === 0) {
            console.log("✅ All curriculum items already have descriptions!");
            return;
        }
        let updated = 0;
        for (const item of itemsWithoutDescription) {
            const description = getDescriptionForItem(item);
            await entity_1.default.findByIdAndUpdate(item._id, { description }, { new: true });
            updated++;
            console.log(`  ✓ Updated: "${item.title}"`);
        }
        console.log(`\n✅ Migration complete! Updated ${updated} items with descriptions.`);
    }
    catch (error) {
        console.log("❌ Error during migration:", error);
        throw error;
    }
};
exports.addCurriculumDescriptions = addCurriculumDescriptions;
// Run migration
mongoose_1.default
    .connect(config_1.default.db.uri)
    .then(() => {
    console.log("✅ Connected to database");
    return (0, exports.addCurriculumDescriptions)();
})
    .then(() => {
    console.log("✅ Migration completed successfully");
    return mongoose_1.default.connection.close();
})
    .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
});
