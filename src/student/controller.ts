import { Request, Response } from "express";
import { studentService } from "./service";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { authUtil } from "../utils/auth";
import { sendEmail } from "../utils/email";
import { verificationEmailTemplate, passwordResetEmailTemplate } from "../utils/template";
import { IEmailInput, CustomRequest } from "../utils/interface";
import { ISignupInput, IEmailVerifyInput, IForgotPasswordInput, IResetPasswordInput, ILoginInput, ICreateUserInput } from "../auth/interface";
import { UserType, AccountStatus } from "../auth/enum";
import config from "../config";
import Logging from "../utils/loggin";

class StudentAuthController {
  public signup = async (req: Request, res: Response) => {
    const body: ISignupInput = req.body;
    const { email, password, fullName } = body;

    const existingStudent = await studentService.findStudentByEmail(email);
    if (existingStudent) {
      if (existingStudent.status === AccountStatus.PendingVerification) {
        return utils.customResponse({
          status: 200,
          res,
          message: MessageResponse.VerifyEmail,
          description: "Account exists but email not verified. Resend OTP",
          data: { email: existingStudent.email, status: existingStudent.status },
        });
      }

      return utils.customResponse({
        status: 409,
        res,
        message: MessageResponse.Error,
        description: "Email already registered",
        data: null,
      });
    }

    const { otp, expiration } = utils.getOtpAndExpiration(6);
    const lastOtpSentAt = new Date();

    const createInput: ICreateUserInput = {
      email,
      password,
      fullName,
      emailVerificationOtp: otp,
      emailVerificationOtpExpiration: expiration,
      lastOtpSentAt,
    };

    const student = await studentService.createStudent(createInput);

    this.sendVerificationEmail({ email, fullName, otp });

    return utils.customResponse({
      status: 201,
      res,
      message: MessageResponse.VerifyEmail,
      description: "Account created. Verification email sent",
      data: { email, status: student.status },
    });
  };

