import mongoose from "mongoose";
import { connectDB } from "../config/db";
import Admin from "../admin/entity";
import { AccountStatus, AdminRole } from "../auth/enum";
import { authUtil } from "../utils/auth";
import Logging from "../utils/loggin";

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await Admin.findOne({ email: "admin@metricmind.com" });

    if (existingAdmin) {
      Logging.info("Super Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await authUtil.hashPassword("Admin@123456");

    const superAdmin = new Admin({
      email: "admin@metricmind.com",
      fullName: "Super Admin",
      password: hashedPassword,
      status: AccountStatus.Active,
      role: AdminRole.SuperAdmin,
    });

    await superAdmin.save();

    Logging.info("Super Admin created successfully");
    console.log("Super Admin Email: admin@metricmind.com");
    console.log("Super Admin Password: Admin@123456");
    console.log("⚠️  Please change this password after first login!");

    process.exit(0);
  } catch (error: any) {
    Logging.error(`Failed to seed admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
