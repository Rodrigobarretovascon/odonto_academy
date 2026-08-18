/**
 * Importa lecrons, ceras e instrumentais de escultura a partir da Dental Cremer.
 * Uso: npm run seed:cremer:sculpture --prefix server
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

/** Catálogo curado (Cremer) — preços públicos quando disponíveis; fallback de mercado quando B2B oculta. */
const ITEMS: Item[] = [
  {
    slug: "esculpidor-lecron-oitavado-golgran",
    name: "Esculpidor Lecron Oitavado - Golgran",
    subtitle: "Aço inox · cabo oitavado",
    description:
      "Esculpidor Lecron Golgran com pontas ativas para escultura em cera e prótese. Aço inox autoclavável.",
    price: 21.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/esculpidor-lecron-5-golgran-dc-344295-02.jpg",
    badge: "Lecron",
    featured: true,
    sort_order: 50,
    characteristics: ["Aço inox", "Autoclavável", "Cabo oitavado"],
    applications: ["Escultura em cera", "Prótese", "Laboratório"],
  },
  {
    slug: "esculpidor-lecron-kota",
    name: "Esculpidor Lecron - Kota",
    subtitle: "Dupla ponta · cabo verde",
    description: "Instrumento de dois lados com excelente poder de corte. Ideal para escultura em cera.",
    price: 23.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/115511.jpg",
    badge: "Lecron",
    featured: true,
    sort_order: 51,
    characteristics: ["Dupla ponta", "Corte preciso", "Kota"],
    applications: ["Escultura em cera", "Laboratório"],
  },
  {
    slug: "esculpidor-lecron-colors-ice",
    name: "Esculpidor Lecron Colors - Ice",
    subtitle: "Aço inox · cores",
    description: "Lecron Ice em aço inox autoclavável, linha Colors. Garantia de 2 anos contra defeito de fabricação.",
    price: 24.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/esculpidor-lecron-colors-cinza-n10-ice-145972.jpg",
    badge: "Lecron",
    sort_order: 52,
    characteristics: ["Autoclavável", "Aço inox", "Cores"],
    applications: ["Escultura", "Cera", "Prótese"],
  },
  {
    slug: "esculpidor-lecron-fava",
    name: "Esculpidor Lecron - Fava",
    subtitle: "Aço inox · 17 cm",
    description: "Lecron Fava em aço inox 5 mm, ponta faca curva. Autoclavável. Registro ANVISA 10317690019.",
    price: 19.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/esculpidor-lecron-dental-cremer-771602-01.jpg",
    badge: "Lecron",
    sort_order: 53,
    characteristics: ["17 cm", "Aço inox", "Autoclavável"],
    applications: ["Escultura em cera", "Modelagem"],
  },
  {
    slug: "esculpidor-lecron-ice",
    name: "Esculpidor Lecron - Ice",
    subtitle: "Aço inox · gravação a laser",
    description: "Lecron Ice em aço inoxidável, totalmente autoclavável. Garantia de 2 anos.",
    price: 22.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/esculpidor-lecron-ice-100506.jpg",
    badge: "Lecron",
    sort_order: 54,
    characteristics: ["Autoclavável", "Gravação a laser"],
    applications: ["Escultura", "Laboratório"],
  },
  {
    slug: "esculpidor-lecron-n5-millennium",
    name: "Esculpidor Lecron N° 5 - Millennium",
    subtitle: "Linha Premium · cabo oco 8 mm",
    description:
      "Lecron 5 Millennium (Golgran) para escultura de amálgama e cera. Cabo oco ergonômico de 8 mm.",
    price: 49.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/729979.jpg",
    badge: "Lecron",
    featured: true,
    sort_order: 55,
    characteristics: ["Millennium", "Cabo 8 mm", "Autoclavável"],
    applications: ["Prótese", "Escultura em cera", "Amálgama"],
  },
  {
    slug: "esculpidor-lecron-hilyn-fava",
    name: "Esculpidor Lecron Hilyn - Fava",
    subtitle: "Aço inox · autoclavável",
    description: "Lecron Hilyn Fava em aço inox, autoclavável.",
    price: 18.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/771619_636095452804818589.jpg",
    badge: "Lecron",
    sort_order: 56,
    characteristics: ["Aço inox", "Autoclavável"],
    applications: ["Escultura", "Cera"],
  },
  {
    slug: "esculpidor-lecron-quinelato",
    name: "Esculpidor Lecron - Quinelato",
    subtitle: "Aço cirúrgico · ~19 cm",
    description: "Lecron Quinelato em aço cirúrgico, ponta faca e ponta colher.",
    price: 29.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/espatula-lecron-dental-cremer-477184-01.jpg",
    badge: "Lecron",
    sort_order: 57,
    characteristics: ["Aço cirúrgico", "Faca + colher"],
    applications: ["Escultura", "Prótese"],
  },
  {
    slug: "esculpidor-hollenback-3s-hu-friedy",
    name: "Esculpidor Hollenback 3S - Hu-Friedy",
    subtitle: "Aço Immunity · autoclavável",
    description: "Hollenback 3S Hu-Friedy (CVHL3S). Aço Immunity, autoclavável.",
    price: 189.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/543193.jpg",
    badge: "Instrumental",
    sort_order: 58,
    characteristics: ["Hu-Friedy", "3S", "Autoclavável"],
    applications: ["Escultura", "Acabamento", "Restauração"],
  },
  {
    slug: "esculpidor-hollemback-duflex-3s",
    name: "Esculpidor Hollemback Duflex Nº 3S - SS White",
    subtitle: "Duflex · SS White",
    description: "Hollemback 3S Duflex SS White para escultura e acabamento.",
    price: 39.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/esculpidor-hollemback-3s-duflex-dc-228526-01.jpg",
    badge: "Instrumental",
    sort_order: 59,
    characteristics: ["3S", "SS White", "Duflex"],
    applications: ["Escultura", "Acabamento"],
  },
  {
    slug: "esculpidor-pk-thomas-2-golgran",
    name: "Esculpidor P. K. Thomas N° 2 Oitavado - Golgran",
    subtitle: "PKT 2 · cabo oitavado 16 cm",
    description:
      "PKT 2 Golgran para remoção de excessos e escultura de cúspides em cera. Aço inox autoclavável.",
    price: 26.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/produto-esculpidor-p-k-thomas-2-oitavado-golgran-100-2.jpg",
    badge: "PKT",
    featured: true,
    sort_order: 60,
    characteristics: ["PKT 2", "16 cm", "Aço inox"],
    applications: ["Escultura em cera", "Prótese", "Laboratório"],
  },
  {
    slug: "kit-esculpidor-pk-thomas-golgran",
    name: "Kit Esculpidor P. K. Thomas 5 Peças - Golgran",
    subtitle: "Nº 1 ao 5 · cabo oitavado",
    description:
      "Kit completo PK Thomas Golgran com 5 instrumentos (Nº 1–5) para todas as etapas da escultura em cera.",
    price: 129.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/kit-cinco-unidades-esculpidor-p-k-thomas-oitavado-golgran-508031.jpg",
    badge: "Kit",
    featured: true,
    sort_order: 61,
    characteristics: ["5 peças", "PKT", "Autoclavável"],
    applications: ["Escultura progressiva", "Laboratório", "Prótese"],
  },
  {
    slug: "esculpidor-pk-thomas-fava",
    name: "Esculpidor P.K Thomas - Fava",
    subtitle: "Aço inox · autoclavável",
    description: "Esculpidor Peter Thomas Fava em aço inox, autoclavável.",
    price: 14.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/771671_636095449107259185.jpg",
    badge: "PKT",
    sort_order: 62,
    characteristics: ["Aço inox", "Autoclavável"],
    applications: ["Escultura em cera"],
  },
  {
    slug: "esculpidor-discoide-cleoide-ss-white",
    name: "Esculpidor Discoide Cleoide Duflex - SS White",
    subtitle: "Aço inox · autoclavável",
    description: "Discoide/Cleóide Duflex SS White para anatomia oclusal e acabamento.",
    price: 34.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/esculpidor-discoide-cleoide-11313-duflex-ssw-ss-white-386462.jpg",
    badge: "Instrumental",
    sort_order: 63,
    characteristics: ["Discoide", "Cleóide", "SS White"],
    applications: ["Anatomia oclusal", "Acabamento"],
  },
  {
    slug: "esculpidor-discoide-cleoide-fava",
    name: "Esculpidor Discóide Cleóide - Fava",
    subtitle: "Aço inox · autoclavável",
    description: "Discoide/Cleóide Fava em aço inox, autoclavável.",
    price: 19.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/771572_636095453592316685.jpg",
    badge: "Instrumental",
    sort_order: 64,
    characteristics: ["Aço inox", "Autoclavável"],
    applications: ["Escultura", "Acabamento oclusal"],
  },
  {
    slug: "esculpidor-discoide-cleoide-millennium",
    name: "Esculpidor Discóide Cleóide Adulto - Millennium",
    subtitle: "Premium · cabo oco 8 mm",
    description: "Discoide/Cleóide Millennium para acabamento e anatomia oclusal. Cabo oco ergonômico.",
    price: 54.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/745672.jpg",
    badge: "Instrumental",
    sort_order: 65,
    characteristics: ["Millennium", "Cabo 8 mm", "Autoclavável"],
    applications: ["Anatomia oclusal", "Acabamento"],
  },
  {
    slug: "esculpidor-7-explorador-millennium",
    name: "Esculpidor 7 Explorador - Millennium",
    subtitle: "Dupla ponta · cabo 8 mm",
    description:
      "Instrumento de dupla ponta para detalhamento anatômico em fissuras e sulcos. Aço inox Millennium.",
    price: 54.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/esculpidor-7-explorador-millennium-hsb.jpg",
    badge: "Instrumental",
    sort_order: 66,
    characteristics: ["Dupla ponta", "Cabo 8 mm", "Millennium"],
    applications: ["Microanatomia", "Escultura", "Acabamento"],
  },
  {
    slug: "esculpidor-n3012-millennium",
    name: "Esculpidor Nº3012 - Millennium",
    subtitle: "Wax-up · pontas finas",
    description:
      "Esculpidor laboratorial Millennium para escultura em cera, wax-up e modelagem de cúspides e fissuras.",
    price: 54.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/esculpidor-n3012-millennium-hsb.jpg",
    badge: "Instrumental",
    sort_order: 67,
    characteristics: ["Wax-up", "Pontas finas", "Autoclavável"],
    applications: ["Laboratório", "Escultura em cera", "Mock-up"],
  },
  {
    slug: "cera-escultura-neutra-kota",
    name: "Cera para Escultura Neutra - Kota",
    subtitle: "Enceramento progressivo · laranja",
    description:
      "Cera Kota que compensa a contração de outras ceras no enceramento progressivo. Cor laranja.",
    price: 31.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/483642.jpg",
    badge: "Cera",
    featured: true,
    sort_order: 70,
    characteristics: ["Escultura", "Neutra", "Kota"],
    applications: ["Enceramento", "Escultura dental", "Laboratório"],
  },
  {
    slug: "cera-opaca-pk-kota",
    name: "Cera Opaca PK - Kota",
    subtitle: "Alta opacidade · detalhes",
    description: "Cera opaca Kota para melhor visualização dos detalhes na escultura.",
    price: 38.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/cera-opaca-pk-kota-dc10280.jpg",
    badge: "Cera",
    featured: true,
    sort_order: 71,
    characteristics: ["Opaca", "Kota", "Detalhes"],
    applications: ["Escultura", "Enceramento", "Laboratório"],
  },
  {
    slug: "cera-caracterizacao-create-wax",
    name: "Cera para Caracterização Create Wax - Evoden",
    subtitle: "Escultura e caracterização",
    description:
      "Cera Create Wax Evoden para caracterização gengival, fixação temporária e alívios em gesso.",
    price: 47.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/cera-para-caracterizacao-create-wax-evoden-dc39658.jpg",
    badge: "Cera",
    sort_order: 72,
    characteristics: ["Create Wax", "Maleável", "Estável"],
    applications: ["Caracterização", "Escultura", "Laboratório"],
  },
  {
    slug: "cera-bloco-macro-classico",
    name: "Cera em Bloco Macro Natural - Clássico",
    subtitle: "Blocos 50×19,5 · natural",
    description: "Cera em bloco macro Clássico para treinamento e escultura. Processo de têmpera e laminação.",
    price: 32.0,
    img: "https://cdn.dentalcremer.com.br/produtos/210/produto-cera-em-bloco-macro-natural-classico.jpg",
    badge: "Cera",
    featured: true,
    sort_order: 73,
    characteristics: ["Bloco macro", "Natural", "Clássico"],
    applications: ["Escultura dental", "Estudo", "Treinamento"],
  },
  {
    slug: "cera-utilidade-classico",
    name: "Cera Utilidade - Clássico",
    subtitle: "Multifuncional · 5 un.",
    description:
      "Cera utilidade Clássico para prótese e ortodontia. Parafina, vaselina e óleo mineral.",
    price: 24.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/produto-cera-utilidade-classico-238808.jpg",
    badge: "Cera",
    sort_order: 74,
    characteristics: ["Utilidade", "5 unidades", "Clássico"],
    applications: ["Prótese", "Laboratório", "Consultório"],
  },
  {
    slug: "cera-utilidade-wilson-polidental",
    name: "Cera Utilidade Wilson - Polidental",
    subtitle: "Refundível · qualidade constante",
    description: "Cera utilidade Wilson Polidental. Pode ser refundida sem perder propriedades.",
    price: 26.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/cera-utilidade-wilson-dental-cremer-100645.jpg",
    badge: "Cera",
    sort_order: 75,
    characteristics: ["Wilson", "Polidental", "Refundível"],
    applications: ["Laboratório", "Prótese"],
  },
  {
    slug: "cera-7-rosa-wilson-polidental",
    name: "Cera 7 Rosa Wilson - Polidental",
    subtitle: "18 lâminas · 225 g",
    description:
      "Cera 7 Rosa Wilson Polidental em lâminas macias (1,13 mm). Ideal para montagem de próteses.",
    price: 34.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/cera-wilson-rosa-7-polidental-dc-100644-01.jpg",
    badge: "Cera",
    featured: true,
    sort_order: 76,
    characteristics: ["18 lâminas", "225 g", "Rosa"],
    applications: ["Prótese", "Montagem", "Laboratório"],
  },
  {
    slug: "cera-9-rosa-lamina-asfer",
    name: "Cera 9 Rosa Lâmina - Asfer",
    subtitle: "Placas macias e flexíveis",
    description: "Cera 9 Asfer em lâminas macias e flexíveis (13,5 × 6,9 cm × 1 mm).",
    price: 22.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/560749_635829347415409322.jpg",
    badge: "Cera",
    sort_order: 77,
    characteristics: ["Lâmina", "Rosa 9", "Asfer"],
    applications: ["Prótese", "Laboratório"],
  },
  {
    slug: "cera-rosa-9-classico",
    name: "Cera Rosa 9 - Clássico",
    subtitle: "Têmpera e laminação",
    description: "Cera Rosa 9 Clássico com hidrocarboretos, óleo mineral e corante.",
    price: 24.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/produto-cera-rosa-9-classico.jpg",
    badge: "Cera",
    sort_order: 78,
    characteristics: ["Rosa 9", "Clássico"],
    applications: ["Prótese", "Laboratório"],
  },
  {
    slug: "cera-articulacao-amarela-classico",
    name: "Cera Articulação Amarela - Clássico",
    subtitle: "Registro e articulação",
    description: "Cera de articulação amarela Clássico para registros oclusais.",
    price: 22.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/produto-cera-articulacao-amarela-classico.jpg",
    badge: "Cera",
    sort_order: 79,
    characteristics: ["Articulação", "Amarela"],
    applications: ["Registro oclusal", "Prótese"],
  },
  {
    slug: "cera-acrilica-facetas-kota",
    name: "Cera Acrílica Branca para Facetas - Kota",
    subtitle: "Enceramento de facetas",
    description: "Cera acrílica branca Kota ideal para enceramento de facetas. Sem pigmentos.",
    price: 42.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/483598.jpg",
    badge: "Cera",
    sort_order: 80,
    characteristics: ["Facetas", "Branca", "Kota"],
    applications: ["Facetas", "Enceramento", "Estética"],
  },
  {
    slug: "disco-cera-evoblock-evoden",
    name: "Disco de Cera Evoblock EBW - Evoden",
    subtitle: "CAD/CAM · 100% calcinável",
    description: "Disco de cera Evoblock Evoden para usinagem CAD/CAM, fundição e injeção.",
    price: 86.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/disco-de-cera-evoblock-ebw-evoden-dc39305-branco.jpg",
    badge: "Cera",
    sort_order: 81,
    characteristics: ["CAD/CAM", "Calcinável", "Evoden"],
    applications: ["Usinagem", "Fundição", "Laboratório digital"],
  },
  {
    slug: "disco-cera-evolux-wax",
    name: "Disco de Cera CAD/CAM Evolux Wax - Blue Dent",
    subtitle: "Holder 98 · calcinável",
    description: "Disco Evolux Wax Blue Dent para CAD/CAM. 100% calcinável, atóxico, fácil extração.",
    price: 149.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/724080.jpg",
    badge: "Cera",
    sort_order: 82,
    characteristics: ["CAD/CAM", "Holder 98", "Calcinável"],
    applications: ["Fresagem", "Fundição", "Laboratório"],
  },
  {
    slug: "lamparina-alcool-lysanda",
    name: "Lamparina a Álcool com Pavio - Lysanda",
    subtitle: "Alumínio · 100 ml",
    description: "Lamparina a álcool Lysanda em alumínio escovado, capacidade 100 ml, com pavio.",
    price: 47.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/lamparina-a-alcool-com-pavio-rosa-claro-1unid--lysanda-150908.jpg",
    badge: "Acessório",
    sort_order: 83,
    characteristics: ["100 ml", "Alumínio", "Pavio"],
    applications: ["Laboratório", "Cera", "Escultura"],
  },
];

async function downloadImage(url: string, dest: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*", Referer: "https://www.dentalcremer.com.br/" },
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  // @ts-expect-error web stream
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

function cleanDesc(s: string) {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}

async function upsertItem(item: Item, sortBase: number) {
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
  await upsertInventory(id, 30);
  void sortBase;
}

async function main() {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  console.log(`Importando ${ITEMS.length} itens (lecron / cera / escultura)…`);
  await migrateSchema();
  let i = 0;
  for (const item of ITEMS) {
    await upsertItem(item, i++);
  }
  console.log(`\nConcluído: ${ITEMS.length} produtos de escultura/cera.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
