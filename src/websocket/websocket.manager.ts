import { Server } from "socket.io";
import http from "http";
import { authService } from "@/modules/auth/auth.service.js";
import { prisma } from "@/config/prisma.js";

// Types
interface ConnectedUser {
  socketId: string;
  userId: number;
  deviceId: string;
}

interface TypingData {
  recipientId: number;
}

// Store connections
const activeUsers = new Map<string, ConnectedUser>(); // socketId -> user
const userSockets = new Map<number, Set<string>>(); // userId -> Set of socketIds

let io: Server;

export function initializeWebSocket(server: http.Server): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = authService.verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, role: true },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error("Invalid token"));
    }
  });

  // Connection handler
  io.on("connection", handleConnection);

  return io;
}

function handleConnection(socket: any): void {
  const user = socket.data.user;
  console.log(`User ${user.email} connected with socket ${socket.id}`);

  // Store connection
  storeConnection(socket.id, user.id, socket.handshake.auth.deviceId);

  // Join user room
  socket.join(`user:${user.id}`);

  // Update presence
  updateUserPresence(user.id, "ONLINE", socket.handshake.auth.deviceId);

  // Broadcast online status
  socket.broadcast.emit("user:online", {
    userId: user.id,
    name: user.name,
  });

  // Setup event listeners
  setupEventListeners(socket, user);
}

function storeConnection(
  socketId: string,
  userId: number,
  deviceId: string,
): void {
  activeUsers.set(socketId, { socketId, userId, deviceId });

  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  userSockets.get(userId)!.add(socketId);
}

function removeConnection(socketId: string, userId: number): void {
  activeUsers.delete(socketId);

  const userSocketSet = userSockets.get(userId);
  if (userSocketSet) {
    userSocketSet.delete(socketId);
    if (userSocketSet.size === 0) {
      userSockets.delete(userId);
    }
  }
}

async function updateUserPresence(
  userId: number,
  status: string,
  deviceId?: string,
): Promise<void> {
  try {
    await prisma.userPresence.upsert({
      where: { userId },
      update: {
        status: status as any,
        lastSeen: new Date(),
        currentDevice: deviceId,
      },
      create: {
        userId,
        status: status as any,
        currentDevice: deviceId,
      },
    });
  } catch (error) {
    console.error("Failed to update presence:", error);
  }
}

function setupEventListeners(socket: any, user: any): void {
  // Ping/Pong for connection health
  socket.on("ping", () => {
    socket.emit("pong");
  });

  // Typing indicators
  socket.on("typing:start", (data: TypingData) => {
    socket.to(`user:${data.recipientId}`).emit("typing:start", {
      userId: user.id,
      name: user.name,
    });
  });

  socket.on("typing:stop", (data: TypingData) => {
    socket.to(`user:${data.recipientId}`).emit("typing:stop", {
      userId: user.id,
      name: user.name,
    });
  });

  // Mark notification as read
  socket.on("notification:read", async (data: { notificationId: number }) => {
    try {
      await prisma.notification.update({
        where: { id: data.notificationId },
        data: { isRead: true, readAt: new Date() },
      });

      await prisma.notificationReceipt.create({
        data: {
          notificationId: data.notificationId,
          userId: user.id,
          readAt: new Date(),
          deviceId: socket.handshake.auth.deviceId,
        },
      });

      socket.emit("notification:read:ack", { success: true });
    } catch (error) {
      socket.emit("notification:read:ack", { success: false });
    }
  });

  // Disconnect
  socket.on("disconnect", async () => {
    console.log(`User ${user.email} disconnected`);
    removeConnection(socket.id, user.id);

    if (!userSockets.has(user.id)) {
      await updateUserPresence(user.id, "AWAY");
      socket.broadcast.emit("user:offline", {
        userId: user.id,
        name: user.name,
      });
    }
  });
}

// Export helper functions for use in other parts of your app
export function sendNotificationToUser(
  userId: number,
  event: string,
  data: any,
): void {
  if (!io) {
    console.warn("WebSocket not initialized");
    return;
  }
  io.to(`user:${userId}`).emit(event, data);
}

export function isUserOnline(userId: number): boolean {
  return userSockets.has(userId) && userSockets.get(userId)!.size > 0;
}

export function getOnlineUsers(): ConnectedUser[] {
  return Array.from(activeUsers.values());
}

export function getWebSocketServer(): Server | null {
  return io || null;
}
