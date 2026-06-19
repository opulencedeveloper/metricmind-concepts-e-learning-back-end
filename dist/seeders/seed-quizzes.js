"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const quiz_entity_1 = __importDefault(require("../course/quiz/quiz.entity"));
const entity_1 = __importDefault(require("../course/curriculum-item/entity"));
const entity_2 = __importDefault(require("../course/section/entity"));
const enum_1 = require("../course/enum");
const enum_2 = require("../course/quiz/enum");
const config_1 = __importDefault(require("../config"));
const seedQuizzes = async () => {
    try {
        console.log('[SEED_QUIZZES] Connecting to MongoDB...');
        await mongoose_1.default.connect(config_1.default.db.uri);
        console.log('[SEED_QUIZZES] Connected to MongoDB');
        console.log('[SEED_QUIZZES] Starting quiz seeder...');
        // Find all quiz-type curriculum items
        const quizItems = await entity_1.default.find({ type: enum_1.CurriculumItemType.Quiz });
        console.log(`[SEED_QUIZZES] Found ${quizItems.length} quiz curriculum items`);
        let created = 0;
        let skipped = 0;
        for (const item of quizItems) {
            // Check if quiz already exists for this curriculum item
            const existingQuiz = await quiz_entity_1.default.findOne({ curriculumItemId: item._id });
            if (existingQuiz) {
                console.log(`[SEED_QUIZZES] Quiz already exists for curriculum item ${item._id}`);
                skipped++;
                continue;
            }
            // Get section to find courseId
            const section = await entity_2.default.findById(item.sectionId);
            if (!section) {
                console.log(`[SEED_QUIZZES] Section not found for curriculum item ${item._id}`);
                continue;
            }
            // Create quiz with default questions
            const quiz = new quiz_entity_1.default({
                courseId: section.courseId,
                sectionId: item.sectionId,
                curriculumItemId: item._id,
                title: item.title,
                description: item.description,
                passingScore: 70,
                timeLimit: 30,
                questions: [
                    {
                        question: `Sample question for "${item.title}"`,
                        questionType: enum_2.QuestionType.MultipleChoice,
                        options: ['Option A', 'Option B', 'Option C', 'Option D'],
                        correctAnswer: 0,
                        explanation: 'This is a placeholder question. Please update it.',
                        points: 10,
                    },
                ],
            });
            await quiz.save();
            console.log(`[SEED_QUIZZES] Created quiz for curriculum item ${item._id}`);
            created++;
        }
        console.log(`[SEED_QUIZZES] Complete! Created: ${created}, Skipped: ${skipped}`);
        await mongoose_1.default.disconnect();
        console.log('[SEED_QUIZZES] Disconnected from MongoDB');
    }
    catch (error) {
        console.error('[SEED_QUIZZES] Error:', error);
        await mongoose_1.default.disconnect();
        throw error;
    }
};
// Run seeder
seedQuizzes().then(() => {
    console.log('[SEED_QUIZZES] Seeder finished successfully');
}).catch((err) => {
    console.error('[SEED_QUIZZES] Seeder failed:', err);
});
