import type { ToolAssetDefinition } from "../types/interaction";

/**
 * Definições de assets de instrumentos.
 * Sem `glbUrl` (ou se o GLB falhar), usa-se a geometria procedural `fallbackGeometry`.
 * Para trocar por modelos profissionais: defina `glbUrl` em `/public/models/tools/…`.
 */
export const TOOL_ASSETS: Record<string, ToolAssetDefinition> = {
  ruler: {
    id: "ruler",
    fallbackGeometry: "ruler",
    glbUrl: "/models/tools/ruler.glb",
    scale: [1, 1, 1],
  },
  scalpel: {
    id: "scalpel",
    fallbackGeometry: "scalpel",
    glbUrl: "/models/tools/scalpel.glb",
    scale: [1, 1, 1],
    activeTipNodes: { blade: "tip-blade" },
  },
  lecron: {
    id: "lecron",
    fallbackGeometry: "lecron",
    glbUrl: "/models/tools/lecron.glb",
    scale: [1, 1, 1],
    activeTipNodes: { knife: "tip-knife", spoon: "tip-spoon" },
  },
  brush: {
    id: "brush",
    fallbackGeometry: "brush",
    glbUrl: "/models/tools/brush.glb",
    scale: [1, 1, 1],
  },
  nylon: {
    id: "nylon",
    fallbackGeometry: "fabric",
    glbUrl: "/models/tools/nylon.glb",
    scale: [1, 1, 1],
  },
};

export function getToolAsset(toolId: string): ToolAssetDefinition {
  return (
    TOOL_ASSETS[toolId] ?? {
      id: toolId,
      fallbackGeometry: "lecron",
    }
  );
}
