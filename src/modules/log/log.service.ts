// src/services/log.service.ts
import { logRepository } from "@/modules/log/log.repository.js";
import { type CreateLogDTO, type LogQueryParams } from "@/types/log.types.js";

export const logService = {
  logEvent: async (logData: CreateLogDTO) => {
    const dbLog = await logRepository.create(logData);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[${logData.level}] ${logData.action}: ${logData.message}`);
    }

    return dbLog;
  },

  logUserAction: async (params: {
    userId: number | null;
    action: string;
    message: string;
    metadata?: Record<string, any>;
    req?: any;
  }) => {
    return await logService.logEvent({
      level: "INFO",
      action: params.action,
      message: params.message,
      userId: params.userId,
      metadata: params.metadata || null,
      ip: params.req?.ip || null,
      userAgent: params.req?.get?.("user-agent") || null,
    });
  },

  logError: async (params: {
    error: Error;
    action: string;
    userId?: number | null;
    metadata?: Record<string, any>;
    req?: any;
  }) => {
    return await logService.logEvent({
      level: "ERROR",
      action: params.action,
      message: params.error.message,
      userId: params.userId || null,
      metadata: params.metadata
        ? {
            ...params.metadata,
            stack: params.error.stack,
          }
        : { stack: params.error.stack },
      ip: params.req?.ip || null,
      userAgent: params.req?.get?.("user-agent") || null,
    });
  },

  getLogs: async (params: LogQueryParams) => {
    return await logRepository.findAll(params);
  },

  getUserActivity: async (
    userId: number,
    page: number = 1,
    limit: number = 50,
  ) => {
    return await logRepository.findByUserId(userId, page, limit);
  },

  cleanupOldLogs: async (daysToKeep: number = 90) => {
    return await logRepository.deleteOldLogs(daysToKeep);
  },
};
