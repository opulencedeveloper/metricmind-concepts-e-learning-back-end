import { Request, Response } from "express";
import { adminService } from "./service";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";
import { authUtil } from "../utils/auth";
import { ILoginInput } from "../auth/interface";
import { UserType, AccountStatus } from "../auth/enum";
import config from "../config";

class AdminAuthController {
  public login = async (req: Request, res: Response) => {
    const body: ILoginInput = req.body;
    const { email, password } = body;

    const admin = await adminService.findAdminByEmailWithPassword(email);

    if (!admin) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Invalid email or password",
        data: null,
      });
    }

    const isPasswordMatch = await authUtil.comparePassword(password, admin.password);

    if (!isPasswordMatch) {
      return utils.customResponse({
        status: 401,
        res,
        message: MessageResponse.Error,
        description: "Invalid email or password",
        data: null,
      });
    }

    if (admin.status !== AccountStatus.Active) {
      return utils.customResponse({
        status: 403,
        res,
        message: MessageResponse.Error,
        description: `Account is ${admin.status}`,
        data: null,
      });
    }

    const token = authUtil.generateAuthToken(admin._id, UserType.Admin, config.jwt.expiresIn);

    return utils.customResponse({
      status: 200,
      res,
      message: MessageResponse.Success,
      description: "Login successful",
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
        },
      },
    });
  };
}

export const adminAuthController = new AdminAuthController();
