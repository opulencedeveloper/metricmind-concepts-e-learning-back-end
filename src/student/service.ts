import mongoose, { Types } from "mongoose";
import Student from "./entity";
import { ICreateUserInput, IUpdateEmailVerificationOtpInput } from "../auth/interface";
import { AccountStatus } from "../auth/enum";

class StudentService {
  public createStudent = async (input: ICreateUserInput) => {
    const student = new Student({
      email: input.email,
      fullName: input.fullName,
      password: input.password,
      emailVerificationOtp: input.emailVerificationOtp,
      emailVerificationOtpExpiration: input.emailVerificationOtpExpiration,
      lastOtpSentAt: input.lastOtpSentAt,
      status: AccountStatus.PendingVerification,
    });

    await student.save();
    return student;
  };

  public findStudentById = async (id: string | mongoose.Types.ObjectId) => {
    return await Student.findById(id);
  };

  public findStudentByEmail = async (email: string) => {
    return await Student.findOne({ email });
  };

  public findStudentByEmailWithPassword = async (email: string) => {
    return await Student.findOne({ email }).select("+password");
  };

  public findStudentByEmailWithOtp = async (email: string) => {
    return await Student.findOne({ email }).select("+emailVerificationOtp +emailVerificationOtpExpiration +passwordResetOtp +passwordResetOtpExpiration");
  };

  public markEmailAsVerified = async (email: string) => {
    return await Student.findOneAndUpdate(
      { email },
      {
        $set: { status: AccountStatus.Active },
        $unset: {
          emailVerificationOtp: 1,
          emailVerificationOtpExpiration: 1,
        },
      },
      { new: true }
    );
  };

  public updateEmailVerificationOtp = async ({ email, otp, expiration }: IUpdateEmailVerificationOtpInput) => {
    return await Student.findOneAndUpdate(
      { email },
      {
        emailVerificationOtp: otp,
        emailVerificationOtpExpiration: expiration,
        lastOtpSentAt: new Date(),
      },
      { new: true }
    );
  };

  public setPasswordResetOtp = async (email: string, otp: string, expiration: Date) => {
    return await Student.findOneAndUpdate(
      { email },
      {
        passwordResetOtp: otp,
        passwordResetOtpExpiration: expiration,
        lastOtpSentAt: new Date(),
      },
      { new: true }
    );
  };

  public updatePassword = async (email: string, newPassword: string) => {
    return await Student.findOneAndUpdate(
      { email },
      {
        password: newPassword,
        $unset: {
          passwordResetOtp: 1,
          passwordResetOtpExpiration: 1,
        },
      },
      { new: true }
    );
  };

  public updateProfile = async (id: string | Types.ObjectId, fullName: string) => {
    return await Student.findByIdAndUpdate(
      id,
      { fullName },
      { new: true }
    );
  };

  public changePassword = async (id: string | Types.ObjectId, newPassword: string) => {
    return await Student.findByIdAndUpdate(
      id,
      { password: newPassword },
      { new: true }
    );
  };
}

export const studentService = new StudentService();
