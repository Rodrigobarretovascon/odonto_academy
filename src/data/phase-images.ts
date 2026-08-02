/**
 * Resolução única de imagem-guia por etapa.
 * Prioridade: PNG do próprio FDI → PNG do mesmo tipo (padrão realista) → SVG próprio.
 * Assim todas as etapas preferem o visual fotodidático do dente 11.
 */

import { imageSourceFdi } from "./condensed-scripts";
import {
  PHASE_IMAGE_CACHE,
  PHASE_PNG_KEYS,
  PHASE_SVG_KEYS,
  phaseAssetKey,
} from "./phase-image-manifest";

export type PhaseImageFormat = "png" | "svg";

export interface ResolvedPhaseImage {
  src: string;
  format: PhaseImageFormat;
  /** FDI do arquivo usado (pode ser modelo do mesmo tipo). */
  tooth: number;
  phase: number;
  /** true se a arte veio de outro FDI do mesmo padrão visual */
  fromTemplate?: boolean;
}

function assetUrl(tooth: number, phase: number, ext: PhaseImageFormat): string {
  const padded = String(phase).padStart(2, "0");
  return `/images/tooth-${tooth}/fase-${padded}.${ext}?v=${PHASE_IMAGE_CACHE}`;
}

/**
 * Cadeia de FDI com arte realista no mesmo padrão (11).
 * Só tipos equivalentes — nunca mistura molar com incisivo.
 */
export function realisticImageCandidates(toothNumber: number): number[] {
  const n = toothNumber;
  const p = n % 10;
  const upper = n < 30;
  const contra = imageSourceFdi(n);
  const out: number[] = [n];

  if (contra !== n) out.push(contra);

  // Irmãos de tipo com set completo/parcial no padrão 11
  if (p === 1) out.push(11, 21);
  else if (p === 2) out.push(12, 22, 11);
  else if (p === 3) out.push(13, 23, 11);
  else if (p === 4) out.push(upper ? 14 : 14, 24);
  else if (p === 5) out.push(upper ? 15 : 15, 14, 25, 24);
  else if (p === 6) out.push(upper ? 16 : 46, 26, 36);
  else if (p === 7) out.push(upper ? 16 : 46, 17, 27, 37);

  return [...new Set(out)];
}

/** Resolve a melhor imagem disponível para o dente/etapa abertos. */
export function resolvePhaseGuideImage(
  toothNumber: number,
  phaseId: number,
): ResolvedPhaseImage | undefined {
  if (phaseId < 1 || phaseId > 7) return undefined;

  for (const candidate of realisticImageCandidates(toothNumber)) {
    const key = phaseAssetKey(candidate, phaseId);
    if (PHASE_PNG_KEYS.has(key)) {
      return {
        src: assetUrl(candidate, phaseId, "png"),
        format: "png",
        tooth: candidate,
        phase: phaseId,
        fromTemplate: candidate !== toothNumber,
      };
    }
  }

  const svgKey = phaseAssetKey(toothNumber, phaseId);
  if (PHASE_SVG_KEYS.has(svgKey)) {
    return {
      src: assetUrl(toothNumber, phaseId, "svg"),
      format: "svg",
      tooth: toothNumber,
      phase: phaseId,
    };
  }

  return undefined;
}

/** @deprecated Use resolvePhaseGuideImage */
export function resolveStepGuideImage(
  toothNumber: number,
  phaseId: number,
): string | undefined {
  return resolvePhaseGuideImage(toothNumber, phaseId)?.src;
}

/** @deprecated Use resolvePhaseGuideImage */
export function resolveStepGuideSvg(
  toothNumber: number,
  phaseId: number,
): string | undefined {
  const key = phaseAssetKey(toothNumber, phaseId);
  if (!PHASE_SVG_KEYS.has(key)) return undefined;
  return assetUrl(toothNumber, phaseId, "svg");
}
