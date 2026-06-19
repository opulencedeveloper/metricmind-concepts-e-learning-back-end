"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRouter = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
const courseController_1 = require("./courseController");
const courseValidator_1 = require("./courseValidator");
const validator_1 = require("../auth/validator");
const admin_auth_1 = require("../middleware/admin-auth");
const utils_1 = require("../utils");
exports.AdminRouter = (0, express_1.Router)();
// ==================== AUTHENTICATION ROUTES ====================
// No auth required for login
exports.AdminRouter.post("/login", validator_1.authValidator.validateLogin, utils_1.utils.wrapAsync(controller_1.adminAuthController.login));
// ==================== COURSE MANAGEMENT ROUTES ====================
// All course routes require admin authentication
exports.AdminRouter.use(admin_auth_1.adminAuth);
// Course CRUD operations
exports.AdminRouter.post("/courses", courseValidator_1.courseValidator.validateCreateCourse, utils_1.utils.wrapAsync(courseController_1.adminCourseController.createCourse));
exports.AdminRouter.get("/courses", utils_1.utils.wrapAsync(courseController_1.adminCourseController.getAdminCourses));
exports.AdminRouter.get("/courses/:courseId", courseValidator_1.courseValidator.validateObjectId, utils_1.utils.wrapAsync(courseController_1.adminCourseController.getCourseDetails));
exports.AdminRouter.put("/courses/:courseId", courseValidator_1.courseValidator.validateObjectId, courseValidator_1.courseValidator.validateUpdateCourse, utils_1.utils.wrapAsync(courseController_1.adminCourseController.updateCourse));
exports.AdminRouter.delete("/courses/:courseId", courseValidator_1.courseValidator.validateObjectId, utils_1.utils.wrapAsync(courseController_1.adminCourseController.deleteCourse));
// Course publish/unpublish
exports.AdminRouter.post("/courses/:courseId/publish", courseValidator_1.courseValidator.validateObjectId, courseValidator_1.courseValidator.validateSectionsHaveQuizzes, utils_1.utils.wrapAsync(courseController_1.adminCourseController.publishCourse));
exports.AdminRouter.post("/courses/:courseId/unpublish", courseValidator_1.courseValidator.validateObjectId, utils_1.utils.wrapAsync(courseController_1.adminCourseController.unpublishCourse));
// Course content management
exports.AdminRouter.get("/courses/:courseId/content", courseValidator_1.courseValidator.validateObjectId, utils_1.utils.wrapAsync(courseController_1.adminCourseController.getCourseContent));
// Section management
exports.AdminRouter.post("/courses/:courseId/sections", courseValidator_1.courseValidator.validateObjectId, courseValidator_1.courseValidator.validateCreateSection, utils_1.utils.wrapAsync(courseController_1.adminCourseController.createSection));
exports.AdminRouter.get("/courses/:courseId/sections/:sectionId", courseValidator_1.courseValidator.validateObjectId, utils_1.utils.wrapAsync(courseController_1.adminCourseController.getSection));
exports.AdminRouter.put("/courses/:courseId/sections/:sectionId", courseValidator_1.courseValidator.validateObjectId, courseValidator_1.courseValidator.validateUpdateSection, utils_1.utils.wrapAsync(courseController_1.adminCourseController.updateSection));
exports.AdminRouter.delete("/courses/:courseId/sections/:sectionId", courseValidator_1.courseValidator.validateObjectId, utils_1.utils.wrapAsync(courseController_1.adminCourseController.deleteSection));
// Curriculum item management
exports.AdminRouter.post("/courses/:courseId/sections/:sectionId/items", courseValidator_1.courseValidator.validateObjectId, courseValidator_1.courseValidator.validateCreateCurriculumItem, utils_1.utils.wrapAsync(courseController_1.adminCourseController.createCurriculumItem));
exports.AdminRouter.get("/courses/:courseId/sections/:sectionId/items/:itemId", courseValidator_1.courseValidator.validateObjectId, utils_1.utils.wrapAsync(courseController_1.adminCourseController.getCurriculumItem));
exports.AdminRouter.put("/courses/:courseId/sections/:sectionId/items/:itemId", courseValidator_1.courseValidator.validateObjectId, courseValidator_1.courseValidator.validateUpdateCurriculumItem, utils_1.utils.wrapAsync(courseController_1.adminCourseController.updateCurriculumItem));
exports.AdminRouter.delete("/courses/:courseId/sections/:sectionId/items/:itemId", courseValidator_1.courseValidator.validateObjectId, utils_1.utils.wrapAsync(courseController_1.adminCourseController.deleteCurriculumItem));
// Quiz management
exports.AdminRouter.post("/courses/:courseId/sections/:sectionId/quizzes", courseValidator_1.courseValidator.validateObjectId, courseValidator_1.courseValidator.validateCreateQuiz, utils_1.utils.wrapAsync(courseController_1.adminCourseController.createQuiz));
exports.AdminRouter.get("/courses/:courseId/sections/:sectionId/quizzes/:quizId", courseValidator_1.courseValidator.validateObjectId, utils_1.utils.wrapAsync(courseController_1.adminCourseController.getQuiz));
exports.AdminRouter.put("/courses/:courseId/sections/:sectionId/quizzes/:quizId", courseValidator_1.courseValidator.validateObjectId, courseValidator_1.courseValidator.validateUpdateQuiz, utils_1.utils.wrapAsync(courseController_1.adminCourseController.updateQuiz));
exports.AdminRouter.delete("/courses/:courseId/sections/:sectionId/quizzes/:quizId", courseValidator_1.courseValidator.validateObjectId, utils_1.utils.wrapAsync(courseController_1.adminCourseController.deleteQuiz));
// ==================== ANALYTICS ROUTES ====================
exports.AdminRouter.get("/stats", utils_1.utils.wrapAsync(courseController_1.adminCourseController.getDashboardStats));
exports.AdminRouter.get("/analytics", utils_1.utils.wrapAsync(courseController_1.adminCourseController.getAnalytics));
