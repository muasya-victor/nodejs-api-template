import { Router } from "express";
import {
  registerController,
  loginController,
  getCurrentUserController,
} from "./auth.controller.js";
import { authMiddleware } from "@/middlewares/auth.middleware.js";

const router = Router();

/*
  #swagger.tags = ['Auth']
*/

/*
  #swagger.tags = ['Auth']
*/

router.post(
  "/register",
  registerController,
  /*
    #swagger.path = '/api/v1/auth/register'

    #swagger.summary = 'Register a new user'

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
 * Login user
 */
router.post(
  "/login",
  loginController,
  /*
    #swagger.path = '/api/v1/auth/login'
    #swagger.summary = 'Login user'
    #swagger.parameters['body'] = {
      in: 'body',
      required: true,
      schema: {
        email: 'john@example.com',
        password: 'strongpassword123'
      }
    }

    #swagger.responses[200] = {
      description: 'Login successful'
    }
  */
);

/**
 * Get current user
 */
router.get(
  "/me",
  authMiddleware,
  getCurrentUserController,
  /*
    #swagger.summary = 'Get current authenticated user'
    #swagger.security = [{
      "bearerAuth": []
    }]
  */
);

export default router;
