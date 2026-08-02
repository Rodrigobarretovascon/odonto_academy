/**
 * Gera diagramas SVG didáticos por fase (estilo dente 11) para todos os FDI.
 * Anteriores: 6 fases. Pré-molares/molares: 7 fases (inclui sulcos oclusais).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public", "images");

const TEETH = [
  { n: 11, kind: "incisor", name: "Inc. central sup. D" },
  { n: 12, kind: "incisor", name: "Inc. lateral sup. D" },
  { n: 13, kind: "canine", name: "Canino sup. D" },
  { n: 14, kind: "premolar", name: "1º pré-molar sup. D" },
  { n: 15, kind: "premolar", name: "2º pré-molar sup. D" },
  { n: 16, kind: "molar", name: "1º molar sup. D" },
  { n: 17, kind: "molar", name: "2º molar sup. D" },
  { n: 21, kind: "incisor", name: "Inc. central sup. E" },
  { n: 22, kind: "incisor", name: "Inc. lateral sup. E" },
  { n: 23, kind: "canine", name: "Canino sup. E" },
  { n: 24, kind: "premolar", name: "1º pré-molar sup. E" },
  { n: 25, kind: "premolar", name: "2º pré-molar sup. E" },
  { n: 26, kind: "molar", name: "1º molar sup. E" },
  { n: 27, kind: "molar", name: "2º molar sup. E" },
  { n: 31, kind: "incisor", name: "Inc. central inf. E" },
  { n: 32, kind: "incisor", name: "Inc. lateral inf. E" },
  { n: 33, kind: "canine", name: "Canino inf. E" },
  { n: 34, kind: "premolar", name: "1º pré-molar inf. E" },
  { n: 35, kind: "premolar", name: "2º pré-molar inf. E" },
  { n: 36, kind: "molar", name: "1º molar inf. E" },
  { n: 37, kind: "molar", name: "2º molar inf. E" },
  { n: 41, kind: "incisor", name: "Inc. central inf. D" },
  { n: 42, kind: "incisor", name: "Inc. lateral inf. D" },
  { n: 43, kind: "canine", name: "Canino inf. D" },
  { n: 44, kind: "premolar", name: "1º pré-molar inf. D" },
  { n: 45, kind: "premolar", name: "2º pré-molar inf. D" },
  { n: 46, kind: "molar", name: "1º molar inf. D" },
  { n: 47, kind: "molar", name: "2º molar inf. D" },
];

const NAVY = "#1e3a6e";
const CREAM = "#f3e6c8";
const WAX = "#e8d4a8";
const GREEN = "#059669";
const RED = "#dc2626";
const ROSE = "#be185d";
const BG = "#f7fafc";

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function frame(title, badge, body, footer) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 640" role="img">
  <defs>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.12"/>
    </filter>
  </defs>
  <rect width="960" height="640" fill="${BG}"/>
  <text x="480" y="42" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="24" font-weight="700" fill="${NAVY}">${esc(title)}</text>
  ${badge}
  ${body}
  <g transform="translate(48,520)">
    <rect width="18" height="18" rx="3" fill="${GREEN}"/>
    <text x="28" y="15" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" fill="#334155">preservar / margem</text>
    <rect x="220" width="18" height="18" rx="3" fill="${RED}"/>
    <text x="248" y="15" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" fill="#334155">remover</text>
  </g>
  <text x="480" y="600" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="16" fill="#475569">${esc(footer)}</text>
</svg>`;
}

function badge(text) {
  return `<g>
    <rect x="36" y="62" width="${Math.min(420, 28 + text.length * 11)}" height="44" rx="22" fill="${NAVY}"/>
    <circle cx="58" cy="84" r="14" fill="#fbbf24"/>
    <text x="80" y="90" font-family="Montserrat,Segoe UI,sans-serif" font-size="15" font-weight="700" fill="#fff">${esc(text)}</text>
  </g>`;
}

function lecron() {
  return `<g transform="translate(70,150)" filter="url(#sh)">
    <rect x="18" y="0" width="14" height="260" rx="4" fill="#94a3b8"/>
    <rect x="14" y="0" width="22" height="40" rx="6" fill="#64748b"/>
    <path d="M12 260 L38 260 L25 310 Z" fill="#cbd5e1" stroke="#475569"/>
    <text x="25" y="340" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${NAVY}">Lecron</text>
  </g>`;
}

/** Silhueta proximal (vista mesial) — anterior */
function proximalAnterior(opts = {}) {
  const { red = true, green = true, labels = true } = opts;
  return `<g transform="translate(340,110)" filter="url(#sh)">
    ${red ? `<path d="M40 40 C20 100, 15 180, 35 300 L90 300 C70 180, 75 100, 95 40 Z" fill="${RED}" opacity="0.55"/>` : ""}
    <path d="M95 35 C70 90, 60 160, 70 300 L170 300 C185 200, 195 110, 175 40 C155 20, 115 18, 95 35 Z" fill="${WAX}" stroke="${NAVY}" stroke-width="2.5"/>
    ${green ? `<path d="M92 40 C72 95, 65 165, 74 295" fill="none" stroke="${GREEN}" stroke-width="4" stroke-linecap="round"/>` : ""}
    ${labels ? `
    <text x="210" y="90" font-family="Montserrat,Segoe UI,sans-serif" font-size="22" font-weight="800" fill="${NAVY}">V</text>
    <text x="40" y="160" font-family="Montserrat,Segoe UI,sans-serif" font-size="22" font-weight="800" fill="${ROSE}">L</text>
    <text x="120" y="250" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" font-weight="700" fill="${NAVY}">cíngulo</text>
    ` : ""}
  </g>`;
}

