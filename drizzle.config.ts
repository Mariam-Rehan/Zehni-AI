import { defineConfig } from "drizzle-kit";
import "dotenv/config"; // ✅ Make sure dotenv loads `.env`
import * as dotenv from "dotenv";
dotenv.config(); // Load .env in both dev and render


if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL,
  },
});
