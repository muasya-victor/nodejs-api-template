import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/config/prisma.js";
import { AppError } from "@/utils/errors.js";
import type { LoginDTO, RegisterDTO, JwtPayload } from "@/types/auth.types.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "God-ni-msoo";
  
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

export const authService = {
  register: async (userData: RegisterDTO, req?: any) => {
    if (!userData.email || !userData.password || !userData.name) {
      throw new AppError("Name, email, and password are required", 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        role: "USER",
      },
    });

    const userAuth = await prisma.userAuth.create({
      data: {
        user_id: user.id,
        password_hash: hashedPassword,
      },
    });

    // Generate token
    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { user: user, token };
  },

  login: async (credentials: LoginDTO, req?: any) => {
    if (!credentials.email || !credentials.password) {
      throw new AppError("Email and password are required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      include: { userAuth: true },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isValidPassword = await bcrypt.compare(
      credentials.password,
      user.userAuth?.password_hash || "",
    );
    if (!isValidPassword) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = authService.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const {userAuth, ...userWithoutAuth} = user;

    return { user: userWithoutAuth, token };
  },

  generateToken: (payload: JwtPayload): string => {
    const expiresIn = JWT_EXPIRES_IN || "7d";
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
  },

  verifyToken: (token: string): JwtPayload => {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new AppError("Invalid or expired token", 401);
    }
  },
};