import type {
  NarrationCue,
  PracticeConfiguration,
  PracticeGeometryOutcome,
  StepNarration,
  ToolAction,
  VirtualHandConfiguration,
} from "./interaction";
import type { SculptureStepCategory, StepVisualMode } from "../data/stepMeta";

/** Tipos do módulo de aula imersiva de escultura — reutilizável por dente. */

export type ToolId = "wax" | "ruler" | "scalpel" | "lecron" | "brush" | "nylon";

export type FaceId = "V" | "P" | "M" | "D" | "I" | "cervical";

export type AnimPhaseId =
  | "instruments"
  | "measure"
  | "thirds"
  | "faces"
  | "proximal-draw"
  | "rough-cut"
  | "second-cut"
  | "round"
  | "vestibular"
  | "lingual"
  | "cingulum"
  | "cervix"
  | "root"
  | "detail"
  | "polish";

export type LessonScreen =
  | "materials"
  | "faces"
  | "quiz"
  | "sculpt"
  | "inspect"
  | "final-quiz"
  | "errors";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  function: string;
  usedInSteps: number[];
  safety?: string;
}

export interface AnatomyStructure {
  id: string;
  name: string;
  face: FaceId | "all";
  description: string;
  createdInStep: number;
}

export interface SculptureStepDef {
  id: string;
  order: number;
  title: string;
  objective: string;
  instructions: string[];
  anatomyNotes: string[];
  warnings: string[];
  commonErrors: string[];
  expectedResult: string;
  /** @deprecated use stepNarration */
  narration?: string;
  stepNarration?: StepNarration;
  activeTool: ToolId;
  animPhase: AnimPhaseId;
  /** Progresso visual 0–1 ao fim desta etapa. */
  endBlend: number;
  cameraFace?: FaceId | "perspective";
  labels?: string[];
  removalHint?: string;
  protectHint?: string;
  toolActions?: ToolAction[];
  practice?: PracticeConfiguration;
  virtualHand?: VirtualHandConfiguration;
  category?: SculptureStepCategory;
  visualMode?: StepVisualMode;
  why?: string;
  narrationCues?: NarrationCue[];
  practiceOutcomes?: PracticeGeometryOutcome;
  protectedRegionIds?: string[];
}

export interface DentalSculptureLesson {
  toothId: string;
  toothName: string;
  notation: string;
  fdi: number;
  tools: ToolDefinition[];
  anatomyStructures: AnatomyStructure[];
  steps: SculptureStepDef[];
  quizPrompts: { prompt: string; answer: FaceId }[];
  inspection: {
    view: FaceId;
    title: string;
    checks: string[];
  }[];
}