function proximalPosterior() {
  return `<g transform="translate(340,120)" filter="url(#sh)">
    <path d="M30 50 C10 120, 10 220, 40 300 L100 300 C70 210, 70 120, 90 50 Z" fill="${RED}" opacity="0.5"/>
    <path d="M95 40 C75 100, 70 180, 85 300 L200 300 C220 200, 230 110, 200 45 C170 20, 120 22, 95 40 Z" fill="${WAX}" stroke="${NAVY}" stroke-width="2.5"/>
    <path d="M92 45 C76 105, 74 185, 88 295" fill="none" stroke="${GREEN}" stroke-width="4"/>
    <ellipse cx="150" cy="70" rx="55" ry="28" fill="${CREAM}" stroke="${NAVY}" stroke-width="2"/>
    <text x="230" y="100" font-family="Montserrat,Segoe UI,sans-serif" font-size="20" font-weight="800" fill="${NAVY}">V</text>
    <text x="50" y="170" font-family="Montserrat,Segoe UI,sans-serif" font-size="20" font-weight="800" fill="${ROSE}">L</text>
  </g>`;
}

function facesBlock(n) {
  return `<g transform="translate(260,120)" filter="url(#sh)">
    <polygon points="80,40 320,40 320,300 80,300" fill="#cfe8f8" stroke="${NAVY}" stroke-width="3"/>
    <text x="200" y="160" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="56" font-weight="800" fill="${NAVY}">V</text>
    <text x="200" y="195" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="16" font-weight="700" fill="#2d5596">VESTIBULAR</text>
    <polygon points="320,40 420,10 420,270 320,300" fill="#fde7c7" stroke="${NAVY}" stroke-width="3"/>
    <text x="365" y="155" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="28" font-weight="800" fill="#9a3412">D</text>
    <rect x="-90" y="140" width="140" height="64" rx="12" fill="#d1fae5" stroke="${GREEN}" stroke-width="2"/>
    <text x="-20" y="168" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="26" font-weight="800" fill="${GREEN}">M</text>
    <text x="-20" y="190" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${GREEN}">MESIAL</text>
    <rect x="100" y="320" width="200" height="48" rx="12" fill="#fce7f3" stroke="${ROSE}" stroke-width="2"/>
    <text x="200" y="350" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="18" font-weight="800" fill="${ROSE}">L · LINGUAL</text>
    <text x="200" y="28" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" font-weight="700" fill="${NAVY}">FDI ${n}</text>
  </g>`;
}

