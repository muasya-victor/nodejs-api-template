import { prisma } from "@/config/prisma.js";
import { BaseRepository } from "@/modules/core/base.repository.js";
import { AppError } from "@/utils/errors.js";
import type { User, Prisma } from "@/generated/prisma/client.js";
import { logService } from "@/modules/log/log.service.js";

class UserRepository extends BaseRepository<User> {
  constructor() {
    super(prisma.user);
  }

  async create(userData: Prisma.UserCreateInput, req?: any): Promise<User> {

    const isUserExisting = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (isUserExisting) {
      await logService.logEvent({
        level: "WARN",
        action: "USER_CREATION_ATTEMPT",
        message: `User with email ${userData.email} already exists`,
        userId: null,
        metadata: {
          attemptedEmail: userData.email,
          existingUserName: isUserExisting.name,
        },
        ip: req?.ip,
        userAgent: req?.get?.("user-agent"),
      });

      throw new AppError("User with this email already exists", 409);
    }

    const user = await super.create(userData);

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.model.findUnique({
      where: { email },
    });
    return user as User | null;
  }

  async findByName(name: string): Promise<User[]> {
    const users = await this.model.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
    });
    return users as User[];
  }

  async updateUser(
    id: number,
    userData: Prisma.UserUpdateInput,
    req?: any,
  ): Promise<User> {
    const existingUser = await this.findById(id);

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    // If email is being changed, check if new email already exists
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await this.findByEmail(userData.email as string);
      
      if (emailExists) {
        throw new AppError("Email already in use by another user", 409);
      }
    }

    const user = await super.update(id, userData);

    // Log update
    await logService.logEvent({
      level: "INFO",
      action: "USER_UPDATED",
      message: `User ${user.email} updated successfully`,
      userId: user.id,
      metadata: { changes: userData },
      ip: req?.ip,
      userAgent: req?.get?.("user-agent"),
    });

    return user;
  }

  async deleteUser(id: number, req?: any): Promise<User> {
    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    const user = await super.delete(id);

    // Log deletion
    await logService.logEvent({
      level: "WARN",
      action: "USER_DELETED",
      message: `User ${user.email} deleted successfully`,
      userId: user.id,
      metadata: { deletedUser: user },
      ip: req?.ip,
      userAgent: req?.get?.("user-agent"),
    });

    return user;
  }

  async getUsersWithPagination(query: any) {
    return await this.paginate(query);
  }
}

export const userRepository = new UserRepository();
