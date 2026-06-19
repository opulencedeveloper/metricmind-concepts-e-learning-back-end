import Joi from "joi";
import mongoose from "mongoose";
import { Request, Response, NextFunction } from "express";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { ICreateCourseInput, IUpdateCourseInput, ICreateSectionInput, ICreateCurriculumItemInput } from "../course/interface";
import { CourseLevel, Language, Currency, CurriculumItemType } from "../course/enum";
import { sectionService } from "../course/section/service";
import { curriculumItemService } from "../course/curriculum-item/service";

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
        .min(10)
        .max(500)
        .required()
        .messages({
          "string.min": "Instructor bio must be at least 10 characters",
          "string.max": "Instructor bio cannot exceed 500 characters",
          "any.required": "Instructor bio is required",
        }),

      instructorImage: Joi.string()
        .uri()
        .required()
        .messages({
          "string.uri": "Instructor image must be a valid URL",
          "any.required": "Instructor image is required",
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
        .min(2)
        .max(100)
        .required()
        .messages({
          "string.min": "Subcategory must be at least 2 characters",
          "string.max": "Subcategory cannot exceed 100 characters",
          "any.required": "Subcategory is required",
        }),

      level: Joi.string()
        .valid(...Object.values(CourseLevel))
        .required()
        .messages({
          "any.only": "Invalid course level",
          "any.required": "Course level is required",
        }),

      language: Joi.string()
        .valid(...Object.values(Language))
        .required()
        .messages({
          "any.only": "Invalid language",
          "any.required": "Language is required",
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
        .required()
        .messages({
          "any.only": "Invalid currency",
          "any.required": "Currency is required",
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
        .required()
        .messages({
          "string.uri": "Preview video URL must be valid",
          "any.required": "Preview video URL is required",
        }),

      learningObjectives: Joi.array()
        .items(Joi.string().min(5).max(200))
        .min(1)
        .max(10)
        .required()
        .messages({
          "array.min": "At least one learning objective is required",
          "array.max": "Maximum 10 learning objectives allowed",
          "any.required": "Learning objectives are required",
        }),

      requirements: Joi.array()
        .items(Joi.string().min(5).max(200))
        .min(1)
        .max(10)
        .required()
        .messages({
          "array.min": "At least one requirement is required",
          "array.max": "Maximum 10 requirements allowed",
          "any.required": "Requirements are required",
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
        .min(1)
        .max(10)
        .required()
        .messages({
          "array.min": "At least one learning objective is required",
          "array.max": "Maximum 10 learning objectives allowed",
          "any.required": "Learning objectives are required",
        }),

      requirements: Joi.array()
        .items(Joi.string().min(5).max(200))
        .min(1)
        .max(10)
        .required()
        .messages({
          "array.min": "At least one requirement is required",
          "array.max": "Maximum 10 requirements allowed",
          "any.required": "Requirements are required",
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
        .min(10)
        .max(500)
        .required()
        .messages({
          "string.min": "Description must be at least 10 characters",
          "string.max": "Description cannot exceed 500 characters",
          "any.required": "Section description is required",
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

  public validateUpdateSection = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      title: Joi.string()
        .min(3)
        .max(150)
        .messages({
          "string.min": "Section title must be at least 3 characters",
          "string.max": "Section title cannot exceed 150 characters",
        }),

      description: Joi.string()
        .min(10)
        .max(500)
        .messages({
          "string.min": "Description must be at least 10 characters",
          "string.max": "Description cannot exceed 500 characters",
        }),

      order: Joi.number()
        .integer()
        .min(1)
        .messages({
          "number.base": "Order must be a number",
          "number.min": "Order must be at least 1",
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
        .required()
        .messages({
          "string.uri": "Video URL must be valid",
          "any.required": "Video URL is required",
        }),

      videoDuration: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
          "number.base": "Video duration must be a number",
          "number.min": "Video duration must be at least 1 second",
          "any.required": "Video duration is required",
        }),

      content: Joi.string()
        .max(5000)
        .required()
        .messages({
          "string.max": "Content cannot exceed 5000 characters",
          "any.required": "Content is required",
        }),

      resources: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(100).required(),
            url: Joi.string().uri().required(),
          })
        )
        .min(1)
        .max(10)
        .required()
        .messages({
          "array.min": "At least one resource is required",
          "array.max": "Maximum 10 resources allowed",
          "any.required": "Resources are required",
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

  public validateUpdateCurriculumItem = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      title: Joi.string()
        .min(3)
        .max(200)
        .messages({
          "string.min": "Item title must be at least 3 characters",
          "string.max": "Item title cannot exceed 200 characters",
        }),

      description: Joi.string()
        .min(10)
        .max(500)
        .messages({
          "string.min": "Description must be at least 10 characters",
          "string.max": "Description cannot exceed 500 characters",
        }),

      type: Joi.string()
        .valid(...Object.values(CurriculumItemType))
        .messages({
          "any.only": "Invalid curriculum item type",
        }),

      order: Joi.number()
        .integer()
        .min(1)
        .messages({
          "number.base": "Order must be a number",
          "number.min": "Order must be at least 1",
        }),

      videoUrl: Joi.string()
        .uri()
        .messages({
          "string.uri": "Video URL must be valid",
        }),

      videoDuration: Joi.number()
        .integer()
        .min(1)
        .messages({
          "number.base": "Video duration must be a number",
          "number.min": "Video duration must be at least 1 second",
        }),

      content: Joi.string()
        .max(5000)
        .messages({
          "string.max": "Content cannot exceed 5000 characters",
        }),

      resources: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().max(100).required(),
            url: Joi.string().uri().required(),
          })
        )
        .min(1)
        .max(10)
        .messages({
          "array.min": "At least one resource is required",
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

  public validateCreateQuiz = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      curriculumItemId: Joi.string()
        .required()
        .messages({
          "any.required": "Curriculum Item ID is required",
        }),

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
          "string.min": "Quiz title must be at least 3 characters",
          "string.max": "Quiz title cannot exceed 200 characters",
          "any.required": "Quiz title is required",
        }),

      description: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
          "string.min": "Description must be at least 10 characters",
          "string.max": "Description cannot exceed 500 characters",
          "any.required": "Quiz description is required",
        }),

      questions: Joi.array()
        .items(
          Joi.object({
            question: Joi.string()
              .min(5)
              .max(1000)
              .required()
              .messages({
                "string.min": "Question must be at least 5 characters",
                "string.max": "Question cannot exceed 1000 characters",
                "any.required": "Question text is required",
              }),

            questionType: Joi.string()
              .required()
              .messages({
                "any.required": "Question type is required",
              }),

            options: Joi.array()
              .items(Joi.string())
              .min(1)
              .required()
              .messages({
                "array.base": "Options must be an array",
                "array.min": "At least one option is required",
                "any.required": "Options are required",
              }),

            correctAnswer: Joi.alternatives()
              .try(Joi.string(), Joi.number())
              .required()
              .messages({
                "any.required": "Correct answer is required",
              }),

            explanation: Joi.string()
              .min(5)
              .max(500)
              .required()
              .messages({
                "string.min": "Explanation must be at least 5 characters",
                "string.max": "Explanation cannot exceed 500 characters",
                "any.required": "Explanation is required",
              }),

            points: Joi.number()
              .min(1)
              .required()
              .messages({
                "number.min": "Points must be at least 1",
                "any.required": "Points are required",
              }),
          })
        )
        .min(1)
        .required()
        .messages({
          "array.min": "Quiz must have at least one question",
          "any.required": "Questions are required",
        }),

      passingScore: Joi.number()
        .min(0)
        .max(100)
        .required()
        .messages({
          "number.min": "Passing score cannot be negative",
          "number.max": "Passing score cannot exceed 100",
          "any.required": "Passing score is required",
        }),

      timeLimit: Joi.number()
        .min(1)
        .required()
        .messages({
          "number.min": "Time limit must be at least 1 minute",
          "any.required": "Time limit is required",
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

  public validateUpdateQuiz = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      title: Joi.string()
        .min(3)
        .max(200)
        .messages({
          "string.min": "Quiz title must be at least 3 characters",
          "string.max": "Quiz title cannot exceed 200 characters",
        }),

      description: Joi.string()
        .min(10)
        .max(500)
        .messages({
          "string.min": "Description must be at least 10 characters",
          "string.max": "Description cannot exceed 500 characters",
        }),

      questions: Joi.array()
        .items(
          Joi.object({
            question: Joi.string()
              .min(5)
              .max(1000)
              .messages({
                "string.min": "Question must be at least 5 characters",
                "string.max": "Question cannot exceed 1000 characters",
              }),

            questionType: Joi.string(),

            options: Joi.array()
              .items(Joi.string())
              .min(1)
              .messages({
                "array.min": "At least one option is required",
              }),

            correctAnswer: Joi.alternatives().try(Joi.string(), Joi.number()),

            explanation: Joi.string()
              .min(5)
              .max(500)
              .messages({
                "string.min": "Explanation must be at least 5 characters",
                "string.max": "Explanation cannot exceed 500 characters",
              }),

            points: Joi.number()
              .min(1)
              .messages({
                "number.min": "Points must be at least 1",
              }),
          })
        )
        .min(1)
        .messages({
          "array.min": "Quiz must have at least one question",
        }),

      passingScore: Joi.number()
        .min(0)
        .max(100)
        .messages({
          "number.min": "Passing score cannot be negative",
          "number.max": "Passing score cannot exceed 100",
        }),

      timeLimit: Joi.number()
        .min(1)
        .messages({
          "number.min": "Time limit must be at least 1 minute",
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

  public validateObjectId = (req: Request, res: Response, next: NextFunction) => {
    const { courseId, sectionId } = req.params;
    const idToValidate = courseId || sectionId;

    if (idToValidate && !mongoose.Types.ObjectId.isValid(idToValidate)) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Invalid ID format",
        data: null,
      });
    }

    next();
  };
}

export const courseValidator = new CourseValidator();
