import express, {
  type Request,
  type Response,
  type Application,
  type NextFunction,
} from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import userRoutes from "@/modules/user/user.routes.js";
import authRoutes from "@/modules/auth/auth.routes.js";
import { AppError } from "@/utils/errors.js";
import { errorLoggingMiddleware } from "@/middlewares/error-logging.middleware.js";
import { contextMiddleware } from "./middlewares/context.middleware.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

dotenv.config();

const app: Application = express();

/** Register middlewares */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(authMiddleware);
app.use(contextMiddleware);

/** Generate API path with version */
const generatePathWithVersion = (
  path: string,
  version: string = "v1",
): string => `/api/${version}/${path}`;

/** Register routes */
app.use(generatePathWithVersion("auth"), authRoutes);
app.use(generatePathWithVersion("users"), userRoutes);
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

/** Error handling middleware (always last) */
app.use(errorLoggingMiddleware);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: err.statusCode,
      errorType: err.name,
    });
  }

  if (err.code === "P2002") {
    return res.status(409).json({
      message: "A record with this email already exists",
      status: 409,
      errorType: "ConflictError",
    });
  }

  res.status(500).json({
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
    status: 500,
    errorType: "InternalServerError",
  });
});

export default app;
