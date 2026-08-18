/**
 * Importa produtos American Burrs · especialidade Prótese Parcial Removível
 * da Dental Cremer (super-loja/american-burrs?filter=especialidade:protese-parcial-removivel).
 *
 * Uso: npm run seed:cremer:ab-ppr --prefix server
 */
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
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

const PRODUCTS_DIR = join(resolve(__dirname, "../../../public"), "uploads/products");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

type Item = {
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  img: string;
  badge: string;
  featured?: boolean;
  sort_order: number;
  characteristics: string[];
  applications: string[];
};

/** Capturado da listagem Cremer com filtro especialidade=Prótese Parcial Removível. */
const ITEMS: Item[] = [
  {
    slug: "kit-ultra-gloss-ca-american-burrs",
    name: "Kit Completo para Polimento de Resina Ultra-Gloss CA - American Burrs",
    subtitle: "American Burrs · 15 peças + broqueiro",
    description:
      "Kit com 15 peças + Broqueiro autoclavável de 75 furos. Linha Ultra-Gloss CA para acabamento e polimento de resina.",
    price: 281.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/kit-acabamento-e-polimento-de-resina-completo-ultra-gloss-american-burrs-978865.jpg",
    badge: "American Burrs",
    featured: true,
    sort_order: 10,
    characteristics: ["Kit 15 peças", "Broqueiro 75 furos", "CA"],
    applications: ["Polimento de resina", "Acabamento", "Prótese parcial removível"],
  },
  {
    slug: "disco-carburundum-marrom-american-burrs",
    name: "Disco de Carburundum Marrom 38x0,6mm - American Burrs",
    subtitle: "American Burrs · 38×0,6 mm",
    description: "Disco de carburundum marrom 38x0,6mm. Embalagem com 1 unidade.",
    price: 9.09,
    img: "https://cdn.dentalcremer.com.br/produtos/210/disco-de-carborundum-marrom-american-burrs-521870-dental-cremer.jpg",
    badge: "American Burrs",
    featured: true,
    sort_order: 11,
    characteristics: ["38×0,6 mm", "Carburundum", "Unidade"],
    applications: ["Corte", "Acabamento", "Prótese parcial removível"],
  },
  {
    slug: "tira-lixa-sawstripe-american-burrs",
    name: "Tira de Lixa de Aço Serrilhada Sawstripe - American Burrs",
    subtitle: "American Burrs · 4 mm · 5 un.",
    description: "Tira de lixa de aço serrilhada Sawstripe 4mm. Embalagem com 5 unidades.",
    price: 94.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/embalagem-tira-de-lixa-de-aco-serrilhada-sawstripe-4mm-american-burrs-121184.jpg",
    badge: "American Burrs",
    featured: true,
    sort_order: 12,
    characteristics: ["4 mm", "5 unidades", "Aço serrilhado"],
    applications: ["Interproximal", "Acabamento", "Prótese parcial removível"],
  },
  {
    slug: "mini-kit-ultramatrix-clip-american-burrs",
    name: "Mini Kit Matriz Seccionais Ultramatrix Clip 1,0 - American Burrs",
    subtitle: "American Burrs · 25 matrizes + anel",
    description: "Mini kit Ultramatrix Clip 1,0 com 25 matrizes, 1 anel e 2 ponteiras.",
    price: 259.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/mini-kit-matriz-seccionais-ultramatrix-clip-1-0-american-burrs-147620.jpg",
    badge: "American Burrs",
    featured: true,
    sort_order: 13,
    characteristics: ["25 matrizes", "1 anel", "2 ponteiras"],
    applications: ["Matriz seccional", "Restaurador", "Prótese parcial removível"],
  },
  {
    slug: "ponta-diamantada-3145-fg-invicta-american-burrs",
    name: "Ponta Diamantada Cilíndrica Topo Esférica FG Invicta N° 3145 - American Burrs",
    subtitle: "American Burrs · FG · Invicta",
    description: "Ponta diamantada cilíndrica topo esférica FG Invicta N° 3145. Alta rotação. Unidade.",
    price: 20.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/ponta-diamantada-esferica-3145-fg-invicta-american-burrs-dental-cremer-107125.jpg",
    badge: "American Burrs",
    sort_order: 14,
    characteristics: ["FG", "Invicta", "N° 3145"],
    applications: ["Preparo", "Alta rotação", "Prótese parcial removível"],
  },
  {
    slug: "kit-acabamento-polimento-universal-american-burrs",
    name: "Kit para Acabamento e Polimento Universal - American Burrs",
    subtitle: "American Burrs · 19 peças PM + broqueiro",
    description:
      "Kit com 19 peças PM e 1 broqueiro organizador de 55 furos para acabamento e polimento universal.",
    price: 899.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/kit-para-acabamento-e-polimento-universal-american-burrs-705157.jpg",
    badge: "American Burrs",
    featured: true,
    sort_order: 15,
    characteristics: ["19 peças PM", "Broqueiro 55 furos", "Universal"],
    applications: ["Acabamento", "Polimento", "Prótese parcial removível"],
  },
  {
    slug: "kit-discos-lixa-ultraflex-american-burrs",
    name: "Kit Discos de Lixa Ultraflex 50unid. - American Burrs",
    subtitle: "American Burrs · 50 pçs + mandril",
    description:
      "Kit com 50 peças Ultraflex (várias granulações 3/8 e 1/2) e 1 mandril de encaixe rápido.",
    price: 237.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/kit-discos-de-lixa-ultraflex--152133.jpg",
    badge: "American Burrs",
    sort_order: 16,
    characteristics: ["50 peças", "Mandril", "Ultraflex"],
    applications: ["Acabamento", "Lixamento", "Prótese parcial removível"],
  },
  {
    slug: "kit-master-resina-american-burrs",
    name: "Kit Acabamento e Polimento Master Resina - American Burrs",
    subtitle: "American Burrs · kit 10 unidades",
    description: "Kit promocional Master Resina para acabamento e polimento. Kit com 10 unidades.",
    price: 423.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/kit-promocional-para-acabamento-e-polimento-master-resina-american-burrs-122245-dental-cremer.jpg",
    badge: "American Burrs",
    sort_order: 17,
    characteristics: ["10 unidades", "Master Resina"],
    applications: ["Acabamento", "Polimento de resina", "Prótese parcial removível"],
  },
  {
    slug: "serra-interproximal-ultracut-american-burrs",
    name: "Serra para Interproximal Ultracut 5unid. - American Burrs",
    subtitle: "American Burrs · 5 unidades",
    description: "Serra para interproximal Ultracut. Embalagem com 5 unidades.",
    price: 80.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/serra-para-interproximal-ultracut-152130.jpg",
    badge: "American Burrs",
    sort_order: 18,
    characteristics: ["5 unidades", "Ultracut", "Interproximal"],
    applications: ["Separação interproximal", "Prótese parcial removível"],
  },
  {
    slug: "kit-twist-gloss-ca-american-burrs",
    name: "Kit Twist-Gloss de Polidores Diamantados CA - American Burrs",
    subtitle: "American Burrs · polidores + broqueiro",
    description:
      "Kit com 2 polidores espirais diamantados CA, 3 polidores de resina CA, 1 escova pelo de cabra e broqueiro autoclavável de 75 furos.",
    price: 408.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/kit-twist-gloss-polidores-diamantadas-ca-american-burrs-130116-dental-cremer.jpg",
    badge: "American Burrs",
    featured: true,
    sort_order: 19,
    characteristics: ["Twist-Gloss", "CA", "Broqueiro 75 furos"],
    applications: ["Polimento", "Resina e cerâmica", "Prótese parcial removível"],
  },
  {
    slug: "polidor-ultra-metal-bastao-pm-american-burrs",
    name: "Polidor de Metal Ultra-Metal Bastão PM - American Burrs",
    subtitle: "American Burrs · 100 unidades · PM",
    description: "Polidor de metal Ultra-Metal bastão PM. Embalagem com 100 unidades.",
    price: 481.02,
    img: "https://cdn.dentalcremer.com.br/produtos/210/115300.jpg",
    badge: "American Burrs",
    sort_order: 20,
    characteristics: ["100 unidades", "PM", "Ultra-Metal"],
    applications: ["Polimento de metal", "Prótese parcial removível"],
  },
];

