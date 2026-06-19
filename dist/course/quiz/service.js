"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const quiz_entity_1 = __importDefault(require("./quiz.entity"));
const quiz_submission_entity_1 = __importDefault(require("./quiz-submission.entity"));
const section_progress_entity_1 = __importDefault(require("./section-progress.entity"));
const entity_1 = __importDefault(require("../section/entity"));
class QuizService {
    constructor() {
        this.createQuiz = async (input) => {
            const quiz = new quiz_entity_1.default(input);
            await quiz.save();
            return quiz;
        };
        this.findQuizById = async (id) => {
            return await quiz_entity_1.default.findById(id);
        };
        this.findQuizBySection = async (sectionId) => {
            return await quiz_entity_1.default.findOne({ sectionId });
        };
        this.findQuizByCurriculumItem = async (curriculumItemId) => {
            return await quiz_entity_1.default.findOne({ curriculumItemId });
        };
        this.findQuizzesByCurriculumItems = async (curriculumItemIds) => {
            console.log('[QUIZ_SERVICE] Finding quizzes for curriculum items:', curriculumItemIds.map(id => id.toString()));
            const result = await quiz_entity_1.default.find({ curriculumItemId: { $in: curriculumItemIds } })
                .select('_id curriculumItemId')
                .lean();
            console.log('[QUIZ_SERVICE] Found quizzes:', result.length, result.map((q) => ({ quizId: q._id.toString(), curriculumItemId: q.curriculumItemId.toString() })));
            return result;
        };
        this.updateQuiz = async (id, input) => {
            return await quiz_entity_1.default.findByIdAndUpdate(id, input, { new: true });
        };
        this.deleteQuiz = async (id) => {
            return await quiz_entity_1.default.findByIdAndDelete(id);
        };
        this.submitQuiz = async (studentId, quizId, input, courseId, sectionId) => {
            const quiz = await quiz_entity_1.default.findById(quizId);
            if (!quiz) {
                throw new Error("Quiz not found");
            }
            // Calculate score
            let score = 0;
            let maxScore = 0;
            // Convert answers object to array format for storage and scoring
            const answersArray = [];
            Object.entries(input.answers).forEach(([questionIndexStr, selectedAnswer]) => {
                const questionIndex = parseInt(questionIndexStr, 10);
                const question = quiz.questions[questionIndex];
                if (!question)
                    return;
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
            const submission = await quiz_submission_entity_1.default.findOneAndUpdate({ studentId, quizId }, {
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
            }, { upsert: true, new: true });
            // Update section progress if passed
            if (passed) {
                await this.updateSectionProgress(studentId, sectionId, courseId, percentageScore);
            }
            return submission;
        };
        this.isAnswerCorrect = (question, selectedAnswer) => {
            // Check both numeric and string comparison for consistency
            return selectedAnswer === question.correctAnswer ||
                selectedAnswer === String(question.correctAnswer);
        };
        this.updateSectionProgress = async (studentId, sectionId, courseId, score) => {
            const progress = await section_progress_entity_1.default.findOneAndUpdate({ studentId, sectionId }, {
                quizPassed: true,
                quizPassedAt: new Date(),
                bestScore: score,
                $inc: { attemptCount: 1 },
            }, { upsert: true, new: true });
            return progress;
        };
        this.canAccessSection = async (studentId, sectionId) => {
            // Check if section has a quiz
            const quiz = await quiz_entity_1.default.findOne({ sectionId });
            if (!quiz) {
                // No quiz = can access section
                return true;
            }
            // Has quiz - check if student passed
            const progress = await section_progress_entity_1.default.findOne({ studentId, sectionId });
            return progress?.quizPassed || false;
        };
        this.getSectionProgress = async (studentId, sectionId) => {
            return await section_progress_entity_1.default.findOne({ studentId, sectionId });
        };
        this.getQuizAttempts = async (studentId, quizId) => {
            return await quiz_submission_entity_1.default.find({ studentId, quizId }).sort({ createdAt: -1 });
        };
        this.getCourseSectionProgress = async (studentId, courseId) => {
            return await section_progress_entity_1.default.find({ studentId, courseId });
        };
        this.isCourseCompleted = async (studentId, courseId) => {
            // Get all sections in course
            const sections = await entity_1.default.find({ courseId }).select('_id').lean();
            if (!sections || sections.length === 0)
                return true; // No sections = course complete
            const sectionIds = sections.map((s) => s._id);
            // Get all quizzes in those sections
            const quizzes = await quiz_entity_1.default.find({ sectionId: { $in: sectionIds } }).select('sectionId').lean();
            if (!quizzes || quizzes.length === 0)
                return true; // No quizzes = course complete
            const sectionsWithQuizzes = new Set(quizzes.map(q => q.sectionId.toString()));
            // Get student progress for those sections
            const progress = await section_progress_entity_1.default.find({
                studentId,
                sectionId: { $in: Array.from(sectionsWithQuizzes).map(id => new mongoose_1.default.Types.ObjectId(id)) },
            }).select('sectionId quizPassed').lean();
            // All sections with quizzes must be passed
            const passedSections = new Set(progress.filter(p => p.quizPassed).map(p => p.sectionId.toString()));
            return passedSections.size === sectionsWithQuizzes.size;
        };
    }
}
exports.quizService = new QuizService();
