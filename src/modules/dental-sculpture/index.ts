export { ImmersiveSculptureLesson } from "./components/ImmersiveSculptureLesson";
export { InteractiveCarveViewport } from "./components/InteractiveCarveViewport";
export { getSculptureLesson, lessonIncisorCentralUpper } from "./data/lessons/incisor-central-upper";
export { toolActionsForStep } from "./data/tool-actions-central-upper";
export { TOOL_ASSETS, getToolAsset } from "./data/toolAssets";
export { loadToolGroup, makeProceduralTool } from "./lib/proceduralTools";
export type { DentalSculptureLesson, SculptureStepDef } from "./types/sculpture";
export type {
  ToolAction,
  PracticeEvaluation,
  InstrumentMovementType,
  ToolAssetDefinition,
} from "./types/interaction";
