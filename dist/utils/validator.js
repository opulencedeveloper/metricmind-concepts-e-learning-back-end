"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonValidator = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class CommonValidator {
    constructor() {
        this.objectId = (value, helpers) => {
            if (!mongoose_1.default.Types.ObjectId.isValid(value)) {
                return helpers.message("Invalid ID format.");
            }
            return value;
        };
    }
}
exports.commonValidator = new CommonValidator();
