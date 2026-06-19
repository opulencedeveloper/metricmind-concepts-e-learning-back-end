import { Server as HttpServer } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./config";
import { connectDB } from "./config/db";
import Logging from "./utils/loggin";



const startServer = async () => {
  await connectDB();

  const server: HttpServer = app.listen(config.app.port, () => {
    Logging.info(`OnaaGa Backend is running on port ${config.app.port} 🔥🔧`);
  });


  const gracefulShutdown = (signal: string) => {
    Logging.warn(`${signal} signal received: closing HTTP server`);

    server.close(async () => {
      Logging.info("HTTP server closed.");

      try {
        await mongoose.connection.close();
        Logging.info("MongoDB connection closed.");
        process.exit(0);
      } catch (err: any) {
        Logging.error(`Error during disconnection: ${err.message}`);
        process.exit(1);
      }
    });

    setTimeout(() => {
      Logging.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

startServer().catch((error) => {
  Logging.error(`CRITICAL FAILURE: ${error.message}`);
  process.exit(1);
});
