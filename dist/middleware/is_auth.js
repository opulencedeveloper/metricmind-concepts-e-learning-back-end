"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const enum_1 = require("../utils/enum");
const utils_1 = require("../utils");
const isAuth = async (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        return utils_1.utils.customResponse({
            status: 401,
            res,
            message: enum_1.MessageResponse.Error,
            description: "Not authenticated",
            data: null,
        });
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, config_1.default.jwt.secret);
    }
    catch (err) {
        return utils_1.utils.customResponse({
            status: 401,
            res,
            message: enum_1.MessageResponse.Error,
            description: "Not authenticated",
            data: null,
        });
    }
    if (!decodedToken || !decodedToken.userId) {
        return utils_1.utils.customResponse({
            status: 401,
            res,
            message: enum_1.MessageResponse.Error,
            description: "Not authenticated",
            data: null,
        });
    }
    // Attach decoded data to request object
    req.userId = new mongoose_1.default.Types.ObjectId(decodedToken.userId);
    req.userType = decodedToken.userType;
    next();
};
exports.isAuth = isAuth;
