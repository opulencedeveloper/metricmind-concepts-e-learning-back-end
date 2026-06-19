
export interface ISignupInput {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

export interface ICreateUserInput {
  email: string;
  password: string;
  fullName: string;
  emailVerificationOtp: string;
  emailVerificationOtpExpiration: Date;
  lastOtpSentAt: Date;
}

export interface IEmailVerifyInput {
  email: string;
  otp: string;
}

export interface IForgotPasswordInput {
  email: string;
}

export interface IResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface IUpdateEmailVerificationOtpInput {
  email: string;
  otp: string;
  expiration: Date;
}

export interface CustomRequest extends Request {
  user?: any;
}
