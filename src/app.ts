import express, { NextFunction, Request, Response, Express } from "express";
import cors from "cors";
import compression from "compression";

import config, { AppEnvironment } from "./config";
import Logging from "./utils/loggin";
import { MessageResponse } from "./utils/enum";
import GeneralMiddleware from "./middleware/general";
import { utils } from "./utils";
import { AuthRouter } from "./auth/router";
import { StudentRouter } from "./student/router";
import { AdminRouter } from "./admin/router";
import { PaymentRouter } from "./payment/router";

const app: Express = express();

/**
 * Express Application Configuration
 * Decoupled from server listening logic for better testability and scalability.
 */
app.set("trust proxy", 1);

// Middleware
app.use(compression());
app.use(GeneralMiddleware.Helmet);

app.use(GeneralMiddleware.RateLimiting);

app.use(
  cors({
    origin: config.app.corsOrigins,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Global middleware to catch malformed JSON
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "status" in err && err.status === 400 && "body" in err) {
    Logging.error(`Malformed JSON request: ${err.message}`);
    return utils.customResponse({
      status: 400,
      res,
      message: MessageResponse.Error,
      description: "Malformed JSON: Please check your request formatting (e.g., missing quotes or commas)",
      data: null,
    });
  }
  next();
});

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  Logging.info(
    `Incoming ==> Method : [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`,
  );

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    Logging.info(
      `Outgoing ==> Method : [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - status: [${res.statusCode}] - duration: [${duration}ms]`,
    );
  });

  next();
});

// Routes
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/student", StudentRouter);
app.use("/api/v1/admin", AdminRouter);
app.use("/api/v1/payments", PaymentRouter);

app.get("/api/v1/healthcheck", (_req: Request, res: Response) => {
  res.status(200).json({ status: "UP 🔥🔧🎂" });
});

// 405 Handler (Method Not Allowed)
app.use(GeneralMiddleware.MethodNotAllowed);

// 404 Handler
app.use((_req: Request, res: Response) => {
  const _error = new Error("Url not found 😟");
  Logging.error(_error);
  return res.status(404).json({ message: _error.message });
});

/**
 * Global Error Handler
 * Never exposes internal stack traces to the client in production.
 */
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  Logging.error(`Error occurred: ${err.message}`);
  
  if (config.app.env !== AppEnvironment.PRODUCTION) {
    Logging.error(`Error stack: ${err.stack}`);
  }

  // Check for MongoDB duplicate key error (E11000)
  if (err.code === 11000) {
    return utils.customResponse({
      status: 409,
      res,
      message: MessageResponse.Error,
      description: "This entry already exists in the registry.",
      data: null,
    });
  }

  if (config.app.env === AppEnvironment.PRODUCTION) {
    Logging.error(`Request URL: ${_req.url}`);
    Logging.error(`Request Method: ${_req.method}`);
  }

  return utils.customResponse({
    status: 500,
    res,
    message: MessageResponse.Error,
    description: err.message || "Internal Server Error",
    data: null,
  });
});

export default app;
