// src/repositories/log.repository.ts
import { prisma } from "@/config/prisma.js";
import { type CreateLogDTO, type LogQueryParams } from "@/types/log.types.js";
import { Prisma } from "@/generated/prisma/client.js";

export const logRepository = {
  create: async (logData: CreateLogDTO) => {
    try {
      const log = await prisma.log.create({
        data: {
          level: logData.level,
          action: logData.action,
          message: logData.message,
          userId: logData.userId || null,
          metadata: logData.metadata || Prisma.JsonNull,
          ip: logData.ip || null,
          userAgent: logData.userAgent || null,
        },
        include: {
          user: true,
        },
      });
      return log;
    } catch (error) {
      console.error("Failed to create log entry:", error);
      throw error;
    }
  },

  createMany: async (logs: CreateLogDTO[]) => {
    try {
      const result = await prisma.log.createMany({
        data: logs.map((log) => ({
          level: log.level,
          action: log.action,
          message: log.message,
          userId: log.userId || null,
          metadata: log.metadata || Prisma.JsonNull,
          ip: log.ip || null,
          userAgent: log.userAgent || null,
        })),
      });

      console.log(`Created ${result.count} log entries`);
      return result;
    } catch (error) {
      console.error("Failed to create batch logs:", error);
      throw error;
    }
  },

  findAll: async (params: LogQueryParams) => {
    try {
      const {
        level,
        action,
        userId,
        startDate,
        endDate,
        page = 1,
        limit = 50,
      } = params;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (level) where.level = level;
      if (action) where.action = action;
      if (userId) where.userId = userId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      const [logs, total] = await Promise.all([
        prisma.log.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        prisma.log.count({ where }),
      ]);

      return {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error("Error finding logs:", error);
      throw error;
    }
  },

  findByUserId: async (
    userId: number,
    page: number = 1,
    limit: number = 50,
  ) => {
    try {
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.log.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.log.count({ where: { userId } }),
      ]);

      return { logs, total, page, limit };
    } catch (error) {
      console.error("Error finding logs by user:", error);
      throw error;
    }
  },

  findByAction: async (
    action: string,
    page: number = 1,
    limit: number = 50,
  ) => {
    try {
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.log.findMany({
          where: { action },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.log.count({ where: { action } }),
      ]);

      return { logs, total, page, limit };
    } catch (error) {
      console.error(`Error finding logs for action ${action}:`, error);
      throw error;
    }
  },

  deleteOldLogs: async (daysToKeep: number = 90) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await prisma.log.deleteMany({
        where: {
          createdAt: { lt: cutoffDate },
          level: { not: "CRITICAL" },
        },
      });

      console.log(`Deleted ${result.count} old log entries`);
      return result.count;
    } catch (error) {
      console.error("Error deleting old logs:", error);
      throw error;
    }
  },
};
