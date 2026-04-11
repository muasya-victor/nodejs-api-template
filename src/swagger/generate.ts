import swaggerAutogen from "swagger-autogen";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const doc = {
  info: {
    title: "Node.js CRM API",
    description:
      "Production-ready REST API with authentication, pagination, logging, and error handling",
    version: "1.0.0",
    contact: {
      name: "Victor Muasya",
      email: "victor.m.muasya@gmail.com",
    },
  },
  host: "localhost:4000",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      description: "Enter your bearer token. Example: Bearer <token>",
    },
  },
  security: [{ bearerAuth: [] }],
  tags: [
    { name: "Auth", description: "Authentication endpoints" },
    { name: "Users", description: "User management endpoints" },
  ],
};

const outputFile = path.join(process.cwd(), "openapi.json");
const endpointsFiles = [
  path.join(process.cwd(), "src/modules/auth/auth.routes.ts"),
  path.join(process.cwd(), "src/modules/user/user.routes.ts"),
];

// Generate swagger.json
swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger documentation generated successfully at", outputFile);
});
