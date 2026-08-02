// Varre public/images/tooth-*/fase-XX.png|svg e gera o manifesto.
// Uso: node scripts/build-phase-image-manifest.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public", "images");
const outFile = path.join(__dirname, "..", "src", "data", "phase-image-manifest.ts");

const png = [];
const svg = [];

for (const dir of fs.readdirSync(root).filter((d) => d.startsWith("tooth-")).sort()) {
  const n = Number(dir.replace("tooth-", ""));
  if (!Number.isFinite(n)) continue;
  const folder = path.join(root, dir);
  for (const file of fs.readdirSync(folder).sort()) {
    const m = file.match(/^fase-(\d{2})\.(png|svg)$/);
    if (!m) continue;
    const phase = Number(m[1]);
    const key = `${n}:${phase}`;
    if (m[2] === "png") png.push(key);
    else svg.push(key);
  }
}

const body = `/**
 * Manifesto gerado automaticamente — não editar à mão.
 * Rodar: node scripts/build-phase-image-manifest.mjs
 */

export const PHASE_IMAGE_CACHE = "v17-estilo-guia";

/** Chaves \`\${tooth}:\${phase}\` com PNG didático disponível. */
export const PHASE_PNG_KEYS: ReadonlySet<string> = new Set(
${JSON.stringify(png, null, 2)}
);

/** Chaves \`\${tooth}:\${phase}\` com SVG didático disponível. */
export const PHASE_SVG_KEYS: ReadonlySet<string> = new Set(
${JSON.stringify(svg, null, 2)}
);

export function phaseAssetKey(tooth: number, phase: number): string {
  return \`\${tooth}:\${phase}\`;
}
`;

fs.writeFileSync(outFile, body);
console.log(`Manifest: ${png.length} PNG · ${svg.length} SVG → ${path.relative(process.cwd(), outFile)}`);
