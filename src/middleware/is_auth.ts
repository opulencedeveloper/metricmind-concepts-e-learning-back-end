import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import mongoose from "mongoose";

import config from "../config";
import { CustomRequest, IDecodedToken } from "../utils/interface";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";

export const isAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return utils.customResponse({
      status: 401,
      res,
      message: MessageResponse.Error,
      description: "Not authenticated",
      data: null,
    });
  }

  const token = authHeader.split(" ")[1];
  let decodedToken: IDecodedToken;

  try {
    decodedToken = jwt.verify(token, config.jwt.secret) as IDecodedToken;
  } catch (err) {
    return utils.customResponse({
      status: 401,
      res,
      message: MessageResponse.Error,
      description: "Not authenticated",
      data: null,
    });
  }

  if (!decodedToken || !decodedToken.userId) {
    return utils.customResponse({
      status: 401,
      res,
      message: MessageResponse.Error,
      description: "Not authenticated",
      data: null,
    });
  }

  // Attach decoded data to request object
  req.userId = new mongoose.Types.ObjectId(decodedToken.userId);
  req.userType = decodedToken.userType;
  next();
};
