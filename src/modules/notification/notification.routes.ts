import { Router } from "express";
import { authMiddleware } from "@/middlewares/auth.middleware.js";
import {
  createNotification,
  getMyNotifications,
  getUnreadNotifications,
  getUnreadCount,
  getNotificationStats,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from "./notification.controller.js";

const router = Router();

/*
  #swagger.tags = ['Notifications']
*/

/**
 * Create and send a notification
 */
router.post(
  "/",
  createNotification,
  /*
    #swagger.path = '/api/v1/notifications'
    #swagger.summary = 'Create and send a notification'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        userId: 1,
        category: 'PAYMENT',
        label: 'payment_success',
        title: 'Payment Received',
        content: 'Your payment of $50.00 was successful',
        metadata: { orderId: 123, amount: 50 },
        priority: 'MEDIUM'
      }
    }
    #swagger.responses[201] = {
      description: 'Notification created and sent'
    }
  */
);

/**
 * Get user's notifications with pagination
 */
router.get(
  "/",
  getMyNotifications,
  /*
    #swagger.path = '/api/v1/notifications'
    #swagger.summary = 'Get user notifications with pagination'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['page'] = {
      in: 'query',
      description: 'Page number',
      type: 'integer',
      default: 1
    }
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Items per page',
      type: 'integer',
      default: 20
    }
    #swagger.parameters['category'] = {
      in: 'query',
      description: 'Filter by category',
      type: 'string',
      enum: ['SYSTEM', 'ACCOUNT', 'PAYMENT', 'REMINDER', 'PROMOTION', 'MESSAGE', 'ALERT']
    }
    #swagger.parameters['isRead'] = {
      in: 'query',
      description: 'Filter by read status',
      type: 'boolean'
    }
    #swagger.responses[200] = {
      description: 'Notifications retrieved'
    }
  */
);

/**
 * Get unread notifications
 */
router.get(
  "/unread",
  getUnreadNotifications,
  /*
    #swagger.path = '/api/v1/notifications/unread'
    #swagger.summary = 'Get unread notifications'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['limit'] = {
      in: 'query',
      description: 'Number of notifications to return',
      type: 'integer',
      default: 10
    }
    #swagger.responses[200] = {
      description: 'Unread notifications retrieved'
    }
  */
);

/**
 * Get unread count
 */
router.get(
  "/unread/count",
  getUnreadCount,
  /*
    #swagger.path = '/api/v1/notifications/unread/count'
    #swagger.summary = 'Get total unread notifications count'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = {
      description: 'Unread count retrieved'
    }
  */
);

/**
 * Get notification statistics
 */
router.get(
  "/stats",
  getNotificationStats,
  /*
    #swagger.path = '/api/v1/notifications/stats'
    #swagger.summary = 'Get notification statistics by category'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = {
      description: 'Statistics retrieved'
    }
  */
);

/**
 * Mark a notification as read
 */
router.patch(
  "/:id/read",
  markAsRead,
  /*
    #swagger.path = '/api/v1/notifications/{id}/read'
    #swagger.summary = 'Mark a notification as read'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Notification ID',
      required: true,
      type: 'integer'
    }
    #swagger.responses[200] = {
      description: 'Notification marked as read'
    }
  */
);

/**
 * Mark all notifications as read
 */
router.patch(
  "/read/all",
  markAllAsRead,
  /*
    #swagger.path = '/api/v1/notifications/read/all'
    #swagger.summary = 'Mark all notifications as read'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = {
      description: 'All notifications marked as read'
    }
  */
);

/**
 * Archive a notification
 */
router.patch(
  "/:id/archive",
  archiveNotification,
  /*
    #swagger.path = '/api/v1/notifications/{id}/archive'
    #swagger.summary = 'Archive a notification'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Notification ID',
      required: true,
      type: 'integer'
    }
    #swagger.responses[200] = {
      description: 'Notification archived'
    }
  */
);

/**
 * Delete a notification
 */
router.delete(
  "/:id",
  deleteNotification,
  /*
    #swagger.path = '/api/v1/notifications/{id}'
    #swagger.summary = 'Delete a notification'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'Notification ID',
      required: true,
      type: 'integer'
    }
    #swagger.responses[200] = {
      description: 'Notification deleted'
    }
  */
);

/**
 * Get user notification preferences
 */
router.get(
  "/preferences",
  getPreferences,
  /*
    #swagger.path = '/api/v1/notifications/preferences'
    #swagger.summary = 'Get user notification preferences'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.responses[200] = {
      description: 'Preferences retrieved'
    }
  */
);

/**
 * Update user notification preferences
 */
router.put(
  "/preferences",
  updatePreferences,
  /*
    #swagger.path = '/api/v1/notifications/preferences'
    #swagger.summary = 'Update user notification preferences'
    #swagger.security = [{ "bearerAuth": [] }]
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        emailEnabled: true,
        pushEnabled: true,
        inAppEnabled: true,
        disabledCategories: ['PROMOTION']
      }
    }
    #swagger.responses[200] = {
      description: 'Preferences updated'
    }
  */
);

export default router;
