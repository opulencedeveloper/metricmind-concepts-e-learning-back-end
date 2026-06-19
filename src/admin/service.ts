import mongoose from "mongoose";
import Admin from "./entity";
import { ICreateUserInput, IUpdateEmailVerificationOtpInput } from "../auth/interface";
import { AccountStatus } from "../auth/enum";

class AdminService {
  public createAdmin = async (input: ICreateUserInput) => {
    const admin = new Admin({
      email: input.email,
      fullName: input.fullName,
      password: input.password,
      emailVerificationOtp: input.emailVerificationOtp,
      emailVerificationOtpExpiration: input.emailVerificationOtpExpiration,
      lastOtpSentAt: input.lastOtpSentAt,
      status: AccountStatus.PendingVerification,
    });

    await admin.save();
    return admin;
  };

  public findAdminById = async (id: string | mongoose.Types.ObjectId) => {
    return await Admin.findById(id);
  };

  public findAdminByEmail = async (email: string) => {
    return await Admin.findOne({ email });
  };

  public findAdminByEmailWithPassword = async (email: string) => {
    return await Admin.findOne({ email }).select("+password");
  };

  public markEmailAsVerified = async (email: string) => {
    return await Admin.findOneAndUpdate(
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
    return await Admin.findOneAndUpdate(
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
    return await Admin.findOneAndUpdate(
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
    return await Admin.findOneAndUpdate(
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
}

export const adminService = new AdminService();
