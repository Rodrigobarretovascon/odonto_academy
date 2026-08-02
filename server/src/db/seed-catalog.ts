/**
 * Seed: ~10 produtos odontológicos + banner de materiais (R$ 0,05 / aparição).
 * Mantém Terus ativo; demais banners ficam desativados para incluir depois.
 *
 * Uso: npm run seed:catalog --prefix server
 */
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import dotenv from "dotenv";
import { query } from "./pool.js";
import { migrateSchema, nextProductCode, slugify } from "./migrate.js";
import { upsertInventory, upsertPrice } from "../services/stock.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config();

const ROOT = resolve(__dirname, "../../../public");
const PRODUCTS_DIR = join(ROOT, "uploads/products");
const BANNERS_DIR = join(ROOT, "uploads/banners");

type ProductSeed = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price_cents: number;
  promo_price_cents?: number | null;
  type: string;
  access_days: number;
  badge: string | null;
  featured: boolean;
  sort_order: number;
  stock_qty: number | null;
  characteristics: string[];
  applications: string[];
  imageUrl: string;
  imageFile: string;
};

type BannerSeed = {
  title: string;
  description: string;
  link_url: string | null;
  sort_order: number;
  imageUrl: string;
  imageFile: string;
};

/** Imagens Unsplash (odontologia / equipamentos / brocas) */
const PRODUCTS: ProductSeed[] = [
  {
    slug: "kit-brocas-diamantadas",
    name: "Kit Brocas Diamantadas",
    subtitle: "12 pontas · alta rotação",
    description:
      "Conjunto de brocas diamantadas para preparo cavitário e acabamento. Encaixe FG, esterilizáveis em autoclave.",
    price_cents: 18990,
    type: "physical",
    access_days: 0,
    badge: "Essencial",
    featured: true,
    sort_order: 10,
    stock_qty: 40,
    characteristics: ["12 pontas", "Diamantadas", "FG", "Autoclavável"],
    applications: ["Preparo cavitário", "Acabamento", "Clínica geral"],
    imageUrl: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80",
    imageFile: "kit-brocas-diamantadas.jpg",
  },
  {
    slug: "micromotor-eletrico",
    name: "Micromotor Elétrico",
    subtitle: "Controle de torque · uso clínico",
    description:
      "Micromotor elétrico com pedaleira e controle de velocidade. Ideal para laboratório e clínica de prótese.",
    price_cents: 129900,
    type: "physical",
    access_days: 0,
    badge: "Equipamento",
    featured: true,
    sort_order: 11,
    stock_qty: 8,
    characteristics: ["Elétrico", "Pedaleira", "Torque ajustável"],
    applications: ["Prótese", "Laboratório", "Acabamento"],
    imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=80",
    imageFile: "micromotor-eletrico.jpg",
  },
  {
    slug: "caneta-alta-rotacao",
    name: "Caneta de Alta Rotação",
    subtitle: "Turbina LED · push button",
    description:
      "Peça de mão alta rotação com iluminação LED e sistema push-button para troca rápida de brocas.",
    price_cents: 89900,
    type: "physical",
    access_days: 0,
    badge: null,
    featured: false,
    sort_order: 12,
    stock_qty: 15,
    characteristics: ["LED", "Push button", "Alta rotação"],
    applications: ["Preparos", "Cirurgia", "Clínica"],
    imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80",
    imageFile: "caneta-alta-rotacao.jpg",
  },
  {
    slug: "kit-brocas-carbide",
    name: "Kit Brocas Carbide",
    subtitle: "Corte eficiente · 10 unidades",
    description:
      "Brocas de carboneto de tungstênio para corte rápido em metal, resina e provisórios.",
    price_cents: 14990,
    type: "physical",
    access_days: 0,
    badge: "Novo",
    featured: false,
    sort_order: 13,
    stock_qty: 55,
    characteristics: ["Carbide", "10 un.", "Corte rápido"],
    applications: ["Provisórios", "Ajuste oclusal", "Metal"],
    imageUrl: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=800&q=80",
    imageFile: "kit-brocas-carbide.jpg",
  },
  {
    slug: "contra-angulo-multiplicador",
    name: "Contra-ângulo Multiplicador",
    subtitle: "1:5 · refrigeração interna",
    description:
      "Contra-ângulo multiplicador 1:5 com refrigeração interna, compatível com micromotores elétricos.",
    price_cents: 75900,
    type: "physical",
    access_days: 0,
    badge: null,
    featured: false,
    sort_order: 14,
    stock_qty: 12,
    characteristics: ["1:5", "Refrigeração", "Elétrico"],
    applications: ["Preparo", "Endodontia", "Prótese"],
    imageUrl: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800&q=80",
    imageFile: "contra-angulo.jpg",
  },
  {
    slug: "kit-instrumentos-exame",
    name: "Kit Instrumentos de Exame",
    subtitle: "Espelho, sonda e pinça",
    description:
      "Kit básico de exame clínico em aço inox: espelho bucal, sonda exploradora e pinça clínica.",
    price_cents: 8990,
    type: "physical",
    access_days: 0,
    badge: null,
    featured: false,
    sort_order: 15,
    stock_qty: 80,
    characteristics: ["Aço inox", "3 peças", "Autoclavável"],
    applications: ["Exame clínico", "Consulta", "Estágio"],
    imageUrl: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&q=80",
    imageFile: "kit-exame.jpg",
  },
  {
    slug: "autoclave-banco",
    name: "Autoclave de Bancada",
    subtitle: "12 L · ciclo rápido",
    description:
      "Autoclave de bancada 12 litros com ciclo rápido e painel digital para esterilização de instrumentais.",
    price_cents: 459000,
    type: "physical",
    access_days: 0,
    badge: "Premium",
    featured: true,
    sort_order: 16,
    stock_qty: 3,
    characteristics: ["12 L", "Digital", "Ciclo rápido"],
    applications: ["Esterilização", "Clínica", "Consultório"],
    imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
    imageFile: "autoclave.jpg",
  },
  {
    slug: "sugador-cirurgico",
    name: "Sugador Cirúrgico",
    subtitle: "Alta potência · descartável",
    description:
      "Pontas sugadoras cirúrgicas de alta potência, embalagem estéril individual (pacote com 50).",
    price_cents: 6990,
    type: "physical",
    access_days: 0,
    badge: null,
    featured: false,
    sort_order: 17,
    stock_qty: 120,
    characteristics: ["50 un.", "Estéril", "Alta potência"],
    applications: ["Cirurgia", "Implante", "Exodontia"],
    imageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&q=80",
    imageFile: "sugador.jpg",
  },
  {
    slug: "fotopolimerizador-led",
    name: "Fotopolimerizador LED",
    subtitle: "Luz azul · bateria recarregável",
    description:
      "Fotopolimerizador LED de alta intensidade, sem fio, com bateria recarregável e display digital.",
    price_cents: 54900,
    type: "physical",
    access_days: 0,
    badge: "Mais vendido",
    featured: true,
    sort_order: 18,
    stock_qty: 22,
    characteristics: ["LED", "Sem fio", "Display"],
    applications: ["Resina", "Adesivo", "Restauração"],
    imageUrl: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800&q=80",
    imageFile: "fotopolimerizador.jpg",
  },
  {
    slug: "caixa-esterilizacao",
    name: "Caixa de Esterilização",
    subtitle: "Inox perfurada · organizadora",
    description:
      "Caixa perfurada em aço inox para organização e esterilização de brocas e instrumentais pequenos.",
    price_cents: 12990,
    type: "physical",
    access_days: 0,
    badge: null,
    featured: false,
    sort_order: 19,
    stock_qty: 35,
    characteristics: ["Inox", "Perfurada", "Organização"],
    applications: ["Autoclave", "Brocas", "Instrumentais"],
    imageUrl: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800&q=80",
    imageFile: "caixa-esterilizacao.jpg",
  },
];

