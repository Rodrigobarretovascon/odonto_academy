import { pool } from "./pool";

/**
 * Remove produtos antigos da loja.
 * - Apaga fisicamente ids < 101 (exceto os referenciados por subscriptions)
 * - Desativa (active=false) os que não podem ser apagados
 * Mantém o catálogo Cremer de escultura (id >= 101).
 */
async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const blocked = await client.query<{ product_id: number }>(
      `SELECT DISTINCT product_id FROM subscriptions WHERE product_id < 101`,
    );
    const blockedIds = new Set(blocked.rows.map((r) => r.product_id));

    const old = await client.query<{ id: number; name: string }>(
      `SELECT id, name FROM products WHERE id < 101 ORDER BY id`,
    );

    const toDeactivate = old.rows.filter((r) => blockedIds.has(r.id)).map((r) => r.id);
    const toDelete = old.rows.filter((r) => !blockedIds.has(r.id)).map((r) => r.id);

    console.log("desativar (subscriptions):", toDeactivate);
    console.log("apagar:", toDelete.length);

    if (toDelete.length) {
      // limpa linhas com FK sem CASCADE / RESTRICT
      for (const table of ["order_items", "stock_movements", "inventory_count_lines"]) {
        const exists = await client.query(
          `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
          [table],
        );
        if (!exists.rowCount) continue;
        const del = await client.query(`DELETE FROM ${table} WHERE product_id = ANY($1::int[])`, [
          toDelete,
        ]);
        console.log(`  ${table}:`, del.rowCount);
      }

      const delProducts = await client.query(`DELETE FROM products WHERE id = ANY($1::int[])`, [
        toDelete,
      ]);
      console.log("products apagados:", delProducts.rowCount);
    }

    if (toDeactivate.length) {
      const upd = await client.query(
        `UPDATE products
         SET active = false,
             featured = false,
             name = 'Assinatura Gabriela Barreto Dental (legado)',
             subtitle = 'Plano interno — não exibido na loja',
             description = 'Produto de assinatura legado mantido por histórico de assinantes.',
             image_url = '/images/brand/gbd-logo-mark-light.png'
         WHERE id = ANY($1::int[])`,
        [toDeactivate],
      );
      console.log("products desativados:", upd.rowCount);
    }

    const left = await client.query(
      `SELECT count(*)::int AS n FROM products WHERE active = true AND type = 'physical'`,
    );
    console.log("ativos na loja:", left.rows[0].n);

    await client.query("COMMIT");
    console.log("OK");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
