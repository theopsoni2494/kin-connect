import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config/env.js";
import * as schema from "./schema.js";

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: config.DATABASE_URL.includes("supabase.co") ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });
