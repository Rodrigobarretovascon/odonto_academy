import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: new URL("../../../.env", import.meta.url).pathname });

const { Pool } = pg;

export const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://gabriela:gabriela_dev@localhost:5433/gabriela_dental",
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  return pool.query<T>(text, params);
}
