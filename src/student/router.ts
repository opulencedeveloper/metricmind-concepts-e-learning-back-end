import { Router } from "express";
import { studentAuthController } from "./controller";
import { studentCourseController } from "./course.controller";
import { studentCourseValidator } from "./course.validator";
import { studentAuth } from "../middleware/student-auth";
import { utils } from "../utils";

export const StudentRouter = Router();

// Public course routes (no authentication required)
StudentRouter.get("/courses", studentCourseValidator.validatePagination, utils.wrapAsync(studentCourseController.getBrowseCourses));

StudentRouter.get("/courses/search", studentCourseValidator.validateSearch, utils.wrapAsync(studentCourseController.searchCourses));

StudentRouter.get("/courses/categories", utils.wrapAsync(studentCourseController.getCategories));

StudentRouter.get("/courses/featured", utils.wrapAsync(studentCourseController.getFeaturedCourses));

StudentRouter.get("/courses/:courseSlug", studentCourseValidator.validateSlug, utils.wrapAsync(studentCourseController.getCourseDetails));

// Protected student routes (authentication required)
StudentRouter.use(studentAuth);

// Profile & Account
StudentRouter.put("/profile", studentCourseValidator.validateUpdateProfile, utils.wrapAsync(studentAuthController.updateProfile));

StudentRouter.post("/change-password", studentCourseValidator.validateChangePassword, utils.wrapAsync(studentAuthController.changePassword));

// Dashboard
StudentRouter.get("/dashboard", utils.wrapAsync(studentCourseController.getDashboard));

// Course details by ID (for checkout/confirmation pages) - MORE SPECIFIC PATH to avoid conflicting with :courseSlug
StudentRouter.get("/courses/by-id/:courseId", studentCourseValidator.validateObjectId, utils.wrapAsync(studentCourseController.getCourseDetailsById));

// Enrollments
StudentRouter.get("/enrollments", utils.wrapAsync(studentCourseController.getStudentEnrollments));

StudentRouter.post("/enrollments/purchase", utils.wrapAsync(studentCourseController.purchaseCourse));

StudentRouter.post("/enrollments/:enrollmentId/drop", studentCourseValidator.validateObjectId, utils.wrapAsync(studentCourseController.dropCourse));

// Payments/Transactions
StudentRouter.get("/payments", utils.wrapAsync(studentCourseController.getPaymentHistory));

// Course content (for enrolled students)
StudentRouter.get("/courses/:courseId/content", studentCourseValidator.validateObjectId, utils.wrapAsync(studentCourseController.getEnrolledCourseDetails));

StudentRouter.put("/courses/:courseId/progress", studentCourseValidator.validateObjectId, utils.wrapAsync(studentCourseController.updateProgress));

StudentRouter.post("/courses/:courseId/curriculum-items/:curriculumItemId/mark-watched", studentCourseValidator.validateObjectId, utils.wrapAsync(studentCourseController.markItemAsWatched));

// Quiz routes (with course context)
StudentRouter.get("/courses/:courseId/quiz/:quizId", studentCourseValidator.validateObjectId, utils.wrapAsync(studentCourseController.getQuiz));

StudentRouter.post("/courses/:courseId/quiz/:quizId/submit", studentCourseValidator.validateObjectId, studentCourseValidator.validateQuizSubmission, utils.wrapAsync(studentCourseController.submitQuiz));

StudentRouter.get("/courses/:courseId/quiz/:quizId/results/:attemptId", studentCourseValidator.validateObjectId, utils.wrapAsync(studentCourseController.getQuizSubmission));

// Quiz results endpoint (simpler, without course ID requirement)
StudentRouter.get("/quiz/:quizId/results/:attemptId", utils.wrapAsync(studentCourseController.getQuizSubmission));

// Certificate routes (dashboard - uses courseId)
StudentRouter.get("/courses/:courseId/certificate", studentCourseValidator.validateObjectId, utils.wrapAsync(studentCourseController.getCertificateByCode));

// Wishlist routes
StudentRouter.get("/wishlist", utils.wrapAsync(studentCourseController.getWishlist));

StudentRouter.post("/wishlist", studentCourseValidator.validateWishlist, utils.wrapAsync(studentCourseController.toggleWishlist));

// Review routes
StudentRouter.get("/courses/:courseSlug/reviews", studentCourseValidator.validateSlug, utils.wrapAsync(studentCourseController.getCourseReviews));

StudentRouter.post("/courses/:courseSlug/reviews", studentCourseValidator.validateSlug, studentCourseValidator.validateReviewSubmit, utils.wrapAsync(studentCourseController.submitReview));

StudentRouter.put("/courses/:courseSlug/reviews/:reviewId", studentCourseValidator.validateSlug, studentCourseValidator.validateObjectId, studentCourseValidator.validateReviewUpdate, utils.wrapAsync(studentCourseController.updateReview));
