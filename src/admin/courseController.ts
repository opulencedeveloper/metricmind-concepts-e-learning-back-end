import { Response } from "express";
import { courseService } from "../course/service";
import { sectionService } from "../course/section/service";
import { curriculumItemService } from "../course/curriculum-item/service";
import { quizService } from "../course/quiz/service";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { CustomRequest } from "../utils/interface";
import { ICreateCourseInput, IUpdateCourseInput, ICreateSectionInput, ICreateCurriculumItemInput } from "../course/interface";
import { ICreateQuizInput, IUpdateQuizInput } from "../course/quiz/interface";
import { CourseStatus } from "../course/enum";

class AdminCourseController {
  public createCourse = async (req: CustomRequest, res: Response) => {
    const adminId = req.userId as any;
    const body: ICreateCourseInput = req.body;

    // Generate slug from title
    const slug = utils.generateSlug(body.title);

    // Check if slug already exists
    const existingCourse = await courseService.slugExists(slug);
    if (existingCourse) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: `A course with slug "${slug}" already exists. Please use a different title.`,
        data: null,
      });
    }

    const course = await courseService.createCourse({
      ...body,
      slug,
      adminId,
    });

    return utils.customResponse({
      status: 201,
      res,
      message: MessageResponse.Success,
      description: "Course created successfully",
      data: { course },
    });
  };

  public getCourseDetails = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    const sections = await sectionService.findSectionsByCourse(courseId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Course details retrieved",
      data: { course, sections },
    });
  };

  public getAdminCourses = async (req: CustomRequest, res: Response) => {
    const adminId = req.userId;

    const courses = await courseService.findCoursesByAdmin(adminId!);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Admin courses retrieved",
      data: { courses, total: courses.length },
    });
  };

  public updateCourse = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const adminId = req.userId;
    const updates: IUpdateCourseInput = req.body;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to update this course",
        data: null,
      });
    }

    // If title is being updated, regenerate slug from new title
    if (updates.title) {
      const newSlug = utils.generateSlug(updates.title);

      // Check if new slug already exists (excluding current course)
      const existingCourse = await courseService.slugExists(newSlug, courseId);
      if (existingCourse) {
        return utils.customResponse({
          status: 400,
          res,
          message: MessageResponse.Error,
          description: `A course with slug "${newSlug}" already exists. Please use a different title.`,
          data: null,
        });
      }

      updates.slug = newSlug;
    }

    const updatedCourse = await courseService.updateCourse(courseId, updates);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Course updated successfully",
      data: { course: updatedCourse },
    });
  };

  public publishCourse = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to publish this course",
        data: null,
      });
    }

    if (course.status === CourseStatus.Published) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Course is already published",
        data: null,
      });
    }

    const publishedCourse = await courseService.publishCourse(courseId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Course published successfully",
      data: { course: publishedCourse },
    });
  };

  public unpublishCourse = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to unpublish this course",
        data: null,
      });
    }

    const unpublishedCourse = await courseService.unpublishCourse(courseId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Course unpublished successfully",
      data: { course: unpublishedCourse },
    });
  };

  public deleteCourse = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to delete this course",
        data: null,
      });
    }

    await sectionService.deleteSectionsByCourse(courseId);
    await courseService.deleteCourse(courseId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Course deleted successfully",
      data: null,
    });
  };

  public createSection = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const adminId = req.userId;
    const body: ICreateSectionInput = req.body;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to add sections to this course",
        data: null,
      });
    }

    const section = await sectionService.createSection({
      ...body,
      courseId: course._id,
    });

    return utils.customResponse({
      status: 201,
      res,
      message: MessageResponse.Success,
      description: "Section created successfully",
      data: { section },
    });
  };

  public getSection = async (req: CustomRequest, res: Response) => {
    const { courseId, sectionId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    const section = await sectionService.findSectionById(sectionId);

    if (!section) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Section not found",
        data: null,
      });
    }

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Section retrieved",
      data: { section },
    });
  };

  public updateSection = async (req: CustomRequest, res: Response) => {
    const { courseId, sectionId } = req.params;
    const adminId = req.userId;
    const updateData = req.body;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    const section = await sectionService.updateSection(sectionId, updateData);

    if (!section) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Section not found",
        data: null,
      });
    }

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Section updated successfully",
      data: { section },
    });
  };

  public deleteSection = async (req: CustomRequest, res: Response) => {
    const { courseId, sectionId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    await sectionService.deleteSection(sectionId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Section deleted successfully",
      data: null,
    });
  };

  public createCurriculumItem = async (req: CustomRequest, res: Response) => {
    const { courseId, sectionId } = req.params;
    const adminId = req.userId;
    const body: ICreateCurriculumItemInput = req.body;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to add items to this course",
        data: null,
      });
    }

    const section = await sectionService.findSectionById(sectionId);

    if (!section) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Section not found",
        data: null,
      });
    }

    const item = await curriculumItemService.createCurriculumItem({
      ...body,
      sectionId: section._id,
    });

    return utils.customResponse({
      status: 201,
      res,
      message: MessageResponse.Success,
      description: "Curriculum item created successfully",
      data: { item },
    });
  };

  public getCurriculumItem = async (req: CustomRequest, res: Response) => {
    const { courseId, sectionId, itemId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    const item = await curriculumItemService.findCurriculumItemById(itemId);

    if (!item) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Curriculum item not found",
        data: null,
      });
    }

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Curriculum item retrieved",
      data: { item },
    });
  };

  public updateCurriculumItem = async (req: CustomRequest, res: Response) => {
    const { courseId, sectionId, itemId } = req.params;
    const adminId = req.userId;
    const updateData = req.body;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    const item = await curriculumItemService.updateCurriculumItem(itemId, updateData);

    if (!item) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Curriculum item not found",
        data: null,
      });
    }

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Curriculum item updated successfully",
      data: { item },
    });
  };

  public deleteCurriculumItem = async (req: CustomRequest, res: Response) => {
    const { courseId, sectionId, itemId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    await curriculumItemService.deleteCurriculumItem(itemId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Curriculum item deleted successfully",
      data: null,
    });
  };

  public getCourseContent = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    const sections = await sectionService.findSectionsByCourse(courseId);

    const content = await Promise.all(
      sections.map(async (section) => {
        const items = await curriculumItemService.findCurriculumItemsBySection(section._id);
        return { section, items };
      })
    );

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Course content retrieved",
      data: { course, content },
    });
  };

  public createQuiz = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const adminId = req.userId;
    const quizData: ICreateQuizInput = req.body;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    const quiz = await quizService.createQuiz(quizData);

    return utils.customResponse({
      status: 201,
      res,
      message: MessageResponse.Success,
      description: "Quiz created successfully",
      data: { quiz },
    });
  };

  public getQuiz = async (req: CustomRequest, res: Response) => {
    const { courseId, quizId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    const quiz = await quizService.findQuizById(quizId);

    if (!quiz) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Quiz not found",
        data: null,
      });
    }

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Quiz retrieved",
      data: { quiz },
    });
  };

  public updateQuiz = async (req: CustomRequest, res: Response) => {
    const { courseId, quizId } = req.params;
    const adminId = req.userId;
    const updateData: IUpdateQuizInput = req.body;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    const quiz = await quizService.updateQuiz(quizId, updateData);

    if (!quiz) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Quiz not found",
        data: null,
      });
    }

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Quiz updated successfully",
      data: { quiz },
    });
  };

  public deleteQuiz = async (req: CustomRequest, res: Response) => {
    const { courseId, quizId } = req.params;
    const adminId = req.userId;

    const course = await courseService.findCourseById(courseId);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    if (course.adminId.toString() !== adminId?.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized to access this course",
        data: null,
      });
    }

    await quizService.deleteQuiz(quizId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Quiz deleted successfully",
      data: null,
    });
  };

  public getDashboardStats = async (req: CustomRequest, res: Response) => {
    const adminId = req.userId;

    const courses = await courseService.findCoursesByAdmin(adminId!);
    const totalCourses = courses.length;
    const totalStudents = new Set(
      courses.flatMap((c: any) => (c.studentsEnrolled ? [c._id] : []))
    ).size;

    let totalEnrollments = 0;
    let totalRevenue = 0;

    courses.forEach((course: any) => {
      totalEnrollments += course.studentsEnrolled || 0;
      totalRevenue += (course.price || 0) * (course.studentsEnrolled || 0);
    });

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
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

  public getAnalytics = async (req: CustomRequest, res: Response) => {
    const adminId = req.userId;

    const courses = await courseService.findCoursesByAdmin(adminId!);

    let totalRevenue = 0;
    let totalRating = 0;
    let totalEnrollments = 0;
    let completedEnrollments = 0;

    const topCourse = courses.length > 0 ? courses[0] : null;

    courses.forEach((course: any) => {
      totalRevenue += (course.price || 0) * (course.studentsEnrolled || 0);
      totalRating += course.rating || 0;
      totalEnrollments += course.studentsEnrolled || 0;
      completedEnrollments += Math.floor((course.studentsEnrolled || 0) * 0.6);
    });

    const averageRating = courses.length > 0 ? totalRating / courses.length : 0;
    const completionRate =
      totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
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

export const adminCourseController = new AdminCourseController();
