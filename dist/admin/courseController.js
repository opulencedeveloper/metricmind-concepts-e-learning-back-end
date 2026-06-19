"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminCourseController = void 0;
const service_1 = require("../course/service");
const service_2 = require("../course/section/service");
const service_3 = require("../course/curriculum-item/service");
const service_4 = require("../course/quiz/service");
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const enum_2 = require("../course/enum");
class AdminCourseController {
    constructor() {
        this.createCourse = async (req, res) => {
            const adminId = req.userId;
            const body = req.body;
            // Generate slug from title
            const slug = utils_1.utils.generateSlug(body.title);
            // Check if slug already exists
            const existingCourse = await service_1.courseService.slugExists(slug);
            if (existingCourse) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: `A course with slug "${slug}" already exists. Please use a different title.`,
                    data: null,
                });
            }
            const course = await service_1.courseService.createCourse({
                ...body,
                slug,
                adminId,
            });
            return utils_1.utils.customResponse({
                status: 201,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Course created successfully",
                data: { course },
            });
        };
        this.getCourseDetails = async (req, res) => {
            const { courseId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            const sections = await service_2.sectionService.findSectionsByCourse(courseId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Course details retrieved",
                data: { course, sections },
            });
        };
        this.getAdminCourses = async (req, res) => {
            const adminId = req.userId;
            const courses = await service_1.courseService.findCoursesByAdmin(adminId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Admin courses retrieved",
                data: { courses, total: courses.length },
            });
        };
        this.updateCourse = async (req, res) => {
            const { courseId } = req.params;
            const adminId = req.userId;
            const updates = req.body;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to update this course",
                    data: null,
                });
            }
            // If title is being updated, regenerate slug from new title
            if (updates.title) {
                const newSlug = utils_1.utils.generateSlug(updates.title);
                // Check if new slug already exists (excluding current course)
                const existingCourse = await service_1.courseService.slugExists(newSlug, courseId);
                if (existingCourse) {
                    return utils_1.utils.customResponse({
                        status: 400,
                        res,
                        message: enum_1.MessageResponse.Error,
                        description: `A course with slug "${newSlug}" already exists. Please use a different title.`,
                        data: null,
                    });
                }
                updates.slug = newSlug;
            }
            const updatedCourse = await service_1.courseService.updateCourse(courseId, updates);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Course updated successfully",
                data: { course: updatedCourse },
            });
        };
        this.publishCourse = async (req, res) => {
            const { courseId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to publish this course",
                    data: null,
                });
            }
            if (course.status === enum_2.CourseStatus.Published) {
                return utils_1.utils.customResponse({
                    status: 400,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Course is already published",
                    data: null,
                });
            }
            const publishedCourse = await service_1.courseService.publishCourse(courseId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Course published successfully",
                data: { course: publishedCourse },
            });
        };
        this.unpublishCourse = async (req, res) => {
            const { courseId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to unpublish this course",
                    data: null,
                });
            }
            const unpublishedCourse = await service_1.courseService.unpublishCourse(courseId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Course unpublished successfully",
                data: { course: unpublishedCourse },
            });
        };
        this.deleteCourse = async (req, res) => {
            const { courseId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to delete this course",
                    data: null,
                });
            }
            await service_2.sectionService.deleteSectionsByCourse(courseId);
            await service_1.courseService.deleteCourse(courseId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Course deleted successfully",
                data: null,
            });
        };
        this.createSection = async (req, res) => {
            const { courseId } = req.params;
            const adminId = req.userId;
            const body = req.body;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to add sections to this course",
                    data: null,
                });
            }
            const section = await service_2.sectionService.createSection({
                ...body,
                courseId: course._id,
            });
            return utils_1.utils.customResponse({
                status: 201,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Section created successfully",
                data: { section },
            });
        };
        this.getSection = async (req, res) => {
            const { courseId, sectionId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            const section = await service_2.sectionService.findSectionById(sectionId);
            if (!section) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Section not found",
                    data: null,
                });
            }
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Section retrieved",
                data: { section },
            });
        };
        this.updateSection = async (req, res) => {
            const { courseId, sectionId } = req.params;
            const adminId = req.userId;
            const updateData = req.body;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            const section = await service_2.sectionService.updateSection(sectionId, updateData);
            if (!section) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Section not found",
                    data: null,
                });
            }
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Section updated successfully",
                data: { section },
            });
        };
        this.deleteSection = async (req, res) => {
            const { courseId, sectionId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            await service_2.sectionService.deleteSection(sectionId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Section deleted successfully",
                data: null,
            });
        };
        this.createCurriculumItem = async (req, res) => {
            const { courseId, sectionId } = req.params;
            const adminId = req.userId;
            const body = req.body;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to add items to this course",
                    data: null,
                });
            }
            const section = await service_2.sectionService.findSectionById(sectionId);
            if (!section) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Section not found",
                    data: null,
                });
            }
            const item = await service_3.curriculumItemService.createCurriculumItem({
                ...body,
                sectionId: section._id,
            });
            return utils_1.utils.customResponse({
                status: 201,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Curriculum item created successfully",
                data: { item },
            });
        };
        this.getCurriculumItem = async (req, res) => {
            const { courseId, sectionId, itemId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            const item = await service_3.curriculumItemService.findCurriculumItemById(itemId);
            if (!item) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Curriculum item not found",
                    data: null,
                });
            }
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Curriculum item retrieved",
                data: { item },
            });
        };
        this.updateCurriculumItem = async (req, res) => {
            const { courseId, sectionId, itemId } = req.params;
            const adminId = req.userId;
            const updateData = req.body;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            const item = await service_3.curriculumItemService.updateCurriculumItem(itemId, updateData);
            if (!item) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Curriculum item not found",
                    data: null,
                });
            }
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Curriculum item updated successfully",
                data: { item },
            });
        };
        this.deleteCurriculumItem = async (req, res) => {
            const { courseId, sectionId, itemId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            await service_3.curriculumItemService.deleteCurriculumItem(itemId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Curriculum item deleted successfully",
                data: null,
            });
        };
        this.getCourseContent = async (req, res) => {
            const { courseId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            const sections = await service_2.sectionService.findSectionsByCourse(courseId);
            const content = await Promise.all(sections.map(async (section) => {
                const items = await service_3.curriculumItemService.findCurriculumItemsBySection(section._id);
                return { section, items };
            }));
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Course content retrieved",
                data: { course, content },
            });
        };
        this.createQuiz = async (req, res) => {
            const { courseId } = req.params;
            const adminId = req.userId;
            const quizData = req.body;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            const quiz = await service_4.quizService.createQuiz(quizData);
            return utils_1.utils.customResponse({
                status: 201,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Quiz created successfully",
                data: { quiz },
            });
        };
        this.getQuiz = async (req, res) => {
            const { courseId, quizId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            const quiz = await service_4.quizService.findQuizById(quizId);
            if (!quiz) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Quiz not found",
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
        this.updateQuiz = async (req, res) => {
            const { courseId, quizId } = req.params;
            const adminId = req.userId;
            const updateData = req.body;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            const quiz = await service_4.quizService.updateQuiz(quizId, updateData);
            if (!quiz) {
                return utils_1.utils.customResponse({
                    status: 404,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Quiz not found",
                    data: null,
                });
            }
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Quiz updated successfully",
                data: { quiz },
            });
        };
        this.deleteQuiz = async (req, res) => {
            const { courseId, quizId } = req.params;
            const adminId = req.userId;
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
            if (course.adminId.toString() !== adminId?.toString()) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Unauthorized to access this course",
                    data: null,
                });
            }
            await service_4.quizService.deleteQuiz(quizId);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Quiz deleted successfully",
                data: null,
            });
        };
        this.getDashboardStats = async (req, res) => {
            const adminId = req.userId;
            const courses = await service_1.courseService.findCoursesByAdmin(adminId);
            const totalCourses = courses.length;
            const totalStudents = new Set(courses.flatMap((c) => (c.studentsEnrolled ? [c._id] : []))).size;
            let totalEnrollments = 0;
            let totalRevenue = 0;
            courses.forEach((course) => {
                totalEnrollments += course.studentsEnrolled || 0;
                totalRevenue += (course.price || 0) * (course.studentsEnrolled || 0);
            });
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Dashboard stats retrieved",
                data: {
                    stats: {
                        totalCourses,
                        totalStudents,
                        totalEnrollments,
                        totalRevenue: Math.round(totalRevenue * 100) / 100,
                    },
                },
            });
        };
        this.getAnalytics = async (req, res) => {
            const adminId = req.userId;
            const courses = await service_1.courseService.findCoursesByAdmin(adminId);
            let totalRevenue = 0;
            let totalRating = 0;
            let totalEnrollments = 0;
            let completedEnrollments = 0;
            const topCourse = courses.length > 0 ? courses[0] : null;
            courses.forEach((course) => {
                totalRevenue += (course.price || 0) * (course.studentsEnrolled || 0);
                totalRating += course.rating || 0;
                totalEnrollments += course.studentsEnrolled || 0;
                completedEnrollments += Math.floor((course.studentsEnrolled || 0) * 0.6);
            });
            const averageRating = courses.length > 0 ? totalRating / courses.length : 0;
            const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
                description: "Analytics retrieved",
                data: {
                    analytics: {
                        totalRevenue: Math.round(totalRevenue * 100) / 100,
                        averageRating: Math.round(averageRating * 10) / 10,
                        totalEnrollments,
                        completionRate,
                        topCourse: topCourse
                            ? { title: topCourse.title, students: topCourse.studentsEnrolled }
                            : null,
                    },
                },
            });
        };
    }
}
exports.adminCourseController = new AdminCourseController();
