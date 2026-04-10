// src/middlewares/error-logging.middleware.ts
import { type Request, type Response, type NextFunction } from "express";
import { logService } from "@/services/log.service.js";

export const errorLoggingMiddleware = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await logService.logEvent({
    level: err.statusCode >= 500 || err.code === "P2002" ? "ERROR" : "WARN",
    action: err.action || "UNHANDLED_ERROR",
    message: err.message,
    userId: (req as any).user?.id || null,
    metadata: {
      statusCode: err.statusCode || 500,
      path: req.path,
      method: req.method,
      ip: req.ip || null,
      stack: err.stack,
      body: req.body,
      query: req.query,
      params: req.params,
      errorCode: err.code,
    },
    ip: req.ip || null,
    userAgent: req.get("user-agent") || null,
  });

  next(err); 
};
