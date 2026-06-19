import mongoose from "mongoose";
import Quiz from "./quiz.entity";
import QuizSubmission from "./quiz-submission.entity";
import SectionProgress from "./section-progress.entity";
import Section from "../section/entity";
import { ICreateQuizInput, ISubmitQuizInput, IQuizQuestion } from "./interface";
import { QuestionType } from "./enum";
import Logging from "../../utils/loggin";

class QuizService {
  public createQuiz = async (input: ICreateQuizInput) => {
    const quiz = new Quiz(input);
    await quiz.save();
    return quiz;
  };

  public findQuizById = async (id: string | mongoose.Types.ObjectId) => {
    return await Quiz.findById(id);
  };

  public findQuizBySection = async (sectionId: string | mongoose.Types.ObjectId) => {
    return await Quiz.findOne({ sectionId });
  };

  public findQuizByCurriculumItem = async (curriculumItemId: string | mongoose.Types.ObjectId) => {
    return await Quiz.findOne({ curriculumItemId });
  };

  public findQuizzesByCurriculumItems = async (curriculumItemIds: mongoose.Types.ObjectId[]) => {
    console.log('[QUIZ_SERVICE] Finding quizzes for curriculum items:', curriculumItemIds.map(id => id.toString()));
    const result = await Quiz.find({ curriculumItemId: { $in: curriculumItemIds } })
      .select('_id curriculumItemId')
      .lean();
    console.log('[QUIZ_SERVICE] Found quizzes:', result.length, result.map((q: any) => ({ quizId: q._id.toString(), curriculumItemId: q.curriculumItemId.toString() })));
    return result;
  };

  public updateQuiz = async (id: string | mongoose.Types.ObjectId, input: Partial<ICreateQuizInput>) => {
    return await Quiz.findByIdAndUpdate(id, input, { new: true });
  };

  public deleteQuiz = async (id: string | mongoose.Types.ObjectId) => {
    return await Quiz.findByIdAndDelete(id);
  };

  public submitQuiz = async (
    studentId: mongoose.Types.ObjectId,
    quizId: mongoose.Types.ObjectId,
    input: ISubmitQuizInput,
    courseId: mongoose.Types.ObjectId,
    sectionId: mongoose.Types.ObjectId
  ) => {
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Calculate score
    let score = 0;
    let maxScore = 0;

    // Convert answers object to array format for storage and scoring
    const answersArray: Array<{ questionIndex: number; selectedAnswer: string | number }> = [];

    Object.entries(input.answers).forEach(([questionIndexStr, selectedAnswer]) => {
      const questionIndex = parseInt(questionIndexStr, 10);
      const question = quiz.questions[questionIndex];
      if (!question) return;

      answersArray.push({ questionIndex, selectedAnswer });
      maxScore += question.points || 1;

      if (this.isAnswerCorrect(question, selectedAnswer)) {
        score += question.points || 1;
      }
    });

    const percentageScore = Math.round((score / maxScore) * 100);
    const passed = percentageScore >= quiz.passingScore;

    console.log('[QUIZ_SUBMIT] Score calculation:', { score, maxScore, percentageScore, passingScore: quiz.passingScore, passed });

    // Update or create submission (keep only latest attempt per student per quiz)
    const submission = await QuizSubmission.findOneAndUpdate(
      { studentId, quizId },
      {
        sectionId,
        courseId,
        answers: answersArray,
        score,
        maxScore,
        percentageScore,
        passed,
        timeTaken: input.timeTaken,
        submittedAt: new Date(),
        $inc: { attemptNumber: 1 },
      },
      { upsert: true, new: true }
    );

    // Update section progress if passed
    if (passed) {
      await this.updateSectionProgress(studentId, sectionId, courseId, percentageScore);
    }

    return submission;
  };

  private isAnswerCorrect = (question: IQuizQuestion, selectedAnswer: string | number): boolean => {
    // Check both numeric and string comparison for consistency
    return selectedAnswer === question.correctAnswer ||
           selectedAnswer === String(question.correctAnswer);
  };

  private updateSectionProgress = async (
    studentId: mongoose.Types.ObjectId,
    sectionId: mongoose.Types.ObjectId,
    courseId: mongoose.Types.ObjectId,
    score: number
  ) => {
    const progress = await SectionProgress.findOneAndUpdate(
      { studentId, sectionId },
      {
        quizPassed: true,
        quizPassedAt: new Date(),
        bestScore: score,
        $inc: { attemptCount: 1 },
      },
      { upsert: true, new: true }
    );

    return progress;
  };

  public canAccessSection = async (
    studentId: mongoose.Types.ObjectId,
    sectionId: mongoose.Types.ObjectId
  ): Promise<boolean> => {
    // Check if section has a quiz
    const quiz = await Quiz.findOne({ sectionId });

    if (!quiz) {
      // No quiz = can access section
      return true;
    }

    // Has quiz - check if student passed
    const progress = await SectionProgress.findOne({ studentId, sectionId });

    return progress?.quizPassed || false;
  };

  public getSectionProgress = async (
    studentId: mongoose.Types.ObjectId,
    sectionId: mongoose.Types.ObjectId
  ) => {
    return await SectionProgress.findOne({ studentId, sectionId });
  };

  public getQuizAttempts = async (studentId: mongoose.Types.ObjectId, quizId: mongoose.Types.ObjectId) => {
    return await QuizSubmission.find({ studentId, quizId }).sort({ createdAt: -1 });
  };

  public getCourseSectionProgress = async (
    studentId: mongoose.Types.ObjectId,
    courseId: mongoose.Types.ObjectId
  ) => {
    return await SectionProgress.find({ studentId, courseId });
  };

  public isCourseCompleted = async (
    studentId: mongoose.Types.ObjectId,
    courseId: mongoose.Types.ObjectId
  ): Promise<boolean> => {
    // Get all sections in course
    const sections = await Section.find({ courseId }).select('_id').lean();
    if (!sections || sections.length === 0) return true; // No sections = course complete

    const sectionIds = sections.map((s: any) => s._id);

    // Get all quizzes in those sections
    const quizzes = await Quiz.find({ sectionId: { $in: sectionIds } }).select('sectionId').lean();
    if (!quizzes || quizzes.length === 0) return true; // No quizzes = course complete

    const sectionsWithQuizzes = new Set(quizzes.map(q => q.sectionId.toString()));

    // Get student progress for those sections
    const progress = await SectionProgress.find({
      studentId,
      sectionId: { $in: Array.from(sectionsWithQuizzes).map(id => new mongoose.Types.ObjectId(id)) },
    }).select('sectionId quizPassed').lean();

    // All sections with quizzes must be passed
    const passedSections = new Set(progress.filter(p => p.quizPassed).map(p => p.sectionId.toString()));

    return passedSections.size === sectionsWithQuizzes.size;
  };
}

export const quizService = new QuizService();
