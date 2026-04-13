import { PrismaClient } from "@/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
import dotenv from "dotenv";
import { withPulse } from "@prisma/extension-pulse";

dotenv.config();

const { Pool } = pkg;
const databaseUrl = process.env.DATABASE_URL;
const pulseApiKey = process.env.PULSE_API_KEY;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

if (!pulseApiKey) {
  console.warn(
    "⚠️ PULSE_API_KEY is not defined. Pulse features will not work.",
  );
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const adapter = new PrismaPg(pool);

// Create base client with adapter
const basePrisma = new PrismaClient({ adapter });

// Extend with Pulse if API key is available
export const prisma = pulseApiKey
  ? basePrisma.$extends(withPulse({ apiKey: pulseApiKey }))
  : basePrisma;