function roundShape(kind) {
  const tip =
    kind === "canine"
      ? "M120 40 L160 120 L200 40"
      : kind === "incisor"
        ? "M90 50 L210 50"
        : "M90 70 Q150 30 210 70";
  return `<g transform="translate(360,130)" filter="url(#sh)">
    <path d="M100 60 C70 120, 65 200, 90 310 L210 310 C240 200, 245 120, 210 60 C180 35, 130 35, 100 60 Z" fill="${WAX}" stroke="${NAVY}" stroke-width="2.5"/>
    <path d="${tip}" fill="none" stroke="${NAVY}" stroke-width="2"/>
    <path d="M95 300 Q150 280 205 300" fill="none" stroke="${GREEN}" stroke-width="3"/>
    <text x="150" y="200" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="16" font-weight="700" fill="${NAVY}">arredondar</text>
    <text x="250" y="100" font-family="Montserrat,Segoe UI,sans-serif" font-size="18" font-weight="800" fill="${RED}">quinas ↓</text>
  </g>`;
}

function lingualFossa(hasOcclusal) {
  if (hasOcclusal) {
    return `<g transform="translate(340,140)" filter="url(#sh)">
      <ellipse cx="160" cy="150" rx="130" ry="110" fill="${WAX}" stroke="${NAVY}" stroke-width="2.5"/>
      <ellipse cx="160" cy="130" rx="40" ry="50" fill="${CREAM}" stroke="${NAVY}" stroke-width="2"/>
      <ellipse cx="160" cy="175" rx="35" ry="40" fill="${CREAM}" stroke="${NAVY}" stroke-width="2"/>
      <path d="M160 90 L160 210" stroke="${NAVY}" stroke-width="2" stroke-dasharray="6 4"/>
      <text x="160" y="40" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="16" font-weight="700" fill="${NAVY}">esboço das cúspides</text>
      <text x="160" y="290" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" fill="${ROSE}">ainda sem sulcos profundos</text>
    </g>`;
  }
  return `<g transform="translate(360,120)" filter="url(#sh)">
    <path d="M80 40 C50 100, 50 220, 90 310 L220 310 C250 200, 250 90, 210 40 C170 15, 110 15, 80 40 Z" fill="${WAX}" stroke="${NAVY}" stroke-width="2.5"/>
    <ellipse cx="155" cy="170" rx="45" ry="70" fill="${RED}" opacity="0.35"/>
    <path d="M120 100 Q155 90 190 100" fill="none" stroke="${GREEN}" stroke-width="3"/>
    <path d="M120 250 Q155 260 190 250" fill="none" stroke="${GREEN}" stroke-width="3"/>
    <text x="155" y="175" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" font-weight="700" fill="${RED}">fossa</text>
    <text x="260" y="120" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" font-weight="700" fill="${GREEN}">cristas</text>
  </g>`;
}

