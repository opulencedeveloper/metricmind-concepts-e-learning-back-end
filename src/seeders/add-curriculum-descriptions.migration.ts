import mongoose from "mongoose";
import CurriculumItem from "../course/curriculum-item/entity";
import { CurriculumItemType } from "../course/enum";
import config from "../config";

// Map descriptions based on item type and title patterns
const getDescriptionForItem = (item: any): string => {
  const { title, type } = item;

  // Default descriptions based on type
  if (type === CurriculumItemType.Lecture) {
    return `Learn about ${title.toLowerCase()}. This video lesson covers the key concepts and best practices you need to know.`;
  }

  if (type === CurriculumItemType.Quiz) {
    return `Test your knowledge with this quiz on ${title.toLowerCase().replace(" quiz", "").replace(" test", "")}. Answer all questions to proceed.`;
  }

  if (type === CurriculumItemType.Article) {
    return `Read this article to deepen your understanding of ${title.toLowerCase()}. Contains detailed explanations and examples.`;
  }

  return `Complete this lesson: ${title}`;
};

export const addCurriculumDescriptions = async () => {
  try {
    console.log("🔄 Adding descriptions to curriculum items...");

    // Find all curriculum items without descriptions
    const itemsWithoutDescription = await CurriculumItem.find({
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

      await CurriculumItem.findByIdAndUpdate(
        item._id,
        { description },
        { new: true }
      );

      updated++;
      console.log(`  ✓ Updated: "${item.title}"`);
    }

    console.log(`\n✅ Migration complete! Updated ${updated} items with descriptions.`);
  } catch (error) {
    console.log("❌ Error during migration:", error);
    throw error;
  }
};

// Run migration
mongoose
  .connect(config.db.uri)
  .then(() => {
    console.log("✅ Connected to database");
    return addCurriculumDescriptions();
  })
  .then(() => {
    console.log("✅ Migration completed successfully");
    return mongoose.connection.close();
  })
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  });
