import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js CRM API",
      version: "1.0.0",
      description: "Production-ready REST API",
    },
    servers: [
      {
        url: "http://localhost:4000/api/v1",
      },
    ],
  },
  apis: ["./src/modules/**/*.ts"],
};

export const specs = swaggerJsdoc(options);
