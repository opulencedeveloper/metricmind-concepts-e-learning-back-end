import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import config from "../config";
import { CustomRequest } from "../utils/interface";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { UserType, AccountStatus } from "../auth/enum";
import { studentService } from "../student/service";
import Logging from "../utils/loggin";

export const studentAuth = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return utils.customResponse({
      status: 401,
      res,
      message: MessageResponse.Error,
      description: "Authorization header missing",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return utils.customResponse({
      status: 401,
      res,
      message: MessageResponse.Error,
      description: "No token provided",
      data: null,
    });
  }

  try {
    const decodedToken = jwt.verify(token, config.jwt.secret) as any;

    if (!decodedToken || decodedToken.userType !== UserType.Student) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Student access required",
        data: null,
      });
    }

    const student = await studentService.findStudentById(decodedToken.userId);

    if (!student) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Student not found",
        data: null,
      });
    }

    if (student.status !== AccountStatus.Active) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: `Student account is ${student.status}`,
        data: null,
      });
    }

    req.userId = new mongoose.Types.ObjectId(decodedToken.userId);
    req.userType = decodedToken.userType;

    next();
  } catch (error: any) {
    Logging.error(`Student auth error: ${error.message}`);

    return utils.customResponse({
      status: 401,
      res,
      message: MessageResponse.Error,
      description: "Invalid or expired token",
      data: null,
    });
  }
};
