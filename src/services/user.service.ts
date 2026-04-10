// src/services/user.service.ts
import { userRepository } from "@/repositories/user.repository.js";
import { type CreateUserDTO } from "@/types/user.js";
import { logService } from "@/services/log.service.js";
import { AppError } from "@/utils/errors.js";

export const userService = {
  createUser: async (userData: CreateUserDTO, req?: any) => {
    const user = await userRepository.create(userData);

    // Log the action
    await logService.logUserAction({
      userId: user.id,
      action: "USER_CREATED",
      message: `User ${user.email} created`,
      metadata: {
        userId: user.id,
        path: req.path,
        method: req.method,
        ip: req.ip || null,
      },
      req,
    });

    return user;
  },

  getUsers: async (query: any) => {
    const result = await userRepository.paginate(query);
    return result;
  },

  getUserById: async (id: number) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  },
};
