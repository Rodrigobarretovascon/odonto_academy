import type { ToothSculptureData, ToothViewData } from "../types/tooth";
import { sculptureScriptFor } from "./sculpture-scripts";

export {
  resolvePhaseGuideImage,
  resolveStepGuideImage,
  resolveStepGuideSvg,
} from "./phase-images";
export type { ResolvedPhaseImage, PhaseImageFormat } from "./phase-images";

type Jaw = "upper" | "lower";
type ToothKind = "incisor" | "canine" | "premolar" | "molar";

interface ToothMeta {
  number: number;
  name: string;
  shortName: string;
  navGroup: string;
  kind: ToothKind;
  jaw: Jaw;
  contralateral: number;
  contralateralName: string;
  blockMeasures: Array<{ label: string; value: string }>;
}

const IMAGE_CACHE = "v12-dentistica";

const img = (number: number, file: string, alt: string, placeholderLabel: string) => ({
  src: `/images/tooth-${number}/${file}?v=${IMAGE_CACHE}`,
  alt,
  placeholderLabel,
});

function finalViews(number: number, meta: Pick<ToothMeta, "jaw" | "kind">): ToothViewData[] {
  const backKey = meta.jaw === "upper" ? "palatina" : "lingual";
  const topKey = meta.kind === "incisor" || meta.kind === "canine" ? "incisal" : "oclusal";
  const topLabel = topKey === "incisal" ? "Incisal" : "Oclusal";

  const slots: Array<{ label: string; file: string; alt: string }> = [
    { label: "Vestibular", file: `${number}-final-vestibular.png`, alt: "Vista vestibular final" },
    { label: "Lingual", file: `${number}-final-${backKey}.png`, alt: "Vista lingual final" },
    { label: "Mesial", file: `${number}-final-mesial.png`, alt: "Vista mesial final" },
    { label: "Distal", file: `${number}-final-distal.png`, alt: "Vista distal final" },
    { label: topLabel, file: `${number}-final-${topKey}.png`, alt: `Vista ${topLabel.toLowerCase()} final` },
  ];

  return slots.map(({ label, file, alt }) => ({
    label,
    image: img(number, file, alt, `PLACEHOLDER — /images/tooth-${number}/${file}`),
  }));
}

function buildTooth(meta: ToothMeta): ToothSculptureData {
  const altura = meta.blockMeasures.find((m) => /altura/i.test(m.label))?.value;
  const md = meta.blockMeasures.find((m) => /mesio/i.test(m.label))?.value;
  const vl = meta.blockMeasures.find((m) => /vestíbulo|vestibulo|lingual/i.test(m.label))?.value;
  const script = sculptureScriptFor(
    meta.number,
    meta.kind,
    meta.jaw,
    { altura, md, vl },
    meta.name,
  );
  const facesStep =
    script.find((s) => s.animPhase === "faces") ??
    script.find((s) => s.animPhase === "measure") ??
    script[0];

  return {
    number: meta.number,
    name: meta.name,
    contralateralNumber: meta.contralateral,
    contralateralName: meta.contralateralName,
    title: `${meta.name} · FDI ${meta.number}`,
    subtitle: `Arcada ${meta.jaw === "upper" ? "superior" : "inferior"} · FDI ${meta.number}`,
    contralateralNote: undefined,
    blockMeasures: meta.blockMeasures,
    blockPreparation: [
      `Use os valores da tabela oferecida acima: altura ${altura ?? "—"}, mesiodistal ${md ?? "—"} e vestíbulo-lingual ${vl ?? "—"}.`,
      "Marque esses valores no bloco de cera com o Lecron — eles guiam toda a escultura.",
      `Oriente as faces V, L, M e D do dente ${meta.number}. Materiais: apenas cera e Lecron.`,
    ],
    faceIdentification: {
      id: facesStep.id,
      title: facesStep.title,
      instructions: facesStep.instructions,
      alert: facesStep.alert,
      animPhase: facesStep.animPhase,
    },
    steps: script.map(({ animPhase, ...s }) => ({ ...s, animPhase })),
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
        contralateralTooth: "Abrir o dente contralateral na navegação para ver o roteiro dele.",
      },
    ],
    alerts: [
      "Materiais: bloco de cera e Lecron.",
      "Não remover cera demais nas fases iniciais — preserve margem de segurança.",
    ],
  };
}

