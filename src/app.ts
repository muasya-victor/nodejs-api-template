import express, {
  type Request,
  type Response,
  type Application,
  type NextFunction,
} from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import userRoutes from "@/routes/user.routes.js";
import { AppError } from "@/utils/errors.js";
import { logService } from "@/services/log.service.js";
import { errorLoggingMiddleware } from "@/middlewares/error-logging.middleware.js";


dotenv.config();

const app: Application = express();

/** Register middlewares */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



/** Generate API path with version */
const generatePathWithVersion = (
  path: string,
  version: string = "v1",
): string => `/api/${version}/${path}`;


/** Register routes */
app.use(generatePathWithVersion("users"), userRoutes);


/** Error handling middleware */
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
    message: process.env.NODE_ENV === "development"
      ? err.message
      : "Internal server error",
    status: 500,
    errorType: "InternalServerError",
  });
});

export default app;
