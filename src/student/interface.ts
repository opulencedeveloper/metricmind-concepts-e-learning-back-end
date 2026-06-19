import { Document, Types } from "mongoose";
import { AccountStatus } from "../auth/enum";

export interface IStudent extends Document {
  _id: Types.ObjectId;
  email: string;
  fullName: string;
  password: string;
  status: AccountStatus;
  emailVerificationOtp?: string;
  emailVerificationOtpExpiration?: Date;
  passwordResetOtp?: string;
  passwordResetOtpExpiration?: Date;
  lastOtpSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUpdateProfileInput {
  fullName: string;
}

export interface IChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
