"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentCourseController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const service_1 = require("../course/service");
const service_2 = require("../course/section/service");
const service_3 = require("../course/curriculum-item/service");
const service_4 = require("../course/enrollment/service");
const service_5 = require("../course/quiz/service");
const quiz_submission_entity_1 = __importDefault(require("../course/quiz/quiz-submission.entity"));
const service_6 = require("../course/wishlist/service");
const service_7 = require("../course/review/service");
const service_8 = require("./service");
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const enum_2 = require("../course/enum");
const loggin_1 = __importDefault(require("../utils/loggin"));
class StudentCourseController {
    constructor() {
        this.getBrowseCourses = async (req, res) => {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 12;
            const category = req.query.category;
            const level = req.query.level;
            const query = { status: enum_2.CourseStatus.Published };
            if (category) {
                query.category = category;
            }
            if (level) {
                query.level = level;
            }
            const courses = await service_1.courseService.findPublishedCourses(page, limit, category, level);
            const total = await (require("../course/entity")).default.countDocuments(query);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Published courses retrieved",
                data: {
                    courses,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit),
                    },
                },
            });
        };
        this.searchCourses = async (req, res) => {
            const query = req.query.query;
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 12;
            const category = req.query.category;
            if (!query || query.trim().length === 0) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Search query is required",
                    data: null,
                });
            }
            const courses = await service_1.courseService.searchCourses(query, page, limit, category);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Search results retrieved",
                data: {
                    courses,
                    pagination: {
                        page,
                        limit,
                        total: courses.length,
                    },
                },
            });
        };
        this.getCourseDetails = async (req, res) => {
            const { courseSlug } = req.params;
            const course = await service_1.courseService.findCourseBySlug(courseSlug);
            if (!course) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course not found",
                    data: null,
                });
            }
            const sections = await service_2.sectionService.findSectionsByCourse(course._id);
            const sectionsWithItems = await Promise.all(sections.map(async (section) => {
                const items = await service_3.curriculumItemService.findCurriculumItemsBySection(section._id);
                return {
                    ...section.toObject(),
                    items,
                };
            }));
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Course details retrieved",
                data: {
                    course,
                    sections: sectionsWithItems,
                },
            });
        };
        this.getCourseDetailsById = async (req, res) => {
            const { courseId } = req.params;
            loggin_1.default.info(`[getCourseDetailsById] Fetching course with ID: ${courseId}`);
            const course = await service_1.courseService.findCourseById(courseId);
            loggin_1.default.info(`[getCourseDetailsById] Course found: ${course ? 'YES' : 'NO'}`);
            if (course) {
                loggin_1.default.info(`[getCourseDetailsById] Course details - ID: ${course._id}, Title: ${course.title}, Status: ${course.status}`);
            }
            if (!course || course.status !== enum_2.CourseStatus.Published) {
                loggin_1.default.warn(`[getCourseDetailsById] Returning 404 - Course not found or not published (courseId: ${courseId})`);
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course not found",
                    data: null,
                });
            }
            loggin_1.default.info(`[getCourseDetailsById] Course is published, fetching sections for courseId: ${courseId}`);
            const sections = await service_2.sectionService.findSectionsByCourse(course._id);
            const sectionsWithItems = await Promise.all(sections.map(async (section) => {
                const items = await service_3.curriculumItemService.findCurriculumItemsBySection(section._id);
                return {
                    ...section.toObject(),
                    items,
                };
            }));
            loggin_1.default.info(`[getCourseDetailsById] Successfully returning course details - courseId: ${courseId}, sections: ${sectionsWithItems.length}`);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Course details retrieved",
                data: {
                    course,
                    sections: sectionsWithItems,
                },
            });
        };
        this.getStudentEnrollments = async (req, res) => {
            const studentId = req.userId;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            const enrollments = await service_4.enrollmentService.findStudentEnrollments(studentId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Student enrollments retrieved",
                data: {
                    enrollments,
                    total: enrollments.length,
                },
            });
        };
        this.getEnrolledCourseDetails = async (req, res) => {
            const { courseId } = req.params;
            const studentId = req.userId;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            const enrollment = await service_4.enrollmentService.findEnrollmentByStudentAndCourse(studentId, courseId);
            if (!enrollment) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "You are not enrolled in this course",
                    data: null,
                });
            }
            const course = await service_1.courseService.findCourseById(courseId);
            if (!course) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course not found",
                    data: null,
                });
            }
            const sections = await service_2.sectionService.findSectionsByCourse(courseId);
            const sectionsWithItems = await Promise.all(sections.map(async (section) => {
                // Check if student can access this section (must pass previous section's quiz)
                const accessCheck = await this.canAccessSection(studentId, section._id, courseId);
                const items = await service_3.curriculumItemService.findCurriculumItemsBySection(section._id);
                // Batch query quizzes for this section's items
                const itemIds = items.map(item => item._id);
                console.log(`[QUIZ_DEBUG] Section ${section._id} - Found ${items.length} items:`, items.map((i) => ({ id: i._id, type: i.type, title: i.title })));
                const quizzesData = await service_5.quizService.findQuizzesByCurriculumItems(itemIds);
                console.log(`[QUIZ_DEBUG] Found ${quizzesData.length} quizzes:`, quizzesData.map((q) => ({ quizId: q._id, curriculumItemId: q.curriculumItemId })));
                const quizMap = new Map(quizzesData.map((q) => [q.curriculumItemId.toString(), q._id]));
                // Attach quizId to quiz-type items
                const itemsWithQuizId = items.map((item) => {
                    const itemObj = item.toObject();
                    console.log(`[QUIZ_DEBUG] Processing item ${item._id} - type: ${itemObj.type}, isQuiz: ${itemObj.type === enum_2.CurriculumItemType.Quiz}`);
                    if (itemObj.type === enum_2.CurriculumItemType.Quiz) {
                        const foundQuizId = quizMap.get(item._id.toString());
                        console.log(`[QUIZ_DEBUG] Quiz item ${item._id} - found quizId: ${foundQuizId}`);
                        itemObj.quizId = foundQuizId;
                    }
                    return itemObj;
                });
                console.log(`[QUIZ_DEBUG] Final items with quizId:`, itemsWithQuizId.filter((i) => i.type === enum_2.CurriculumItemType.Quiz).map((i) => ({ id: i._id, quizId: i.quizId })));
                return {
                    ...section.toObject(),
                    items: itemsWithQuizId,
                    canAccess: accessCheck.canAccess,
                    accessReason: accessCheck.reason,
                };
            }));
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Enrolled course details retrieved",
                data: {
                    course,
                    sections: sectionsWithItems,
                    enrollment,
                },
            });
        };
        this.updateProgress = async (req, res) => {
            const { courseId } = req.params;
            const { progress } = req.body;
            const studentId = req.userId;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            if (typeof progress !== "number" || progress < 0 || progress > 100) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Progress must be a number between 0 and 100",
                    data: null,
                });
            }
            const enrollment = await service_4.enrollmentService.findEnrollmentByStudentAndCourse(studentId, courseId);
            if (!enrollment) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "You are not enrolled in this course",
                    data: null,
                });
            }
            const updated = await service_4.enrollmentService.updateProgress(enrollment._id, {
                progress,
                lastAccessedDate: new Date(),
            });
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Progress updated successfully",
                data: { enrollment: updated },
            });
        };
        this.getCategories = async (req, res) => {
            const Course = require("../course/entity").default;
            const categories = await Course.distinct("category", { status: enum_2.CourseStatus.Published });
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Categories retrieved",
                data: { categories },
            });
        };
        this.getFeaturedCourses = async (req, res) => {
            const limit = 3;
            const courses = await service_1.courseService.findPublishedCourses(1, limit);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Featured courses retrieved",
                data: { courses },
            });
        };
        this.getQuiz = async (req, res) => {
            const { quizId } = req.params;
            const studentId = req.userId;
            const quiz = await service_5.quizService.findQuizById(quizId);
            if (!quiz) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Quiz not found",
                    data: null,
                });
            }
            // Security: Check if student has access to this section
            const section = await service_2.sectionService.findSectionById(quiz.sectionId);
            if (!section) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Section not found",
                    data: null,
                });
            }
            const accessCheck = await this.canAccessSection(studentId, quiz.sectionId, section.courseId);
            if (!accessCheck.canAccess) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: accessCheck.reason || "Access denied",
                    data: null,
                });
            }
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Quiz retrieved",
                data: { quiz },
            });
        };
        this.submitQuiz = async (req, res) => {
            const { quizId } = req.params;
            const { answers, timeTaken } = req.body;
            const studentId = req.userId;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            try {
                const quiz = await service_5.quizService.findQuizById(quizId);
                if (!quiz) {
                    return utils_1.utils.customResponse({
                        status: 404,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: "Quiz not found",
                        data: null,
                    });
                }
                const section = await service_2.sectionService.findSectionById(quiz.sectionId);
                if (!section) {
                    return utils_1.utils.customResponse({
                        status: 404,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: "Section not found",
                        data: null,
                    });
                }
                // Security: Check if student has access to this section
                const accessCheck = await this.canAccessSection(studentId, quiz.sectionId, section.courseId);
                if (!accessCheck.canAccess) {
                    return utils_1.utils.customResponse({
                        status: 403,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: accessCheck.reason || "Access denied",
                        data: null,
                    });
                }
                if (!section) {
                    return utils_1.utils.customResponse({
                        status: 404,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: "Section not found",
                        data: null,
                    });
                }
                const submission = await service_5.quizService.submitQuiz(new mongoose_1.default.Types.ObjectId(studentId.toString()), new mongoose_1.default.Types.ObjectId(quizId), { quizId: new mongoose_1.default.Types.ObjectId(quizId), answers, timeTaken }, new mongoose_1.default.Types.ObjectId(section.courseId.toString()), new mongoose_1.default.Types.ObjectId(quiz.sectionId.toString()));
                return utils_1.utils.customResponse({
                    status: 201,
                    res,
                    message: enum_1.MessageResponse.Success,
                    description: "Quiz submitted successfully",
                    data: { attemptId: submission._id },
                });
            }
            catch (error) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: error.message || "Failed to submit quiz",
                    data: null,
                });
            }
        };
        this.getQuizSubmission = async (req, res) => {
            const { quizId, attemptId } = req.params;
            const studentId = req.userId;
            const submission = await quiz_submission_entity_1.default.findById(attemptId);
            if (!submission) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Submission not found",
                    data: null,
                });
            }
            if (submission.quizId.toString() !== quizId) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Submission does not belong to this quiz",
                    data: null,
                });
            }
            // Verify student owns this submission
            if (submission.studentId.toString() !== studentId.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized",
                    data: null,
                });
            }
            const quiz = await service_5.quizService.findQuizById(quizId);
            if (!quiz) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Quiz not found",
                    data: null,
                });
            }
            // Build answer review
            // Only show explanations for CORRECT answers - don't reveal info about wrong answers
            const reviewAnswers = submission.answers.map((answer) => {
                const question = quiz.questions[answer.questionIndex];
                const isCorrect = answer.selectedAnswer === question.correctAnswer ||
                    answer.selectedAnswer === String(question.correctAnswer);
                const review = {
                    questionIndex: answer.questionIndex,
                    question: question.question,
                    userAnswer: question.options[answer.selectedAnswer],
                    correct: isCorrect,
                };
                // Only include explanation for correct answers - reinforces learning
                // Wrong answers don't get explanation - encourages retaking to learn
                if (isCorrect) {
                    review.explanation = question.explanation;
                }
                return review;
            });
            console.log('[QUIZ_RESULTS] Submission passed:', submission.passed);
            console.log('[QUIZ_RESULTS] Review answers sample:', JSON.stringify(reviewAnswers.slice(0, 1), null, 2));
            console.log('[QUIZ_RESULTS] Has correctAnswer in first review?', 'correctAnswer' in reviewAnswers[0]);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Submission retrieved",
                data: { submission, quiz, reviewAnswers },
            });
        };
        this.dropCourse = async (req, res) => {
            const { enrollmentId } = req.params;
            const studentId = req.userId;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            const enrollment = await service_4.enrollmentService.findEnrollmentById(enrollmentId);
            if (!enrollment) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Enrollment not found",
                    data: null,
                });
            }
            if (enrollment.studentId.toString() !== studentId.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "You cannot drop this enrollment",
                    data: null,
                });
            }
            const droppedEnrollment = await service_4.enrollmentService.dropEnrollment(enrollmentId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Course dropped successfully",
                data: { enrollment: droppedEnrollment },
            });
        };
        this.canAccessSection = async (studentId, sectionId, courseId) => {
            const section = await service_2.sectionService.findSectionById(sectionId);
            if (!section) {
                return { canAccess: false, reason: "Section not found" };
            }
            // Get all sections in course sorted by order
            const allSections = await service_2.sectionService.findSectionsByCourse(courseId);
            const currentSectionIndex = allSections.findIndex((s) => s._id.toString() === sectionId.toString());
            // First section - always accessible
            if (currentSectionIndex === 0) {
                return { canAccess: true };
            }
            // Not the first section - must pass previous section's quiz
            const previousSection = allSections[currentSectionIndex - 1];
            if (!previousSection) {
                return { canAccess: true };
            }
            // Check if previous section has a quiz and if student passed it
            const previousSectionAccess = await service_5.quizService.canAccessSection(studentId, previousSection._id);
            if (!previousSectionAccess) {
                return {
                    canAccess: false,
                    reason: `You must complete the quiz in "${previousSection.title}" before accessing this section`,
                };
            }
            return { canAccess: true };
        };
        this.getCertificateByCode = async (req, res) => {
            const { courseId } = req.params;
            const studentId = req.userId;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            const enrollment = await service_4.enrollmentService.findEnrollmentByStudentAndCourse(studentId, courseId);
            if (!enrollment) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "You are not enrolled in this course",
                    data: null,
                });
            }
            const course = await service_1.courseService.findCourseById(courseId);
            if (!course) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course not found",
                    data: null,
                });
            }
            // Verify all course quizzes are completed
            const courseObjectId = new mongoose_1.default.Types.ObjectId(courseId);
            const isCompleted = await service_5.quizService.isCourseCompleted(studentId, courseObjectId);
            if (!isCompleted) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Complete all course quizzes to earn your certificate",
                    data: null,
                });
            }
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Certificate retrieved successfully",
                data: {
                    certificate: {
                        _id: enrollment._id,
                        studentId,
                        courseSlug: course.slug,
                        courseName: course.title,
                        studentName: 'Student',
                        completedAt: new Date(),
                    },
                },
            });
        };
        this.getDashboard = async (req, res) => {
            const studentId = req.userId;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            const enrollments = await service_4.enrollmentService.findStudentEnrollments(studentId);
            const totalEnrolled = enrollments.length;
            const completed = enrollments.filter((e) => e.progress === 100).length;
            const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
            const totalHours = Math.round(enrollments.reduce((sum, e) => {
                const courseDuration = e.courseId?.totalDuration || 0;
                const timeInvested = (courseDuration * (e.progress || 0)) / 100;
                return sum + timeInvested;
            }, 0));
            // Get recent courses (already populated with course details)
            const recentCourses = enrollments
                .sort((a, b) => new Date(b.lastAccessedDate || 0).getTime() - new Date(a.lastAccessedDate || 0).getTime())
                .slice(0, 5)
                .map((enrollment) => ({
                _id: enrollment._id,
                courseId: {
                    _id: enrollment.courseId?._id || enrollment.courseId,
                    title: enrollment.courseId?.title || 'Unknown Course',
                    instructor: enrollment.courseId?.instructor || '',
                    thumbnail: enrollment.courseId?.thumbnail || '',
                    previewVideoUrl: enrollment.courseId?.previewVideoUrl || '',
                    totalDuration: enrollment.courseId?.totalDuration,
                },
                progress: enrollment.progress || 0,
                lastAccessedDate: enrollment.lastAccessedDate,
            }));
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Dashboard data retrieved",
                data: {
                    stats: {
                        totalEnrolled,
                        inProgress,
                        completed,
                        totalHours,
                    },
                    recentCourses,
                },
            });
        };
        this.getPaymentHistory = async (req, res) => {
            const studentId = req.userId;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            const paymentService = require("../payment/service").paymentService;
            const payments = await paymentService.findStudentPayments(studentId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Payment history retrieved",
                data: {
                    payments,
                    total: payments.length,
                },
            });
        };
        this.purchaseCourse = async (req, res) => {
            const studentId = req.userId;
            const { courseId } = req.body;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            if (!courseId) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course ID is required",
                    data: null,
                });
            }
            const course = await service_1.courseService.findCourseById(courseId);
            if (!course) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course not found",
                    data: null,
                });
            }
            const paymentService = require("../payment/service").paymentService;
            const existingPayment = await paymentService.findPaymentByStudentAndCourse(studentId, courseId);
            if (existingPayment) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "You are already enrolled in this course",
                    data: null,
                });
            }
            const studentService = require("./service").studentService;
            const student = await studentService.findStudentById(studentId);
            if (!student) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Student not found",
                    data: null,
                });
            }
            const paystackPayment = await paymentService.initiatePayment({
                studentId: new mongoose_1.default.Types.ObjectId(studentId.toString()),
                courseId: new mongoose_1.default.Types.ObjectId(courseId),
                amount: course.price,
                currency: course.currency,
                studentEmail: student.email,
                studentName: student.fullName,
            });
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Payment initiated",
                data: {
                    authorizationUrl: paystackPayment.authorization_url,
                    accessCode: paystackPayment.access_code,
                    reference: paystackPayment.reference,
                },
            });
        };
        this.getWishlist = async (req, res) => {
            const wishlist = await service_6.wishlistService.getStudentWishlist(req.userId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Wishlist retrieved",
                data: {
                    wishlist: wishlist.map((w) => ({
                        _id: w.courseId._id,
                        title: w.courseId.title,
                        description: w.courseId.description,
                        price: w.courseId.price,
                        category: w.courseId.category,
                        level: w.courseId.level,
                    })),
                },
            });
        };
        this.toggleWishlist = async (req, res) => {
            const { courseId } = req.body;
            const isInWishlist = await service_6.wishlistService.isInWishlist(req.userId, courseId);
            if (isInWishlist) {
                await service_6.wishlistService.removeFromWishlist(req.userId, courseId);
                return utils_1.utils.customResponse({
                    status: 200,
                    res,
                    message: enum_1.MessageResponse.Success,
                    description: "Removed from wishlist",
                    data: { added: false },
                });
            }
            await service_6.wishlistService.addToWishlist({ studentId: req.userId, courseId });
            return utils_1.utils.customResponse({
                status: 201,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Added to wishlist",
                data: { added: true },
            });
        };
        this.getCourseReviews = async (req, res) => {
            const { courseSlug } = req.params;
            const course = await service_1.courseService.findCourseBySlug(courseSlug);
            if (!course) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course not found",
                    data: null,
                });
            }
            const [enrollment, reviews, studentReview, rating] = await Promise.all([
                service_4.enrollmentService.findEnrollmentByStudentAndCourse(req.userId, course._id),
                service_7.reviewService.getCourseReviews(course._id),
                service_7.reviewService.findStudentCourseReview(course._id, req.userId),
                service_7.reviewService.getAverageRating(course._id),
            ]);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Reviews retrieved",
                data: {
                    courseId: course._id,
                    courseName: course.title,
                    courseCompleted: enrollment && enrollment.progress === 100,
                    studentReview: studentReview || undefined,
                    allReviews: reviews,
                    averageRating: rating.averageRating,
                    totalReviews: rating.totalReviews,
                },
            });
        };
        this.submitReview = async (req, res) => {
            const { courseSlug } = req.params;
            const { rating, comment } = req.body;
            const course = await service_1.courseService.findCourseBySlug(courseSlug);
            if (!course) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course not found",
                    data: null,
                });
            }
            const enrollment = await service_4.enrollmentService.findEnrollmentByStudentAndCourse(req.userId, course._id);
            if (!enrollment || enrollment.progress !== 100) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Can only review completed courses",
                    data: null,
                });
            }
            const student = await service_8.studentService.findStudentById(req.userId);
            const review = await service_7.reviewService.createReview({
                courseId: course._id,
                studentId: req.userId,
                studentName: student.fullName,
                rating,
                comment: comment.trim(),
            });
            return utils_1.utils.customResponse({
                status: 201,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Review submitted",
                data: { review },
            });
        };
        this.updateReview = async (req, res) => {
            const { reviewId } = req.params;
            const { rating, comment } = req.body;
            const review = await service_7.reviewService.findReviewById(reviewId);
            if (!review || review.studentId.toString() !== req.userId.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Cannot update this review",
                    data: null,
                });
            }
            const updatedReview = await service_7.reviewService.updateReview(reviewId, {
                rating: rating || review.rating,
                comment: comment || review.comment,
            });
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Review updated",
                data: { review: updatedReview },
            });
        };
        this.markItemAsWatched = async (req, res) => {
            const { courseId, curriculumItemId } = req.params;
            const studentId = req.userId;
            if (!studentId) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Authentication required",
                    data: null,
                });
            }
            // Verify student is enrolled in the course
            const enrollment = await service_4.enrollmentService.findEnrollmentByStudentAndCourse(studentId, courseId);
            if (!enrollment) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "You are not enrolled in this course",
                    data: null,
                });
            }
            // Mark item as watched and update progress
            const updated = await service_4.enrollmentService.markItemAsWatched(enrollment._id, courseId, {
                curriculumItemId: new mongoose_1.default.Types.ObjectId(curriculumItemId),
            });
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Item marked as watched",
                data: { enrollment: updated },
            });
        };
    }
}
exports.studentCourseController = new StudentCourseController();
