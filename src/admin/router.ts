import { Router } from "express";
import { adminAuthController } from "./controller";
import { adminCourseController } from "./courseController";
import { courseValidator } from "./courseValidator";
import { authValidator } from "../auth/validator";
import { adminAuth } from "../middleware/admin-auth";
import { utils } from "../utils";

export const AdminRouter = Router();

// ==================== AUTHENTICATION ROUTES ====================
// No auth required for login
AdminRouter.post("/login", authValidator.validateLogin, utils.wrapAsync(adminAuthController.login));

// ==================== COURSE MANAGEMENT ROUTES ====================
// All course routes require admin authentication
AdminRouter.use(adminAuth);

// Course CRUD operations
AdminRouter.post("/courses", courseValidator.validateCreateCourse, utils.wrapAsync(adminCourseController.createCourse));

AdminRouter.get("/courses", utils.wrapAsync(adminCourseController.getAdminCourses));

AdminRouter.get("/courses/:courseId", courseValidator.validateObjectId, utils.wrapAsync(adminCourseController.getCourseDetails));

AdminRouter.put("/courses/:courseId", courseValidator.validateObjectId, courseValidator.validateUpdateCourse, utils.wrapAsync(adminCourseController.updateCourse));

AdminRouter.delete("/courses/:courseId", courseValidator.validateObjectId, utils.wrapAsync(adminCourseController.deleteCourse));

// Course publish/unpublish
AdminRouter.post("/courses/:courseId/publish", courseValidator.validateObjectId, courseValidator.validateSectionsHaveQuizzes, utils.wrapAsync(adminCourseController.publishCourse));

AdminRouter.post("/courses/:courseId/unpublish", courseValidator.validateObjectId, utils.wrapAsync(adminCourseController.unpublishCourse));

// Course content management
AdminRouter.get("/courses/:courseId/content", courseValidator.validateObjectId, utils.wrapAsync(adminCourseController.getCourseContent));

// Section management
AdminRouter.post("/courses/:courseId/sections", courseValidator.validateObjectId, courseValidator.validateCreateSection, utils.wrapAsync(adminCourseController.createSection));

AdminRouter.get("/courses/:courseId/sections/:sectionId", courseValidator.validateObjectId, utils.wrapAsync(adminCourseController.getSection));

AdminRouter.put("/courses/:courseId/sections/:sectionId", courseValidator.validateObjectId, courseValidator.validateUpdateSection, utils.wrapAsync(adminCourseController.updateSection));

AdminRouter.delete("/courses/:courseId/sections/:sectionId", courseValidator.validateObjectId, utils.wrapAsync(adminCourseController.deleteSection));

// Curriculum item management
AdminRouter.post("/courses/:courseId/sections/:sectionId/items", courseValidator.validateObjectId, courseValidator.validateCreateCurriculumItem, utils.wrapAsync(adminCourseController.createCurriculumItem));

AdminRouter.get("/courses/:courseId/sections/:sectionId/items/:itemId", courseValidator.validateObjectId, utils.wrapAsync(adminCourseController.getCurriculumItem));

AdminRouter.put("/courses/:courseId/sections/:sectionId/items/:itemId", courseValidator.validateObjectId, courseValidator.validateUpdateCurriculumItem, utils.wrapAsync(adminCourseController.updateCurriculumItem));

AdminRouter.delete("/courses/:courseId/sections/:sectionId/items/:itemId", courseValidator.validateObjectId, utils.wrapAsync(adminCourseController.deleteCurriculumItem));

// Quiz management
AdminRouter.post("/courses/:courseId/sections/:sectionId/quizzes", courseValidator.validateObjectId, courseValidator.validateCreateQuiz, utils.wrapAsync(adminCourseController.createQuiz));

AdminRouter.get("/courses/:courseId/sections/:sectionId/quizzes/:quizId", courseValidator.validateObjectId, utils.wrapAsync(adminCourseController.getQuiz));

AdminRouter.put("/courses/:courseId/sections/:sectionId/quizzes/:quizId", courseValidator.validateObjectId, courseValidator.validateUpdateQuiz, utils.wrapAsync(adminCourseController.updateQuiz));

AdminRouter.delete("/courses/:courseId/sections/:sectionId/quizzes/:quizId", courseValidator.validateObjectId, utils.wrapAsync(adminCourseController.deleteQuiz));

// ==================== ANALYTICS ROUTES ====================
AdminRouter.get("/stats", utils.wrapAsync(adminCourseController.getDashboardStats));

AdminRouter.get("/analytics", utils.wrapAsync(adminCourseController.getAnalytics));
