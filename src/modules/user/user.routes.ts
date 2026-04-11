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

/*
  #swagger.tags = ['Users']
*/

/**
 * Create user
 */
router.post(
  "/",
  createUserController,
  /*
    #swagger.path = '/api/v1/users'
    #swagger.summary = 'Create user'

    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'strongpassword123'
      }
    }
  */
);

/**
 * Get all users
 */
router.get(
  "/",
  getUsers,
  /*
    #swagger.path = '/api/v1/users'
    #swagger.summary = 'Get all users'
  */
);

/**
 * Get my profile
 */
router.get(
  "/me",
  authMiddleware,
  getMyProfile,
  /*
    #swagger.path = '/api/v1/users/me'
    #swagger.summary = 'Get my profile'
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);

/**
 * Update my profile
 */
router.put(
  "/me",
  authMiddleware,
  updateMyProfile,
  /*
    #swagger.path = '/api/v1/users/me'
    #swagger.summary = 'Update my profile'

    #swagger.security = [{
      "bearerAuth": []
    }]

    #swagger.parameters['body'] = {
      in: 'body',
      schema: {
        name: 'Updated Name'
      }
    }
  */
);

/**
 * Delete my account
 */
router.delete(
  "/me",
  authMiddleware,
  deleteMyAccount,
  /*
    #swagger.path = '/api/v1/users/me'
    #swagger.summary = 'Delete my account'
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);

/**
 * Get user by ID
 */
router.get(
  "/:id",
  authMiddleware,
  getUserById,
  /*
    #swagger.path = '/api/v1/users/:id'
    #swagger.summary = 'Get user by ID'
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);

export default router;
