import mongoose from 'mongoose';
import Quiz from '../course/quiz/quiz.entity';
import CurriculumItem from '../course/curriculum-item/entity';
import Section from '../course/section/entity';
import { CurriculumItemType } from '../course/enum';
import { QuestionType } from '../course/quiz/enum';
import config from '../config';

const seedQuizzes = async () => {
  try {
    console.log('[SEED_QUIZZES] Connecting to MongoDB...');
    await mongoose.connect(config.db.uri);
    console.log('[SEED_QUIZZES] Connected to MongoDB');

    console.log('[SEED_QUIZZES] Starting quiz seeder...');

    // Find all quiz-type curriculum items
    const quizItems = await CurriculumItem.find({ type: CurriculumItemType.Quiz });
    console.log(`[SEED_QUIZZES] Found ${quizItems.length} quiz curriculum items`);

    let created = 0;
    let skipped = 0;

    for (const item of quizItems) {
      // Check if quiz already exists for this curriculum item
      const existingQuiz = await Quiz.findOne({ curriculumItemId: item._id });

      if (existingQuiz) {
        console.log(`[SEED_QUIZZES] Quiz already exists for curriculum item ${item._id}`);
        skipped++;
        continue;
      }

      // Get section to find courseId
      const section = await Section.findById(item.sectionId);
      if (!section) {
        console.log(`[SEED_QUIZZES] Section not found for curriculum item ${item._id}`);
        continue;
      }

      // Create quiz with default questions
      const quiz = new Quiz({
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
            questionType: QuestionType.MultipleChoice,
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
    await mongoose.disconnect();
    console.log('[SEED_QUIZZES] Disconnected from MongoDB');
  } catch (error) {
    console.error('[SEED_QUIZZES] Error:', error);
    await mongoose.disconnect();
    throw error;
  }
};

// Run seeder
seedQuizzes().then(() => {
  console.log('[SEED_QUIZZES] Seeder finished successfully');
}).catch((err) => {
  console.error('[SEED_QUIZZES] Seeder failed:', err);
});
