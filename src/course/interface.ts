import { Document, Types } from "mongoose";
import { CourseLevel, Currency, CourseStatus, Language, CurriculumItemType } from "./enum";

export interface ISection extends Document {
  _id: Types.ObjectId;
  courseId: Types.ObjectId;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICurriculumItem extends Document {
  _id: Types.ObjectId;
  sectionId: Types.ObjectId;
  title: string;
  description: string;
  type: CurriculumItemType;
  order: number;
  videoUrl: string;
  videoDuration: number;
  content: string;
  resources: Array<{ name: string; url: string }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourse extends Document {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  title: string;
  description: string;
  slug: string;
  instructor: string;
  instructorBio: string;
  instructorImage: string;
  category: string;
  subcategory: string;
  level: CourseLevel;
  language: Language;
  price: number;
  currency: Currency;
  thumbnail: string;
  previewVideoUrl: string;
  learningObjectives: string[];
  requirements: string[];
  totalDuration: number;
  status: CourseStatus;
  studentsEnrolled?: number;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCourseInput {
  title: string;
  description: string;
  slug?: string;
  instructor: string;
  instructorBio: string;
  instructorImage: string;
  category: string;
  subcategory: string;
  level: CourseLevel;
  language: Language;
  price: number;
  currency: Currency;
  thumbnail: string;
  previewVideoUrl: string;
  learningObjectives: string[];
  requirements: string[];
}

export interface IUpdateCourseInput {
  title?: string;
  description?: string;
  instructor?: string;
  instructorBio?: string;
  instructorImage?: string;
  category?: string;
  subcategory?: string;
  level?: CourseLevel;
  language?: Language;
  price?: number;
  currency?: Currency;
  thumbnail?: string;
  previewVideoUrl?: string;
  learningObjectives?: string[];
  requirements?: string[];
  status?: CourseStatus;
  slug?: string;
}

export interface ICreateSectionInput {
  courseId: Types.ObjectId;
  title: string;
  description: string;
  order: number;
}

export interface ICreateCurriculumItemInput {
  sectionId: Types.ObjectId;
  title: string;
  description: string;
  type: CurriculumItemType;
  order: number;
  videoUrl: string;
  videoDuration: number;
  content: string;
  resources: Array<{ name: string; url: string }>;
}

export interface IUpdateCurriculumItemInput {
  title?: string;
  description?: string;
  type?: CurriculumItemType;
  order?: number;
  videoUrl?: string;
  videoDuration?: number;
  content?: string;
  resources?: Array<{ name: string; url: string }>;
}

export interface IUpdateCurriculumItemInputRequired {
  title: string;
  description: string;
  type: CurriculumItemType;
  order: number;
  videoUrl: string;
  videoDuration: number;
  content: string;
  resources: Array<{ name: string; url: string }>;
}
