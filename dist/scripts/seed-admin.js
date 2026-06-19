"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const entity_1 = __importDefault(require("../admin/entity"));
const enum_1 = require("../auth/enum");
const auth_1 = require("../utils/auth");
const loggin_1 = __importDefault(require("../utils/loggin"));
const seedAdmin = async () => {
    try {
        await (0, db_1.connectDB)();
        const existingAdmin = await entity_1.default.findOne({ email: "admin@metricmind.com" });
        if (existingAdmin) {
            loggin_1.default.info("Super Admin already exists");
            process.exit(0);
        }
        const hashedPassword = await auth_1.authUtil.hashPassword("Admin@123456");
        const superAdmin = new entity_1.default({
            email: "admin@metricmind.com",
            fullName: "Super Admin",
            password: hashedPassword,
            status: enum_1.AccountStatus.Active,
            role: enum_1.AdminRole.SuperAdmin,
        });
        await superAdmin.save();
        loggin_1.default.info("Super Admin created successfully");
        console.log("Super Admin Email: admin@metricmind.com");
        console.log("Super Admin Password: Admin@123456");
        console.log("⚠️  Please change this password after first login!");
        process.exit(0);
    }
    catch (error) {
        loggin_1.default.error(`Failed to seed admin: ${error.message}`);
        process.exit(1);
    }
};
seedAdmin();
