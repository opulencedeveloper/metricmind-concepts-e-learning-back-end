import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import mongoose from "mongoose";
import config from "../config";
import { CustomRequest } from "../utils/interface";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { UserType, AccountStatus } from "../auth/enum";
import { adminService } from "../admin/service";
import Logging from "../utils/loggin";

export const adminAuth = async (req: CustomRequest, res: Response, next: NextFunction) => {
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
    const decodedToken = jwt.verify(token, config.jwt.secretAdmin) as any;

    if (!decodedToken || decodedToken.userType !== UserType.Admin) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: "Admin access required",
        data: null,
      });
    }

    const admin = await adminService.findAdminById(decodedToken.userId);

    if (!admin) {
      return utils.customResponse({
        status: 404,
        res,
        message: MessageResponse.Error,
        description: "Admin not found",
        data: null,
      });
    }

    if (admin.status !== AccountStatus.Active) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: `Admin account is ${admin.status}`,
        data: null,
      });
    }

    req.userId = new mongoose.Types.ObjectId(decodedToken.userId);
    req.userType = decodedToken.userType;
    (req as any).admin = admin;

    next();
  } catch (error: any) {
    Logging.error(`Admin auth error: ${error.message}`);

    return utils.customResponse({
      status: 401,
      res,
      message: MessageResponse.Error,
      description: "Invalid or expired token",
      data: null,
    });
  }
};
