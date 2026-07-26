import bcrypt from "bcryptjs";
import { pool, query } from "./pool.js";

const PRODUCTS = [
  {
    slug: "academia-mensal",
    name: "Academia Gabriela Barreto",
    subtitle: "Assinatura mensal · conteúdo exclusivo",
    description:
      "Acesso completo por 30 dias à plataforma exclusiva: guia de escultura em cera dos 28 dentes, anatomia dental, visualizador 3D, novidades e assistente IA para tirar dúvidas durante a escultura.",
    price_cents: 4990,
    type: "subscription",
    access_days: 30,
    image_url: "/images/shop/academia-mensal.svg",
    badge: "Mais popular",
    featured: true,
    sort_order: 1,
  },
  {
    slug: "kit-escultura",
    name: "Kit Escultura Profissional",
    subtitle: "Material físico + 90 dias de acesso digital",
    description:
      "Kit completo para escultura em cera com blocos calibrados, instrumentos essenciais e guia impresso. Inclui 90 dias de acesso à Academia Gabriela Barreto com todo o conteúdo digital exclusivo.",
    price_cents: 24990,
    type: "physical",
    access_days: 90,
    image_url: "/images/shop/kit-escultura.svg",
    badge: "Completo",
    featured: true,
    sort_order: 2,
  },
];

async function seed() {
  for (const p of PRODUCTS) {
    await query(
      `INSERT INTO products (slug, name, subtitle, description, price_cents, type, access_days, image_url, badge, featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         subtitle = EXCLUDED.subtitle,
         description = EXCLUDED.description,
         price_cents = EXCLUDED.price_cents,
         type = EXCLUDED.type,
         access_days = EXCLUDED.access_days,
         image_url = EXCLUDED.image_url,
         badge = EXCLUDED.badge,
         featured = EXCLUDED.featured,
         sort_order = EXCLUDED.sort_order`,
      [
        p.slug,
        p.name,
        p.subtitle,
        p.description,
        p.price_cents,
        p.type,
        p.access_days,
        p.image_url,
        p.badge,
        p.featured,
        p.sort_order,
      ],
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

  console.log("✓ Produtos e admin criados");
  console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
