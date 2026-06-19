"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./index"));
const loggin_1 = __importDefault(require("../utils/loggin"));
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(index_1.default.db.uri);
        loggin_1.default.info(`MongoDB Connected: ${conn.connection.host} 🎂`);
        // Handle unexpected disconnection
        mongoose_1.default.connection.on("error", (err) => {
            loggin_1.default.error(`MongoDB Connection Error: ${err.message}`);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            loggin_1.default.warn("MongoDB Disconnected. Attempting to reconnect...");
        });
    }
    catch (error) {
        loggin_1.default.error(`Database connection failed: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
