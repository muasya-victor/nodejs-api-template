import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";

export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, token } = await authService.register(req.body, req);

    res.status(201).json({
      message: "Registration successful",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user, token } = await authService.login(req.body, req);

    res.status(200).json({
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).json({
      message: "Current user retrieved",
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
