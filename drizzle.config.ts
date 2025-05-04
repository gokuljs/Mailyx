import { defineConfig } from "drizzle-kit";
import { env } from "./src/env"; // Assuming your env setup is here

if (!env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required.");
}

export default defineConfig({
  schema: "./src/server/db/schema/index.ts",
  out: "./drizzle", // Directory to output migration files
  dialect: "postgresql", // Specify the dialect
  dbCredentials: {
    url: env.DATABASE_URL, // Standard URL for PostgreSQL
  },
  verbose: true, // Enable verbose logging for debugging
  strict: true, // Enable strict mode for more checks
});
