import type {
  Notification,
  NotificationCategory,
  NotificationPriority,
} from "@/generated/prisma/client.js";

export interface CreateNotificationDTO {
  userId: number;
  senderId?: number;
  category: NotificationCategory;
  label: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  priority?: NotificationPriority;
  actionUrl?: string;
  imageUrl?: string;
  expiresAt?: Date;
}

export interface UpdateNotificationDTO {
  isRead?: boolean;
  isArchived?: boolean;
}

export interface NotificationQueryParams {
  userId?: number;
  category?: NotificationCategory;
  isRead?: boolean;
  isArchived?: boolean;
  priority?: NotificationPriority;
  page?: number;
  limit?: number;
  search?: string;
}

export interface NotificationResponse {
  id: number;
  userId: number;
  senderId?: number;
  category: NotificationCategory;
  label: string;
  title: string;
  content: string;
  metadata?: any;
  isRead: boolean;
  isDelivered: boolean;
  priority: NotificationPriority;
  createdAt: Date;
  readAt?: Date;
  deliveredAt?: Date;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
}
