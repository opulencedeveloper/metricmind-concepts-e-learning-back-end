import { NextFunction, Request, Response } from "express";
import Crypto from "crypto";
import { MessageResponse } from "./enum";
import { CustomHttpResponse } from "./interface";

class Utils {
  // Middleware function to wrap controllers with try-catch
  public wrapAsync(fn: Function) {
    return (req: Request, res: Response, next: NextFunction) => {
      fn(req, res, next).catch(next);
    };
  }

  public customResponse({
    res,
    status,
    message,
    description,
    data,
  }: CustomHttpResponse) {
    return res.status(status).json({
      message,
      description,
      data,
    });
  }

  /**
   * Generate OTP with configurable length
   * Uber/Bolt philosophy: 4-digit for quick operations (PIN), 6-digit for security-critical (password reset)
   */
  public generateOtp = (digits: number = 4): string => {
    return Array.from({ length: digits }, () => Crypto.randomInt(0, 10)).join("");
  };

  /**
   * Get OTP with expiration
   * @param digits OTP length (default 4 for withdrawal PIN, 6 for password reset)
   */
  public getOtpAndExpiration(digits: number = 4) {
    return {
      otp: this.generateOtp(digits),
      expiration: new Date(Date.now() + 10 * 60 * 1000),
    };
  }

  public async tryCatchWrapper<T>(
    fn: () => Promise<T>,
    res: Response,
    successMessage: string,
    successStatus: number = 200
  ) {
    try {
      const data = await fn();
      return this.customResponse({
        status: successStatus,
        res,
        message: MessageResponse.Success,
        description: successMessage,
        data,
      });
    } catch (error: any) {

      console.log(error)
      return this.customResponse({
        status: 400,
        res,   
        message: MessageResponse.Error,
        description: error.message || "An unexpected error occurred",
        data: null,
      });
    }
  }


  public getSupportedMethods(app: any, targetUrl: string): string[] {
    const methods: Set<string> = new Set();
    const cleanTargetUrl = targetUrl.split("?")[0].replace(/\/+$/, "") || "/";

    const scan = (stack: any[], prefix: string = "") => {
      if (!stack) return;

      stack.forEach((layer: any) => {
        if (layer.route) {
          // Direct route definition (e.g., router.post('/login'))
          const routePath = layer.route.path === "/" ? "" : layer.route.path;
          const fullPath = (prefix + routePath).replace(/\/+/g, "/") || "/";

          if (this.matchRoutePath(fullPath, cleanTargetUrl)) {
            Object.keys(layer.route.methods).forEach((method) => {
              if (method !== "_all") methods.add(method.toUpperCase());
            });
          }
        } else if (layer.name === "router" || (layer.handle && layer.handle.stack)) {
          // Nested router (e.g., app.use('/api/v1/auth', AuthRouter))
          let routerPath = "";
          if (layer.regexp) {
            // Extract the static prefix from the layer's regexp
            routerPath = layer.regexp.source
              .replace("^\\", "")
              .replace("\\/?(?=\\/|$)", "")
              .replace(/\\\//g, "/")
              .replace(/\^/g, "")
              .replace(/\$/g, "");
          }
          
          scan(layer.handle.stack, (prefix + routerPath).replace(/\/+/g, "/"));
        }
      });
    };

    scan(app._router.stack);
    return Array.from(methods);
  }

  /**
   * Robust path matching that handles Express-style route parameters (:id, etc.)
   */
  private matchRoutePath(registeredPath: string, targetPath: string): boolean {
    const regParts = registeredPath.split("/").filter(Boolean);
    const targetParts = targetPath.split("/").filter(Boolean);

    if (regParts.length !== targetParts.length) return false;

    return regParts.every((part, i) => {
      return part.startsWith(":") || part === targetParts[i];
    });
  }

  /**
   * Generate URL-friendly slug from text (SEO-optimized)
   * Example: "UI/UX Design Fundamentals" → "uiux-design-fundamentals"
   */
  public generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };
}

export const utils = new Utils();
