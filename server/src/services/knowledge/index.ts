import type { KnowledgeChunk } from "./types.js";
import { CLINICAL_EXTRA } from "./clinical-extra.js";
import { APP_CONTENT_CHUNKS } from "./app-content.js";

export type { KnowledgeChunk } from "./types.js";

export const EXTRA_KNOWLEDGE: KnowledgeChunk[] = [
  ...CLINICAL_EXTRA,
  ...APP_CONTENT_CHUNKS,
];
