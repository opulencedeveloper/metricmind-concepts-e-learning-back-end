import { Request, Response } from "express";
import { MessageResponse } from "./enum";
import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { UserType } from "../auth/enum";

export interface CustomRequest extends Request {
  userId?: mongoose.Types.ObjectId;
  userType?: UserType;
  admin?: any;
}

export interface CustomHttpResponse {
  res: Response;
  status: number;
  message: MessageResponse;
  description: string;
  data: any;
  meta?: any;
}

export interface ISendEmail {
  receiverEmail: string;
  subject: string;
  emailTemplate: string;
  replyTo?: string;
}

export interface IOTP {
  email: string;
  otp: string;
}

export interface IResendOTP {
  email: string;
}

export interface IValidateEmail {
  email: string;
}

export interface IWelcomeEmail {
  email: string;
  name: string;
}

export type IVerifyEmail = IOTP;

export interface IQueryId {
  id: string;
}

export interface IDecodedToken extends JwtPayload {
  userId: string;
  userType: UserType;
}

export interface IEmailInput {
  email: string;
  fullName: string;
  otp: string;
}
