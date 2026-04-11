// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { prisma } from "@/config/prisma.js";
import { AppError } from "@/utils/errors.js";
import type { LoginDTO, RegisterDTO, JwtPayload } from "@/types/auth.types.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-key-change-this";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const authService = {
  register: async (userData: RegisterDTO, req?: any) => {
    // Validate required fields
    if (!userData.email || !userData.password || !userData.name) {
      throw new AppError("Name, email, and password are required", 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    // Hash password (ensure it's a string)
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: "USER",
      },
    });

    // Generate token
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  login: async (credentials: LoginDTO, req?: any) => {
    // Validate required fields
    if (!credentials.email || !credentials.password) {
      throw new AppError("Email and password are required", 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check password (ensure both are strings)
    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isValidPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate token
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  generateToken: (payload: JwtPayload): string => {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign(payload, JWT_SECRET as string, options);
  },

  verifyToken: (token: string): JwtPayload => {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new AppError("Invalid or expired token", 401);
    }
  },
};
