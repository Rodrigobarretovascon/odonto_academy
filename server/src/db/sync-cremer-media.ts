/**
 * Sincroniza preço + imagem reais da Dental Cremer (match estrito por palavras-obrigatórias).
 * Uso: npm run seed:cremer:sync --prefix server
 */
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import dotenv from "dotenv";
import { query } from "./pool.js";
import { migrateSchema } from "./migrate.js";
import { upsertPrice } from "../services/stock.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../../.env") });
dotenv.config();

const ROOT = resolve(__dirname, "../../../public");
const PRODUCTS_DIR = join(ROOT, "uploads/products");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

type Hit = { name: string; href: string; price: number; img: string };

type Entry = {
  slug: string;
  /** queries em ordem de preferência */
  queries: string[];
  /** TODAS precisam aparecer no nome (normalizado) */
  must: string[];
  /** se aparecer, descarta */
  ban?: string[];
  maxPrice?: number;
  minPrice?: number;
};

const MAP: Entry[] = [
  {
    slug: "luvas-procedimento-m",
    queries: ["luva latex procedimento com po medix", "luva para procedimento latex com po"],
    must: ["luva", "latex", "procedimento"],
    ban: ["kit 5", "kit 10", "nitrilo", "cirurgica", "suporte", "porta"],
    maxPrice: 80,
  },
  {
    slug: "luvas-nitrilo-m",
    queries: ["luva nitrilo procedimento sem po azul medix", "luva nitrilo procedimento sem po"],
    must: ["luva", "nitril", "procedimento"],
    ban: ["kit 5", "kit 10", "suporte", "porta", "latex"],
    maxPrice: 80,
  },
  {
    slug: "mascara-cirurgica-tripla",
    queries: ["mascara cirurgica descartavel tripla elástico", "mascara cirurgica tripla camada"],
    must: ["mascara", "cirurg"],
    ban: ["suporte", "porta", "n95", "pff2", "luvas"],
    maxPrice: 60,
  },
  {
    slug: "alcool-70-spray",
    queries: ["alcool etilico 70 spray 500", "alcool 70% spray"],
    must: ["alcool", "70"],
    ban: ["gel", "mascara"],
    maxPrice: 40,
  },
  {
    slug: "sugador-saliva-descartavel",
    queries: ["sugador saliva descartavel", "sugador descartavel transparente"],
    must: ["sugador"],
    ban: ["cirurgico", "alta potencia suporte"],
    maxPrice: 40,
  },
  {
    slug: "babador-descartavel",
    queries: ["babador descartavel odontologico pacote", "babador descartavel elástico"],
    must: ["babador"],
    ban: ["infantil", "patinadora", "funwork impermeavel infantil"],
    maxPrice: 80,
  },
  {
    slug: "resina-composta-a2",
    queries: ["resina composta A2 seringa", "resina z350 a2", "resina brilliant ng a2"],
    must: ["resina", "a2"],
    ban: ["acrilica", "flow", "kit ", "combo", "impressora"],
    maxPrice: 250,
  },
  {
    slug: "resina-composta-a1",
    queries: ["resina composta A1 seringa", "resina z250 a1", "resina form a1"],
    must: ["resina", "a1"],
    ban: ["acrilica", "flow", "kit ", "combo"],
    maxPrice: 250,
  },
  {
    slug: "adesivo-universal",
    queries: ["adesivo single bond universal", "adesivo optibond universal", "adesivo universal 5ml"],
    must: ["adesivo"],
    ban: ["combo resina", "ortodontico", "kit resina"],
    maxPrice: 350,
  },
  {
    slug: "acido-fosforico-37",
    queries: ["condicionador acido fosforico 37", "acido fosforico 37% seringa"],
    must: ["acido", "fosfor"],
    ban: ["kit academico"],
    maxPrice: 80,
  },
  {
    slug: "ionomero-vidro-restaurador",
    queries: ["ionomero de vidro restaurador", "vidrion r", "ionomero restaurador"],
    must: ["ionomer"],
    ban: ["ponta diamantada", "broca"],
    maxPrice: 200,
  },
  {
    slug: "cimento-ionomero-lutamento",
    queries: ["cimento ionomero de vidro lutamento", "relyx luting", "cimento ionomerico lutamento"],
    must: ["ciment"],
    ban: ["provisorio sealtemp", "obturador"],
    maxPrice: 300,
  },
  {
    slug: "cimento-resinoso-dual",
    queries: ["cimento resinoso dual cure", "relyx ultimate", "cimento resinoso dual"],
    must: ["ciment", "resinos"],
    ban: ["ionomer"],
    maxPrice: 500,
  },
  {
    slug: "anestesico-lidocaina-2",
    queries: ["anestésico lidocaína 2% com epinefrina", "lidocaina 2% tubete"],
    must: ["lidocain"],
    ban: ["faixa", "turbante", "funwork"],
    maxPrice: 120,
  },
  {
    slug: "agulha-gengival-30g",
    queries: ["agulha gengival 30g curta", "agulha odontologica 30g"],
    must: ["agulha", "gengival"],
    ban: ["insulina", "sering"],
    maxPrice: 80,
  },
  {
    slug: "algodao-rolo",
    queries: ["algodao em rolo odontologico", "rolo de algodao dental"],
    must: ["algod"],
    ban: ["porta algodao", "alumínio", "aluminio"],
    maxPrice: 40,
  },
  {
    slug: "gaze-esteril",
    queries: ["compressa gaze esteril 7,5", "gaze esteril 7,5x7,5"],
    must: ["gaze"],
    ban: [],
    maxPrice: 40,
  },
  {
    slug: "lencol-borracha-medio",
    queries: ["lencol de borracha medio isolamento", "lencol borracha dental medium"],
    must: ["lencol", "borracha"],
    ban: ["wedjets", "fio estabilizador", "grampo"],
    maxPrice: 120,
  },
  {
    slug: "kit-grampos-isolamento",
    queries: ["kit grampos isolamento absoluto", "grampos para lencol de borracha kit"],
    must: ["gramp"],
    ban: ["medidor", "alginato"],
    maxPrice: 400,
  },
  {
    slug: "arco-young",
    queries: ["arco de young adulto", "arco young plastico"],
    must: ["arco", "young"],
    ban: ["resina", "acrilica"],
    maxPrice: 80,
  },
  {
    slug: "brocas-diamantadas-kit-fg",
    queries: ["kit pontas diamantadas FG", "kit brocas diamantadas sortidas"],
    must: ["diamant"],
    ban: ["ponta diamantada conica", "unidade"],
    maxPrice: 300,
    minPrice: 20,
  },
  {
    slug: "brocas-carbide-kit",
    queries: ["kit brocas carbide FG", "broca carbide kit sortido"],
    must: ["carbide"],
    ban: ["roto reta", "amanngirrbach", "cad/cam"],
    maxPrice: 300,
  },
  {
    slug: "discos-lixa-sof-lex",
    queries: ["disco sof-lex 3m", "disco lixa acabamento sof lex", "disco praxis lixa"],
    must: ["disco"],
    ban: [],
    maxPrice: 200,
  },
  {
    slug: "fita-matriz-metalica",
    queries: ["fita matriz metalica aço", "matriz metalica rolo dental"],
    must: ["matriz"],
    ban: ["microporosa", "cremer fita", "adesiva"],
    maxPrice: 40,
  },
  {
    slug: "cunhas-madeira-kit",
    queries: ["cunha de madeira odontologica", "cunhas madeira anatômicas kit"],
    must: ["cunha", "madeira"],
    ban: ["porta click", "resinas"],
    maxPrice: 60,
  },
  {
    slug: "pasta-profilatica",
    queries: ["pasta profilatica 90g", "pasta profilática microdont"],
    must: ["pasta", "profil"],
    ban: [],
    maxPrice: 50,
  },
  {
    slug: "escova-robinson-kit",
    queries: ["escova robinson taca kit", "escova robinson ca"],
    must: ["robinson"],
    ban: [],
    maxPrice: 80,
  },
  {
    slug: "fluor-gel-acido",
    queries: ["fluor gel acido 200ml", "gel fluoretado acidulado"],
    must: ["fluor"],
    ban: ["clinpro clear kit tres"],
    maxPrice: 80,
  },
  {
    slug: "clareador-dental-16",
    queries: ["clareador peróxido carbamida 16%", "whiteness perfect 16", "clareador 16%"],
    must: ["clareador"],
    ban: ["copo", "copa do mundo"],
    maxPrice: 150,
  },
  {
    slug: "barreira-gengival",
    queries: ["barreira gengival fotopolimerizavel", "barreira gengival superdam"],
    must: ["barreira", "gengival"],
    ban: [],
    maxPrice: 80,
  },
  {
    slug: "alginato-tipo-ii",
    queries: ["alginato hidrocoloide tipo II", "alginato jeltrate", "alginato 453g"],
    must: ["alginato"],
    ban: ["medidor", "kit medidor"],
    maxPrice: 80,
  },
  {
    slug: "silicone-adicao-kit",
    queries: ["silicone de adicao express", "kit silicone adicao putty light", "silicone adição moldagem"],
    must: ["silicone"],
    ban: ["acabamento", "polimento", "viking"],
    maxPrice: 600,
  },
  {
    slug: "gesso-pedra-tipo-iii",
    queries: ["gesso pedra tipo III 1kg", "gesso tipo 3 pedra"],
    must: ["gesso"],
    ban: ["tipo iv", "tipo 4", "articu"],
    maxPrice: 80,
  },
  {
    slug: "gesso-especial-tipo-iv",
    queries: ["gesso especial tipo IV", "gesso tipo 4 pedra"],
    must: ["gesso"],
    ban: ["tipo iii", "tipo 3", "arti"],
    maxPrice: 100,
  },
  {
    slug: "cera-utilidade",
    queries: ["cera utilidade lamina", "cera utilidade rosa"],
    must: ["cera", "utilidade"],
    ban: ["caracterizacao", "create wax"],
    maxPrice: 50,
  },
  {
    slug: "cera-escultura-blocos",
    queries: ["cera para escultura lysanda", "cera escultura polidental", "cera para escultura"],
    must: ["cera", "escultura"],
    ban: [],
    maxPrice: 80,
  },
  {
    slug: "espatula-lecron-1",
    queries: ["esculpidor lecron golgran", "espatula lecron n1"],
    must: ["lecron"],
    ban: [],
    maxPrice: 60,
  },
  {
    slug: "espatula-hollemback-3s",
    queries: ["espatula hollemback 3s", "hollenback 3s golgran"],
    must: ["hollemback|hollenback"],
    ban: ["hydcal", "hidroxido"],
    maxPrice: 80,
  },
  {
    slug: "kit-exame-clinico",
    queries: ["kit clinico odontologico espelho sonda pinça", "kit exame clinico inox"],
    must: ["kit"],
    ban: ["medidor", "alginato"],
    maxPrice: 150,
  },
  {
    slug: "sonda-periodontal-who",
    queries: ["sonda periodontal milimetrada", "sonda periodontal who", "sonda periodontal golgran"],
    must: ["sonda", "periodontal"],
    ban: ["exploradora"],
    maxPrice: 80,
  },
  {
    slug: "fotopolimerizador-led-sem-fio",
    queries: ["fotopolimerizador led sem fio", "fotopolimerizador emitter", "fotopolimerizador radii"],
    must: ["fotopolimerizador"],
    ban: [],
    maxPrice: 2500,
    minPrice: 100,
  },
  {
    slug: "microaplicadores",
    queries: ["microaplicador odontologico", "microbrush dental pacote", "aplicador descartavel micro"],
    must: ["microaplic|microbrush|aplicadores"],
    ban: ["creme dental", "colgate"],
    maxPrice: 40,
  },
  {
    slug: "limas-endo-kit-25mm",
    queries: ["lima tipo k 25mm kit", "lima k-file 25mm first series", "limas endodonticas 25mm"],
    must: ["lima"],
    ban: [],
    maxPrice: 120,
  },
  {
    slug: "cones-guta-percha",
    queries: ["cone de guta percha sortido", "guta percha cones 02"],
    must: ["guta"],
    ban: ["solvente", "eucaliptol"],
    maxPrice: 80,
  },
  {
    slug: "cones-papel-absorvente",
    queries: ["cone de papel absorvente endodontia", "paper points endodontico"],
    must: ["papel"],
    ban: ["parafuso", "cone morse", "implante"],
    maxPrice: 60,
  },
  {
    slug: "hipoclorito-sodico-25",
    queries: ["hipoclorito de sodio 2,5% endodontia", "hipoclorito sodio irrigacao"],
    must: ["hipoclorito"],
    ban: ["lima"],
    maxPrice: 50,
  },
  {
    slug: "edta-17-gel",
    queries: ["edta 17% gel endodontia", "edta trisodium gel"],
    must: ["edta"],
    ban: ["lima"],
    maxPrice: 60,
  },
  {
    slug: "fio-sutura-seda-3-0",
    queries: ["fio de sutura seda 3-0", "sutura seda 3-0 agulha"],
    must: ["sutura", "seda"],
    ban: [],
    maxPrice: 80,
  },
  {
    slug: "lamina-bisturi-15",
    queries: ["lamina de bisturi n15", "lamina bisturi 15 caixa"],
    must: ["lamina", "bisturi"],
    ban: ["cabo"],
    maxPrice: 60,
  },
  {
    slug: "cabo-bisturi-n3",
    queries: ["cabo de bisturi n3", "cabo bisturi numero 3 inox"],
    must: ["cabo", "bisturi"],
    ban: ["lamina"],
    maxPrice: 50,
  },
];

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function matches(entry: Entry, name: string, price: number) {
  const n = norm(name);
  // "a|b" = qualquer alternativa
  if (
    entry.must.some((m) => {
      const alts = m.split("|").map((x) => norm(x.trim())).filter(Boolean);
      return !alts.some((a) => n.includes(a));
    })
  ) {
    return false;
  }
  if ((entry.ban || []).some((b) => n.includes(norm(b)))) return false;
  if (entry.maxPrice != null && price > entry.maxPrice) return false;
  if (entry.minPrice != null && price < entry.minPrice) return false;
  if (!(price > 0)) return false;
  return true;
}

