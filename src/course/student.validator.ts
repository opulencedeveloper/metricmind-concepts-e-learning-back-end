import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";

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
}

export const studentCourseValidator = new StudentCourseValidator();
