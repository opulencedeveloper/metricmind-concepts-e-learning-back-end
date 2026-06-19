"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthController = void 0;
const service_1 = require("./service");
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const auth_1 = require("../utils/auth");
const enum_2 = require("../auth/enum");
const config_1 = __importDefault(require("../config"));
class AdminAuthController {
    constructor() {
        this.login = async (req, res) => {
            const body = req.body;
            const { email, password } = body;
            const admin = await service_1.adminService.findAdminByEmailWithPassword(email);
            if (!admin) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Invalid email or password",
                    data: null,
                });
            }
            const isPasswordMatch = await auth_1.authUtil.comparePassword(password, admin.password);
            if (!isPasswordMatch) {
                return utils_1.utils.customResponse({
                    status: 401,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: "Invalid email or password",
                    data: null,
                });
            }
            if (admin.status !== enum_2.AccountStatus.Active) {
                return utils_1.utils.customResponse({
                    status: 403,
                    res,
                    message: enum_1.MessageResponse.Error,
                    description: `Account is ${admin.status}`,
                    data: null,
                });
            }
            const token = auth_1.authUtil.generateAuthToken(admin._id, enum_2.UserType.Admin, config_1.default.jwt.expiresIn);
            return utils_1.utils.customResponse({
                status: 200,
                res,
                message: enum_1.MessageResponse.Success,
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
}
exports.adminAuthController = new AdminAuthController();
