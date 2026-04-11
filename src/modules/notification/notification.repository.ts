import { prisma } from "@/config/prisma.js";
import { BaseRepository } from "@/modules/core/base.repository.js";
import { Prisma } from "@/generated/prisma/client.js";
import type { Notification } from "@/generated/prisma/client.js";
import { AppError } from "@/utils/errors.js";
import type {
  CreateNotificationDTO,
  NotificationQueryParams,
  NotificationStats,
} from "@/types/notification.types.js";

class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super(prisma.notification);
  }

  async create(data: CreateNotificationDTO): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        senderId: data.senderId,
        category: data.category,
        label: data.label,
        title: data.title,
        content: data.content,
        metadata: data.metadata || Prisma.JsonNull,
        priority: data.priority || "MEDIUM",
        actionUrl: data.actionUrl,
        imageUrl: data.imageUrl,
        expiresAt: data.expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return notification;
  }

  async createMany(notifications: CreateNotificationDTO[]): Promise<number> {
    const result = await prisma.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        senderId: n.senderId,
        category: n.category,
        label: n.label,
        title: n.title,
        content: n.content,
        metadata: n.metadata || Prisma.JsonNull,
        priority: n.priority || "MEDIUM",
        actionUrl: n.actionUrl,
        imageUrl: n.imageUrl,
        expiresAt: n.expiresAt,
      })),
    });
    return result.count;
  }

  async findByUser(
    userId: number,
    params: NotificationQueryParams,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const {
      category,
      isRead,
      isArchived,
      priority,
      page = 1,
      limit = 20,
      search,
    } = params;
    const skip = (page - 1) * limit;

    const takeLimit = typeof limit === "string" ? parseInt(limit, 10) : limit;

    const where: any = { userId };

    if (category) where.category = category;
    if (isRead !== undefined) where.isRead = isRead;
    if (isArchived !== undefined) where.isArchived = isArchived;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { label: { contains: search, mode: "insensitive" } },
      ];
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: takeLimit, // Use the parsed number
        orderBy: { createdAt: "desc" },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  }

  async findUnreadByUser(
    userId: number,
    limit: number = 10,
  ): Promise<Notification[]> {
    return await prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
        isArchived: false,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: number): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return result.count;
  }

  async archive(id: number, userId: number): Promise<Notification> {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return await prisma.notification.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async deleteByUser(id: number, userId: number): Promise<Notification> {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return await prisma.notification.delete({ where: { id } });
  }

  async deleteOldNotifications(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true,
        isArchived: true,
      },
    });
    return result.count;
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await prisma.notification.count({
      where: { userId, isRead: false, isArchived: false },
    });
  }

  async getStats(userId: number): Promise<NotificationStats> {
    const [total, unread, byCategory] = await Promise.all([
      prisma.notification.count({ where: { userId, isArchived: false } }),
      prisma.notification.count({
        where: { userId, isRead: false, isArchived: false },
      }),
      prisma.notification.groupBy({
        by: ["category"],
        where: { userId, isArchived: false },
        _count: true,
      }),
    ]);

    const categoryMap: Record<string, number> = {};
    byCategory.forEach((item: { category: string; _count: number }) => {
      categoryMap[item.category] = item._count;
    });

    return { total, unread, byCategory: categoryMap };
  }

  async shouldSend(userId: number, category: string): Promise<boolean> {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) return true;

    const disabledCategories = prefs.disabledCategories as string[];
    return !disabledCategories.includes(category);
  }
}

export const notificationRepository = new NotificationRepository();
