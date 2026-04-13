import type { AuthUser } from "@/types/auth.types.js";
import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
  user?: AuthUser | null;
  requestId?: string;
  ip?: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();

export const runWithContext = <T>(
  context: RequestContext,
  callback: () => T,
): T => {
  return requestContext.run(context, callback);
};

export const getCurrentUser = () => {
  const context = requestContext.getStore();
  if (!context?.user) {
    throw new Error("No user in current context");
  }
  return context.user;
};

export const getCurrentUserId = (): number => {
  return getCurrentUser().id;
};

export const getRequestContext = () => {
  const context = requestContext.getStore();
  if (!context) {
    throw new Error("No request context found");
  }
  return context;
};

export const getCurrentUserRole = (): string => {
  return getCurrentUser().role;
};

export const isAuthenticated = (): boolean => {
  try {
    getCurrentUser();
    return true;
  } catch {
    return false;
  }
};

export const isAdmin = (): boolean => {
  try {
    return getCurrentUser().role === "ADMIN";
  } catch {
    return false;
  }
};
