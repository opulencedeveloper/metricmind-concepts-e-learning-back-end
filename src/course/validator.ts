import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { ICreateCourseInput, IUpdateCourseInput, ICreateSectionInput, ICreateCurriculumItemInput } from "./interface";
import { CourseLevel, Language, Currency, CurriculumItemType } from "./enum";
import { sectionService } from "./section/service";
import { curriculumItemService } from "./curriculum-item/service";

class CourseValidator {
  public validateCreateCourse = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<ICreateCourseInput>({
      title: Joi.string()
        .min(5)
        .max(200)
        .required()
        .messages({
          "string.min": "Course title must be at least 5 characters",
          "string.max": "Course title cannot exceed 200 characters",
          "any.required": "Course title is required",
        }),

      description: Joi.string()
        .min(20)
        .max(2000)
        .required()
        .messages({
          "string.min": "Course description must be at least 20 characters",
          "string.max": "Course description cannot exceed 2000 characters",
          "any.required": "Course description is required",
        }),

      instructor: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          "string.min": "Instructor name must be at least 2 characters",
          "any.required": "Instructor name is required",
        }),

      instructorBio: Joi.string()
        .max(500)
        .messages({
          "string.max": "Instructor bio cannot exceed 500 characters",
        }),

      instructorImage: Joi.string()
        .uri()
        .messages({
          "string.uri": "Instructor image must be a valid URL",
        }),

