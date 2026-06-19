import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { ISignupInput, IEmailVerifyInput, IForgotPasswordInput, IResetPasswordInput, ILoginInput } from "./interface";
import { PASSWORD_REGEX } from "../utils/constants";

class AuthValidator {
  public validateSignup = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<ISignupInput>({
      email: Joi.string()
        .email()
        .required()
        .messages({
          "string.email": "Please enter a valid email address",
          "any.required": "Email is required",
        }),

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

      password: Joi.string()
        .min(8)
        .pattern(PASSWORD_REGEX)
        .required()
        .messages({
          "any.required": "Password is required",
          "string.min": "Password must be at least 8 characters",
          "string.pattern.base": "Password must contain uppercase, lowercase, and numbers",
        }),

      confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.required": "Confirm password is required",
          "any.only": "Passwords do not match",
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

  public validateEmailVerify = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<IEmailVerifyInput>({
      email: Joi.string()
        .email()
        .required()
        .messages({
          "string.email": "Invalid email",
          "any.required": "Email is required",
        }),

      otp: Joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
          "string.pattern.base": "OTP must be 6 digits",
          "any.required": "OTP is required",
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

  public validateResendVerification = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          "string.email": "Invalid email",
          "any.required": "Email is required",
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

  public validateForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<IForgotPasswordInput>({
      email: Joi.string()
        .email()
        .required()
        .messages({
          "string.email": "Invalid email",
          "any.required": "Email is required",
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

  public validateResetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<IResetPasswordInput>({
      email: Joi.string()
        .email()
        .required()
        .messages({
          "string.email": "Invalid email",
          "any.required": "Email is required",
        }),

      otp: Joi.string()
        .pattern(/^\d{6}$/)
        .required()
        .messages({
          "string.pattern.base": "OTP must be 6 digits",
          "any.required": "OTP is required",
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
          "any.required": "Confirm password is required",
          "any.only": "Passwords do not match",
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

  public validateLogin = async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object<ILoginInput>({
      email: Joi.string()
        .email()
        .required()
        .messages({
          "string.email": "Invalid email",
          "any.required": "Email is required",
        }),

      password: Joi.string()
        .required()
        .messages({
          "any.required": "Password is required",
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
}

export const authValidator = new AuthValidator();
