import type { ToothSculptureData, ToothViewData } from "../types/tooth";

type Jaw = "upper" | "lower";
type ToothKind = "incisor" | "canine" | "premolar" | "molar";

interface ToothMeta {
  number: number;
  name: string;
  shortName: string;
  navGroup: "upper-r" | "upper-l" | "lower-l" | "lower-r";
  kind: ToothKind;
  jaw: Jaw;
  contralateral: number;
  contralateralName: string;
  blockMeasures: Array<{ label: string; value: string }>;
}

const IMAGE_CACHE = "v5";

const img = (number: number, file: string, alt: string, placeholderLabel: string) => ({
  src: `/images/tooth-${number}/${file}?v=${IMAGE_CACHE}`,
  alt,
  placeholderLabel,
});

/** Layout fixo (vestibular → palatina/lingual → mesial → distal → incisal).
 *  Legendas da esquerda para a direita: Distal, Mesial, Lingual, Vestibular, Incisal. */
function finalViews(number: number, meta: Pick<ToothMeta, "jaw" | "kind">): ToothViewData[] {
  const backKey = meta.jaw === "upper" ? "palatina" : "lingual";
  const topKey = meta.kind === "incisor" || meta.kind === "canine" ? "incisal" : "oclusal";
  const topLabel = topKey === "incisal" ? "Incisal" : "Oclusal";

  const slots: Array<{ label: string; file: string; alt: string }> = [
    { label: "Distal", file: `${number}-final-vestibular.png`, alt: "Vista vestibular final" },
    { label: "Mesial", file: `${number}-final-${backKey}.png`, alt: "Vista palatina/lingual final" },
    { label: "Lingual", file: `${number}-final-mesial.png`, alt: "Vista mesial final" },
    { label: "Vestibular", file: `${number}-final-distal.png`, alt: "Vista distal final" },
    { label: topLabel, file: `${number}-final-${topKey}.png`, alt: `Vista ${topLabel.toLowerCase()} final` },
  ];

  return slots.map(({ label, file, alt }) => ({
    label,
    image: img(number, file, alt, `Imagem — ${label.toLowerCase()}`),
  }));
}

function buildTooth(meta: ToothMeta): ToothSculptureData {
  const innerFace = meta.jaw === "upper" ? "palatina" : "lingual";
  return {
    number: meta.number,
    name: meta.name,
    contralateralNumber: meta.contralateral,
    contralateralName: meta.contralateralName,
    title: `Escultura Dental em Cera – Dente ${meta.number}`,
    subtitle: `${meta.name.replace(/ (direito|esquerdo)$/, "")} · par contralateral ${meta.contralateral}`,
    contralateralNote: undefined,
    blockMeasures: meta.blockMeasures,
    blockPreparation: [
      "Selecione o bloco de cera com as dimensões indicadas.",
      "Marque a linha cervical com régua — ela separa coroa e raiz na escultura.",
      "Com o estilete, trace linhas leves dividindo o bloco em terços (incisal, médio, cervical).",
      "Marque as faces: vestibular, " + innerFace + ", mesial e distal antes de desbastar.",
      "Não remova cera demais nesta fase; as marcações guiam todo o procedimento.",
    ],
    faceIdentification: {
      id: 2,
      title: "Identifique e marque as faces",
      instructions: [
        "Vestibular — face externa voltada para lábios ou bochechas.",
        `${innerFace.charAt(0).toUpperCase()}${innerFace.slice(1)} — face interna voltada para palato ou língua.`,
        "Mesial — face que aponta para a linha média do arco.",
        "Distal — face que se afasta da linha média.",
        meta.kind === "molar" || meta.kind === "premolar"
          ? "Oclusal — superfície de mastigação com cúspides, sulcos e fossas."
          : "Incisal — borda de corte ou cúspide principal.",
        "Use linhas finas na cera para delimitar cada face antes do desgaste.",
      ],
    },
    steps: [
      {
        id: 3,
        title: "Desenhe o perfil nas proximais",
        instructions: ["Trace o contorno nas faces mesial e distal.", "Projete a curva vestibular e a linha cervical."],
      },
      {
        id: 4,
        title: "Faça o desgaste grosseiro",
        instructions: ["Remova o excesso de cera fora do perfil.", "Preserve volume para detalhes finais."],
      },
      {
        id: 5,
        title: "Forme a vestibular",
        instructions: ["Modele a convexidade vestibular.", "Arredonde transições cervicais e incisais/oclusais."],
      },
      {
        id: 6,
        title: `Esculpa a ${innerFace}`,
        instructions: [`Defina cristas e concavidades na face ${innerFace}.`, "Mantenha espessura uniforme."],
      },
      {
        id: 7,
        title: "Ajuste proporções",
        instructions: ["Verifique simetria nas vistas mesial, distal e superior.", "Corrija inclinações e espessuras."],
      },
      {
        id: 8,
        title: "Finalize os detalhes",
        instructions: ["Refine anatomia superficial.", "Polimento final com escova e meia fina."],
      },
      ...(meta.kind === "molar" || meta.kind === "premolar"
        ? [
            {
              id: 9,
              title: "Esculpindo a oclusal e os sulcos",
              instructions: [
                "Identifique as cúspides e o padrão oclusal do dente.",
                "Escave os sulcos centrais com Le cron ou instrumento fino — profundidade uniforme.",
                "Mantenha paredes inclinadas e fossas arredondadas; evite sulcos muito profundos.",
                "Compare com o visualizador 3D e as vistas finais.",
              ],
            },
          ]
        : []),
    ],
    finalViews: finalViews(meta.number, meta),
    contralateralDifferences: [
      {
        aspect: "Espelhamento",
        primaryTooth: `Mesial voltada à linha média (dente ${meta.number}).`,
        contralateralTooth: `Mesial voltada à linha média (dente ${meta.contralateral}).`,
      },
      {
        aspect: "Procedimento",
        primaryTooth: "Mesmos passos descritos nesta página.",
        contralateralTooth: "Repetir trocando mesial ↔ distal.",
      },
    ],
    alerts: [
      "Instrumentos: Le cron, estilete, escova, meia fina, régua.",
      "Não remover cera demais nas fases iniciais.",
    ],
  };
}

