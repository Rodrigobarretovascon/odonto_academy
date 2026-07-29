import { query } from "./pool.js";
import { nextProductCode, slugify, migrateSchema } from "./migrate.js";
import { upsertInventory, upsertPrice } from "../services/stock.js";

async function main() {
  await migrateSchema();

  const terus = await query<{ id: number }>(
    `SELECT id FROM customers WHERE name ILIKE '%TERUS%' ORDER BY id LIMIT 1`,
  );
  const terusId = terus.rows[0]?.id ?? null;
  console.log("Terus customer", terusId);

  const products = [
    {
      slug: "cera-escultura-polidental",
      name: "Cera para Escultura Polidental",
      subtitle: "72g · 10 blocos · POLIDENTAL",
      description:
        "Cera para escultura com excelente maleabilidade e consistência ideal. Fácil de esculpir, ótima estabilidade e alta qualidade. Embalagem com 72g (10 blocos).",
      price_cents: 2600,
      badge: "Polidental",
      characteristics: ["Fácil de esculpir", "Ótima estabilidade", "Alta qualidade", "72g (10 blocos)"],
      applications: ["Escultura em cera", "Laboratório", "Acabamento"],
      image_url: "/uploads/products/cera-polidental.jpg",
      sort_order: 20,
      stock_qty: 50,
    },
    {
      slug: "cera-escultura-lysanda",
      name: "Cera para Escultura Lysanda",
      subtitle: "72g · 10 blocos · LYSANDA",
      description:
        "Cera indicada para escultura odontológica. Derretimento uniforme, alta resistência e fácil de esculpir. Embalagem com 72g (10 blocos).",
      price_cents: 2600,
      badge: "Lysanda",
      characteristics: ["Derretimento uniforme", "Alta resistência", "Fácil de esculpir", "72g (10 blocos)"],
      applications: ["Escultura odontológica", "Laboratório", "Estudo"],
      image_url: "/uploads/products/cera-lysanda.jpg",
      sort_order: 21,
      stock_qty: 50,
    },
    {
      slug: "lecron-numero-1-golgran",
      name: "Lecron Número 1 Golgran",
      subtitle: "Espátula para cera · GOLGRAN",
      description:
        "Espátula para manipulação de cera e acabamento. Aço inoxidável, alta durabilidade e precisão no manuseio.",
      price_cents: 1990,
      badge: "Golgran",
      characteristics: ["Aço inoxidável", "Alta durabilidade", "Precisão no manuseio"],
      applications: ["Manipulação de cera", "Acabamento", "Escultura"],
      image_url: "/uploads/products/lecron-golgran.jpg",
      sort_order: 22,
      stock_qty: 40,
    },
  ];

  for (const p of products) {
    const existing = await query<{ id: number }>(`SELECT id FROM products WHERE slug = $1`, [p.slug]);
    let id: number;
    if (existing.rows[0]) {
      id = existing.rows[0].id;
      await query(
        `UPDATE products SET
           name=$2, subtitle=$3, description=$4, type='physical', access_days=0,
           image_url=$5, badge=$6, featured=true, sort_order=$7,
           characteristics=$8, applications=$9, active=true, updated_at=NOW()
         WHERE id=$1`,
        [
          id,
          p.name,
          p.subtitle,
          p.description,
          p.image_url,
          p.badge,
          p.sort_order,
          p.characteristics,
          p.applications,
        ],
      );
      console.log("~ product", p.slug);
    } else {
      const code = await nextProductCode();
      const inserted = await query<{ id: number }>(
        `INSERT INTO products (
           code, slug, name, subtitle, description, type, access_days, image_url, badge,
           featured, sort_order, characteristics, applications, active
         ) VALUES ($1,$2,$3,$4,$5,'physical',0,$6,$7,true,$8,$9,$10,true)
         RETURNING id`,
        [
          code,
          slugify(p.slug) || p.slug,
          p.name,
          p.subtitle,
          p.description,
          p.image_url,
          p.badge,
          p.sort_order,
          p.characteristics,
          p.applications,
        ],
      );
      id = inserted.rows[0].id;
      console.log("+ product", p.slug, code);
    }
    await upsertPrice(id, p.price_cents, null);
    await upsertInventory(id, p.stock_qty);
  }

  const bannerTitle = "Terus · Rodrigo Barreto";
  const bannerImage = "/uploads/banners/banner-terus-rb.jpg";
  const existingBanner = await query<{ id: number }>(
    `SELECT id FROM ad_banners WHERE title = $1 LIMIT 1`,
    [bannerTitle],
  );
  if (existingBanner.rows[0]) {
    await query(
      `UPDATE ad_banners SET
         description=$2, image_url=$3, link_url=$4, customer_id=$5,
         cost_per_impression_cents=5, valid_from=CURRENT_DATE,
         valid_until=CURRENT_DATE + INTERVAL '180 days',
         active=true, sort_order=0, updated_at=NOW()
       WHERE id=$1`,
      [
        existingBanner.rows[0].id,
        "Banner Ask Technology · Rodrigo Barreto · Terus.tec",
        bannerImage,
        "https://terus.tec",
        terusId,
      ],
    );
    console.log("~ banner", bannerTitle);
  } else {
    await query(
      `INSERT INTO ad_banners (
         title, description, image_url, link_url, customer_id,
         cost_per_impression_cents, valid_from, valid_until, active, sort_order
       ) VALUES ($1,$2,$3,$4,$5,5,CURRENT_DATE,CURRENT_DATE + INTERVAL '180 days',true,0)`,
      [
        bannerTitle,
        "Banner Ask Technology · Rodrigo Barreto · Terus.tec",
        bannerImage,
        "https://terus.tec",
        terusId,
      ],
    );
    console.log("+ banner", bannerTitle, "customer", terusId);
  }
}

main()
  .then(() => {
    console.log("ok");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
