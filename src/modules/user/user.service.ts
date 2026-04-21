import { userRepository } from "@/modules/user/user.repository.js";
import { type CreateUserDTO, type UpdateUserDTO } from "@/types/user.types.js";
import { logService } from "@/modules/log/log.service.js";
import { AppError } from "@/utils/errors.js";
import { getCurrentUserId, getCurrentUser } from "@/context/request.context.js";
import { sendEmail } from "../mail/mail.utils.js";
import { sendWelcomeEmail } from "../mail/email.service.js";

export const userService = {
  createUser: async (userData: CreateUserDTO, req?: any) => {
    const user = await userRepository.create(userData);
    return user;
  },

  getUsers: async (query: any) => {
    return await userRepository.getUsersWithPagination(query);
  },

  getUserById: async (id: number) => {
    const user = await userRepository.getUserWithoutPassword(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  },

  // Get current user's profile using context
  getMyProfile: async () => {
    const userId = getCurrentUserId();
    const user = await userRepository.getUserWithoutPassword(userId);
    
    if (!user) {
      throw new AppError("User not found", 404);
    }

    sendWelcomeEmail(user.email, user.name)
    return user;
  },

  // Update current user's profile
  updateMyProfile: async (updateData: UpdateUserDTO, req?: any) => {
    const userId = getCurrentUserId();
    const user = await userRepository.updateUser(userId, updateData, req);
    return user;
  },

  // Delete current user's account
  deleteMyAccount: async (req?: any) => {
    const userId = getCurrentUserId();
    return await userRepository.deleteUser(userId, req);
  },

  // Check if current user is admin
  isAdmin: () => {
    const user = getCurrentUser();
    return user.role === "ADMIN";
  },
};
