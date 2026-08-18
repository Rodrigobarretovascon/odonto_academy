/**
 * Aplica catálogo curado (URLs/imagens/preços públicos da Dental Cremer).
 * Preços null = mantém o preço já cadastrado; sempre atualiza nome + foto quando houver.
 *
 * Uso: npm run seed:cremer:apply --prefix server
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

const PRODUCTS_DIR = join(resolve(__dirname, "../../../public"), "uploads/products");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

type Row = {
  slug: string;
  name: string;
  price: number | null;
  img: string;
  href: string;
};

/** Matches revisados manualmente a partir do site público Dental Cremer */
const CATALOG: Row[] = [
  {
    slug: "luvas-procedimento-m",
    name: "Luva Látex para Procedimento sem Pó - Medix",
    price: 41.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/luva-para-procedimento-latex-sem-po-g-medix-150207.jpg",
    href: "https://www.dentalcremer.com.br/luva-para-procedimento-latex-sem-po-medix-dc39106.html",
  },
  {
    slug: "luvas-nitrilo-m",
    name: "Luva Nitrílo para Procedimento sem Pó Azul - Medix",
    price: 38.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/embalagem-luva-para-procedimento-nitrilo-sem-po-azul-p-medix.jpg",
    href: "https://www.dentalcremer.com.br/luva-para-procedimento-nitrilo-sem-po-azul-medix-dc39018.html",
  },
  {
    slug: "sugador-saliva-descartavel",
    name: "Sugador Endodôntico - Henry Schein",
    price: null,
    img: "https://cdn.dentalcremer.com.br/produtos/210/sugador-endodontico-henry-schein-156078.jpg",
    href: "https://www.dentalcremer.com.br/sugador-endodontico-henry-schein-156078.html",
  },
  {
    slug: "babador-descartavel",
    name: "Babador Descartável Branco - Jon",
    price: null,
    img: "https://cdn.dentalcremer.com.br/produtos/210/avental-descartavel-tnt-paciente-adulto-40gr-jon-126283.jpg",
    href: "https://www.dentalcremer.com.br/babador-descartavel-branco-jon-126283.html",
  },
  {
    slug: "adesivo-universal",
    name: "Adesivo Ankor U-Bond 5ml - Angelus",
    price: null,
    img: "https://cdn.dentalcremer.com.br/produtos/210/adesivo-ankor-u-bond-5ml-angelus-hsb.jpg",
    href: "https://www.dentalcremer.com.br/adesivo-ankor-u-bond-5ml-angelus-156788.html",
  },
  {
    slug: "ionomero-vidro-restaurador",
    name: "Ionômero de Vidro Restaurador Ionglass R - Maquira",
    price: 74.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/ionomero-de-vidro-a2-restaurador-ionglass-r-maquira-607857.jpg",
    href: "https://www.dentalcremer.com.br/ionomero-de-vidro-restaurador-ionglass-r-maquira.html",
  },
  {
    slug: "cimento-resinoso-dual",
    name: "Cimento Resinoso 3M Dual RelyX ARC - Solventum",
    price: 336.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/cimento-resinoso-dual-relyxtm-arc-3m-dc23112.jpg",
    href: "https://www.dentalcremer.com.br/cimento-resinoso-dual-relyxtm-arc-3m-solventum-dc23112.html",
  },
  {
    slug: "agulha-gengival-30g",
    name: "Agulha Gengival Estética - Verve Medtech",
    price: 70.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/agulha-gengival-estetica-27g-0-40-x-38mm-verve-medtech-hsb.jpg",
    href: "https://www.dentalcremer.com.br/agulha-gengival-estetica-verve-medtech-dc39638.html",
  },
  {
    slug: "lencol-borracha-medio",
    name: "Lençol de Borracha 15x15 - Easy",
    price: 53.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/lencol-de-borracha-15x15-39718-hsb.jpg",
    href: "https://www.dentalcremer.com.br/lencol-de-borracha-15x15-dc39718.html",
  },
  {
    slug: "kit-grampos-isolamento",
    name: "Kit Grampo para Isolamento Fiesta - Coltene",
    price: 887.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/kit-grampo-para-isolamento-sem-asa-fiesta-coltene-1.jpg",
    href: "https://www.dentalcremer.com.br/kit-grampo-para-isolamento-fiesta-coltene-dc39495.html",
  },
  {
    slug: "arco-young",
    name: "Arco de Young Adulto Inox - Coltene",
    price: null,
    img: "https://cdn.dentalcremer.com.br/produtos/210/arco-de-young-adulto-inox-6-152mm-1unid--coltene-154439.jpg",
    href: "https://www.dentalcremer.com.br/arco-de-young-adulto-inox-6-152mm-1unid-coltene-154439.html",
  },
  {
    slug: "brocas-diamantadas-kit-fg",
    name: "Ponta Diamantada Cônica Extremidade Arredondada FG - Microdont",
    price: 11.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/ponta-diamantada-conica-extremidade-arredondada-hsb.jpg",
    href: "https://www.dentalcremer.com.br/ponta-diamantada-conica-extremidade-arredondada-fg-microdont-dc39464.html",
  },
  {
    slug: "brocas-carbide-kit",
    name: "Broca Carbide Operatória Cone Invertido FG Nº 36 - AllPrime",
    price: null,
    img: "https://cdn.dentalcremer.com.br/produtos/210/broca-carbide-operatoria-cone-invertido-fg-19mm-n-36-allprime-110156.jpg",
    href: "https://www.dentalcremer.com.br/broca-carbide-operatoria-cone-invertido-fg-19mm-n-36-allprime-110156.html",
  },
  {
    slug: "discos-lixa-sof-lex",
    name: "Disco de Lixa Praxis Refil 3/8 - TDV",
    price: 92.99,
    img: "https://cdn.dentalcremer.com.br/produtos/210/disco-de-lixa-praxis-refil-3-8-tdv-129536-dental-cremer.jpg",
    href: "https://www.dentalcremer.com.br/disco-de-lixa-praxis-refil-3-8-tdv.html",
  },
  {
    slug: "fita-matriz-metalica",
    name: "Banda Matriz de Poliéster 50unid. - Microdont",
    price: null,
    img: "https://cdn.dentalcremer.com.br/produtos/210/banda-matriz-de-poliester-c-50-unidades-microdont-hsb.jpg",
    href: "https://www.dentalcremer.com.br/banda-matriz-de-poliester-microdont-153979.html",
  },
  {
    slug: "cunhas-madeira-kit",
    name: "Cunha Anatômica de Madeira - TDV",
    price: 49.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/cunha-anatomica-madeira-tdv-DC10489.jpg",
    href: "https://www.dentalcremer.com.br/cunha-anatomica-de-madeira-tdv-dc10489.html",
  },
  {
    slug: "pasta-profilatica",
    name: "Pasta Profilática 90G - Microdont",
    price: 16.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/pasta-profilatica-menta-90g-microdont-150108.jpg",
    href: "https://www.dentalcremer.com.br/pasta-profilatica-90g-microdont-dc39102.html",
  },
  {
    slug: "escova-robinson-kit",
    name: "Escova Robinson Taça - Microdont",
    price: 4.89,
    img: "https://cdn.dentalcremer.com.br/produtos/210/escova-robinson-taca-rosa-super-macia-1unid--microdont-150110.jpg",
    href: "https://www.dentalcremer.com.br/escova-robinson-taca-microdont-dc39103.html",
  },
  {
    slug: "clareador-dental-16",
    name: "Kit Clareador 16% - AllPrime",
    price: 41.99,
    img: "https://cdn.dentalcremer.com.br/produtos/210/itens-kit-clareador-16-5-seringas-3g-allprime-151651.jpg",
    href: "https://www.dentalcremer.com.br/kit-clareador-allprime-dc39241.html",
  },
  {
    slug: "barreira-gengival",
    name: "Barreira Gengival Superdam Azul 2g - Easy",
    price: 29.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/barreira-gengival-superdam-azul-2g-easy-153428.jpg",
    href: "https://www.dentalcremer.com.br/barreira-gengival-superdam-azul-2g-easy-153428.html",
  },
  {
    slug: "alginato-tipo-ii",
    name: "Alginato Regular Set Tipo II - AllPrime",
    price: null,
    img: "https://cdn.dentalcremer.com.br/produtos/210/alginato-regular-set-tipo-ii-allprime-151968.jpg",
    href: "https://www.dentalcremer.com.br/alginato-regular-set-tipo-ii-allprime-151968.html",
  },
  {
    slug: "cera-escultura-blocos",
    name: "Cera para Escultura Neutra - Kota",
    price: 31.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/483642.jpg",
    href: "https://www.dentalcremer.com.br/cera-para-escultura-neutra-kota-483642.html",
  },
  {
    slug: "espatula-lecron-1",
    name: "Esculpidor Lecron Oitavado - Golgran",
    price: 21.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/esculpidor-lecron-5-golgran-dc-344295-02.jpg",
    href: "https://www.dentalcremer.com.br/esculpidor-lecron-oitavado-golgran.html",
  },
  {
    slug: "fotopolimerizador-led-sem-fio",
    name: "Fotopolimerizador Emitter Now Black Pro - Schuster",
    price: null,
    img: "https://cdn.dentalcremer.com.br/produtos/210/fotopolimerizador-emitter-now-black-pro-schuster-hsb.jpg",
    href: "https://www.dentalcremer.com.br/fotopolimerizador-emitter-now-black-pro-schuster-156280.html",
  },
  {
    slug: "limas-endo-kit-25mm",
    name: "Lima K-File GenEndo - Vigodent",
    price: 31.99,
    img: "https://cdn.dentalcremer.com.br/produtos/210/lima-k-file-n80-31mm-6unid--vigodent-149244.jpg",
    href: "https://www.dentalcremer.com.br/lima-k-file-vigodent-dc39008.html",
  },
  {
    slug: "cones-guta-percha",
    name: "Cone de Guta Percha Calibrado Estéril - Easy",
    price: 85.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/guta-percha-easy-acessoria-easy-dc38966.jpg",
    href: "https://www.dentalcremer.com.br/guta-percha-easy-acessoria-easy-dc38966.html",
  },
  {
    slug: "cones-papel-absorvente",
    name: "Ponta de Papel Absorvente - Easy",
    price: 85.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/ponta-de-papel-absorvente-easy-easy-dc38967.jpg",
    href: "https://www.dentalcremer.com.br/ponta-de-papel-absorvente-easy-dc38967.html",
  },
  {
    slug: "hipoclorito-sodico-25",
    name: "Hipoclorito de Sódio 1% Solução de Milton - Asfer",
    price: null,
    img: "https://cdn.dentalcremer.com.br/produtos/210/386851.jpg",
    href: "https://www.dentalcremer.com.br/hipoclorito-de-sodio-1-soluc-o-de-milton-asfer-386851.html",
  },
  {
    slug: "lamina-bisturi-15",
    name: "Lâmina de Bisturi Descartável Inox - Indusbello",
    price: 97.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/lamina-de-bisturi-descartavel-inox-n10-100unid--indusbello-148342.jpg",
    href: "https://www.dentalcremer.com.br/lamina-de-bisturi-descartavel-inox-indusbello-dc38939.html",
  },
  {
    slug: "resina-composta-a2",
    name: "Resina Brilliant NG Esmalte A2/B2 - Coltene",
    price: 54.9,
    img: "https://cdn.dentalcremer.com.br/produtos/210/resina-brilliant-ng-esmalte-coltene-1.jpg",
    href: "https://www.dentalcremer.com.br/resina-brilliant-ng-esmalte-a2-b2-coltene.html",
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

async function main() {
  mkdirSync(PRODUCTS_DIR, { recursive: true });
  await migrateSchema();
  let ok = 0;
  for (const row of CATALOG) {
    const ext = row.img.match(/\.(jpe?g|png|webp)/i)?.[1]?.toLowerCase() || "jpg";
    const file = `${row.slug}.${ext === "jpeg" ? "jpg" : ext}`;
    const dest = join(PRODUCTS_DIR, file);
    for (const oldExt of ["svg", "jpg", "png", "webp"]) {
      const p = join(PRODUCTS_DIR, `${row.slug}.${oldExt}`);
      if (existsSync(p) && p !== dest) {
        try {
          unlinkSync(p);
        } catch {
          /* ignore */
        }
      }
    }
    try {
      await downloadImage(row.img, dest);
    } catch (err) {
      console.warn(`  ! img ${row.slug}:`, err instanceof Error ? err.message : err);
    }
    const image_url = existsSync(dest) ? `/uploads/products/${file}` : null;
    const db = await query<{ id: number }>(`SELECT id FROM products WHERE slug=$1`, [row.slug]);
    if (!db.rows[0]) {
      console.warn(`  ! missing ${row.slug}`);
      continue;
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
      [db.rows[0].id, row.name.slice(0, 180), "Revenda · Dental Cremer", image_url],
    );
    if (row.price != null && row.price > 0) {
      await upsertPrice(db.rows[0].id, Math.round(row.price * 100), null);
    }
    console.log(
      `  ✓ ${row.slug} ${row.price != null ? `R$ ${row.price.toFixed(2)}` : "(preço mantido)"} | ${row.name.slice(0, 60)}`,
    );
    ok += 1;
  }
  console.log(`\nAplicados: ${ok}/${CATALOG.length} (imagens Cremer).`);
  console.log("Obs.: vários preços Cremer só aparecem logado como revendedor.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
