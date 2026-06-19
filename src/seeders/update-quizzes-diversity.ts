import mongoose from 'mongoose';
import Quiz from '../course/quiz/quiz.entity';
import { QuestionType } from '../course/quiz/enum';
import config from '../config';

const updateQuizzesDiversity = async () => {
  try {
    console.log('[UPDATE_QUIZZES] Connecting to MongoDB...');
    await mongoose.connect(config.db.uri);
    console.log('[UPDATE_QUIZZES] Connected to MongoDB');

    console.log('[UPDATE_QUIZZES] Finding all quizzes...');
    const quizzes = await Quiz.find();
    console.log(`[UPDATE_QUIZZES] Found ${quizzes.length} quizzes`);

    let updated = 0;

    for (const quiz of quizzes) {
      // Create diverse questions with auto-gradable types
      const diverseQuestions = [
        {
          question: `What is the correct answer about ${quiz.title}?`,
          questionType: QuestionType.MultipleChoice,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'Option A is the correct answer because it aligns with the topic.',
          points: 10,
        },
        {
          question: `${quiz.title} is a fundamental concept.`,
          questionType: QuestionType.TrueFalse,
          options: ['True', 'False'],
          correctAnswer: 0,
          explanation: 'True - This is a core concept in the field.',
          points: 10,
        },
        {
          question: `According to best practices in ${quiz.title}, which approach is correct?`,
          questionType: QuestionType.MultipleChoice,
          options: ['Approach 1', 'Approach 2', 'Approach 3', 'Approach 4'],
          correctAnswer: 2,
          explanation: 'Approach 3 is considered the best practice in this domain.',
          points: 10,
        },
        {
          question: `Implementing ${quiz.title} principles improves overall quality.`,
          questionType: QuestionType.TrueFalse,
          options: ['True', 'False'],
          correctAnswer: 0,
          explanation: 'True - Following these principles definitely improves quality.',
          points: 10,
        },
        {
          question: `Which scenario best demonstrates proper ${quiz.title} usage?`,
          questionType: QuestionType.MultipleChoice,
          options: ['Scenario A', 'Scenario B', 'Scenario C', 'Scenario D'],
          correctAnswer: 1,
          explanation: 'Scenario B demonstrates the proper and most effective usage.',
          points: 10,
        },
      ];

      // Update quiz with diverse questions
      quiz.questions = diverseQuestions;
      quiz.passingScore = 60;
      quiz.timeLimit = 45;

      await quiz.save();
      console.log(`[UPDATE_QUIZZES] Updated quiz: ${quiz.title}`);
      updated++;
    }

    console.log(`[UPDATE_QUIZZES] Complete! Updated ${updated} quizzes with diverse question types`);
    await mongoose.disconnect();
    console.log('[UPDATE_QUIZZES] Disconnected from MongoDB');
  } catch (error) {
    console.error('[UPDATE_QUIZZES] Error:', error);
    await mongoose.disconnect();
    throw error;
  }
};

// Run migration
updateQuizzesDiversity().then(() => {
  console.log('[UPDATE_QUIZZES] Migration finished successfully');
}).catch((err) => {
  console.error('[UPDATE_QUIZZES] Migration failed:', err);
});
