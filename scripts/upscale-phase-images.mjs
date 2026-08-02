/**
 * Gera versões em alta resolução (2×) das imagens fase-*.png.
 * 1536×1024 → 3072×2048 (adequado a telas Retina).
 *
 * Uso: node scripts/upscale-phase-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public", "images");
const TARGET_W = 3072;
const TARGET_H = 2048;

let done = 0;
let skipped = 0;

for (const dir of fs.readdirSync(root).filter((d) => d.startsWith("tooth-")).sort()) {
  const folder = path.join(root, dir);
  for (const file of fs.readdirSync(folder).sort()) {
    if (!/^fase-\d{2}\.png$/.test(file)) continue;
    const filePath = path.join(folder, file);
    const meta = await sharp(filePath).metadata();
    const w = meta.width ?? 0;
    const h = meta.height ?? 0;

    if (w >= TARGET_W && h >= TARGET_H) {
      skipped++;
      continue;
    }

    const tmp = `${filePath}.hires.tmp.png`;
    await sharp(filePath)
      .resize(TARGET_W, TARGET_H, {
        fit: "fill",
        kernel: sharp.kernel.lanczos3,
      })
      .png({ compressionLevel: 6, adaptiveFiltering: true })
      .toFile(tmp);

    fs.renameSync(tmp, filePath);
    done++;
    console.log(`↑ ${dir}/${file}  ${w}×${h} → ${TARGET_W}×${TARGET_H}`);
  }
}

console.log(`Pronto: ${done} atualizadas · ${skipped} já em alta resolução.`);

// Atualiza manifesto / cache bust
const { spawnSync } = await import("node:child_process");
spawnSync(process.execPath, [path.join(__dirname, "build-phase-image-manifest.mjs")], {
  stdio: "inherit",
});
