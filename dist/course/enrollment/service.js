"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollmentService = void 0;
const entity_1 = __importDefault(require("./entity"));
const entity_2 = __importDefault(require("../section/entity"));
const entity_3 = __importDefault(require("../curriculum-item/entity"));
const enum_1 = require("../enum");
const service_1 = require("../service");
class EnrollmentService {
    constructor() {
        this.enrollStudent = async (input, session) => {
            const enrollment = new entity_1.default({
                ...input,
                status: enum_1.EnrollmentStatus.Active,
                enrollmentDate: new Date(),
            });
            await enrollment.save({ session });
            await service_1.courseService.updateStudentCount(input.courseId, 1);
            return enrollment;
        };
        this.findEnrollmentById = async (id) => {
            return await entity_1.default.findById(id);
        };
        this.findEnrollmentByStudentAndCourse = async (studentId, courseId) => {
            return await entity_1.default.findOne({ studentId, courseId });
        };
        this.findStudentEnrollments = async (studentId) => {
            return await entity_1.default.find({ studentId })
                .select('courseId progress lastAccessedDate enrollmentDate')
                .populate("courseId", "title instructor thumbnail previewVideoUrl totalDuration")
                .sort({ enrollmentDate: -1 });
        };
        this.findCourseEnrollments = async (courseId) => {
            return await entity_1.default.find({ courseId }).sort({ enrollmentDate: -1 });
        };
        this.updateProgress = async (enrollmentId, input) => {
            return await entity_1.default.findByIdAndUpdate(enrollmentId, input, { new: true });
        };
        this.completeEnrollment = async (enrollmentId) => {
            return await entity_1.default.findByIdAndUpdate(enrollmentId, {
                status: enum_1.EnrollmentStatus.Completed,
                completionDate: new Date(),
                progress: 100,
            }, { new: true });
        };
        this.dropEnrollment = async (enrollmentId) => {
            return await entity_1.default.findByIdAndUpdate(enrollmentId, { status: enum_1.EnrollmentStatus.Dropped }, { new: true });
        };
        this.issueCertificate = async (enrollmentId, certificateUrl) => {
            return await entity_1.default.findByIdAndUpdate(enrollmentId, {
                certificateIssued: true,
                certificateUrl,
            }, { new: true });
        };
        this.getStudentCourseProgress = async (studentId, courseId) => {
            return await entity_1.default.findOne({ studentId, courseId }, { progress: 1, lastAccessedDate: 1, status: 1 });
        };
        this.markItemAsWatched = async (enrollmentId, courseId, input) => {
            const enrollment = await entity_1.default.findById(enrollmentId);
            if (!enrollment) {
                throw new Error("Enrollment not found");
            }
            // Check if item is already watched
            const isAlreadyWatched = enrollment.watchedItems.some((id) => id.toString() === input.curriculumItemId.toString());
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
        this.getTotalCourseItems = async (courseId) => {
            const sections = await entity_2.default.find({ courseId });
            const sectionIds = sections.map((s) => s._id);
            const totalItems = await entity_3.default.countDocuments({
                sectionId: { $in: sectionIds },
            });
            return totalItems;
        };
        this.getWatchedItems = async (enrollmentId) => {
            const enrollment = await entity_1.default.findById(enrollmentId, { watchedItems: 1 });
            return enrollment?.watchedItems || [];
        };
    }
}
exports.enrollmentService = new EnrollmentService();
