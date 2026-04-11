import { Router } from "express";
import {
  createUserController,
  getUsers,
  getUserById,
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
} from "./user.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post("/", createUserController);
router.get("/", getUsers);

router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);
router.delete("/me", authMiddleware, deleteMyAccount);
router.get("/:id", authMiddleware, getUserById);

export default router;
