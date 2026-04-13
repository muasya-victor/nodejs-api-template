// src/modules/notification/notification.service.ts
import { prisma } from "@/config/prisma.js";
import { notificationRepository } from "./notification.repository.js";
import { sendNotificationToUser } from "@/websocket/index.js";
import { logService } from "@/modules/log/log.service.js";
import type {
  CreateNotificationDTO,
  NotificationQueryParams,
} from "@/types/notification.types.js";
import type { Notification } from "@/generated/prisma/client.js";
import { getCurrentUser } from "@/context/request.context.js";

export const notificationService = {
  async createAndNotify(
    data: CreateNotificationDTO,
    req?: any,
  ): Promise<Notification> {
    const shouldSend = await notificationRepository.shouldSend(
      data.userId,
      data.category,
    );

    if (!shouldSend) {
      await logService.logEvent({
        level: "INFO",
        action: "NOTIFICATION_SUPPRESSED",
        message: `User ${data.userId} opted out of ${data.category} notifications`,
        userId: data.userId,
        metadata: { category: data.category, notificationLabel: data.label },
        ip: req?.ip,
        userAgent: req?.get?.("user-agent"),
      });

      return await notificationRepository.create(data);
    }

    const notification = await notificationRepository.create(data);

    sendNotificationToUser(data.userId, "notification:new", {
      id: notification.id,
      title: notification.title,
      content: notification.content,
      category: notification.category,
      label: notification.label,
      priority: notification.priority,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    });

    await logService.logEvent({
      level: "INFO",
      action: "NOTIFICATION_SENT",
      message: `Notification sent to user ${data.userId}`,
      userId: data.userId,
      metadata: {
        notificationId: notification.id,
        category: data.category,
        label: data.label,
      },
      ip: req?.ip,
      userAgent: req?.get?.("user-agent"),
    });

    return notification;
  },

  async bulkCreateAndNotify(
    notifications: CreateNotificationDTO[],
    req?: any,
  ): Promise<number> {
    let count = 0;
    for (const notification of notifications) {
      await this.createAndNotify(notification, req);
      count++;
    }
    return count;
  },

  async getNotifications(userId: number, query: NotificationQueryParams) {
    return await notificationRepository.findByUser(userId, query);
  },

  async getUnreadNotifications(userId: number, limit?: number) {
    return await notificationRepository.findUnreadByUser(userId, limit);
  },

  async getUnreadCount(userId: number): Promise<number> {
    return await notificationRepository.getUnreadCount(userId);
  },

  async getStats(userId: number) {
    return await notificationRepository.getStats(userId);
  },

  async markAsRead(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    const notification = await notificationRepository.markAsRead(
      notificationId,
      userId,
    );

    if (notification.senderId) {
      sendNotificationToUser(
        notification.senderId,
        "notification:read:receipt",
        {
          notificationId: notification.id,
          userId: userId,
          readAt: new Date(),
        },
      );
    }

    return notification;
  },

  async markAllAsRead(userId: number): Promise<number> {
    return await notificationRepository.markAllAsRead(userId);
  },

  async archiveNotification(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    return await notificationRepository.archive(notificationId, userId);
  },

  async deleteNotification(
    notificationId: number,
    userId: number,
  ): Promise<Notification> {
    return await notificationRepository.deleteByUser(notificationId, userId);
  },

  async cleanupOldNotifications(daysToKeep: number = 30): Promise<number> {
    return await notificationRepository.deleteOldNotifications(daysToKeep);
  },

  async getUserPreferences(userId: number) {
    return await prisma.notificationPreference.findUnique({
      where: { userId },
    });
  },

  async updateUserPreferences(
    userId: number,
    data: {
      disabledCategories?: string[];
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      inAppEnabled?: boolean;
    },
  ) {
    return await prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        disabledCategories: data.disabledCategories || [],
        emailEnabled: data.emailEnabled ?? true,
        pushEnabled: data.pushEnabled ?? true,
        inAppEnabled: data.inAppEnabled ?? true,
      },
    });
  },
};