      category: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          "string.min": "Category must be at least 2 characters",
          "any.required": "Course category is required",
        }),

      subcategory: Joi.string()
        .max(100)
        .messages({
          "string.max": "Subcategory cannot exceed 100 characters",
        }),

      level: Joi.string()
        .valid(...Object.values(CourseLevel))
        .messages({
          "any.only": "Invalid course level",
        }),

      language: Joi.string()
        .valid(...Object.values(Language))
        .messages({
          "any.only": "Invalid language",
        }),

      price: Joi.number()
        .min(0)
        .required()
        .messages({
          "number.min": "Price cannot be negative",
          "any.required": "Price is required",
        }),

      currency: Joi.string()
        .valid(...Object.values(Currency))
        .messages({
          "any.only": "Invalid currency",
        }),

      thumbnail: Joi.string()
        .uri()
        .required()
        .messages({
          "string.uri": "Thumbnail must be a valid URL",
          "any.required": "Thumbnail URL is required",
        }),

      previewVideoUrl: Joi.string()
        .uri()
        .messages({
          "string.uri": "Preview video URL must be valid",
        }),

      learningObjectives: Joi.array()
        .items(Joi.string().min(5).max(200))
        .max(10)
        .messages({
          "array.max": "Maximum 10 learning objectives allowed",
        }),

      requirements: Joi.array()
        .items(Joi.string().min(5).max(200))
        .max(10)
        .messages({
          "array.max": "Maximum 10 requirements allowed",
        }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    next();
  };

  public validateUpdateCourse = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<Partial<IUpdateCourseInput>>({
      title: Joi.string()
        .min(5)
        .max(200)
        .messages({
          "string.min": "Course title must be at least 5 characters",
          "string.max": "Course title cannot exceed 200 characters",
        }),

      description: Joi.string()
        .min(20)
        .max(2000)
        .messages({
          "string.min": "Course description must be at least 20 characters",
          "string.max": "Course description cannot exceed 2000 characters",
        }),

      instructor: Joi.string()
        .min(2)
        .max(100)
        .messages({
          "string.min": "Instructor name must be at least 2 characters",
        }),

      instructorBio: Joi.string()
        .max(500)
        .messages({
          "string.max": "Instructor bio cannot exceed 500 characters",
        }),

      instructorImage: Joi.string()
        .uri()
        .messages({
          "string.uri": "Instructor image must be a valid URL",
        }),

      category: Joi.string()
        .min(2)
        .max(100)
        .messages({
          "string.min": "Category must be at least 2 characters",
        }),

      subcategory: Joi.string()
        .max(100)
        .messages({
          "string.max": "Subcategory cannot exceed 100 characters",
        }),

      level: Joi.string()
        .valid(...Object.values(CourseLevel))
        .messages({
          "any.only": "Invalid course level",
        }),

      language: Joi.string()
        .valid(...Object.values(Language))
        .messages({
          "any.only": "Invalid language",
        }),

      price: Joi.number()
        .min(0)
        .messages({
          "number.min": "Price cannot be negative",
        }),

      currency: Joi.string()
        .valid(...Object.values(Currency))
        .messages({
          "any.only": "Invalid currency",
        }),

      thumbnail: Joi.string()
        .uri()
        .messages({
          "string.uri": "Thumbnail must be a valid URL",
        }),

      previewVideoUrl: Joi.string()
        .uri()
        .messages({
          "string.uri": "Preview video URL must be valid",
        }),

      learningObjectives: Joi.array()
        .items(Joi.string().min(5).max(200))
        .max(10)
        .messages({
          "array.max": "Maximum 10 learning objectives allowed",
        }),

      requirements: Joi.array()
        .items(Joi.string().min(5).max(200))
        .max(10)
        .messages({
          "array.max": "Maximum 10 requirements allowed",
        }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    next();
  };

  public validateCreateSection = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<ICreateSectionInput>({
      courseId: Joi.string()
        .required()
        .messages({
          "any.required": "Course ID is required",
        }),

      title: Joi.string()
        .min(3)
        .max(150)
        .required()
        .messages({
          "string.min": "Section title must be at least 3 characters",
          "string.max": "Section title cannot exceed 150 characters",
          "any.required": "Section title is required",
        }),

      description: Joi.string()
        .max(500)
        .messages({
          "string.max": "Description cannot exceed 500 characters",
        }),

      order: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
          "number.base": "Order must be a number",
          "number.min": "Order must be at least 1",
          "any.required": "Section order is required",
        }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    next();
  };

  public validateCreateCurriculumItem = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<ICreateCurriculumItemInput>({
      sectionId: Joi.string()
        .required()
        .messages({
          "any.required": "Section ID is required",
        }),

      title: Joi.string()
        .min(3)
        .max(200)
        .required()
        .messages({
          "string.min": "Item title must be at least 3 characters",
          "string.max": "Item title cannot exceed 200 characters",
          "any.required": "Item title is required",
        }),

      description: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
          "string.min": "Description must be at least 10 characters",
          "string.max": "Description cannot exceed 500 characters",
          "any.required": "Description is required",
        }),

      type: Joi.string()
        .valid(...Object.values(CurriculumItemType))
        .required()
        .messages({
          "any.only": "Invalid curriculum item type",
          "any.required": "Item type is required",
        }),

      order: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
          "number.base": "Order must be a number",
          "number.min": "Order must be at least 1",
          "any.required": "Item order is required",
        }),

      videoUrl: Joi.string()
        .uri()
        .when("type", {
          is: CurriculumItemType.Lecture,
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "string.uri": "Video URL must be valid",
          "any.required": "Video URL is required for lecture type",
        }),

      videoDuration: Joi.number()
        .integer()
        .min(1)
        .when("type", {
          is: CurriculumItemType.Lecture,
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "number.base": "Video duration must be a number",
          "number.min": "Video duration must be at least 1 second",
          "any.required": "Video duration is required for lecture type",
        }),

      content: Joi.string()
        .max(5000)
        .when("type", {
          is: CurriculumItemType.Article,
          then: Joi.required(),
          otherwise: Joi.optional(),
        })
        .messages({
          "string.max": "Content cannot exceed 5000 characters",
          "any.required": "Content is required for article type",
        }),

      resources: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(100).required(),
            url: Joi.string().uri().required(),
          })
        )
        .max(10)
        .messages({
          "array.max": "Maximum 10 resources allowed",
        }),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    next();
  };

  // Validates that every section has at least one quiz before publishing
  public validateSectionsHaveQuizzes = async (req: Request, res: Response, next: NextFunction) => {
    const { courseId } = req.params;

    const sections = await sectionService.findSectionsByCourse(courseId);

    if (sections.length === 0) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Course must have at least one section",
        data: null,
      });
    }

    for (const section of sections) {
      const items = await curriculumItemService.findCurriculumItemsBySection(section._id);
      const hasQuiz = items.some((item) => item.type === CurriculumItemType.Quiz);

      if (!hasQuiz) {
        return utils.customResponse({
          status: 400,
          res,
          message: MessageResponse.Error,
          description: `Section "${section.title}" must have at least one quiz before course can be published`,
          data: null,
        });
      }
    }

    next();
  };
}

export const courseValidator = new CourseValidator();
