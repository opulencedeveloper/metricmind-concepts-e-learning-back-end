"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const db_1 = require("./config/db");
const loggin_1 = __importDefault(require("./utils/loggin"));
const startServer = async () => {
    await (0, db_1.connectDB)();
    const server = app_1.default.listen(config_1.default.app.port, () => {
        loggin_1.default.info(`OnaaGa Backend is running on port ${config_1.default.app.port} 🔥🔧`);
    });
    const gracefulShutdown = (signal) => {
        loggin_1.default.warn(`${signal} signal received: closing HTTP server`);
        server.close(async () => {
            loggin_1.default.info("HTTP server closed.");
            try {
                await mongoose_1.default.connection.close();
                loggin_1.default.info("MongoDB connection closed.");
                process.exit(0);
            }
            catch (err) {
                loggin_1.default.error(`Error during disconnection: ${err.message}`);
                process.exit(1);
            }
        });
        setTimeout(() => {
            loggin_1.default.error("Could not close connections in time, forcefully shutting down");
            process.exit(1);
        }, 10000);
    };
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};
startServer().catch((error) => {
    loggin_1.default.error(`CRITICAL FAILURE: ${error.message}`);
    process.exit(1);
});
