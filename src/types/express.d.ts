import type { AuthUser } from "@/types/auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
