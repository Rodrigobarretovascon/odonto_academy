#!/usr/bin/env node
/**
 * Extrai imagens individuais do slide de referência (dente 11).
 * Coordenadas calibradas manualmente sobre dente-11-slide.png (1024×574).
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public", "images");
const SLIDE = path.join(publicDir, "reference", "dente-11-slide.png");

/** @type {Record<string, { left: number; top: number; width: number; height: number }>} */
const SLIDE11_CROPS = {
  "01-bloco-medidas": { left: 12, top: 88, width: 128, height: 148 },
  "02-faces": { left: 270, top: 124, width: 224, height: 122 },
  "03-perfil-proximal": { left: 518, top: 132, width: 234, height: 86 },
  "04-desgaste-grosseiro": { left: 768, top: 138, width: 240, height: 118 },
  "05-vestibular": { left: 12, top: 332, width: 232, height: 82 },
  "06-palatina": { left: 264, top: 318, width: 236, height: 98 },
  "07-proporcao-incisal": { left: 514, top: 318, width: 240, height: 98 },
  "08-finalizacao": { left: 766, top: 318, width: 242, height: 98 },
  "final-vestibular": { left: 20, top: 458, width: 172, height: 102 },
  "final-palatina": { left: 190, top: 458, width: 172, height: 102 },
  "final-mesial": { left: 360, top: 458, width: 172, height: 102 },
  "final-distal": { left: 530, top: 458, width: 172, height: 102 },
  "final-incisal": { left: 700, top: 458, width: 172, height: 102 },
};

async function extractSlide11() {
  const outDir = path.join(publicDir, "tooth-11");
  await mkdir(outDir, { recursive: true });
  const slide = sharp(SLIDE);

  for (const [name, rect] of Object.entries(SLIDE11_CROPS)) {
    await slide.clone().extract(rect).png().toFile(path.join(outDir, `${name}.png`));
    console.log(`✓ tooth-11/${name}.png`);
  }
}

/** Colagem 4 vistas verticais + 1 incisal à direita */
async function extractFinalViewsFromCollage(inputFile, outDir, prefix) {
  await mkdir(outDir, { recursive: true });
  const meta = await sharp(inputFile).metadata();
  const width = meta.width ?? 800;
  const height = meta.height ?? 400;

  const views = [
    { name: "vestibular", left: 0.02, top: 0.08, w: 0.19, h: 0.72 },
    { name: "mesial", left: 0.21, top: 0.08, w: 0.19, h: 0.72 },
    { name: "lingual", left: 0.405, top: 0.08, w: 0.19, h: 0.72 },
    { name: "distal", left: 0.6, top: 0.08, w: 0.19, h: 0.72 },
    { name: "incisal", left: 0.82, top: 0.1, w: 0.15, h: 0.58 },
  ];

  const img = sharp(inputFile);
  for (const v of views) {
    await img
      .clone()
      .extract({
        left: Math.round(width * v.left),
        top: Math.round(height * v.top),
        width: Math.round(width * v.w),
        height: Math.round(height * v.h),
      })
      .png()
      .toFile(path.join(outDir, `${prefix}-final-${v.name}.png`));
    console.log(`✓ ${prefix}/final-${v.name}.png`);
  }
}

async function main() {
  console.log("Extraindo imagens do slide dente 11…");
  await extractSlide11();

  const caninoInf = path.join(
    publicDir,
    "final-views",
    "WhatsApp_Image_2026-07-20_at_17.34.55-890694ae-57ec-40ab-900a-208ffe65fc7b.png",
  );
  console.log("\nExtraindo vistas finais — canino inferior…");
  await extractFinalViewsFromCollage(caninoInf, path.join(publicDir, "tooth-33"), "33");

  console.log("\nConcluído.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
