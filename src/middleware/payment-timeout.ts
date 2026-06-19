import { Request, Response, NextFunction } from "express";
import { utils } from "../utils";
import { MessageResponse } from "../utils/enum";
import Logging from "../utils/loggin";

/**
 * Payment Operation Timeout Middleware
 * Prevents hanging payment requests that can cause orphaned payments
 * when users close browser, navigate away, or lose connection
 */
export const paymentTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    let timeoutId: NodeJS.Timeout;
    let isTimedOut = false;

    // Set timeout
    timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        isTimedOut = true;
        Logging.warn(
          `Payment request timeout after ${timeoutMs}ms: ${req.method} ${req.path}`
        );

        return utils.customResponse({
          status: 408,
          res,
          message: MessageResponse.Error,
          description: "Payment operation timed out. Please try again.",
          data: null,
        });
      }
    }, timeoutMs);

    // Clear timeout if response is sent before timeout
    const originalSend = res.send;
    res.send = function (data: any) {
      clearTimeout(timeoutId);
      return originalSend.call(this, data);
    };

    // Handle response end
    res.on("finish", () => {
      clearTimeout(timeoutId);
    });

    res.on("close", () => {
      clearTimeout(timeoutId);
      if (!isTimedOut) {
        Logging.info(`Payment request connection closed: ${req.method} ${req.path}`);
      }
    });

    next();
  };
};

/**
 * Specific timeout configurations for payment endpoints
 */
export const paymentTimeoutConfigs = {
  // Initiate payment: 30 seconds (includes Paystack API call)
  initiate: paymentTimeout(30000),

  // Verify payment: 20 seconds (quick DB lookup + Paystack verification)
  verify: paymentTimeout(20000),

  // Webhook: 10 seconds (should be fast)
  webhook: paymentTimeout(10000),

  // Payment history: 15 seconds
  history: paymentTimeout(15000),
};