async function fetchText(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parseSearch(html: string): Hit[] {
  const blocks = html.match(/<li class="item product-item"[\s\S]*?<\/li>/gi) || [];
  const hits: Hit[] = [];
  for (const block of blocks) {
    const name =
      block.match(/product-item-link"[^>]*>([^<]+)/i)?.[1]?.replace(/\s+/g, " ").trim() || "";
    const href =
      block.match(/href="(https:\/\/www\.dentalcremer\.com\.br\/[^"]+\.html)"/i)?.[1] || "";
    const price = Number(block.match(/data-price-amount="([0-9.]+)"/i)?.[1] || 0);
    const img =
      block.match(/(https:\/\/cdn\.dentalcremer\.com\.br\/produtos\/210\/[^"]+)/i)?.[1] ||
      block.match(/(https:\/\/cdn\.dentalcremer\.com\.br\/produtos\/[^"]+)/i)?.[1] ||
      "";
    if (name && href) hits.push({ name, href, price, img });
  }
  return hits;
}

async function enrichFromProductPage(hit: Hit): Promise<Hit> {
  try {
    const html = await fetchText(hit.href);
    const price = Number(html.match(/data-price-amount="([0-9.]+)"/i)?.[1] || hit.price);
    const img =
      html.match(/property="og:image"\s+content="([^"]+)"/i)?.[1] ||
      html.match(/(https:\/\/cdn\.dentalcremer\.com\.br\/produtos\/210\/[^"]+)/i)?.[1] ||
      hit.img;
    const name =
      html.match(/property="og:title"\s+content="([^"]+)"/i)?.[1] ||
      html.match(/<h1[^>]*>([^<]+)/i)?.[1]?.replace(/\s+/g, " ").trim() ||
      hit.name;
    return { ...hit, price: price || hit.price, img: img || hit.img, name };
  } catch {
    return hit;
  }
}

async function downloadImage(url: string, dest: string) {
  if (existsSync(dest)) {
    try {
      unlinkSync(dest);
    } catch {
      /* ignore */
    }
  }
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*", Referer: "https://www.dentalcremer.com.br/" },
  });
  if (!res.ok || !res.body) throw new Error(`img ${res.status}`);
  // @ts-expect-error web stream
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function findBest(entry: Entry): Promise<Hit | null> {
  for (const q of entry.queries) {
    const html = await fetchText(
      `https://www.dentalcremer.com.br/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    );
    const hits = parseSearch(html).filter((h) => matches(entry, h.name, h.price));
    if (hits.length) {
      hits.sort((a, b) => a.price - b.price);
      return enrichFromProductPage(hits[0]);
    }
    await sleep(250);
  }
  return null;
}

async function syncOne(entry: Entry) {
  const best = await findBest(entry);
  if (!best) {
    console.warn(`  ! sem match: ${entry.slug}`);
    return false;
  }

  const ext = best.img.match(/\.(jpe?g|png|webp)/i)?.[1]?.toLowerCase() || "jpg";
  const file = `${entry.slug}.${ext === "jpeg" ? "jpg" : ext}`;
  const dest = join(PRODUCTS_DIR, file);
  // remove old svg placeholder
  for (const old of [`${entry.slug}.svg`, `${entry.slug}.jpg`, `${entry.slug}.png`, `${entry.slug}.webp`]) {
    const p = join(PRODUCTS_DIR, old);
    if (existsSync(p) && p !== dest) {
      try {
        unlinkSync(p);
      } catch {
        /* ignore */
      }
    }
  }
  try {
    if (best.img) await downloadImage(best.img, dest);
  } catch (err) {
    console.warn(`  ! img ${entry.slug}:`, err instanceof Error ? err.message : err);
  }

  const image_url = existsSync(dest) ? `/uploads/products/${file}` : null;
  const price_cents = Math.round(best.price * 100);
  const row = await query<{ id: number }>(`SELECT id FROM products WHERE slug=$1`, [entry.slug]);
  if (!row.rows[0]) {
    console.warn(`  ! slug local ausente ${entry.slug}`);
    return false;
  }
  await query(
    `UPDATE products SET
       name=$2,
       subtitle=$3,
       image_url=COALESCE($4, image_url),
       badge='Cremer',
       active=true,
       updated_at=NOW()
     WHERE id=$1`,
    [row.rows[0].id, best.name.slice(0, 180), "Revenda · Dental Cremer", image_url],
  );
  await upsertPrice(row.rows[0].id, price_cents, null);
  console.log(`  ✓ ${entry.slug} → R$ ${best.price.toFixed(2)} | ${best.name.slice(0, 72)}`);
  return true;
}

async function main() {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  console.log(`Sync estrito Cremer (${MAP.length})…`);
  await migrateSchema();
  let ok = 0;
  for (const entry of MAP) {
    try {
      if (await syncOne(entry)) ok += 1;
    } catch (err) {
      console.warn(`  ! ${entry.slug}:`, err instanceof Error ? err.message : err);
    }
    await sleep(350);
  }
  console.log(`\nAtualizados: ${ok}/${MAP.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