function detailShape(kind, hasOcclusal) {
  if (hasOcclusal) {
    return `<g transform="translate(340,140)" filter="url(#sh)">
      <ellipse cx="160" cy="150" rx="135" ry="115" fill="${WAX}" stroke="${NAVY}" stroke-width="2.5"/>
      <ellipse cx="120" cy="120" rx="42" ry="48" fill="${CREAM}" stroke="${NAVY}"/>
      <ellipse cx="200" cy="120" rx="38" ry="44" fill="${CREAM}" stroke="${NAVY}"/>
      <ellipse cx="120" cy="190" rx="36" ry="40" fill="${CREAM}" stroke="${NAVY}"/>
      <ellipse cx="200" cy="190" rx="34" ry="38" fill="${CREAM}" stroke="${NAVY}"/>
      <text x="160" y="40" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="16" font-weight="700" fill="${NAVY}">altura das cúspides</text>
      <text x="160" y="300" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" fill="#475569">conferir tabela · proporção</text>
    </g>`;
  }
  return `<g transform="translate(360,120)" filter="url(#sh)">
    <path d="M90 55 L210 55 L230 300 L70 300 Z" fill="${WAX}" stroke="${NAVY}" stroke-width="2.5"/>
    <path d="M90 55 L100 70" stroke="${NAVY}" stroke-width="2"/>
    <path d="M210 55 Q230 80 225 110" fill="none" stroke="${NAVY}" stroke-width="2"/>
    <text x="95" y="45" font-family="Montserrat,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${NAVY}">MI</text>
    <text x="210" y="45" font-family="Montserrat,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${NAVY}">DI</text>
    <text x="150" y="200" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="15" font-weight="700" fill="${NAVY}">proporção</text>
  </g>`;
}

function occlusalSulci(kind, n) {
  const pos = n % 10;
  let grooves;
  if (kind === "premolar") {
    grooves = `
      <path d="M90 150 L230 150" stroke="${RED}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="110" cy="150" r="10" fill="${RED}" opacity="0.7"/>
      <circle cx="210" cy="150" r="10" fill="${RED}" opacity="0.7"/>
      <text x="160" y="120" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${RED}">sulco central</text>
    `;
  } else if (pos === 6 && (n >= 30)) {
    // lower first molar Y
    grooves = `
      <path d="M100 100 L160 160 L100 220" fill="none" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>
      <path d="M160 160 L240 160" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>
      <text x="160" y="90" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${RED}">padrão em Y</text>
    `;
  } else if (kind === "molar" && n < 30) {
    grooves = `
      <path d="M100 150 L240 150" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>
      <path d="M160 90 L160 210" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
      <path d="M120 120 L200 180" stroke="${RED}" stroke-width="3" stroke-linecap="round"/>
      <text x="160" y="80" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${RED}">sulcos + fossa</text>
    `;
  } else {
    grooves = `
      <path d="M100 150 L240 150" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>
      <path d="M160 100 L160 200" stroke="${RED}" stroke-width="5" stroke-linecap="round"/>
      <text x="160" y="85" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="13" font-weight="700" fill="${RED}">cruz / sulcos</text>
    `;
  }
  return `<g transform="translate(340,130)" filter="url(#sh)">
    <ellipse cx="160" cy="150" rx="140" ry="120" fill="${WAX}" stroke="${NAVY}" stroke-width="2.5"/>
    <path d="M40 150 Q160 40 280 150 Q160 260 40 150" fill="none" stroke="${GREEN}" stroke-width="5" opacity="0.85"/>
    ${grooves}
    <text x="40" y="50" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" font-weight="700" fill="${GREEN}">cristas</text>
    <text x="250" y="50" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" font-weight="700" fill="${GREEN}">cúspides</text>
    <text x="160" y="300" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" fill="#475569">aprofundir em camadas finas · Lecron</text>
  </g>`;
}

function polishShape(hasOcclusal) {
  if (hasOcclusal) {
    return `<g transform="translate(340,130)" filter="url(#sh)">
      <ellipse cx="160" cy="150" rx="135" ry="115" fill="${WAX}" stroke="${NAVY}" stroke-width="2.5"/>
      <path d="M90 150 L230 150" stroke="#94a3b8" stroke-width="3"/>
      <text x="160" y="40" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="16" font-weight="700" fill="${NAVY}">revisão final</text>
      <text x="160" y="300" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" fill="#475569">alisar · conferir tabela · oclusal</text>
    </g>`;
  }
  return `<g transform="translate(360,120)" filter="url(#sh)">
    <path d="M90 50 L210 50 L225 300 L75 300 Z" fill="${WAX}" stroke="${NAVY}" stroke-width="2.5"/>
    <text x="150" y="180" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="16" font-weight="700" fill="${NAVY}">alisar</text>
    <text x="150" y="340" text-anchor="middle" font-family="Montserrat,Segoe UI,sans-serif" font-size="14" fill="#475569">revisão de faces · cera + Lecron</text>
  </g>`;
}

