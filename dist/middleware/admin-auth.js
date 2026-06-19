"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const enum_2 = require("../auth/enum");
const service_1 = require("../admin/service");
const loggin_1 = __importDefault(require("../utils/loggin"));
const adminAuth = async (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return utils_1.utils.customResponse({
            status: 401,
            res,
            message: enum_1.MessageResponse.Error,
            description: "Authorization header missing",
            data: null,
        });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return utils_1.utils.customResponse({
            status: 401,
            res,
            message: enum_1.MessageResponse.Error,
            description: "No token provided",
            data: null,
        });
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secretAdmin);
        if (!decodedToken || decodedToken.userType !== enum_2.UserType.Admin) {
            return utils_1.utils.customResponse({
                status: 403,
                res,
                message: enum_1.MessageResponse.Error,
                description: "Admin access required",
                data: null,
            });
        }
        const admin = await service_1.adminService.findAdminById(decodedToken.userId);
        if (!admin) {
            return utils_1.utils.customResponse({
                status: 404,
                res,
                message: enum_1.MessageResponse.Error,
                description: "Admin not found",
                data: null,
            });
        }
        if (admin.status !== enum_2.AccountStatus.Active) {
            return utils_1.utils.customResponse({
                status: 403,
                res,
                message: enum_1.MessageResponse.Error,
                description: `Admin account is ${admin.status}`,
                data: null,
            });
        }
        req.userId = new mongoose_1.default.Types.ObjectId(decodedToken.userId);
        req.userType = decodedToken.userType;
        req.admin = admin;
        next();
    }
    catch (error) {
        loggin_1.default.error(`Admin auth error: ${error.message}`);
        return utils_1.utils.customResponse({
            status: 401,
            res,
            message: enum_1.MessageResponse.Error,
            description: "Invalid or expired token",
            data: null,
        });
    }
};
exports.adminAuth = adminAuth;
