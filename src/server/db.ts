import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./db/schema";

import { env } from "@/env";

const createDbClient = () => {
  // Use the standard Node 'pg' client
  const client = new Client({
    connectionString: env.DATABASE_URL, // Use standard DATABASE_URL from Supabase
  });
  // Consider connecting the client here if needed for immediate checks,
  // though Drizzle typically handles connection pooling.
  // await client.connect();

  // Pass the schema and the pg client instance to drizzle
  return drizzle(client, { schema, logger: env.NODE_ENV === "development" });
};

// Define the type for the global object
type GlobalDbClient = {
  db: ReturnType<typeof createDbClient> | undefined;
};

const globalForDb = globalThis as unknown as GlobalDbClient;

// Use the existing global instance or create a new one
export const db = globalForDb.db ?? createDbClient();

// Store the instance in the global object in development
if (env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
