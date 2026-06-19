"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authUtil = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const enum_1 = require("../auth/enum");
class AuthUtil {
    hashPassword(password) {
        return new Promise((resolve, reject) => {
            bcrypt_1.default.genSalt(12, (err, salt) => {
                if (err)
                    reject(err);
                bcrypt_1.default.hash(password, salt, (error, hashed) => {
                    if (error)
                        reject(error);
                    resolve(hashed);
                });
            });
        });
    }
    comparePassword(password, hashed) {
        return bcrypt_1.default.compare(password, hashed);
    }
    generateAuthToken(userId, userType, expiresIn) {
        const secret = userType === enum_1.UserType.Admin ? config_1.default.jwt.secretAdmin : config_1.default.jwt.secret;
        return jsonwebtoken_1.default.sign({ userId, userType }, secret, { expiresIn: expiresIn });
    }
}
exports.authUtil = new AuthUtil();
