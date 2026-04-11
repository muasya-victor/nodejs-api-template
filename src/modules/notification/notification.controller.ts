// src/modules/notification/notification.controller.ts
import type { Request, Response, NextFunction } from "express";
import { notificationService } from "./notification.service.js";
import { getCurrentUserId } from "@/context/request.context.js";
import { AppError } from "@/utils/errors.js";

export const createNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const notification = await notificationService.createAndNotify(
      req.body,
      req,
    );
    res.status(201).json({
      success: true,
      message: "Notification created and sent",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId();
    const result = await notificationService.getNotifications(
      userId,
      req.query,
    );
    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        total: result.total,
        totalPages: Math.ceil(
          result.total /
            (req.query.limit ? parseInt(req.query.limit as string) : 20),
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId();
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : undefined;
    const notifications = await notificationService.getUnreadNotifications(
      userId,
      limit,
    );
    res.status(200).json({
      success: true,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId();
    const count = await notificationService.getUnreadCount(userId);
    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId();
    const stats = await notificationService.getStats(userId);
    res.status(200).json({
      success: true,
      total: stats.total,
      unread: stats.unread,
      byCategory: stats.byCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId();
    const notificationId = req.params.id ? parseInt(req.params.id as string) : NaN;

    if (isNaN(notificationId)) {
      throw new AppError("Invalid notification ID", 400);
    }

    const notification = await notificationService.markAsRead(
      notificationId,
      userId,
    );
    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId();
    const count = await notificationService.markAllAsRead(userId);
    res.status(200).json({
      success: true,
      message: `${count} notification${count !== 1 ? "s" : ""} marked as read`,
      count,
    });
  } catch (error) {
    next(error);
  }
};

export const archiveNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId();
    const notificationId = req.params.id ? parseInt(req.params.id as string) : NaN;

    if (isNaN(notificationId)) {
      throw new AppError("Invalid notification ID", 400);
    }

    const notification = await notificationService.archiveNotification(
      notificationId,
      userId,
    );
    res.status(200).json({
      success: true,
      message: "Notification archived",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId();
    const notificationId = req.params.id ? parseInt(req.params.id as string) : NaN;

    if (isNaN(notificationId)) {
      throw new AppError("Invalid notification ID", 400);
    }

    await notificationService.deleteNotification(notificationId, userId);
    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const getPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId();
    const preferences = await notificationService.getUserPreferences(userId);
    res.status(200).json({
      success: true,
      data: preferences || {
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        disabledCategories: [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = getCurrentUserId();
    const preferences = await notificationService.updateUserPreferences(
      userId,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: "Preferences updated",
      data: preferences,
    });
  } catch (error) {
    next(error);
  }
};