async function downloadImage(url: string, dest: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*", Referer: "https://www.dentalcremer.com.br/" },
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(dest));
}

function cleanDesc(s: string) {
  return s.replace(/\s+/g, " ").trim().slice(0, 600);
}

async function upsertItem(item: Item) {
  const ext = item.img.match(/\.(jpe?g|png|webp)/i)?.[1]?.toLowerCase() || "jpg";
  const file = `${item.slug}.${ext === "jpeg" ? "jpg" : ext}`;
  const dest = join(PRODUCTS_DIR, file);
  for (const old of ["svg", "jpg", "png", "webp"]) {
    const p = join(PRODUCTS_DIR, `${item.slug}.${old}`);
    if (existsSync(p) && p !== dest) {
      try {
        unlinkSync(p);
      } catch {
        /* ignore */
      }
    }
  }
  try {
    await downloadImage(item.img, dest);
  } catch (err) {
    console.warn(`  ! img ${item.slug}:`, err instanceof Error ? err.message : err);
  }
  const image_url = existsSync(dest) ? `/uploads/products/${file}` : null;
  const existing = await query<{ id: number }>(`SELECT id FROM products WHERE slug=$1`, [item.slug]);
  let id: number;
  if (existing.rows[0]) {
    id = existing.rows[0].id;
    await query(
      `UPDATE products SET
         name=$2, subtitle=$3, description=$4, type='physical', access_days=0,
         image_url=COALESCE($5, image_url), badge=$6, featured=$7, sort_order=$8,
         characteristics=$9, applications=$10, active=true, updated_at=NOW()
       WHERE id=$1`,
      [
        id,
        item.name,
        item.subtitle,
        cleanDesc(item.description),
        image_url,
        item.badge,
        Boolean(item.featured),
        item.sort_order,
        item.characteristics,
        item.applications,
      ],
    );
    console.log(`  ~ ${item.slug}`);
  } else {
    const code = await nextProductCode();
    const inserted = await query<{ id: number }>(
      `INSERT INTO products (
         code, slug, name, subtitle, description, type, access_days, image_url, badge,
         featured, sort_order, characteristics, applications, active
       ) VALUES ($1,$2,$3,$4,$5,'physical',0,$6,$7,$8,$9,$10,$11,true)
       RETURNING id`,
      [
        code,
        slugify(item.slug) || item.slug,
        item.name,
        item.subtitle,
        cleanDesc(item.description),
        image_url,
        item.badge,
        Boolean(item.featured),
        item.sort_order,
        item.characteristics,
        item.applications,
      ],
    );
    id = inserted.rows[0].id;
    console.log(`  + ${item.slug} (${code})`);
  }
  await upsertPrice(id, Math.round(item.price * 100), null);
  await upsertInventory(id, 25);
}

async function main() {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  console.log(`Importando ${ITEMS.length} produtos American Burrs (PPR) da Dental Cremer…`);
  await migrateSchema();
  for (const item of ITEMS) {
    await upsertItem(item);
  }
  console.log(`\nConcluído: ${ITEMS.length} produtos American Burrs · Prótese Parcial Removível.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
