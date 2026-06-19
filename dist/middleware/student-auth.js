"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const enum_2 = require("../auth/enum");
const service_1 = require("../student/service");
const loggin_1 = __importDefault(require("../utils/loggin"));
const studentAuth = async (req, res, next) => {
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
        const decodedToken = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
        if (!decodedToken || decodedToken.userType !== enum_2.UserType.Student) {
            return utils_1.utils.customResponse({
                status: 403,
                res,
                message: enum_1.MessageResponse.Error,
                description: "Student access required",
                data: null,
            });
        }
        const student = await service_1.studentService.findStudentById(decodedToken.userId);
        if (!student) {
            return utils_1.utils.customResponse({
                status: 404,
                res,
                message: enum_1.MessageResponse.Error,
                description: "Student not found",
                data: null,
            });
        }
        if (student.status !== enum_2.AccountStatus.Active) {
            return utils_1.utils.customResponse({
                status: 403,
                res,
                message: enum_1.MessageResponse.Error,
                description: `Student account is ${student.status}`,
                data: null,
            });
        }
        req.userId = new mongoose_1.default.Types.ObjectId(decodedToken.userId);
        req.userType = decodedToken.userType;
        next();
    }
    catch (error) {
        loggin_1.default.error(`Student auth error: ${error.message}`);
        return utils_1.utils.customResponse({
            status: 401,
            res,
            message: enum_1.MessageResponse.Error,
            description: "Invalid or expired token",
            data: null,
        });
    }
};
exports.studentAuth = studentAuth;
