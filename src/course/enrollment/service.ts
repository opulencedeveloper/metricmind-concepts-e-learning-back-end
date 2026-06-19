import mongoose from "mongoose";
import Enrollment from "./entity";
import Section from "../section/entity";
import CurriculumItem from "../curriculum-item/entity";
import { ICreateEnrollmentInput, IUpdateProgressInput, IMarkItemWatchedInput } from "./interface";
import { EnrollmentStatus } from "../enum";
import { courseService } from "../service";

class EnrollmentService {
  public enrollStudent = async (input: ICreateEnrollmentInput, session: any) => {
    const enrollment = new Enrollment({
      ...input,
      status: EnrollmentStatus.Active,
      enrollmentDate: new Date(),
    });

    await enrollment.save({ session });

    await courseService.updateStudentCount(input.courseId, 1);

    return enrollment;
  };

  public findEnrollmentById = async (id: string | mongoose.Types.ObjectId) => {
    return await Enrollment.findById(id);
  };

  public findEnrollmentByStudentAndCourse = async (
    studentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId
  ) => {
    return await Enrollment.findOne({ studentId, courseId });
  };

  public findStudentEnrollments = async (studentId: string | mongoose.Types.ObjectId) => {
    return await Enrollment.find({ studentId })
      .select('courseId progress lastAccessedDate enrollmentDate')
      .populate("courseId", "title instructor thumbnail previewVideoUrl totalDuration")
      .sort({ enrollmentDate: -1 });
  };

  public findCourseEnrollments = async (courseId: string | mongoose.Types.ObjectId) => {
    return await Enrollment.find({ courseId }).sort({ enrollmentDate: -1 });
  };

  public updateProgress = async (
    enrollmentId: string | mongoose.Types.ObjectId,
    input: IUpdateProgressInput
  ) => {
    return await Enrollment.findByIdAndUpdate(enrollmentId, input, { new: true });
  };

  public completeEnrollment = async (enrollmentId: string | mongoose.Types.ObjectId) => {
    return await Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        status: EnrollmentStatus.Completed,
        completionDate: new Date(),
        progress: 100,
      },
      { new: true }
    );
  };

  public dropEnrollment = async (enrollmentId: string | mongoose.Types.ObjectId) => {
    return await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { status: EnrollmentStatus.Dropped },
      { new: true }
    );
  };

  public issueCertificate = async (
    enrollmentId: string | mongoose.Types.ObjectId,
    certificateUrl: string
  ) => {
    return await Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        certificateIssued: true,
        certificateUrl,
      },
      { new: true }
    );
  };

  public getStudentCourseProgress = async (
    studentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId
  ) => {
    return await Enrollment.findOne(
      { studentId, courseId },
      { progress: 1, lastAccessedDate: 1, status: 1 }
    );
  };

  public markItemAsWatched = async (
    enrollmentId: string | mongoose.Types.ObjectId,
    courseId: string | mongoose.Types.ObjectId,
    input: IMarkItemWatchedInput
  ) => {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Check if item is already watched
    const isAlreadyWatched = enrollment.watchedItems.some(
      (id) => id.toString() === input.curriculumItemId.toString()
    );

    if (isAlreadyWatched) {
      return enrollment;
    }

    // Add item to watched items
    enrollment.watchedItems.push(input.curriculumItemId);

    // Calculate new progress percentage
    const totalItems = await this.getTotalCourseItems(courseId);
    const watchedCount = enrollment.watchedItems.length;
    const newProgress = totalItems > 0 ? Math.round((watchedCount / totalItems) * 100) : 0;

    enrollment.progress = newProgress;
    enrollment.lastAccessedDate = new Date();

    await enrollment.save();

    return enrollment;
  };

  private getTotalCourseItems = async (courseId: string | mongoose.Types.ObjectId): Promise<number> => {
    const sections = await Section.find({ courseId });
    const sectionIds = sections.map((s) => s._id);

    const totalItems = await CurriculumItem.countDocuments({
      sectionId: { $in: sectionIds },
    });

    return totalItems;
  };

  public getWatchedItems = async (
    enrollmentId: string | mongoose.Types.ObjectId
  ) => {
    const enrollment = await Enrollment.findById(enrollmentId, { watchedItems: 1 });
    return enrollment?.watchedItems || [];
  };
}

export const enrollmentService = new EnrollmentService();
