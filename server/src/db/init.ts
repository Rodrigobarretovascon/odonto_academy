import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { pool } from "./pool.js";
import { migrateSchema } from "./migrate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function init() {
  // Tabelas base (IF NOT EXISTS — não altera colunas em tabelas já existentes)
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  await pool.query(schema);
  // Colunas/tabelas novas + índices dependentes
  await migrateSchema();
  console.log("✓ Schema aplicado");
  await pool.end();
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
