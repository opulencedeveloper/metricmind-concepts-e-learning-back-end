import mongoose from "mongoose";
import config from "./index";
import Logging from "../utils/loggin";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.db.uri);
    Logging.info(`MongoDB Connected: ${conn.connection.host} 🎂`);
    
    // Handle unexpected disconnection
    mongoose.connection.on("error", (err) => {
      Logging.error(`MongoDB Connection Error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      Logging.warn("MongoDB Disconnected. Attempting to reconnect...");
    });

  } catch (error: any) {
    Logging.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};
