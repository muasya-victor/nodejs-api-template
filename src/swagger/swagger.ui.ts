import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openApiPath = path.resolve(__dirname, "../../openapi.json");

let swaggerDocument;
try {
  const specContent = fs.readFileSync(openApiPath, "utf8");
  swaggerDocument = JSON.parse(specContent);
  console.log("✅ OpenAPI specification loaded successfully");
} catch (error) {
  console.warn("⚠️ OpenAPI spec not found. Run `npm run docs:generate` first.");
  swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "Node.js CRM API",
      version: "1.0.0",
      description:
        "API documentation (run `npm run docs:generate` to generate full docs)",
    },
    paths: {},
  };
}

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerDocument, {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Node.js CRM API Documentation",
});