const BANNERS: BannerSeed[] = [
  {
    title: "Materiais selecionados",
    description: "para estudantes e profissionais da Odontologia.",
    link_url: "/loja",
    sort_order: 1,
    imageUrl: "",
    imageFile: "banner-materiais-selecionados.jpg",
  },
  {
    title: "A inteligência artificial",
    description: "ao lado da sua jornada na Odontologia.",
    link_url: "/ia",
    sort_order: 2,
    imageUrl: "",
    imageFile: "banner-ia-odontologia.jpg",
  },
  {
    title: "Explore a anatomia dental",
    description: "de forma visual, completa e fácil de compreender.",
    link_url: "/app/anatomia",
    sort_order: 3,
    imageUrl: "",
    imageFile: "banner-anatomia-dental.jpg",
  },
];

async function downloadImage(url: string, dest: string) {
  if (existsSync(dest)) {
    console.log(`  · já existe ${dest}`);
    return;
  }
  const res = await fetch(url, {
    headers: {
      "User-Agent": "GBDentalSeed/1.0",
      Accept: "image/*",
    },
  });
  if (!res.ok || !res.body) {
    throw new Error(`Falha ao baixar ${url}: ${res.status}`);
  }
  // @ts-expect-error Node fetch body is web stream
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  console.log(`  ✓ ${dest}`);
}

async function ensureCustomer() {
  const existing = await query<{ id: number }>(
    `SELECT id FROM customers WHERE document = '00000000000191' LIMIT 1`,
  );
  if (existing.rows[0]) return existing.rows[0].id;
  const inserted = await query<{ id: number }>(
    `INSERT INTO customers (name, email, phone, document, notes, active)
     VALUES ($1,$2,$3,$4,$5,true) RETURNING id`,
    [
      "Dental Media Ads",
      "ads@dentalmedia.example",
      "11999990000",
      "00000000000191",
      "Cliente pagante dos banners seed",
    ],
  );
  return inserted.rows[0].id;
}

