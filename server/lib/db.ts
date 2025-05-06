import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

const client = postgres('postgresql://postgres:1234@localhost:5432/SoulScribe');
export const db = drizzle(client, { schema });