  public verifyEmail = async (req: Request, res: Response) => {
    const body: IEmailVerifyInput = req.body;
    const { email, otp } = body;

    const student = await studentService.findStudentByEmailWithOtp(email);

    if (!student) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Student not found",
        data: null,
      });
    }

    if (student.status !== AccountStatus.PendingVerification) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Email already verified",
        data: null,
      });
    }

    if (student.emailVerificationOtp !== otp) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Invalid OTP",
        data: null,
      });
    }

    if (!student.emailVerificationOtpExpiration || new Date() > student.emailVerificationOtpExpiration) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "OTP expired",
        data: null,
      });
    }

    const verifiedStudent = await studentService.markEmailAsVerified(email);

    if (!verifiedStudent) {
      return utils.customResponse({
        status: 500,
        res,
        message: MessageResponse.Error,
        description: "Failed to verify email",
        data: null,
      });
    }

    const token = authUtil.generateAuthToken(verifiedStudent._id, UserType.Student, config.jwt.expiresIn);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Email verified successfully",
      data: {
        token,
        student: {
          id: verifiedStudent._id,
          email: verifiedStudent.email,
          fullName: verifiedStudent.fullName,
          status: verifiedStudent.status,
        },
      },
    });
  };

  public resendVerificationEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    const student = await studentService.findStudentByEmail(email);

    if (!student) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Student not found",
        data: null,
      });
    }

    if (student.status !== AccountStatus.PendingVerification) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Email already verified",
        data: null,
      });
    }

    const { otp, expiration } = utils.getOtpAndExpiration(6);

    await studentService.updateEmailVerificationOtp({ email, otp, expiration });

    this.sendVerificationEmail({ email, fullName: student.fullName, otp });

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Verification email resent",
      data: null,
    });
  };

  public forgotPassword = async (req: Request, res: Response) => {
    const body: IForgotPasswordInput = req.body;
    const { email } = body;

    const student = await studentService.findStudentByEmail(email);

    if (!student) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Student not found",
        data: null,
      });
    }

    const { otp, expiration } = utils.getOtpAndExpiration(6);

    await studentService.setPasswordResetOtp(email, otp, expiration);

    this.sendPasswordResetEmail({ email, fullName: student.fullName, otp });

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Password reset OTP sent to email",
      data: null,
    });
  };

  public resetPassword = async (req: Request, res: Response) => {
    const body: IResetPasswordInput = req.body;
    const { email, otp, newPassword } = body;

    const student = await studentService.findStudentByEmailWithOtp(email);

    if (!student) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Student not found",
        data: null,
      });
    }

    if (student.passwordResetOtp !== otp) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Invalid OTP",
        data: null,
      });
    }

    if (!student.passwordResetOtpExpiration || new Date() > student.passwordResetOtpExpiration) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "OTP expired",
        data: null,
      });
    }

    const hashedPassword = await authUtil.hashPassword(newPassword);
    await studentService.updatePassword(email, hashedPassword);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Password reset successfully",
      data: null,
    });
  };

  public login = async (req: Request, res: Response) => {
    const body: ILoginInput = req.body;
    const { email, password } = body;

    const student = await studentService.findStudentByEmailWithPassword(email);

    if (!student) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Invalid email or password",
        data: null,
      });
    }

    const isPasswordMatch = await authUtil.comparePassword(password, student.password);

    if (!isPasswordMatch) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Invalid email or password",
        data: null,
      });
    }

    if (student.status !== AccountStatus.Active) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: `Account is ${student.status}`,
        data: null,
      });
    }

    const token = authUtil.generateAuthToken(student._id, UserType.Student, config.jwt.expiresIn);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Login successful",
      data: {
        token,
        student: {
          id: student._id,
          email: student.email,
          fullName: student.fullName,
          status: student.status,
          createdAt: student.createdAt,
        },
      },
    });
  };

  public updateProfile = async (req: CustomRequest, res: Response) => {
    const studentId = req.userId;
    const { fullName } = req.body;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized",
        data: null,
      });
    }

    if (!fullName || !fullName.trim()) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Full name is required",
        data: null,
      });
    }

    try {
      const updated = await studentService.updateProfile(studentId, fullName.trim());

      if (!updated) {
        return utils.customResponse({
          status: 404,
          res,
          message: MessageResponse.Error,
          description: "Student not found",
          data: null,
        });
      }

      return utils.customResponse({
        status: 200,
        res,
        message: MessageResponse.Success,
        description: "Profile updated successfully",
        data: {
          student: {
            id: updated._id,
            fullName: updated.fullName,
            createdAt: updated.createdAt,
          },
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return utils.customResponse({
        status: 500,
        res,
        message: MessageResponse.Error,
        description: "Failed to update profile",
        data: null,
      });
    }
  };

  public changePassword = async (req: CustomRequest, res: Response) => {
    const studentId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!studentId) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Unauthorized",
        data: null,
      });
    }

    if (!currentPassword || !newPassword) {
      return utils.customResponse({
        status: 400,
        res,
        message: MessageResponse.Error,
        description: "Current and new password are required",
        data: null,
      });
    }

    try {
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

      const withPassword = await studentService.findStudentByEmailWithPassword(student.email);
      const isMatch = await authUtil.comparePassword(currentPassword, withPassword!.password);

      if (!isMatch) {
        return utils.customResponse({
          status: 401,
          res,
          message: MessageResponse.Error,
          description: "Current password is incorrect",
          data: null,
        });
      }

      await studentService.changePassword(studentId, newPassword);

      return utils.customResponse({
        status: 200,
        res,
        message: MessageResponse.Success,
        description: "Password changed successfully",
        data: null,
      });
    } catch (error) {
      console.error('Change password error:', error);
      return utils.customResponse({
        status: 500,
        res,
        message: MessageResponse.Error,
        description: "Failed to change password",
        data: null,
      });
    }
  };

  private sendVerificationEmail = (input: IEmailInput) => {
    setImmediate(async () => {
      try {
        const emailTemplate = verificationEmailTemplate(input.fullName, input.otp);
        await sendEmail({
          receiverEmail: input.email,
          subject: "Verify Your Email Address",
          emailTemplate,
        });
        Logging.info(`Verification email sent to ${input.email}`);
      } catch (error: any) {
        Logging.error(`Failed to send verification email to ${input.email}: ${error.message}`);
      }
    });
  };

  private sendPasswordResetEmail = (input: IEmailInput) => {
    setImmediate(async () => {
      try {
        const emailTemplate = passwordResetEmailTemplate(input.fullName, input.otp);
        await sendEmail({
          receiverEmail: input.email,
          subject: "Reset Your Password",
          emailTemplate,
        });
        Logging.info(`Password reset email sent to ${input.email}`);
      } catch (error: any) {
        Logging.error(`Failed to send password reset email to ${input.email}: ${error.message}`);
      }
    });
  };
}

export const studentAuthController = new StudentAuthController();