async function seedProducts() {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  console.log("\nProdutos odontológicos:");
  for (const p of PRODUCTS) {
    const localPath = join(PRODUCTS_DIR, p.imageFile);
    try {
      await downloadImage(p.imageUrl, localPath);
    } catch (err) {
      console.warn(`  ! imagem ${p.slug}:`, err instanceof Error ? err.message : err);
    }
    const image_url = `/uploads/products/${p.imageFile}`;
    const existing = await query<{ id: number; code: string }>(
      `SELECT id, code FROM products WHERE slug = $1`,
      [p.slug],
    );
    let id: number;
    if (existing.rows[0]) {
      id = existing.rows[0].id;
      await query(
        `UPDATE products SET
           name = $2, subtitle = $3, description = $4, type = $5, access_days = $6,
           image_url = $7, badge = $8, featured = $9, sort_order = $10,
           characteristics = $11, applications = $12, active = true, updated_at = NOW()
         WHERE id = $1`,
        [
          id,
          p.name,
          p.subtitle,
          p.description,
          p.type,
          p.access_days,
          image_url,
          p.badge,
          p.featured,
          p.sort_order,
          p.characteristics,
          p.applications,
        ],
      );
      console.log(`  ~ atualizado ${p.slug}`);
    } else {
      const code = await nextProductCode();
      const inserted = await query<{ id: number }>(
        `INSERT INTO products (
           code, slug, name, subtitle, description, type, access_days, image_url, badge,
           featured, sort_order, characteristics, applications, active
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,true)
         RETURNING id`,
        [
          code,
          slugify(p.slug) || p.slug,
          p.name,
          p.subtitle,
          p.description,
          p.type,
          p.access_days,
          image_url,
          p.badge,
          p.featured,
          p.sort_order,
          p.characteristics,
          p.applications,
        ],
      );
      id = inserted.rows[0].id;
      console.log(`  + criado ${p.slug} (${code})`);
    }
    await upsertPrice(id, p.price_cents, p.promo_price_cents ?? null);
    await upsertInventory(id, p.stock_qty);
  }
}

async function seedBanners(customerId: number) {
  mkdirSync(BANNERS_DIR, { recursive: true });
  console.log("\nBanners (R$ 0,05 / aparição):");
  for (const b of BANNERS) {
    const localPath = join(BANNERS_DIR, b.imageFile);
    if (b.imageUrl) {
      try {
        await downloadImage(b.imageUrl, localPath);
      } catch (err) {
        console.warn(`  ! imagem ${b.title}:`, err instanceof Error ? err.message : err);
      }
    } else if (!existsSync(localPath)) {
      console.warn(`  ! arquivo local ausente: ${localPath}`);
    }
    const image_url = `/uploads/banners/${b.imageFile}`;
    const existing = await query<{ id: number }>(
      `SELECT id FROM ad_banners WHERE title = $1 LIMIT 1`,
      [b.title],
    );
    if (existing.rows[0]) {
      await query(
        `UPDATE ad_banners SET
           description = $2, image_url = $3, link_url = $4, customer_id = $5,
           cost_per_impression_cents = 5, valid_from = CURRENT_DATE,
           valid_until = CURRENT_DATE + INTERVAL '90 days',
           active = true, sort_order = $6, updated_at = NOW()
         WHERE id = $1`,
        [existing.rows[0].id, b.description || null, image_url, b.link_url, customerId, b.sort_order],
      );
      console.log(`  ~ atualizado ${b.title}`);
    } else {
      await query(
        `INSERT INTO ad_banners (
           title, description, image_url, link_url, customer_id,
           cost_per_impression_cents, valid_from, valid_until, active, sort_order
         ) VALUES ($1,$2,$3,$4,$5,5,CURRENT_DATE,CURRENT_DATE + INTERVAL '90 days',true,$6)`,
        [b.title, b.description || null, image_url, b.link_url, customerId, b.sort_order],
      );
      console.log(`  + criado ${b.title}`);
    }
  }

  /* Mantém banners do seed + Terus ativos; os demais ficam para incluir depois. */
  const keepTitles = BANNERS.map((b) => b.title);
  await query(
    `UPDATE ad_banners SET active = false, updated_at = NOW()
     WHERE active = true
       AND title NOT ILIKE '%Terus%'
       AND NOT (title = ANY($1::text[]))`,
    [keepTitles],
  );
  console.log("  · demais banners desativados (exceto Terus e seed)");
}

async function main() {
  console.log("Seed catálogo odontológico + banners…");
  await migrateSchema();
  const customerId = await ensureCustomer();
  console.log(`Cliente pagante banners: #${customerId}`);
  await seedProducts();
  await seedBanners(customerId);
  console.log("\nConcluído.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
