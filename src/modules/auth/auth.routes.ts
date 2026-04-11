import { Router } from "express";
import {
  registerController,
  loginController,
  getCurrentUserController,
} from "./auth.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authMiddleware, getCurrentUserController);

export default router;