function titlesFor(kind) {
  const has = kind === "premolar" || kind === "molar";
  if (!has) {
    return [
      "Preparar o bloco e orientar as faces",
      "Proximais e redução grosseira",
      "Arredondar a macroforma",
      "Anatomia proximal e fossa lingual",
      "Borda, proporção e detalhes",
      "Refino e revisão final",
    ];
  }
  return [
    "Preparar o bloco e orientar as faces",
    "Proximais e redução grosseira",
    "Arredondar a macroforma",
    "Proximal, lingual e preparação oclusal",
    "Proporção, cúspides e detalhes",
    "Sulcos e fossas na oclusal",
    "Refino e revisão final",
  ];
}

function buildPhase(tooth, phaseId) {
  const { n, kind } = tooth;
  const has = kind === "premolar" || kind === "molar";
  const titles = titlesFor(kind);
  const title = `Etapa ${phaseId} — ${titles[phaseId - 1]} · FDI ${n}`;
  const footer = `FDI ${n} · ${tooth.name} · cera + Lecron`;

  if (phaseId === 1) {
    return frame(title, badge("ORIENTAR FACES: V / L / M / D"), facesBlock(n) + lecron(), footer);
  }
  if (phaseId === 2) {
    const body = lecron() + (has ? proximalPosterior() : proximalAnterior());
    return frame(title, badge("FACE EM TRABALHO: MESIAL (M)"), body, `Vista mesial · ${footer}`);
  }
  if (phaseId === 3) {
    return frame(title, badge("ARREDONDAR COM LECRON"), lecron() + roundShape(kind), footer);
  }
  if (phaseId === 4) {
    return frame(
      title,
      badge(has ? "CÚSPIDES — SEM SULCOS AINDA" : "FACE EM TRABALHO: LINGUAL (L)"),
      lecron() + lingualFossa(has),
      footer,
    );
  }
  if (phaseId === 5) {
    return frame(title, badge(has ? "PROPORÇÃO DAS CÚSPIDES" : "BORDA E PROPORÇÃO"), lecron() + detailShape(kind, has), footer);
  }
  if (has && phaseId === 6) {
    return frame(
      title,
      badge("FACE EM TRABALHO: OCLUSAL"),
      lecron() + occlusalSulci(kind, n),
      `Vista oclusal · ${footer}`,
    );
  }
  if ((has && phaseId === 7) || (!has && phaseId === 6)) {
    return frame(title, badge("REFINO E REVISÃO"), lecron() + polishShape(has), footer);
  }
  return null;
}

let count = 0;
for (const tooth of TEETH) {
  // 11/21 já têm PNG aprovados — ainda assim geramos SVG como fallback didático
  const has = tooth.kind === "premolar" || tooth.kind === "molar";
  const max = has ? 7 : 6;
  const dir = path.join(OUT, `tooth-${tooth.n}`);
  fs.mkdirSync(dir, { recursive: true });
  for (let p = 1; p <= max; p++) {
    const svg = buildPhase(tooth, p);
    if (!svg) continue;
    const file = path.join(dir, `fase-${String(p).padStart(2, "0")}.svg`);
    fs.writeFileSync(file, svg, "utf8");
    count++;
  }
}

console.log(`Generated ${count} phase SVG diagrams.`);

// Atualiza o manifesto PNG/SVG usado pelo app
try {
  const { spawnSync } = await import("node:child_process");
  const r = spawnSync(process.execPath, [path.join(__dirname, "build-phase-image-manifest.mjs")], {
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
} catch (err) {
  console.warn("Não foi possível atualizar o manifesto:", err);
}
