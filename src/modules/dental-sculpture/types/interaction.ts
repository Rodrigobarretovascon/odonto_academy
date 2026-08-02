/** Tipos avançados — trajetórias, movimentos e prática. */

export type InstrumentMovementType =
  | "mark"
  | "cut"
  | "scrape"
  | "carve"
  | "round"
  | "smooth"
  | "brush"
  | "polish";

export type ActiveTip = "knife" | "spoon" | "blade" | "brush" | "fabric" | "ruler";

export type ToolPathPoint = {
  position: [number, number, number];
  rotation: [number, number, number];
  progress: number;
};

export type ToolAction = {
  id: string;
  toolId: string;
  movementType: InstrumentMovementType;
  activeTip?: ActiveTip;
  path: ToolPathPoint[];
  removalRegion?: string;
  removalStrength?: number;
  repetitions?: number;
  speed?: number;
  inclineHint?: string;
};

export type RemovalRegion = {
  id: string;
  label: string;
  kind: "remove" | "protect" | "caution";
};

export type PracticeGuideLevel = "full" | "partial" | "free";

export type PracticeConfiguration = {
  enabled: boolean;
  guideDefault?: PracticeGuideLevel;
  idealPathId?: string;
  tolerance?: number;
};

export type PracticeFeedback = {
  type: "success" | "warning" | "error";
  region?: string;
  message: string;
};

export type PracticeEvaluation = {
  score: number;
  pathAccuracy: number;
  directionAccuracy: number;
  coverageAccuracy: number;
  depthAccuracy: number;
  angleAccuracy?: number;
  feedback: PracticeFeedback[];
};

export type StepNarration = {
  text: string;
  audioUrl?: string;
  startAt?: number;
};

export type VirtualHandConfiguration = {
  enabled: boolean;
  modelUrl?: string;
  gripType?: string;
  dominantHand?: "left" | "right";
};

export type MovementProfile = {
  type: InstrumentMovementType;
  speed: number;
  distance: number;
  visualPressure: number;
  depth: number;
  residue: number;
  label: string;
};

export type NarrationCue = {
  id: string;
  startProgress: number;
  endProgress: number;
  text: string;
  focusRegion?: string;
};

export type PracticeGeometryOutcome = {
  insufficient?: string;
  expected: string;
  excessive?: string;
};

export type ProtectedRegionHit = {
  regionId: string;
  duration: number;
  penetration: number;
};

export type PracticeMomentMarker = {
  id: string;
  progress: number;
  kind: "ok" | "warn" | "error";
  label: string;
};

export type ToolAssetDefinition = {
  id: string;
  fallbackGeometry: "ruler" | "scalpel" | "lecron" | "brush" | "fabric";
  glbUrl?: string;
  scale?: [number, number, number];
  rotationOffset?: [number, number, number];
  activeTipNodes?: {
    knife?: string;
    spoon?: string;
    blade?: string;
  };
};

export type SculptureLayerId =
  | "block"
  | "planned"
  | "rough"
  | "anatomic"
  | "vestibular-detail"
  | "palatal-detail"
  | "finish";

export type AnatomyProgressItem = {
  id: string;
  label: string;
  status: "idle" | "building" | "ok" | "review" | "done";
};
