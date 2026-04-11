import type { Request, Response, NextFunction } from "express";
import { runWithContext } from "@/context/request.context.js";
import { v4 as uuidv4 } from "uuid";

export const contextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  runWithContext(
    {
      user: req.user ?? null, 
      requestId: uuidv4(),
    },
    next,
  );
};
