import { Document, Types } from "mongoose";
import { AccountStatus, AdminRole } from "../auth/enum";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  email: string;
  fullName: string;
  password: string;
  status: AccountStatus;
  role: AdminRole;
  emailVerificationOtp?: string;
  emailVerificationOtpExpiration?: Date;
  passwordResetOtp?: string;
  passwordResetOtpExpiration?: Date;
  lastOtpSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
