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
    const user = await userService.getUserById(
      parseInt(req.params.id as string),
    );

    res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's profile
export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.getMyProfile();

    res.status(200).json({
      message: "Profile retrieved successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update current user's profile
export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.updateMyProfile(req.body, req);

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Delete current user's account
export const deleteMyAccount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await userService.deleteMyAccount(req);

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
