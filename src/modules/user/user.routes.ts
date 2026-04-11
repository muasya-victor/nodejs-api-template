// src/routes/user.routes.ts
import { Router } from "express";
import {
  createUserController,
  getUsers,
  getUserById,
} from "@/modules/user/user.controller.js";

const router = Router();

router.get("/", getUsers); 
router.get("/:id", getUserById); 
router.post("/", createUserController);

export default router;
