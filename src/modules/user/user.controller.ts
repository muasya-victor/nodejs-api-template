// src/controllers/user.controller.ts
import { type Request, type Response, type NextFunction } from "express";
import { userService } from "@/modules/user/user.service.js";
import { AppError } from "@/utils/errors.js";

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.body.name || !req.body.email) {
      throw new AppError("Name and email are required", 400);
    }

    const user = await userService.createUser(req.body, req);

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Service handles pagination
    const result = await userService.getUsers(req.query);

    res.status(200).json({
      message: "Users retrieved successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.getUserById(parseInt(req.params.id as string));

    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
