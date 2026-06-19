import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { MessageResponse } from "../utils/enum";
import { utils } from "../utils";

const createRateLimitHandler = (retryAfter: number) => (req: any, res: any) => {
  res.status(429).json({
    status: 429,
    message: MessageResponse.Error,
    description: "Too many requests. Please slow down and try again shortly.",
    error: "rate_limited",
    retry_after: retryAfter,
    data: null
  });
};

export default class GeneralMiddleware {
  static Helmet = helmet({
    crossOriginResourcePolicy: false,
  });

  static RateLimiting = rateLimit({
    windowMs: 60 * 1000,
    max: 500,
    handler: createRateLimitHandler(30),
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Payment endpoint rate limiters (stricter than global)
  static PaymentInitiateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    keyGenerator: (req: any) => `${req.userId || req.ip}:payment:initiate`,
    handler: createRateLimitHandler(3600),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => !req.userId,
  });

  static PaymentVerifyLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    keyGenerator: (req: any) => `${req.userId || req.ip}:payment:verify`,
    handler: createRateLimitHandler(3600),
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: any) => !req.userId,
  });

  static PaymentWebhookLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    keyGenerator: (req: any) => `${req.ip}:payment:webhook`,
    handler: createRateLimitHandler(60),
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * Global 405 Method Not Allowed Handler
   * Scans the router stack to identify valid methods for the requested path.
   */
  static MethodNotAllowed = (req: any, res: any, next: any) => {
    const supportedMethods = utils.getSupportedMethods(req.app, req.path);

    if (supportedMethods.length > 0) {
      res.set("Allow", supportedMethods.join(", "));
      return utils.customResponse({
        status: 405,
        res,
        message: MessageResponse.MethodNotAllowed,
        description: `The ${req.method} method is not supported for this resource. Supported methods: ${supportedMethods.join(", ")}`,
        data: null,
      });
    }

    next();
  };
}