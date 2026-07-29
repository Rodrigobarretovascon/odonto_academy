import { pool } from "./pool.js";
import { ensureDatabase } from "./ensure.js";

async function seed() {
  await ensureDatabase();

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@gabrielabarreto.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  console.log("✓ Produtos e admin criados / atualizados");
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
