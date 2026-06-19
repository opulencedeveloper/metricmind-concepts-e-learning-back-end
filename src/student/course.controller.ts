import { Response } from "express";
import mongoose from "mongoose";
import { courseService } from "../course/service";
import { sectionService } from "../course/section/service";
import { curriculumItemService } from "../course/curriculum-item/service";
import { enrollmentService } from "../course/enrollment/service";
import { quizService } from "../course/quiz/service";
import Quiz from "../course/quiz/quiz.entity";
import QuizSubmission from "../course/quiz/quiz-submission.entity";
import { wishlistService } from "../course/wishlist/service";
import { reviewService } from "../course/review/service";
import { studentService } from "./service";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { CustomRequest } from "../utils/interface";
import { CourseStatus, CurriculumItemType } from "../course/enum";
import Logging from "../utils/loggin";

class StudentCourseController {
  public getBrowseCourses = async (req: CustomRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const category = req.query.category as string | undefined;
    const level = req.query.level as string | undefined;

    const query: any = { status: CourseStatus.Published };

    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    const courses = await courseService.findPublishedCourses(page, limit, category, level);
    const total = await (require("../course/entity")).default.countDocuments(query);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
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

  public searchCourses = async (req: CustomRequest, res: Response) => {
    const query = req.query.query as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const category = req.query.category as string | undefined;

    if (!query || query.trim().length === 0) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Search query is required",
        data: null,
      });
    }

    const courses = await courseService.searchCourses(query, page, limit, category);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
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

  public getCourseDetails = async (req: CustomRequest, res: Response) => {
    const { courseSlug } = req.params;

    const course = await courseService.findCourseBySlug(courseSlug);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    const sections = await sectionService.findSectionsByCourse(course._id);

    const sectionsWithItems = await Promise.all(
      sections.map(async (section) => {
        const items = await curriculumItemService.findCurriculumItemsBySection(section._id);
        return {
          ...section.toObject(),
          items,
        };
      })
    );

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Course details retrieved",
      data: {
        course,
        sections: sectionsWithItems,
      },
    });
  };

  public getCourseDetailsById = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;

    Logging.info(`[getCourseDetailsById] Fetching course with ID: ${courseId}`);

    const course = await courseService.findCourseById(courseId);

    Logging.info(`[getCourseDetailsById] Course found: ${course ? 'YES' : 'NO'}`);
    if (course) {
      Logging.info(`[getCourseDetailsById] Course details - ID: ${course._id}, Title: ${course.title}, Status: ${course.status}`);
    }

    if (!course || course.status !== CourseStatus.Published) {
      Logging.warn(`[getCourseDetailsById] Returning 404 - Course not found or not published (courseId: ${courseId})`);
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    Logging.info(`[getCourseDetailsById] Course is published, fetching sections for courseId: ${courseId}`);

    const sections = await sectionService.findSectionsByCourse(course._id);

    const sectionsWithItems = await Promise.all(
      sections.map(async (section) => {
        const items = await curriculumItemService.findCurriculumItemsBySection(section._id);
        return {
          ...section.toObject(),
          items,
        };
      })
    );

    Logging.info(`[getCourseDetailsById] Successfully returning course details - courseId: ${courseId}, sections: ${sectionsWithItems.length}`);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Course details retrieved",
      data: {
        course,
        sections: sectionsWithItems,
      },
    });
  };

  public getStudentEnrollments = async (req: CustomRequest, res: Response) => {
    const studentId = req.userId;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    const enrollments = await enrollmentService.findStudentEnrollments(studentId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Student enrollments retrieved",
      data: {
        enrollments,
        total: enrollments.length,
      },
    });
  };

  public getEnrolledCourseDetails = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const studentId = req.userId;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    const enrollment = await enrollmentService.findEnrollmentByStudentAndCourse(studentId, courseId);

    if (!enrollment) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "You are not enrolled in this course",
        data: null,
      });
    }

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

    const sections = await sectionService.findSectionsByCourse(courseId);

    const sectionsWithItems = await Promise.all(
      sections.map(async (section) => {
        // Check if student can access this section (must pass previous section's quiz)
        const accessCheck = await this.canAccessSection(studentId, section._id, courseId);

        const items = await curriculumItemService.findCurriculumItemsBySection(section._id);

        // Batch query quizzes for this section's items
        const itemIds = items.map(item => item._id);
        console.log(`[QUIZ_DEBUG] Section ${section._id} - Found ${items.length} items:`, items.map((i: any) => ({ id: i._id, type: i.type, title: i.title })));

        const quizzesData = await quizService.findQuizzesByCurriculumItems(itemIds);
        console.log(`[QUIZ_DEBUG] Found ${quizzesData.length} quizzes:`, quizzesData.map((q: any) => ({ quizId: q._id, curriculumItemId: q.curriculumItemId })));

        const quizMap = new Map(quizzesData.map((q: any) => [q.curriculumItemId.toString(), q._id]));

        // Attach quizId to quiz-type items
        const itemsWithQuizId = items.map((item: any) => {
          const itemObj = item.toObject();
          console.log(`[QUIZ_DEBUG] Processing item ${item._id} - type: ${itemObj.type}, isQuiz: ${itemObj.type === CurriculumItemType.Quiz}`);

          if (itemObj.type === CurriculumItemType.Quiz) {
            const foundQuizId = quizMap.get(item._id.toString());
            console.log(`[QUIZ_DEBUG] Quiz item ${item._id} - found quizId: ${foundQuizId}`);
            itemObj.quizId = foundQuizId;
          }
          return itemObj;
        });

        console.log(`[QUIZ_DEBUG] Final items with quizId:`, itemsWithQuizId.filter((i: any) => i.type === CurriculumItemType.Quiz).map((i: any) => ({ id: i._id, quizId: i.quizId })));

        return {
          ...section.toObject(),
          items: itemsWithQuizId,
          canAccess: accessCheck.canAccess,
          accessReason: accessCheck.reason,
        };
      })
    );

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Enrolled course details retrieved",
      data: {
        course,
        sections: sectionsWithItems,
        enrollment,
      },
    });
  };

  public updateProgress = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const { progress } = req.body;
    const studentId = req.userId;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Progress must be a number between 0 and 100",
        data: null,
      });
    }

    const enrollment = await enrollmentService.findEnrollmentByStudentAndCourse(studentId, courseId);

    if (!enrollment) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "You are not enrolled in this course",
        data: null,
      });
    }

    const updated = await enrollmentService.updateProgress(enrollment._id, {
      progress,
      lastAccessedDate: new Date(),
    });

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Progress updated successfully",
      data: { enrollment: updated },
    });
  };

  public getCategories = async (req: CustomRequest, res: Response) => {
    const Course = require("../course/entity").default;

    const categories = await Course.distinct("category", { status: CourseStatus.Published });

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Categories retrieved",
      data: { categories },
    });
  };

  public getFeaturedCourses = async (req: CustomRequest, res: Response) => {
    const limit = 3;

    const courses = await courseService.findPublishedCourses(1, limit);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Featured courses retrieved",
      data: { courses },
    });
  };

  public getQuiz = async (req: CustomRequest, res: Response) => {
    const { quizId } = req.params;
    const studentId = req.userId;

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

    // Security: Check if student has access to this section
    const section = await sectionService.findSectionById(quiz.sectionId);
    if (!section) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Section not found",
        data: null,
      });
    }
    const accessCheck = await this.canAccessSection(studentId, quiz.sectionId, section.courseId);
    if (!accessCheck.canAccess) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: accessCheck.reason || "Access denied",
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

  public submitQuiz = async (req: CustomRequest, res: Response) => {
    const { quizId } = req.params;
    const { answers, timeTaken } = req.body;
    const studentId = req.userId;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    try {
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

      const section = await sectionService.findSectionById(quiz.sectionId);

      if (!section) {
        return utils.customResponse({
          status: 404,
          res,
          message: MessageResponse.Error,
          description: "Section not found",
          data: null,
        });
      }

      // Security: Check if student has access to this section
      const accessCheck = await this.canAccessSection(studentId, quiz.sectionId, section.courseId);
      if (!accessCheck.canAccess) {
        return utils.customResponse({
          status: 403,
          res,
          message: MessageResponse.Error,
          description: accessCheck.reason || "Access denied",
          data: null,
        });
      }

      if (!section) {
        return utils.customResponse({
          status: 404,
          res,
          message: MessageResponse.Error,
          description: "Section not found",
          data: null,
        });
      }

      const submission = await quizService.submitQuiz(
        new mongoose.Types.ObjectId(studentId.toString()),
        new mongoose.Types.ObjectId(quizId),
        { quizId: new mongoose.Types.ObjectId(quizId), answers, timeTaken },
        new mongoose.Types.ObjectId(section.courseId.toString()),
        new mongoose.Types.ObjectId(quiz.sectionId.toString())
      );

      return utils.customResponse({
        status: 201,
        res,
        message: MessageResponse.Success,
        description: "Quiz submitted successfully",
        data: { attemptId: submission._id },
      });
    } catch (error: any) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.message || "Failed to submit quiz",
        data: null,
      });
    }
  };

  public getQuizSubmission = async (req: CustomRequest, res: Response) => {
    const { quizId, attemptId } = req.params;
    const studentId = req.userId;

    const submission = await QuizSubmission.findById(attemptId);

    if (!submission) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Submission not found",
        data: null,
      });
    }

    if (submission.quizId.toString() !== quizId) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Submission does not belong to this quiz",
        data: null,
      });
    }

    // Verify student owns this submission
    if (submission.studentId.toString() !== studentId!.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized",
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

    // Build answer review
    // Only show explanations for CORRECT answers - don't reveal info about wrong answers
    const reviewAnswers = submission.answers.map((answer: any) => {
      const question = quiz.questions[answer.questionIndex];
      const isCorrect = answer.selectedAnswer === question.correctAnswer ||
                        answer.selectedAnswer === String(question.correctAnswer);

      const review: any = {
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

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Submission retrieved",
      data: { submission, quiz, reviewAnswers },
    });
  };

  public dropCourse = async (req: CustomRequest, res: Response) => {
    const { enrollmentId } = req.params;
    const studentId = req.userId;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    const enrollment = await enrollmentService.findEnrollmentById(enrollmentId);

    if (!enrollment) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Enrollment not found",
        data: null,
      });
    }

    if (enrollment.studentId.toString() !== studentId.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "You cannot drop this enrollment",
        data: null,
      });
    }

    const droppedEnrollment = await enrollmentService.dropEnrollment(enrollmentId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Course dropped successfully",
      data: { enrollment: droppedEnrollment },
    });
  };

  private canAccessSection = async (
    studentId: any,
    sectionId: any,
    courseId: any
  ): Promise<{ canAccess: boolean; reason?: string }> => {
    const section = await sectionService.findSectionById(sectionId);

    if (!section) {
      return { canAccess: false, reason: "Section not found" };
    }

    // Get all sections in course sorted by order
    const allSections = await sectionService.findSectionsByCourse(courseId);
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
    const previousSectionAccess = await quizService.canAccessSection(studentId, previousSection._id);

    if (!previousSectionAccess) {
      return {
        canAccess: false,
        reason: `You must complete the quiz in "${previousSection.title}" before accessing this section`,
      };
    }

    return { canAccess: true };
  };

  public getCertificateByCode = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const studentId = req.userId;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    const enrollment = await enrollmentService.findEnrollmentByStudentAndCourse(studentId, courseId);

    if (!enrollment) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "You are not enrolled in this course",
        data: null,
      });
    }

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

    // Verify all course quizzes are completed
    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    const isCompleted = await quizService.isCourseCompleted(studentId, courseObjectId);
    if (!isCompleted) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Complete all course quizzes to earn your certificate",
        data: null,
      });
    }

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
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

  public getDashboard = async (req: CustomRequest, res: Response) => {
    const studentId = req.userId;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    const enrollments = await enrollmentService.findStudentEnrollments(studentId);

    const totalEnrolled = enrollments.length;
    const completed = enrollments.filter((e: any) => e.progress === 100).length;
    const inProgress = enrollments.filter((e: any) => e.progress > 0 && e.progress < 100).length;
    const totalHours = Math.round(
      enrollments.reduce((sum: number, e: any) => {
        const courseDuration = e.courseId?.totalDuration || 0;
        const timeInvested = (courseDuration * (e.progress || 0)) / 100;
        return sum + timeInvested;
      }, 0)
    );

    // Get recent courses (already populated with course details)
    const recentCourses = enrollments
      .sort((a: any, b: any) => new Date(b.lastAccessedDate || 0).getTime() - new Date(a.lastAccessedDate || 0).getTime())
      .slice(0, 5)
      .map((enrollment: any) => ({
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

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
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

  public getPaymentHistory = async (req: CustomRequest, res: Response) => {
    const studentId = req.userId;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    const paymentService = require("../payment/service").paymentService;
    const payments = await paymentService.findStudentPayments(studentId);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Payment history retrieved",
      data: {
        payments,
        total: payments.length,
      },
    });
  };

  public purchaseCourse = async (req: CustomRequest, res: Response) => {
    const studentId = req.userId;
    const { courseId } = req.body;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    if (!courseId) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Course ID is required",
        data: null,
      });
    }

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

    const paymentService = require("../payment/service").paymentService;
    const existingPayment = await paymentService.findPaymentByStudentAndCourse(studentId, courseId);

    if (existingPayment) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "You are already enrolled in this course",
        data: null,
      });
    }

    const studentService = require("./service").studentService;
    const student = await studentService.findStudentById(studentId);

    if (!student) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Student not found",
        data: null,
      });
    }

    const paystackPayment = await paymentService.initiatePayment({
      studentId: new mongoose.Types.ObjectId(studentId.toString()),
      courseId: new mongoose.Types.ObjectId(courseId),
      amount: course.price,
      currency: course.currency,
      studentEmail: student.email,
      studentName: student.fullName,
    });

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Payment initiated",
      data: {
        authorizationUrl: paystackPayment.authorization_url,
        accessCode: paystackPayment.access_code,
        reference: paystackPayment.reference,
      },
    });
  };

  public getWishlist = async (req: CustomRequest, res: Response) => {
    const wishlist = await wishlistService.getStudentWishlist(req.userId!);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Wishlist retrieved",
      data: {
        wishlist: wishlist.map((w: any) => ({
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

  public toggleWishlist = async (req: CustomRequest, res: Response) => {
    const { courseId } = req.body;
    const isInWishlist = await wishlistService.isInWishlist(req.userId!, courseId);

    if (isInWishlist) {
      await wishlistService.removeFromWishlist(req.userId!, courseId);
      return utils.customResponse({
        status: 200,
        res,
        message: MessageResponse.Success,
        description: "Removed from wishlist",
        data: { added: false },
      });
    }

    await wishlistService.addToWishlist({ studentId: req.userId!, courseId });
    return utils.customResponse({
      status: 201,
      res,
      message: MessageResponse.Success,
      description: "Added to wishlist",
      data: { added: true },
    });
  };

  public getCourseReviews = async (req: CustomRequest, res: Response) => {
    const { courseSlug } = req.params;
    const course = await courseService.findCourseBySlug(courseSlug);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    const [enrollment, reviews, studentReview, rating] = await Promise.all([
      enrollmentService.findEnrollmentByStudentAndCourse(req.userId!, course._id),
      reviewService.getCourseReviews(course._id),
      reviewService.findStudentCourseReview(course._id, req.userId!),
      reviewService.getAverageRating(course._id),
    ]);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
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

  public submitReview = async (req: CustomRequest, res: Response) => {
    const { courseSlug } = req.params;
    const { rating, comment } = req.body;
    const course = await courseService.findCourseBySlug(courseSlug);

    if (!course) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Course not found",
        data: null,
      });
    }

    const enrollment = await enrollmentService.findEnrollmentByStudentAndCourse(req.userId!, course._id);

    if (!enrollment || enrollment.progress !== 100) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Can only review completed courses",
        data: null,
      });
    }

    const student = await studentService.findStudentById(req.userId!);

    const review = await reviewService.createReview({
      courseId: course._id,
      studentId: req.userId!,
      studentName: student!.fullName,
      rating,
      comment: comment.trim(),
    });

    return utils.customResponse({
      status: 201,
      res,
      message: MessageResponse.Success,
      description: "Review submitted",
      data: { review },
    });
  };

  public updateReview = async (req: CustomRequest, res: Response) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const review = await reviewService.findReviewById(reviewId);

    if (!review || review.studentId.toString() !== req.userId!.toString()) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Cannot update this review",
        data: null,
      });
    }

    const updatedReview = await reviewService.updateReview(reviewId, {
      rating: rating || review.rating,
      comment: comment || review.comment,
    });

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Review updated",
      data: { review: updatedReview },
    });
  };

  public markItemAsWatched = async (req: CustomRequest, res: Response) => {
    const { courseId, curriculumItemId } = req.params;
    const studentId = req.userId;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Authentication required",
        data: null,
      });
    }

    // Verify student is enrolled in the course
    const enrollment = await enrollmentService.findEnrollmentByStudentAndCourse(studentId, courseId);

    if (!enrollment) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "You are not enrolled in this course",
        data: null,
      });
    }

    // Mark item as watched and update progress
    const updated = await enrollmentService.markItemAsWatched(enrollment._id, courseId, {
      curriculumItemId: new mongoose.Types.ObjectId(curriculumItemId),
    });

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Item marked as watched",
      data: { enrollment: updated },
    });
  };
}

export const studentCourseController = new StudentCourseController();