const METAS: ToothMeta[] = [
  { number: 11, name: "Incisivo central superior direito", shortName: "Inc. Central", navGroup: "upper-r", kind: "incisor", jaw: "upper", contralateral: 21, contralateralName: "Incisivo central superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "10,5 mm" }, { label: "Mesiodistal", value: "8,5 mm" }, { label: "Vestíbulo-palatina", value: "7,0 mm" }] },
  { number: 12, name: "Incisivo lateral superior direito", shortName: "Inc. Lateral", navGroup: "upper-r", kind: "incisor", jaw: "upper", contralateral: 22, contralateralName: "Incisivo lateral superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "9,0 mm" }, { label: "Mesiodistal", value: "6,5 mm" }, { label: "Vestíbulo-palatina", value: "6,0 mm" }] },
  { number: 13, name: "Canino superior direito", shortName: "Canino", navGroup: "upper-r", kind: "canine", jaw: "upper", contralateral: 23, contralateralName: "Canino superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "10,5 mm" }, { label: "Mesiodistal", value: "7,9 mm" }, { label: "Vestíbulo-palatina", value: "8,4 mm" }] },
  { number: 14, name: "Primeiro pré-molar superior direito", shortName: "1º Pré-M", navGroup: "upper-r", kind: "premolar", jaw: "upper", contralateral: 24, contralateralName: "Primeiro pré-molar superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "8,5 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-palatina", value: "9,0 mm" }] },
  { number: 15, name: "Segundo pré-molar superior direito", shortName: "2º Pré-M", navGroup: "upper-r", kind: "premolar", jaw: "upper", contralateral: 25, contralateralName: "Segundo pré-molar superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "8,0 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-palatina", value: "8,5 mm" }] },
  { number: 16, name: "Primeiro molar superior direito", shortName: "1º Molar", navGroup: "upper-r", kind: "molar", jaw: "upper", contralateral: 26, contralateralName: "Primeiro molar superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "7,5 mm" }, { label: "Mesiodistal", value: "10,5 mm" }, { label: "Vestíbulo-palatina", value: "11,0 mm" }] },
  { number: 17, name: "Segundo molar superior direito", shortName: "2º Molar", navGroup: "upper-r", kind: "molar", jaw: "upper", contralateral: 27, contralateralName: "Segundo molar superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "7,0 mm" }, { label: "Mesiodistal", value: "10,0 mm" }, { label: "Vestíbulo-palatina", value: "10,0 mm" }] },
  { number: 21, name: "Incisivo central superior esquerdo", shortName: "Inc. Central", navGroup: "upper-l", kind: "incisor", jaw: "upper", contralateral: 11, contralateralName: "Incisivo central superior direito", blockMeasures: [{ label: "Altura da coroa", value: "10,5 mm" }, { label: "Mesiodistal", value: "8,5 mm" }, { label: "Vestíbulo-palatina", value: "7,0 mm" }] },
  { number: 22, name: "Incisivo lateral superior esquerdo", shortName: "Inc. Lateral", navGroup: "upper-l", kind: "incisor", jaw: "upper", contralateral: 12, contralateralName: "Incisivo lateral superior direito", blockMeasures: [{ label: "Altura da coroa", value: "9,0 mm" }, { label: "Mesiodistal", value: "6,5 mm" }, { label: "Vestíbulo-palatina", value: "6,0 mm" }] },
  { number: 23, name: "Canino superior esquerdo", shortName: "Canino", navGroup: "upper-l", kind: "canine", jaw: "upper", contralateral: 13, contralateralName: "Canino superior direito", blockMeasures: [{ label: "Altura da coroa", value: "10,5 mm" }, { label: "Mesiodistal", value: "7,9 mm" }, { label: "Vestíbulo-palatina", value: "8,4 mm" }] },
  { number: 24, name: "Primeiro pré-molar superior esquerdo", shortName: "1º Pré-M", navGroup: "upper-l", kind: "premolar", jaw: "upper", contralateral: 14, contralateralName: "Primeiro pré-molar superior direito", blockMeasures: [{ label: "Altura da coroa", value: "8,5 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-palatina", value: "9,0 mm" }] },
  { number: 25, name: "Segundo pré-molar superior esquerdo", shortName: "2º Pré-M", navGroup: "upper-l", kind: "premolar", jaw: "upper", contralateral: 15, contralateralName: "Segundo pré-molar superior direito", blockMeasures: [{ label: "Altura da coroa", value: "8,0 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-palatina", value: "8,5 mm" }] },
  { number: 26, name: "Primeiro molar superior esquerdo", shortName: "1º Molar", navGroup: "upper-l", kind: "molar", jaw: "upper", contralateral: 16, contralateralName: "Primeiro molar superior direito", blockMeasures: [{ label: "Altura da coroa", value: "7,5 mm" }, { label: "Mesiodistal", value: "10,5 mm" }, { label: "Vestíbulo-palatina", value: "11,0 mm" }] },
  { number: 27, name: "Segundo molar superior esquerdo", shortName: "2º Molar", navGroup: "upper-l", kind: "molar", jaw: "upper", contralateral: 17, contralateralName: "Segundo molar superior direito", blockMeasures: [{ label: "Altura da coroa", value: "7,0 mm" }, { label: "Mesiodistal", value: "10,0 mm" }, { label: "Vestíbulo-palatina", value: "10,0 mm" }] },
  { number: 31, name: "Incisivo central inferior esquerdo", shortName: "Inc. Central", navGroup: "lower-l", kind: "incisor", jaw: "lower", contralateral: 41, contralateralName: "Incisivo central inferior direito", blockMeasures: [{ label: "Altura da coroa", value: "9,0 mm" }, { label: "Mesiodistal", value: "5,4 mm" }, { label: "Vestíbulo-lingual", value: "6,0 mm" }] },
  { number: 32, name: "Incisivo lateral inferior esquerdo", shortName: "Inc. Lateral", navGroup: "lower-l", kind: "incisor", jaw: "lower", contralateral: 42, contralateralName: "Incisivo lateral inferior direito", blockMeasures: [{ label: "Altura da coroa", value: "9,5 mm" }, { label: "Mesiodistal", value: "6,0 mm" }, { label: "Vestíbulo-lingual", value: "6,0 mm" }] },
  { number: 33, name: "Canino inferior esquerdo", shortName: "Canino", navGroup: "lower-l", kind: "canine", jaw: "lower", contralateral: 43, contralateralName: "Canino inferior direito", blockMeasures: [{ label: "Altura da coroa", value: "11,0 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-lingual", value: "8,0 mm" }] },
  { number: 34, name: "Primeiro pré-molar inferior esquerdo", shortName: "1º Pré-M", navGroup: "lower-l", kind: "premolar", jaw: "lower", contralateral: 44, contralateralName: "Primeiro pré-molar inferior direito", blockMeasures: [{ label: "Altura da coroa", value: "8,5 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-lingual", value: "9,0 mm" }] },
  { number: 35, name: "Segundo pré-molar inferior esquerdo", shortName: "2º Pré-M", navGroup: "lower-l", kind: "premolar", jaw: "lower", contralateral: 45, contralateralName: "Segundo pré-molar inferior direito", blockMeasures: [{ label: "Altura da coroa", value: "8,0 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-lingual", value: "8,5 mm" }] },
  { number: 36, name: "Primeiro molar inferior esquerdo", shortName: "1º Molar", navGroup: "lower-l", kind: "molar", jaw: "lower", contralateral: 46, contralateralName: "Primeiro molar inferior direito", blockMeasures: [{ label: "Altura da coroa", value: "7,5 mm" }, { label: "Mesiodistal", value: "11,0 mm" }, { label: "Vestíbulo-lingual", value: "10,5 mm" }] },
  { number: 37, name: "Segundo molar inferior esquerdo", shortName: "2º Molar", navGroup: "lower-l", kind: "molar", jaw: "lower", contralateral: 47, contralateralName: "Segundo molar inferior direito", blockMeasures: [{ label: "Altura da coroa", value: "7,0 mm" }, { label: "Mesiodistal", value: "10,0 mm" }, { label: "Vestíbulo-lingual", value: "10,0 mm" }] },
  { number: 41, name: "Incisivo central inferior direito", shortName: "Inc. Central", navGroup: "lower-r", kind: "incisor", jaw: "lower", contralateral: 31, contralateralName: "Incisivo central inferior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "9,0 mm" }, { label: "Mesiodistal", value: "5,4 mm" }, { label: "Vestíbulo-lingual", value: "6,0 mm" }] },
  { number: 42, name: "Incisivo lateral inferior direito", shortName: "Inc. Lateral", navGroup: "lower-r", kind: "incisor", jaw: "lower", contralateral: 32, contralateralName: "Incisivo lateral inferior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "9,5 mm" }, { label: "Mesiodistal", value: "6,0 mm" }, { label: "Vestíbulo-lingual", value: "6,0 mm" }] },
  { number: 43, name: "Canino inferior direito", shortName: "Canino", navGroup: "lower-r", kind: "canine", jaw: "lower", contralateral: 33, contralateralName: "Canino inferior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "11,0 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-lingual", value: "8,0 mm" }] },
  { number: 44, name: "Primeiro pré-molar inferior direito", shortName: "1º Pré-M", navGroup: "lower-r", kind: "premolar", jaw: "lower", contralateral: 34, contralateralName: "Primeiro pré-molar inferior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "8,5 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-lingual", value: "9,0 mm" }] },
  { number: 45, name: "Segundo pré-molar inferior direito", shortName: "2º Pré-M", navGroup: "lower-r", kind: "premolar", jaw: "lower", contralateral: 35, contralateralName: "Segundo pré-molar inferior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "8,0 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-lingual", value: "8,5 mm" }] },
  { number: 46, name: "Primeiro molar inferior direito", shortName: "1º Molar", navGroup: "lower-r", kind: "molar", jaw: "lower", contralateral: 36, contralateralName: "Primeiro molar inferior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "7,5 mm" }, { label: "Mesiodistal", value: "11,0 mm" }, { label: "Vestíbulo-lingual", value: "10,5 mm" }] },
  { number: 47, name: "Segundo molar inferior direito", shortName: "2º Molar", navGroup: "lower-r", kind: "molar", jaw: "lower", contralateral: 37, contralateralName: "Segundo molar inferior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "7,0 mm" }, { label: "Mesiodistal", value: "10,0 mm" }, { label: "Vestíbulo-lingual", value: "10,0 mm" }] },
];

export const teeth: Record<string, ToothSculptureData> = Object.fromEntries(
  METAS.map((meta) => [String(meta.number), buildTooth(meta)]),
);

export const toothOrder = [
  "11", "12", "13", "14", "15", "16", "17",
  "21", "22", "23", "24", "25", "26", "27",
  "31", "32", "33", "34", "35", "36", "37",
  "41", "42", "43", "44", "45", "46", "47",
] as const;

export const toothNavItems = METAS.map((m) => ({
  key: String(m.number),
  shortName: m.shortName,
  fullName: m.name,
  group: m.navGroup,
}));
