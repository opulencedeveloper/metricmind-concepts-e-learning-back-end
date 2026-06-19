"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRouter = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
const course_controller_1 = require("./course.controller");
const course_validator_1 = require("./course.validator");
const student_auth_1 = require("../middleware/student-auth");
const utils_1 = require("../utils");
exports.StudentRouter = (0, express_1.Router)();
// Public course routes (no authentication required)
exports.StudentRouter.get("/courses", course_validator_1.studentCourseValidator.validatePagination, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getBrowseCourses));
exports.StudentRouter.get("/courses/search", course_validator_1.studentCourseValidator.validateSearch, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.searchCourses));
exports.StudentRouter.get("/courses/categories", utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getCategories));
exports.StudentRouter.get("/courses/featured", utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getFeaturedCourses));
exports.StudentRouter.get("/courses/:courseSlug", course_validator_1.studentCourseValidator.validateSlug, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getCourseDetails));
// Protected student routes (authentication required)
exports.StudentRouter.use(student_auth_1.studentAuth);
// Profile & Account
exports.StudentRouter.put("/profile", course_validator_1.studentCourseValidator.validateUpdateProfile, utils_1.utils.wrapAsync(controller_1.studentAuthController.updateProfile));
exports.StudentRouter.post("/change-password", course_validator_1.studentCourseValidator.validateChangePassword, utils_1.utils.wrapAsync(controller_1.studentAuthController.changePassword));
// Dashboard
exports.StudentRouter.get("/dashboard", utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getDashboard));
// Course details by ID (for checkout/confirmation pages) - MORE SPECIFIC PATH to avoid conflicting with :courseSlug
exports.StudentRouter.get("/courses/by-id/:courseId", course_validator_1.studentCourseValidator.validateObjectId, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getCourseDetailsById));
// Enrollments
exports.StudentRouter.get("/enrollments", utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getStudentEnrollments));
exports.StudentRouter.post("/enrollments/purchase", utils_1.utils.wrapAsync(course_controller_1.studentCourseController.purchaseCourse));
exports.StudentRouter.post("/enrollments/:enrollmentId/drop", course_validator_1.studentCourseValidator.validateObjectId, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.dropCourse));
// Payments/Transactions
exports.StudentRouter.get("/payments", utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getPaymentHistory));
// Course content (for enrolled students)
exports.StudentRouter.get("/courses/:courseId/content", course_validator_1.studentCourseValidator.validateObjectId, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getEnrolledCourseDetails));
exports.StudentRouter.put("/courses/:courseId/progress", course_validator_1.studentCourseValidator.validateObjectId, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.updateProgress));
exports.StudentRouter.post("/courses/:courseId/curriculum-items/:curriculumItemId/mark-watched", course_validator_1.studentCourseValidator.validateObjectId, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.markItemAsWatched));
// Quiz routes (with course context)
exports.StudentRouter.get("/courses/:courseId/quiz/:quizId", course_validator_1.studentCourseValidator.validateObjectId, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getQuiz));
exports.StudentRouter.post("/courses/:courseId/quiz/:quizId/submit", course_validator_1.studentCourseValidator.validateObjectId, course_validator_1.studentCourseValidator.validateQuizSubmission, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.submitQuiz));
exports.StudentRouter.get("/courses/:courseId/quiz/:quizId/results/:attemptId", course_validator_1.studentCourseValidator.validateObjectId, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getQuizSubmission));
// Quiz results endpoint (simpler, without course ID requirement)
exports.StudentRouter.get("/quiz/:quizId/results/:attemptId", utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getQuizSubmission));
// Certificate routes (dashboard - uses courseId)
exports.StudentRouter.get("/courses/:courseId/certificate", course_validator_1.studentCourseValidator.validateObjectId, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getCertificateByCode));
// Wishlist routes
exports.StudentRouter.get("/wishlist", utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getWishlist));
exports.StudentRouter.post("/wishlist", course_validator_1.studentCourseValidator.validateWishlist, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.toggleWishlist));
// Review routes
exports.StudentRouter.get("/courses/:courseSlug/reviews", course_validator_1.studentCourseValidator.validateSlug, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.getCourseReviews));
exports.StudentRouter.post("/courses/:courseSlug/reviews", course_validator_1.studentCourseValidator.validateSlug, course_validator_1.studentCourseValidator.validateReviewSubmit, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.submitReview));
exports.StudentRouter.put("/courses/:courseSlug/reviews/:reviewId", course_validator_1.studentCourseValidator.validateSlug, course_validator_1.studentCourseValidator.validateObjectId, course_validator_1.studentCourseValidator.validateReviewUpdate, utils_1.utils.wrapAsync(course_controller_1.studentCourseController.updateReview));
