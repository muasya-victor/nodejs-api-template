// src/middlewares/context.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { runWithContext } from "@/context/request.context.js";
import { v4 as uuidv4 } from "uuid";

export const contextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    throw new Error("Unauthenticated");
  }

  runWithContext(
    {
      user: req.user,
      requestId: uuidv4(),
    },
    next,
  );
};