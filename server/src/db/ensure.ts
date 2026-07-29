import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { query } from "./pool.js";
import { migrateSchema } from "./migrate.js";
import { upsertInventory, upsertPrice } from "../services/stock.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PRODUCTS = [
  {
    code: "GB-00001",
    slug: "academia-mensal",
    name: "Academia Gabriela Barreto",
    subtitle: "Assinatura mensal · conteúdo exclusivo",
    description:
      "Acesso completo por 30 dias à plataforma exclusiva: guia de escultura em cera dos 28 dentes, anatomia dental, visualizador 3D, novidades e assistente IA.",
    price_cents: 4990,
    type: "subscription",
    access_days: 30,
    image_url: "/images/shop/academia-mensal.svg",
    badge: "Mais popular",
    featured: true,
    sort_order: 1,
    stock_qty: null as number | null,
    characteristics: ["Acesso digital", "28 dentes", "Atlas anatômico", "Assistente IA"],
    applications: ["Estudo", "Escultura em cera", "Treino clínico"],
  },
  {
    code: "GB-00002",
    slug: "kit-escultura",
    name: "Kit Escultura Profissional",
    subtitle: "Material físico + 90 dias de acesso digital",
    description:
      "Kit completo para escultura em cera com blocos calibrados, instrumentos essenciais e guia impresso. Inclui 90 dias de acesso à Academia.",
    price_cents: 24990,
    type: "physical",
    access_days: 90,
    image_url: "/images/shop/kit-escultura.svg",
    badge: "Completo",
    featured: true,
    sort_order: 2,
    stock_qty: 20 as number | null,
    characteristics: ["Blocos de cera", "Instrumentos", "Guia impresso", "90 dias digitais"],
    applications: ["Escultura prática", "Curso presencial", "Estudo em casa"],
  },
];

export async function ensureDatabase() {
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  await query(schema);
  await migrateSchema();

  for (const p of PRODUCTS) {
    const result = await query<{ id: number }>(
      `INSERT INTO products (
         code, slug, name, subtitle, description, type, access_days, image_url, badge,
         featured, sort_order, characteristics, applications
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         subtitle = EXCLUDED.subtitle,
         description = EXCLUDED.description,
         type = EXCLUDED.type,
         access_days = EXCLUDED.access_days,
         image_url = EXCLUDED.image_url,
         badge = EXCLUDED.badge,
         featured = EXCLUDED.featured,
         sort_order = EXCLUDED.sort_order,
         characteristics = EXCLUDED.characteristics,
         applications = EXCLUDED.applications,
         updated_at = NOW()
       RETURNING id`,
      [
        p.code,
        p.slug,
        p.name,
        p.subtitle,
        p.description,
        p.type,
        p.access_days,
        p.image_url,
        p.badge,
        p.featured,
        p.sort_order,
        p.characteristics,
        p.applications,
      ],
    );
    const id = result.rows[0].id;
    await upsertPrice(id, p.price_cents, null);
    await upsertInventory(id, p.stock_qty);
  }

  await query(`
    SELECT setval(
      'product_code_seq',
      GREATEST(
        COALESCE((
          SELECT MAX(NULLIF(regexp_replace(code, '\\D', '', 'g'), '')::int)
          FROM products
        ), 0),
        1
      ),
      true
    )
  `);

  const kit = await query<{ id: number }>(`SELECT id FROM products WHERE slug = 'kit-escultura'`);
  if (kit.rows[0]) {
    await query(
      `INSERT INTO product_volume_prices (product_id, min_qty, unit_price_cents) VALUES ($1, 3, 22990)
       ON CONFLICT (product_id, min_qty) DO UPDATE SET unit_price_cents = EXCLUDED.unit_price_cents`,
      [kit.rows[0].id],
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@gabrielabarreto.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(adminPassword, 10);

  await query(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'`,
    [adminEmail, hash, "Gabriela Barreto"],
  );
}