const METAS: ToothMeta[] = [
  { number: 11, name: "Incisivo central superior direito", shortName: "Inc. Central", navGroup: "upper-r", kind: "incisor", jaw: "upper", contralateral: 21, contralateralName: "Incisivo central superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "10,5 mm" }, { label: "Mesiodistal", value: "8,5 mm" }, { label: "Vestíbulo-lingual", value: "7,0 mm" }] },
  { number: 12, name: "Incisivo lateral superior direito", shortName: "Inc. Lateral", navGroup: "upper-r", kind: "incisor", jaw: "upper", contralateral: 22, contralateralName: "Incisivo lateral superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "9,0 mm" }, { label: "Mesiodistal", value: "6,5 mm" }, { label: "Vestíbulo-lingual", value: "6,0 mm" }] },
  { number: 13, name: "Canino superior direito", shortName: "Canino", navGroup: "upper-r", kind: "canine", jaw: "upper", contralateral: 23, contralateralName: "Canino superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "10,5 mm" }, { label: "Mesiodistal", value: "7,9 mm" }, { label: "Vestíbulo-lingual", value: "8,4 mm" }] },
  { number: 14, name: "Primeiro pré-molar superior direito", shortName: "1º Pré-M", navGroup: "upper-r", kind: "premolar", jaw: "upper", contralateral: 24, contralateralName: "Primeiro pré-molar superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "8,5 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-lingual", value: "9,0 mm" }] },
  { number: 15, name: "Segundo pré-molar superior direito", shortName: "2º Pré-M", navGroup: "upper-r", kind: "premolar", jaw: "upper", contralateral: 25, contralateralName: "Segundo pré-molar superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "8,0 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-lingual", value: "8,5 mm" }] },
  { number: 16, name: "Primeiro molar superior direito", shortName: "1º Molar", navGroup: "upper-r", kind: "molar", jaw: "upper", contralateral: 26, contralateralName: "Primeiro molar superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "7,5 mm" }, { label: "Mesiodistal", value: "10,5 mm" }, { label: "Vestíbulo-lingual", value: "11,0 mm" }] },
  { number: 17, name: "Segundo molar superior direito", shortName: "2º Molar", navGroup: "upper-r", kind: "molar", jaw: "upper", contralateral: 27, contralateralName: "Segundo molar superior esquerdo", blockMeasures: [{ label: "Altura da coroa", value: "7,0 mm" }, { label: "Mesiodistal", value: "10,0 mm" }, { label: "Vestíbulo-lingual", value: "10,0 mm" }] },
  { number: 21, name: "Incisivo central superior esquerdo", shortName: "Inc. Central", navGroup: "upper-l", kind: "incisor", jaw: "upper", contralateral: 11, contralateralName: "Incisivo central superior direito", blockMeasures: [{ label: "Altura da coroa", value: "10,5 mm" }, { label: "Mesiodistal", value: "8,5 mm" }, { label: "Vestíbulo-lingual", value: "7,0 mm" }] },
  { number: 22, name: "Incisivo lateral superior esquerdo", shortName: "Inc. Lateral", navGroup: "upper-l", kind: "incisor", jaw: "upper", contralateral: 12, contralateralName: "Incisivo lateral superior direito", blockMeasures: [{ label: "Altura da coroa", value: "9,0 mm" }, { label: "Mesiodistal", value: "6,5 mm" }, { label: "Vestíbulo-lingual", value: "6,0 mm" }] },
  { number: 23, name: "Canino superior esquerdo", shortName: "Canino", navGroup: "upper-l", kind: "canine", jaw: "upper", contralateral: 13, contralateralName: "Canino superior direito", blockMeasures: [{ label: "Altura da coroa", value: "10,5 mm" }, { label: "Mesiodistal", value: "7,9 mm" }, { label: "Vestíbulo-lingual", value: "8,4 mm" }] },
  { number: 24, name: "Primeiro pré-molar superior esquerdo", shortName: "1º Pré-M", navGroup: "upper-l", kind: "premolar", jaw: "upper", contralateral: 14, contralateralName: "Primeiro pré-molar superior direito", blockMeasures: [{ label: "Altura da coroa", value: "8,5 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-lingual", value: "9,0 mm" }] },
  { number: 25, name: "Segundo pré-molar superior esquerdo", shortName: "2º Pré-M", navGroup: "upper-l", kind: "premolar", jaw: "upper", contralateral: 15, contralateralName: "Segundo pré-molar superior direito", blockMeasures: [{ label: "Altura da coroa", value: "8,0 mm" }, { label: "Mesiodistal", value: "7,0 mm" }, { label: "Vestíbulo-lingual", value: "8,5 mm" }] },
  { number: 26, name: "Primeiro molar superior esquerdo", shortName: "1º Molar", navGroup: "upper-l", kind: "molar", jaw: "upper", contralateral: 16, contralateralName: "Primeiro molar superior direito", blockMeasures: [{ label: "Altura da coroa", value: "7,5 mm" }, { label: "Mesiodistal", value: "10,5 mm" }, { label: "Vestíbulo-lingual", value: "11,0 mm" }] },
  { number: 27, name: "Segundo molar superior esquerdo", shortName: "2º Molar", navGroup: "upper-l", kind: "molar", jaw: "upper", contralateral: 17, contralateralName: "Segundo molar superior direito", blockMeasures: [{ label: "Altura da coroa", value: "7,0 mm" }, { label: "Mesiodistal", value: "10,0 mm" }, { label: "Vestíbulo-lingual", value: "10,0 mm" }] },
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
  jaw: m.jaw as Jaw,
  number: m.number,
}));

/** Vídeo esperado por fase (quando houver gravação própria). */
export function phaseVideoPath(toothNumber: number, phaseId: number) {
  return `/videos/tooth-${toothNumber}/fase-${phaseId}.mp4`;
}
