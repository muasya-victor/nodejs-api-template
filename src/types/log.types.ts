export interface CreateLogDTO {
  level: "DEBUG" | "INFO" | "WARN" | "ERROR" | "CRITICAL";
  action: string;
  message: string;
  userId?: number | null;
  metadata?: Record<string, any> | null;
  ip?: string | null;
  userAgent?: string | null;
}

export interface LogQueryParams {
  level?: string;
  action?: string;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
