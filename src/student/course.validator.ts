import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { PASSWORD_REGEX } from "../utils/constants";

class StudentCourseValidator {
  public validateSearch = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      query: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
          "string.min": "Search query must be at least 2 characters",
          "string.max": "Search query cannot exceed 100 characters",
          "any.required": "Search query is required",
        }),

      page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
          "number.base": "Page must be a number",
          "number.min": "Page must be at least 1",
        }),

      limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(12)
        .messages({
          "number.base": "Limit must be a number",
          "number.min": "Limit must be at least 1",
          "number.max": "Limit cannot exceed 50",
        }),

      category: Joi.string()
        .max(100)
        .optional()
        .messages({
          "string.max": "Category cannot exceed 100 characters",
        }),
    });

    const { error, value } = schema.validate(req.query);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    req.query = value;
    next();
  };

  public validatePagination = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
          "number.base": "Page must be a number",
          "number.min": "Page must be at least 1",
        }),

      limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(12)
        .messages({
          "number.base": "Limit must be a number",
          "number.min": "Limit must be at least 1",
          "number.max": "Limit cannot exceed 50",
        }),

      category: Joi.string()
        .max(100)
        .messages({
          "string.max": "Category cannot exceed 100 characters",
        }),

      level: Joi.string()
        .valid("beginner", "intermediate", "advanced")
        .messages({
          "any.only": "Invalid course level",
        }),
    });

    const { error, value } = schema.validate(req.query);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    req.query = value;
    next();
  };

  public validateObjectId = (req: Request, res: Response, next: NextFunction) => {
    const { courseId, quizId, submissionId, enrollmentId, sectionId, reviewId, curriculumItemId } = req.params;
    const idsToValidate = [courseId, quizId, submissionId, enrollmentId, sectionId, reviewId, curriculumItemId].filter(Boolean);

    for (const id of idsToValidate) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return utils.customResponse({
          status: 400,
          res,
          message: MessageResponse.Error,
          description: "Invalid ID format",
          data: null,
        });
      }
    }

    next();
  };

  public validateSlug = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      courseSlug: Joi.string()
        .lowercase()
        .trim()
        .min(3)
        .max(255)
        .required()
        .regex(/^[a-z0-9-]+$/)
        .messages({
          "string.min": "Slug must be at least 3 characters",
          "string.max": "Slug cannot exceed 255 characters",
          "string.pattern.base": "Slug can only contain lowercase letters, numbers, and hyphens",
          "any.required": "Slug is required",
        }),
    });

    const { error } = schema.validate(req.params);

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

  public validateQuizSubmission = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      quizId: Joi.string()
        .required()
        .custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
          }
          return value;
        })
        .messages({
          "any.required": "quizId is required",
          "any.invalid": "quizId must be a valid MongoDB ID",
        }),

      answers: Joi.object()
        .pattern(
          Joi.string().pattern(/^\d+$/),
          Joi.alternatives().try(Joi.string(), Joi.number())
        )
        .min(1)
        .required()
        .messages({
          "object.min": "At least one answer is required",
          "any.required": "answers object is required",
        }),

      timeTaken: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
          "number.base": "timeTaken must be a number",
          "number.min": "timeTaken cannot be negative",
        }),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    req.body = value;
    next();
  };

  public validateWishlist = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      courseId: Joi.string()
        .required()
        .custom((value, helpers) => {
          if (!mongoose.Types.ObjectId.isValid(value)) {
            return helpers.error("any.invalid");
          }
          return value;
        })
        .messages({
          "any.required": "courseId is required",
          "any.invalid": "courseId must be a valid MongoDB ID",
        }),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    req.body = value;
    next();
  };

  public validateReviewSubmit = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required()
        .messages({
          "number.base": "Rating must be a number",
          "number.min": "Rating must be at least 1",
          "number.max": "Rating cannot exceed 5",
          "any.required": "Rating is required",
        }),

      comment: Joi.string()
        .trim()
        .min(10)
        .max(1000)
        .required()
        .messages({
          "string.min": "Review must be at least 10 characters",
          "string.max": "Review cannot exceed 1000 characters",
          "any.required": "Review comment is required",
        }),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    req.body = value;
    next();
  };

  public validateReviewUpdate = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .optional()
        .messages({
          "number.base": "Rating must be a number",
          "number.min": "Rating must be at least 1",
          "number.max": "Rating cannot exceed 5",
        }),

      comment: Joi.string()
        .trim()
        .min(10)
        .max(1000)
        .optional()
        .messages({
          "string.min": "Review must be at least 10 characters",
          "string.max": "Review cannot exceed 1000 characters",
        }),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    req.body = value;
    next();
  };

  public validateUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      fullName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
          "string.min": "Full name must be at least 2 characters",
          "string.max": "Full name cannot exceed 100 characters",
          "any.required": "Full name is required",
        }),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    req.body = value;
    next();
  };

  public validateChangePassword = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      currentPassword: Joi.string()
        .required()
        .messages({
          "any.required": "Current password is required",
        }),

      newPassword: Joi.string()
        .min(8)
        .pattern(PASSWORD_REGEX)
        .required()
        .messages({
          "any.required": "New password is required",
          "string.min": "Password must be at least 8 characters",
          "string.pattern.base": "Password must contain uppercase, lowercase, and numbers",
        }),

      confirmPassword: Joi.string()
        .valid(Joi.ref("newPassword"))
        .required()
        .messages({
          "any.only": "Passwords must match",
          "any.required": "Confirm password is required",
        }),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: error.details[0].message,
        data: null,
      });
    }

    req.body = value;
    next();
  };
}

export const studentCourseValidator = new StudentCourseValidator();
