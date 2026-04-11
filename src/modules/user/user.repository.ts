// src/repositories/user.repository.ts
import { prisma } from "@/config/prisma.js";
import { BaseRepository } from "../core/base.repository.js";
import { AppError } from "@/utils/errors.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(prisma.user);
  }

  async create(userData: any) {
    const isUserExisting = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (isUserExisting) {
      throw new AppError("User with this email already exists", 409);
    }

    return await super.create(userData);
  }

  async findByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  }
}

export const userRepository = new UserRepository();
