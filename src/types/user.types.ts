import type { User as PrismaUser } from "@/generated/prisma/client.js";

export type SafeUser = Omit<PrismaUser, "password">;

export interface CreateUserDTO {
  name: string;
  email: string;
  password?: string; 
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
}
