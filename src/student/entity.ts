import mongoose, { Schema } from "mongoose";
import { IStudent } from "./interface";
import { AccountStatus } from "../auth/enum";
import { authUtil } from "../utils/auth";

const studentSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    status: {
      type: String,
      enum: Object.values(AccountStatus),
      default: AccountStatus.PendingVerification,
      index: true,
    },
    emailVerificationOtp: {
      type: String,
      trim: true,
      default: undefined,
      select: false,
    },
    emailVerificationOtpExpiration: {
      type: Date,
      default: undefined,
      select: false,
    },
    passwordResetOtp: {
      type: String,
      trim: true,
      default: undefined,
      select: false,
    },
    passwordResetOtpExpiration: {
      type: Date,
      default: undefined,
      select: false,
    },
    lastOtpSentAt: {
      type: Date,
      default: undefined,
      select: false,
    },
  },
  { timestamps: true }
);

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const hashed = await authUtil.hashPassword((this as any).password);
    (this as any).password = hashed;
    next();
  } catch (error: any) {
    next(error);
  }
});

const Student = mongoose.model<IStudent>("Student", studentSchema);

export default Student;
