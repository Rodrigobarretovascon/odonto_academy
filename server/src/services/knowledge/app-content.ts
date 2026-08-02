import type { KnowledgeChunk } from "./types.js";

/**
 * Conteúdo espelhado do app (resumos + roteiro de escultura didático)
 * para retrieval — sem depender do bundle do frontend.
 */
export const APP_CONTENT_CHUNKS: KnowledgeChunk[] = [
  {
    id: "app-resumo-faces",
    title: "Resumo do app — Faces do dente",
    tags: ["faces", "vestibular", "lingual", "mesial", "distal", "oclusal", "incisal", "resumo", "anatomia"],
    body: `Cada dente permanente apresenta faces orientadas no arco. Vestibular olha para lábios/bochechas; lingual para a cavidade oral interna; mesial e distal relacionam-se à linha média; a face de mastigação é incisal (anteriores) ou oclusal (posteriores). No GB Dental usamos “lingual” também nos superiores.`,
    audience: "student",
  },
  {
    id: "app-resumo-periodonto",
    title: "Resumo do app — Periodonto",
    tags: ["periodonto", "gengiva", "ligamento", "cemento", "osso", "resumo"],
    body: `O periodonto de inserção e proteção inclui gengiva, ligamento periodontal, cemento e osso alveolar. Alterações inflamatórias podem evoluir de gengivite para periodontite. Contorno proximal adequado na restauração/escultura ajuda a preservar o periodonto.`,
    audience: "student",
  },
  {
    id: "app-resumo-fdi",
    title: "Resumo do app — Numeração FDI",
    tags: ["fdi", "nomenclatura", "quadrante", "resumo"],
    body: `No sistema FDI permanente, quadrantes 1 e 2 são superiores (direita e esquerda do paciente); 3 e 4, inferiores. O segundo dígito conta a partir da linha média (1 central … 8 terceiro molar). Ex.: 23 = canino superior esquerdo.`,
    audience: "student",
  },
  {
    id: "app-escultura-fluxo",
    title: "Roteiro GB Dental — fluxo de escultura",
    tags: ["escultura", "cera", "lecron", "roteiro", "regressiva", "app"],
    body: `Nas páginas /app/escultura/{FDI}: 1) Marcar medidas da tabela (altura, MD, VL) no bloco com Lecron e definir V/L/M/D. 2) Proximais com margem de segurança (começar mesial). 3) Arredondar macroforma. 4) Anatomia proximal/lingual (cúspides nos posteriores). 5) Detalhes. 6) Posteriores: sulcos oclusais. 7) Refino. Face em trabalho sempre visível. Verde=preservar; vermelho=remover.`,
    audience: "student",
  },
  {
    id: "app-escultura-proximais",
    title: "Escultura — proximais e redução grosseira",
    tags: ["escultura", "mesial", "distal", "proximal", "margem", "cera", "lecron"],
    body: `Na face MESIAL desenhe o perfil com margem de segurança; reduza cera fora da margem; depois repita na DISTAL. Convergência cervical. Colo é zona de risco de fratura. Mesial e distal não são simétricas — distal costuma ser mais convexa/arredondada.`,
    audience: "student",
  },
  {
    id: "app-escultura-oclusal",
    title: "Escultura — sulcos oclusais (posteriores)",
    tags: ["escultura", "oclusal", "sulco", "fossa", "cúspide", "cuspide", "molar", "premolar", "pré-molar"],
    body: `FACE EM TRABALHO: OCLUSAL. Esboce cúspides → risque sulcos leves → aprofunde em camadas. Preserve pontas e cristas marginais. Padrões: pré-molar (sulco central), 1º molar superior (crista oblíqua), 1º molar inferior (Y / 5 cúspides). Sulcos rasos e limpos com Lecron.`,
    audience: "student",
  },
  {
    id: "app-anatomia-anteriores",
    title: "Anatomia rápida — anteriores",
    tags: ["incisivo", "canino", "anterior", "cíngulo", "cingulo", "mamelão", "mamelao"],
    body: `Centrais superiores: coroa larga, MI ~90°, DI arredondado, fossa+cíngulo. Laterais superiores: mais estreitos, distal inclinada. Inferiores: estreitos e sutis. Caninos: cúspide única, pentágono vestibular, distal mais curta; crista lingual intermediária no superior.`,
    audience: "student",
  },
  {
    id: "app-anatomia-posteriores",
    title: "Anatomia rápida — posteriores",
    tags: ["pré-molar", "pre-molar", "premolar", "molar", "carabelli", "oclusal"],
    body: `1º PMS: V>L. 2º PMS: cúspides mais iguais. 1º PMI: V dominante + sulco mesiolingual. 1º MS: 4 cúspides ± Carabelli, crista oblíqua. 1º MI: 5 cúspides, padrão Y. 2º MI: 4 cúspides, mais retangular.`,
    audience: "student",
  },
];
